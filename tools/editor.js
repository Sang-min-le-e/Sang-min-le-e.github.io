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
    .edit-box .row { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 8px; }
    .edit-box .hint { margin-right: auto; color: #566581; font-size: 12px; }
    .edit-box button { white-space: nowrap; }
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

  // 글자 밖(상자 여백 등)을 눌렀을 때 그 자리를 감싼 블록을 찾는다
  const BLOCK_SEL = "p, li, h1, h2, h3, h4, h5, h6, dt, dd, summary, td, th, pre, blockquote, figcaption, .note, .answer, .lead";
  const STOP_SEL = "body, main, article, section, nav, header, footer, .wrap";
  function blockAt(target) {
    let el = target && target.nodeType === Node.ELEMENT_NODE ? target : target && target.parentElement;
    for (; el && !el.matches(STOP_SEL); el = el.parentElement) {
      if (blocked(el)) return null;
      if (el.matches(BLOCK_SEL) || (el.tagName === "DIV" && directText(el))) return el;
    }
    return null;
  }

  // 블록 안의 글자 중 누른 자리에서 가장 가까운 것
  function nearestText(block, x, y) {
    if (!block) return null;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.data.trim() && !blocked(n.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    let best = null, bestDist = Infinity;
    while (walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      for (const r of range.getClientRects()) {
        const dx = Math.max(r.left - x, 0, x - r.right);
        const dy = Math.max(r.top - y, 0, y - r.bottom);
        const d = dy * 100000 + dx; // 같은 줄(세로 거리)을 먼저, 그다음 가로 거리로 고른다
        if (d < bestDist) { bestDist = d; best = walker.currentNode; }
      }
    }
    return best;
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
    const canChange = markOf(node) && !node.parentElement.closest(".lab, nav");
    box.innerHTML = `
      <textarea aria-label="글자 고치기"></textarea>
      <div class="row">
        <span class="hint">Enter 저장 · Esc 취소</span>
        ${canChange ? `<button type="button" class="delete">삭제</button><button type="button" class="add">아래에 추가</button>` : ""}
        <button type="button" class="cancel">취소</button>
        <button type="button" class="save">저장</button>
      </div>
      ${canChange ? "" : `<span class="hint">자동으로 그려지거나 코드와 연결된 글자라 수정만 할 수 있습니다.</span>`}`;
    const input = box.querySelector("textarea");
    const row = box.querySelector(".row");
    input.value = shown;
    const width = Math.min(Math.max(rect.width + 24, 520), innerWidth - 32);
    box.style.width = width + "px";
    box.style.left = Math.max(16, Math.min(rect.left - 12, innerWidth - width - 16)) + "px";
    document.body.appendChild(box);
    const below = rect.bottom + 8;
    const fits = below + box.offsetHeight <= innerHeight - 16;
    box.style.top = (fits ? below : Math.max(16, rect.top - box.offsetHeight - 8)) + "px";
    input.focus();
    input.select();

    let submit = () => save(node, old, shown, input.value);
    row.querySelector(".save").addEventListener("click", () => submit());
    row.querySelector(".cancel").addEventListener("click", closeBox);

    if (canChange) {
      row.querySelector(".add").addEventListener("click", () => {
        input.value = "";
        input.setAttribute("aria-label", "아래에 추가할 글자");
        input.placeholder = "아래에 추가할 글자. 줄마다 하나씩 추가됩니다.";
        row.querySelector(".hint").textContent = "Enter 추가 · Shift+Enter 줄바꿈";
        row.querySelector(".save").textContent = "추가";
        row.querySelector(".delete").remove();
        row.querySelector(".add").remove();
        submit = () => change(node, old, { action: "add", new: input.value });
        input.focus();
      });
      row.querySelector(".delete").addEventListener("click", () => showDelete(node, old, row));
    }

    input.addEventListener("keydown", e => {
      e.stopPropagation(); // 사이트의 Esc 뒤로 가기가 함께 동작하지 않게
      if (e.isComposing) return; // 한글 조합 중 Enter는 저장이 아니다
      if (e.key === "Escape") closeBox();
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    });
  }

  // 삭제는 되돌리기 어려우니 무엇이 지워지는지 보여 주고 한 번 더 누르게 한다
  function showDelete(node, old, row) {
    const parent = node.parentElement;
    const block = parent.closest("p, li, h1, h2, h3, h4, h5, h6, div, dt, dd, summary, td, th, pre, blockquote, figcaption");
    const flat = s => s.replace(/\s+/g, " ").trim();
    const mixed = block && flat(block.textContent) !== flat(old);
    const whole = parent.closest("summary") ? "질문과 답변을 모두 삭제"
      : parent.closest("dt, dd") ? "항목과 내용을 모두 삭제"
      : mixed ? "문단 전체 삭제" : "정말 삭제";
    row.innerHTML = `
      <span class="hint">삭제할까요?</span>
      <button type="button" class="cancel">취소</button>
      ${mixed ? `<button type="button" class="piece">이 글자만 삭제</button>` : ""}
      <button type="button" class="save whole">${whole}</button>`;
    row.querySelector(".cancel").addEventListener("click", closeBox);
    row.querySelector(".whole").addEventListener("click", () => change(node, old, { action: "delete", scope: "block" }));
    if (mixed) row.querySelector(".piece").addEventListener("click", () => change(node, old, { action: "delete", scope: "piece" }));
    row.querySelector(".whole").focus();
  }

  async function post(body) {
    try {
      const res = await fetch("/__edit__/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) return data;
      say(data.error || "저장하지 못했습니다.", true);
    } catch {
      say("저장하지 못했습니다. 편집 서버가 켜져 있는지 확인해 주세요.", true);
    }
    return null;
  }

  function reloadAfter(data) {
    closeBox();
    remember({ on: true, y: scrollY, saved: data.file });
    location.reload();
  }

  async function change(node, old, extra) {
    const mark = markOf(node);
    if (!mark) { say("이 글자는 삭제하거나 아래에 추가할 수 없습니다.", true); return; }
    const data = await post({ old, file: FILE, start: mark.start, end: mark.end, ...extra });
    if (data) reloadAfter(data);
  }

  async function save(node, old, shown, value) {
    const next = value.trim();
    if (next === shown) { closeBox(); return; }
    if (!next) { say("빈 글자로는 저장할 수 없습니다. 지우려면 삭제 버튼을 쓰세요.", true); return; }
    const mark = markOf(node);
    const body = { old, new: next };
    if (mark) Object.assign(body, { file: FILE, start: mark.start, end: mark.end });
    const data = await post(body);
    if (!data) return;
    // JS가 그린 글자는 원본을 고쳤으니 다시 그린다
    if (data.reload) { reloadAfter(data); return; }
    closeBox();
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
    const node = textAt(e.clientX, e.clientY, e.target) || nearestText(blockAt(e.target), e.clientX, e.clientY);
    if (node) openBox(node);
    else closeBox();
  }, true);
  document.addEventListener("mouseover", e => {
    if (!on || isUi(e.target)) { setHover(null); return; }
    const el = e.target;
    const own = el.nodeType === Node.ELEMENT_NODE && !blocked(el) && directText(el) ? el : null;
    setHover(blockAt(el) || own);
  }, true);

  const saved = recall();
  if (saved && saved.on) {
    setMode(true);
    if (saved.saved) say(`${saved.saved}에 저장했습니다.`);
    if (saved.y) addEventListener("load", () => scrollTo(0, saved.y));
  }
})();
