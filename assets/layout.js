// 모든 페이지가 공유하는 헤더, 목차, 이전/다음 링크.
// 페이지는 <body data-root="../" data-topic="ds/hash-table"> 처럼 위치만 알려주면 된다.
(function () {
  const SITE_NAME = "면접까지 가는 컴퓨터 사이언스 서버실";
  const GITHUB_URL = "https://github.com/Sang-min-le-e";
  const STATUS_LABEL = { todo: "예정", draft: "초안", understood: "이해함", interview: "면접 가능" };
  const body = document.body;
  const root = body.dataset.root || "./";
  const racks = window.RACKS || [];

  // ---------- 헤더 ----------
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap-wide inner">
      <a class="brand" href="${root}index.html"><svg class="mark" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M14 6.5h3M14 17.5h3"/><circle cx="7.5" cy="6.5" r="1.3" fill="#68b631" stroke="none"/><circle cx="7.5" cy="17.5" r="1.3" fill="#2560ff" stroke="none"/></svg><span class="brand-name">${SITE_NAME}</span></a>
      <a class="gh-link" href="${GITHUB_URL}" target="_blank" rel="noopener" aria-label="GitHub 프로필 (새 창)">
        <svg class="gh-mark" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
      </a>
    </div>`;
  body.prepend(header);

  // ---------- 공통 유틸 ----------
  // 이름은 불변 인프라처럼 번호로 붙인다: RACK-001, server-001 (서버 번호는 랙을 넘어 이어진다)
  const rackName = rack => `RACK-${rack.id}`;
  let seq = 0;
  racks.forEach(rack => rack.servers.forEach(server => { server.host = "server-" + String(++seq).padStart(3, "0"); }));

  // 랙 → 서버 → 주제를 한 줄로 편다. 이전/다음 링크는 이 순서를 따른다.
  const flat = racks.flatMap(rack =>
    rack.servers.flatMap(server =>
      server.topics.map(t => ({ ...t, rack, server, path: `${server.dir}/${t.slug}` }))));
  const badge = s => `<span class="badge ${s}">${STATUS_LABEL[s]}</span>`;
  const topicHref = t => `${root}${t.path}.html`;
  window.CS = { racks, flat, badge, rackName, topicHref, STATUS_LABEL, SITE_NAME, root };

  // ---------- 주제 페이지: 경로, 상태, 이전/다음 ----------
  const here = body.dataset.topic;
  if (here) {
    const idx = flat.findIndex(t => t.path === here);
    const cur = flat[idx];
    const crumb = document.querySelector("[data-crumb]");
    if (cur && crumb) {
      crumb.innerHTML =
        `<a href="${root}index.html#/rack/${cur.rack.id}">${rackName(cur.rack)} · ${cur.rack.name}</a> <span class="sep">/</span> ` +
        `<a href="${root}index.html#/rack/${cur.rack.id}/${cur.server.dir}">${cur.server.host} · ${cur.server.title}</a> <span class="sep">/</span> ${badge(cur.status)}`;
    }
    const pager = document.querySelector("[data-pager]");
    if (pager && idx >= 0) {
      // 예정(todo) 주제는 아직 파일이 없으니 건너뛴다
      const prev = flat.slice(0, idx).reverse().find(t => t.status !== "todo");
      const next = flat.slice(idx + 1).find(t => t.status !== "todo");
      pager.innerHTML =
        (prev ? `<a class="prev" href="${topicHref(prev)}"><small>← 이전</small>${prev.name}</a>` : "") +
        (next ? `<a class="next" href="${topicHref(next)}"><small>다음 →</small>${next.name}</a>` : "");
    }
  }

  // ---------- 푸터 ----------
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `<div class="wrap-wide">${SITE_NAME} · 직접 쓰고, 직접 켜 보며 정리합니다.</div>`;
  body.append(footer);
})();
