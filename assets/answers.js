// 면접 답변 표시와 편집 모드.
// 답변은 assets/answers.json에 모아 두고, 질문은 <details class="qa" data-q="이름"> 으로 구분한다.
// 편집 모드(주소 끝에 ?edit)에서 저장하면 GitHub API로 그 파일을 커밋하고, Pages가 다시 배포한다.
(function () {
  const API = "https://api.github.com/repos/Sang-min-le-e/Sang-min-le-e.github.io";
  const BRANCH = "main";
  const FILE = "assets/answers.json";
  const TOKEN_KEY = "answers-github-token";
  const TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";
  const EMPTY_TEXT = "아직 작성 전입니다.";

  const topic = document.body.dataset.topic;
  const root = document.body.dataset.root || "./";
  // data-hint가 붙은 칸의 글은 답변이 아니라 나에게 보여 줄 안내문이다
  const items = [...document.querySelectorAll(".qa[data-q]")].map(el => {
    const box = el.querySelector(".answer");
    return { el, box, id: el.dataset.q, isHint: "hint" in box.dataset, base: box.textContent.trim() };
  });
  if (!topic || !items.length) return;

  const editing = new URLSearchParams(location.search).has("edit");
  const pageUrl = location.pathname;

  // 사생활 보호 모드 등에서는 저장소 접근이 막힐 수 있다
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }
  function setToken(value) {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
      return true;
    } catch { return false; }
  }

  // ---------- 방문자 화면 ----------
  const staticText = item => (item.isHint ? "" : item.base);

  function render(answers) {
    const saved = answers[topic] || {};
    items.forEach(item => {
      const text = saved[item.id] || staticText(item);
      item.box.textContent = text || EMPTY_TEXT;
      item.box.classList.toggle("written", !!text);
      item.box.classList.toggle("empty", !text);
    });
  }

  async function loadPublished() {
    const res = await fetch(`${root}${FILE}`, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }

  // ---------- GitHub API ----------
  function github(path, token, options = {}) {
    return fetch(API + path, {
      ...options,
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, ...options.headers },
    });
  }

  function errorText(status) {
    if (status === 401) return "토큰이 잘못됐거나 만료됐어요. 토큰을 지우고 다시 입력해 주세요.";
    if (status === 403 || status === 404) return "토큰 권한이 부족해요. 이 저장소의 Contents 쓰기 권한이 있는지 확인해 주세요.";
    return `GitHub 요청이 실패했어요. (HTTP ${status})`;
  }

  const fromBase64 = text => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\n/g, "")), c => c.charCodeAt(0)));
  const toBase64 = text => {
    let binary = "";
    new TextEncoder().encode(text).forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary);
  };

  async function readFile(token) {
    const res = await github(`/contents/${FILE}?ref=${BRANCH}`, token);
    if (!res.ok) throw new Error(errorText(res.status));
    const file = await res.json();
    return { sha: file.sha, answers: JSON.parse(fromBase64(file.content)) };
  }

  // 그 사이 다른 커밋이 끼어들면(409) 최신 파일을 다시 읽어 한 번 더 시도한다
  async function saveAnswer(token, id, text) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const { sha, answers } = await readFile(token);
      const saved = answers[topic] || {};
      if (text) saved[id] = text;
      else delete saved[id];
      if (Object.keys(saved).length) answers[topic] = saved;
      else delete answers[topic];

      const res = await github(`/contents/${FILE}`, token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `면접 답변 ${text ? "수정" : "삭제"}: ${topic}#${id}`,
          content: toBase64(JSON.stringify(answers, null, 2) + "\n"),
          sha,
          branch: BRANCH,
        }),
      });
      if (res.ok) return;
      if (res.status !== 409) throw new Error(errorText(res.status));
    }
    throw new Error("저장이 다른 커밋과 겹쳤어요. 잠시 뒤 다시 저장해 주세요.");
  }

  // ---------- 편집 모드 ----------
  function addPanel(html) {
    const panel = document.createElement("div");
    panel.className = "edit-panel";
    panel.innerHTML = html;
    items[0].el.before(panel);
    return panel;
  }

  function showTokenForm() {
    const panel = addPanel(`
      <strong>답변 편집 모드</strong>
      <p>이 저장소의 Contents 쓰기 권한만 준 <a href="${TOKEN_URL}" target="_blank" rel="noopener">GitHub 토큰</a>을 입력하세요. 토큰은 이 브라우저에만 저장됩니다. 공용 PC에서는 쓰지 마세요.</p>
      <form class="edit-token">
        <input type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_..." aria-label="GitHub 토큰" required>
        <button class="btn small primary" type="submit">확인</button>
      </form>
      <p class="edit-status" role="status"></p>`);
    const input = panel.querySelector("input");
    const status = panel.querySelector(".edit-status");
    panel.querySelector("form").addEventListener("submit", async e => {
      e.preventDefault();
      const token = input.value.trim();
      status.textContent = "토큰을 확인하는 중이에요.";
      try {
        const res = await github("", token);
        if (!res.ok) throw new Error(errorText(res.status));
        const repo = await res.json();
        if (!repo.permissions || !repo.permissions.push) throw new Error(errorText(403));
        if (!setToken(token)) throw new Error("이 브라우저에는 토큰을 저장할 수 없어요. 사생활 보호 모드인지 확인해 주세요.");
        location.reload();
      } catch (err) {
        status.textContent = err.message;
      }
    });
  }

  function addEditor(item, token, answers) {
    const text = (answers[topic] || {})[item.id] || staticText(item);
    item.el.open = true;
    item.box.classList.remove("written", "empty");
    item.box.classList.add("editing");
    item.box.innerHTML = `
      <textarea rows="6"></textarea>
      <div class="edit-actions">
        <button class="btn small primary" type="button">저장</button>
        <span class="edit-status" role="status"></span>
      </div>`;
    const area = item.box.querySelector("textarea");
    const button = item.box.querySelector("button");
    const status = item.box.querySelector(".edit-status");
    area.value = text;
    area.placeholder = item.isHint ? item.base : "내 답변을 적습니다.";
    area.setAttribute("aria-label", `${item.el.querySelector("summary").textContent} 답변`);
    item.saved = text;
    area.addEventListener("input", () => { status.textContent = ""; });

    button.addEventListener("click", async () => {
      const value = area.value.trim();
      button.disabled = true;
      status.textContent = "저장하는 중이에요.";
      try {
        await saveAnswer(token, item.id, value);
        area.value = value;
        item.saved = value;
        status.textContent = "저장했어요. 보통 1분 안팎이면 사이트에 반영됩니다.";
      } catch (err) {
        status.textContent = err.message;
      } finally {
        button.disabled = false;
      }
    });
    item.area = area;
  }

  async function startEditor() {
    const token = getToken();
    if (!token) { showTokenForm(); return; }

    const panel = addPanel(`
      <strong>답변 편집 모드</strong>
      <p class="edit-status" role="status">답변을 불러오는 중이에요.</p>
      <div class="edit-actions">
        <a class="btn small" href="${pageUrl}">편집 끝내기</a>
        <button class="btn small" type="button">토큰 지우기</button>
      </div>`);
    const status = panel.querySelector(".edit-status");
    panel.querySelector("button").addEventListener("click", () => {
      setToken(null);
      location.reload();
    });
    // 배포가 끝나기 전의 낡은 파일을 덮어쓰지 않도록 저장소의 최신본을 읽는다
    try {
      const { answers } = await readFile(token);
      items.forEach(item => addEditor(item, token, answers));
      status.textContent = "질문마다 따로 저장합니다. 칸을 비우고 저장하면 그 답변이 지워집니다.";
    } catch (err) {
      status.textContent = err.message;
    }
    window.addEventListener("beforeunload", e => {
      if (items.some(item => item.area && item.area.value.trim() !== item.saved)) e.preventDefault();
    });
  }

  // ---------- 시작 ----------
  render({});
  if (editing) {
    startEditor();
  } else {
    if (getToken()) {
      addPanel(`<a class="btn small" href="${pageUrl}?edit">답변 편집</a>`);
    }
    loadPublished().then(render).catch(() => {});
  }
})();
