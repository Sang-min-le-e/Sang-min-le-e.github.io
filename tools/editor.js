// 사이트 편집 도구. tools/edit-server.py가 페이지를 내보낼 때만 끼워 넣는다.
// 글자(text node) 하나씩 고치므로 <code>나 <strong> 같은 표시는 깨지지 않는다.
(function () {
  const FILE = document.currentScript.dataset.file;
  const STORE_KEY = "site-edit-mode";
  const MARK = /^edit:(\d+):(\d+)$/;

  const style = document.createElement("style");
  style.textContent = `
    .edit-ui { font: 14px/1.5 Inter, Pretendard Variable, sans-serif; color: #2c333f; }
    .edit-bar { position: fixed; right: 16px; bottom: 16px; z-index: 2147483000; display: flex; align-items: center; gap: 8px; max-width: calc(100vw - 32px); }
    .edit-toggle, .edit-box button { min-height: 44px; padding: 0 16px; border: 1px solid #c8cfda; border-radius: 4px; background: #fff; color: #2c333f; font: inherit; font-weight: 600; cursor: pointer; }
    .edit-toggle.on, .edit-box button.save { background: #2560ff; border-color: #003db5; color: #fff; }
    .edit-msg { padding: 8px 12px; border: 1px solid #c8cfda; border-radius: 4px; background: #fff; }
    .edit-msg:empty { display: none; }
    .edit-msg.error { border-color: #2c333f; background: #e7eaef; }
    .edit-box { position: fixed; z-index: 2147483001; display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid #c8cfda; border-radius: 4px; background: #fff; box-shadow: 0 4px 16px rgba(44, 51, 63, .2); }
    .edit-box textarea { width: 100%; min-height: 72px; padding: 8px; box-sizing: border-box; border: 1px solid #c8cfda; border-radius: 4px; font: inherit; resize: vertical; }
    .edit-box textarea:focus { outline: 2px solid #c0e0fa; border-color: #2560ff; }
    .edit-box .row { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
    .edit-box .hint { margin-right: auto; color: #566581; font-size: 12px; }
    body.edit-on, body.edit-on * { cursor: text !important; }
    body.edit-on .edit-ui, body.edit-on .edit-ui button { cursor: pointer !important; }
    body.edit-on .edit-box textarea { cursor: text !important; }
    .edit-hover { outline: 2px dashed #2560ff !important; outline-offset: 2px; }
  `;
  document.head.appendChild(style);

  const bar = document.createElement("div");
  bar.className = "edit-ui edit-bar";
  bar.innerHTML = `<span class="edit-msg" role="status"></span><button type="button" class="edit-toggle" aria-pressed="false">편집</button>`;
  document.body.appendChild(bar);
  const toggle = bar.querySelector(".edit-toggle");
  const msg = bar.querySelector(".edit-msg");

  let on = false;
  let box = null;
  let hovered = null;

  function remember(value) {
    try {
      if (value) sessionStorage.setItem(STORE_KEY, JSON.stringify(value));
      else sessionStorage.removeItem(STORE_KEY);
    } catch {}
  }
  function recall() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)); } catch { return null; }
  }

  function say(text, isError) {
    msg.textContent = text;
    msg.classList.toggle("error", !!isError);
  }

  function setHover(el) {
    if (hovered) hovered.classList.remove("edit-hover");
    hovered = el;
    if (hovered) hovered.classList.add("edit-hover");
  }

  function setMode(value) {
    on = value;
    toggle.classList.toggle("on", on);
    toggle.setAttribute("aria-pressed", String(on));
    toggle.textContent = on ? "편집 끄기" : "편집";
    document.body.classList.toggle("edit-on", on);
    remember(on ? { on: true } : null);
    if (on) {
      // 접힌 면접 답변도 고칠 수 있게 펼친다
      document.querySelectorAll("details").forEach(d => { d.open = true; });
      say("고칠 글자를 누르세요.");
    } else {
      closeBox();
      setHover(null);
      say("");
    }
  }

  const isUi = el => el && el.closest && el.closest(".edit-ui");
  const blocked = el => !el || !el.closest || el.closest(".edit-ui, script, style, textarea, input, select, canvas");
  const directText = el => [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.data.trim());

  // 누른 자리의 글자를 찾는다. 글자 밖을 누르면 없는 것으로 친다
  function textAt(x, y, target) {
    let node = null;
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      node = p && p.offsetNode;
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(x, y);
      node = r && r.startContainer;
    }
    if (node && node.nodeType === Node.TEXT_NODE && node.data.trim()) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const hit = [...range.getClientRects()].some(r =>
        x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2);
      if (hit && !blocked(node.parentElement)) return node;
    }
    // SVG 글자는 위 방법으로 잡히지 않을 수 있다
    if (target instanceof SVGElement && !blocked(target)) return directText(target) || null;
    return null;
  }

  function markOf(node) {
    const prev = node.previousSibling;
    if (!prev || prev.nodeType !== Node.COMMENT_NODE) return null;
    const m = prev.data.match(MARK);
    return m ? { comment: prev, start: Number(m[1]), end: Number(m[2]) } : null;
  }

  // 저장하면 파일 안 위치가 밀리므로 뒤쪽 글자들의 위치 주석을 맞춘다
  function shiftMarks(changedEnd, delta) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    while (walker.nextNode()) {
      const c = walker.currentNode;
      const m = c.data.match(MARK);
      if (!m) continue;
      const start = Number(m[1]);
      const end = Number(m[2]);
      if (start >= changedEnd) c.data = `edit:${start + delta}:${end + delta}`;
      else if (end === changedEnd) c.data = `edit:${start}:${end + delta}`;
    }
  }

  function closeBox() {
    if (box) box.remove();
    box = null;
  }

  function openBox(node) {
    closeBox();
    const inPre = !!node.parentElement.closest("pre");
    const old = node.data;
    const shown = inPre ? old.trim() : old.replace(/\s+/g, " ").trim();
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();

    box = document.createElement("div");
    box.className = "edit-ui edit-box";
    box.innerHTML = `
      <textarea aria-label="글자 고치기"></textarea>
      <div class="row">
        <span class="hint">Enter 저장 · Esc 취소</span>
        <button type="button" class="cancel">취소</button>
        <button type="button" class="save">저장</button>
      </div>`;
    const input = box.querySelector("textarea");
    input.value = shown;
    const width = Math.min(Math.max(rect.width + 24, 360), innerWidth - 32);
    box.style.width = width + "px";
    box.style.left = Math.max(16, Math.min(rect.left - 12, innerWidth - width - 16)) + "px";
    document.body.appendChild(box);
    const below = rect.bottom + 8;
    const fits = below + box.offsetHeight <= innerHeight - 16;
    box.style.top = (fits ? below : Math.max(16, rect.top - box.offsetHeight - 8)) + "px";
    input.focus();
    input.select();

    const submit = () => save(node, old, shown, input.value);
    box.querySelector(".save").addEventListener("click", submit);
    box.querySelector(".cancel").addEventListener("click", closeBox);
    input.addEventListener("keydown", e => {
      e.stopPropagation(); // 사이트의 Esc 뒤로 가기가 함께 동작하지 않게
      if (e.isComposing) return; // 한글 조합 중 Enter는 저장이 아니다
      if (e.key === "Escape") closeBox();
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    });
  }

  async function save(node, old, shown, value) {
    const next = value.trim();
    if (next === shown) { closeBox(); return; }
    if (!next) { say("빈 글자로는 저장할 수 없습니다.", true); return; }
    const mark = markOf(node);
    const body = { old, new: next };
    if (mark) Object.assign(body, { file: FILE, start: mark.start, end: mark.end });
    let res, data;
    try {
      res = await fetch("/__edit__/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      data = await res.json();
    } catch {
      say("저장하지 못했습니다. 편집 서버가 켜져 있는지 확인해 주세요.", true);
      return;
    }
    if (!res.ok) { say(data.error || "저장하지 못했습니다.", true); return; }

    closeBox();
    if (data.reload) {
      // JS가 그린 글자는 원본을 고쳤으니 다시 그린다
      remember({ on: true, y: scrollY, saved: data.file });
      location.reload();
      return;
    }
    node.data = next;
    shiftMarks(mark.end, data.delta);
    say(`${data.file}에 저장했습니다.`);
  }

  toggle.addEventListener("click", () => setMode(!on));

  // 편집 중에는 링크와 버튼이 동작하지 않고 글자 고치기만 된다
  ["pointerdown", "mousedown", "pointerup", "mouseup"].forEach(type => {
    window.addEventListener(type, e => {
      if (on && !isUi(e.target)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });
  window.addEventListener("click", e => {
    if (!on || isUi(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    const node = textAt(e.clientX, e.clientY, e.target);
    if (node) openBox(node);
    else closeBox();
  }, true);
  document.addEventListener("mouseover", e => {
    if (!on || isUi(e.target)) { setHover(null); return; }
    const el = e.target;
    setHover(el.nodeType === Node.ELEMENT_NODE && !blocked(el) && directText(el) ? el : null);
  }, true);

  const saved = recall();
  if (saved && saved.on) {
    setMode(true);
    if (saved.saved) say(`${saved.saved}에 저장했습니다.`);
    if (saved.y) addEventListener("load", () => scrollTo(0, saved.y));
  }
})();
