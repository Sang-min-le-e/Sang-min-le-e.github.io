// 프로젝트 페이지(projects/NNN-이름.html)가 공통으로 쓰는 스크립트.
// 페이지 맨 위 <meta name="project:..."> 를 읽어 머리판, 위치 표시, 기술 스택 칩을 그린다.
// 홈의 Production 랙도 같은 meta를 읽어 랙에 꽂는다 (window.readProjectMeta).
(function () {
  const STATUS = { live: "운영 중", dev: "개발 중", archived: "보관" };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // 문서(지금 페이지 또는 불러온 HTML)에서 프로젝트 정보를 꺼낸다
  window.readProjectMeta = function (doc, file) {
    const meta = n => (doc.querySelector(`meta[name="project:${n}"]`) || {}).content || "";
    const id = (file.match(/(\d{3})-[\w-]+\.html$/) || [])[1] || "000";
    return {
      id, file,
      host: "prod-" + id,
      name: meta("name") || file,
      summary: meta("summary"),
      status: STATUS[meta("status")] ? meta("status") : "dev",
      statusLabel: STATUS[meta("status")] || STATUS.dev,
      stack: meta("stack").split(",").map(s => s.trim()).filter(Boolean),
      github: meta("github"),
      demo: meta("demo"),
      sample: meta("sample") === "true",
    };
  };
  window.PROJECT_STATUS = STATUS;

  // ---------- 프로젝트 페이지에서만 ----------
  const face = document.querySelector("[data-project-face]");
  if (!face) return;
  const p = window.readProjectMeta(document, location.pathname.split("/").pop());
  document.title = `${p.host} ${p.name} · My Compiled Datacenter`;

  const crumb = document.querySelector("[data-crumb]");
  if (crumb) crumb.innerHTML = `<a href="../index.html#/">Production</a> <span class="sep">/</span> ${p.host} <span class="sep">/</span> <span class="badge ${p.status === "live" ? "interview" : p.status === "dev" ? "understood" : "todo"}">${p.statusLabel}</span>`;

  const link = (url, label) => url
    ? `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`
    : `<span class="btn" aria-disabled="true">${label} 준비 중</span>`;
  face.className = "prod-face";
  face.style.viewTransitionName = "project-" + p.id; // 홈의 랙에서 이어져 날아온다
  face.innerHTML = `
    <span class="prod-led ${p.status}" aria-hidden="true"></span>
    <div class="prod-face-body">
      <div class="prod-host">${p.host} · ${p.statusLabel}${p.sample ? ' <span class="sample-tag">예시</span>' : ""}</div>
      <h1>${esc(p.name)}</h1>
      <p>${esc(p.summary)}</p>
    </div>
    <div class="prod-links">${link(p.github, "GitHub")}${link(p.demo, "서비스")}</div>`;

  const stack = document.querySelector("[data-stack]");
  if (stack) {
    stack.className = "stack-chips";
    stack.innerHTML = p.stack.map(s => `<span>${esc(s)}</span>`).join("");
  }
})();
