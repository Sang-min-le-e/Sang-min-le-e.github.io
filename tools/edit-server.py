#!/usr/bin/env python3
"""내 컴퓨터에서만 도는 사이트 편집 서버.

    python3 tools/edit-server.py

http://localhost:8767 을 열고 오른쪽 아래 "편집" 버튼을 켠 뒤 글자를 누르면 고칠 수 있다.
저장하면 저장소 파일이 바로 바뀐다. 사이트에 반영하려면 커밋하고 푸시한다.

- 편집 도구는 이 서버가 페이지를 내보낼 때만 끼워 넣는다. github.io 페이지에는 들어가지 않는다.
- 파일에 쓰는 일은 이 서버만 할 수 있고, 127.0.0.1에서 오는 같은 주소의 요청만 받는다.

글자와 파일 위치를 잇는 방법: HTML을 내보낼 때 글자 바로 앞에 <!--edit:시작:끝--> 주석을 넣는다.
주석이 없는 글자는 JS가 그린 것이므로 topics.js, 프로젝트 meta, 화면 코드에서 같은 글자를 찾는다.
"""
import argparse
import html
import json
import os
import re
import shutil
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
EDITOR_JS = Path(__file__).resolve().parent / "editor.js"
EDITOR_URL = "/__edit__/editor.js"
SAVE_URL = "/__edit__/save"
MAX_BODY = 1024 * 1024
WRITE_LOCK = threading.Lock()

TAG = r"""(?:[^>"']|"[^"]*"|'[^']*')*>"""
TOKEN = re.compile(
    r"<!--.*?-->"
    r"|<(script|style|title|textarea)\b" + TAG + r".*?</\1\s*>"
    r"|<[a-zA-Z/!]" + TAG,
    re.S | re.I,
)
BODY = re.compile(r"<body\b" + TAG, re.I)
META = re.compile(r'<meta\s+name="project:(\w+)"\s+content="([^"]*)"')
CODE_FILES = ("index.html", "assets/layout.js", "assets/project-page.js")
CODE_UNSAFE = re.compile(r"[`$\"'\\<>&]")


class EditError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status
        self.message = message


def read(path):
    # newline을 바꾸지 않으려고 바이트로 읽는다. 위치 계산이 파일 그대로여야 한다
    return path.read_bytes().decode("utf-8")


def write(path, text):
    tmp = path.with_name("." + path.name + ".edit-tmp")
    tmp.write_bytes(text.encode("utf-8"))
    shutil.copymode(path, tmp)
    os.replace(tmp, path)


def normalize(text):
    return re.sub(r"\s+", " ", text).strip()


def instrument(source, rel_path):
    """글자마다 파일 위치 주석을 붙이고 편집 도구를 끼워 넣는다."""
    body = BODY.search(source)
    if not body:
        return source
    out = [source[: body.end()]]

    def add_text(text, offset):
        stripped = text.strip()
        if stripped:
            start = offset + len(text) - len(text.lstrip())
            out.append("<!--edit:%d:%d-->" % (start, start + len(stripped)))
        out.append(text)

    pos = body.end()
    for token in TOKEN.finditer(source, pos):
        add_text(source[pos : token.start()], pos)
        out.append(token.group())
        pos = token.end()
    add_text(source[pos:], pos)

    page = "".join(out)
    tag = '<script src="%s" data-file="%s"></script>\n' % (EDITOR_URL, html.escape(rel_path))
    at = page.lower().rfind("</body>")
    return page + tag if at < 0 else page[:at] + tag + page[at:]


def resolve_html(rel_path):
    path = (ROOT / str(rel_path)).resolve()
    inside = ROOT in path.parents
    hidden = inside and any(part.startswith(".") for part in path.relative_to(ROOT).parts)
    if not inside or hidden or path.suffix != ".html" or not path.is_file():
        raise EditError(400, "고칠 수 없는 파일입니다.")
    return path


def save_marked(rel_path, start, end, old, new):
    """위치 주석이 있는 글자를 고친다. 그 자리의 글자가 다르면 파일이 바뀐 것이므로 멈춘다."""
    path = resolve_html(rel_path)
    source = read(path)
    if not (isinstance(start, int) and isinstance(end, int) and 0 <= start < end <= len(source)):
        raise EditError(409, "파일이 바뀌었습니다. 새로고침한 뒤 다시 고쳐 주세요.")
    if normalize(html.unescape(source[start:end])) != normalize(old):
        raise EditError(409, "파일이 바뀌었습니다. 새로고침한 뒤 다시 고쳐 주세요.")
    replacement = html.escape(new, quote=False)
    write(path, source[:start] + replacement + source[end:])
    return {"file": rel_path, "delta": len(replacement) - (end - start)}


def data_matches(old, new):
    """JS가 그리는 글자의 원본 후보: topics.js 문자열, 프로젝트 meta."""
    matches = []
    topics = ROOT / "assets/topics.js"
    source = read(topics)
    needle = json.dumps(old, ensure_ascii=False)
    for m in re.finditer(re.escape(needle), source):
        matches.append((topics, m.start() + 1, m.end() - 1, json.dumps(new, ensure_ascii=False)[1:-1]))

    for path in sorted((ROOT / "projects").glob("[0-9]*.html")):
        source = read(path)
        for m in META.finditer(source):
            name, content = m.group(1), m.group(2)
            if html.unescape(content) == old:
                matches.append((path, m.start(2), m.end(2), html.escape(new, quote=True)))
            elif name == "stack":
                # 기술 스택 칩 하나는 쉼표로 나뉜 값의 일부다
                for item in re.finditer(r"[^,]+", content):
                    value = item.group()
                    if html.unescape(value.strip()) == old:
                        at = m.start(2) + item.start() + len(value) - len(value.lstrip())
                        matches.append((path, at, at + len(value.strip()), html.escape(new, quote=True)))
    return matches


def code_matches(old, new):
    """화면 코드에 그대로 적힌 글자. 코드가 깨지지 않게 특수문자는 받지 않는다."""
    pattern = re.compile(r"(?<=[>\"'`])" + re.escape(old) + r"(?=[<\"'`])")
    matches = []
    for rel_path in CODE_FILES:
        path = ROOT / rel_path
        for m in pattern.finditer(read(path)):
            matches.append((path, m.start(), m.end(), new))
    if matches and CODE_UNSAFE.search(new):
        raise EditError(400, "이 글자는 화면 코드에 있어서 ` $ \" ' \\ < > & 를 넣을 수 없습니다.")
    return matches


def save_generated(old, new):
    old = normalize(old)
    matches = data_matches(old, new) or code_matches(old, new)
    if not matches:
        raise EditError(404, "숫자나 조합처럼 자동으로 만들어진 글자라 여기서 고칠 수 없습니다.")
    if len(matches) > 1:
        names = sorted({str(m[0].relative_to(ROOT)) for m in matches})
        raise EditError(409, "같은 글자가 %d곳에 있어 고칠 곳을 정할 수 없습니다: %s" % (len(matches), ", ".join(names)))
    path, start, end, replacement = matches[0]
    source = read(path)
    write(path, source[:start] + replacement + source[end:])
    return {"file": str(path.relative_to(ROOT)), "reload": True}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_body(self, status, content_type, text):
        data = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, status, value):
        self.send_body(status, "application/json; charset=utf-8", json.dumps(value, ensure_ascii=False))

    def allowed_host(self):
        # 다른 사이트가 주소를 속여 이 서버를 읽거나 쓰지 못하게 한다
        port = self.server.server_address[1]
        return self.headers.get("Host") in ("localhost:%d" % port, "127.0.0.1:%d" % port)

    def do_GET(self):
        if not self.allowed_host():
            self.send_error(403)
            return
        path = unquote(urlsplit(self.path).path)
        if path == EDITOR_URL:
            self.send_body(200, "text/javascript; charset=utf-8", read(EDITOR_JS))
            return
        if any(part.startswith(".") for part in path.split("/")):
            self.send_error(404)
            return
        rel_path = path.lstrip("/")
        if path.endswith("/"):
            rel_path += "index.html"
        target = (ROOT / rel_path).resolve()
        if rel_path.endswith(".html") and ROOT in target.parents and target.is_file():
            self.send_body(200, "text/html; charset=utf-8", instrument(read(target), rel_path))
            return
        super().do_GET()

    def do_HEAD(self):
        if not self.allowed_host():
            self.send_error(403)
            return
        super().do_HEAD()

    def do_POST(self):
        origin_ok = self.headers.get("Origin") == "http://" + str(self.headers.get("Host"))
        is_json = (self.headers.get("Content-Type") or "").startswith("application/json")
        if not self.allowed_host() or not origin_ok or not is_json:
            self.send_json(403, {"error": "이 컴퓨터의 편집 화면에서만 저장할 수 있습니다."})
            return
        if urlsplit(self.path).path != SAVE_URL:
            self.send_json(404, {"error": "없는 주소입니다."})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if length > MAX_BODY:
                raise EditError(413, "글이 너무 깁니다.")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            old, new = payload.get("old"), payload.get("new")
            if not isinstance(old, str) or not isinstance(new, str) or not new.strip():
                raise EditError(400, "빈 글자로는 저장할 수 없습니다.")
            new = new.strip()
            with WRITE_LOCK:
                if payload.get("start") is not None:
                    result = save_marked(payload.get("file"), payload.get("start"), payload.get("end"), old, new)
                else:
                    result = save_generated(old, new)
            self.send_json(200, result)
        except EditError as error:
            self.send_json(error.status, {"error": error.message})
        except ValueError:
            self.send_json(400, {"error": "요청을 읽지 못했습니다."})


def main():
    parser = argparse.ArgumentParser(description="내 컴퓨터에서만 도는 사이트 편집 서버")
    parser.add_argument("--port", type=int, default=8767)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print("편집 서버: http://localhost:%d  (끄려면 Ctrl+C)" % args.port, flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
