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
      <a class="brand" href="${root}index.html"><span class="mark" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2" y="9" width="12" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="4.5" r="1" fill="#68b631"/><circle cx="11" cy="11.5" r="1" fill="#68b631"/></svg></span><span class="brand-name">${SITE_NAME}</span></a>
      <a class="gh-link" href="${GITHUB_URL}" target="_blank" rel="noopener" aria-label="GitHub 프로필 (새 창)">
        <svg class="gh-mark" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        <span class="gh-text">GitHub</span>
      </a>
    </div>`;
  body.prepend(header);

  // ---------- 공통 유틸 ----------
  const unitNo = i => "U" + String(i + 1).padStart(2, "0");
  // 랙 → 서버 → 주제를 한 줄로 편다. 이전/다음 링크는 이 순서를 따른다.
  const flat = racks.flatMap(rack =>
    rack.servers.flatMap((server, si) =>
      server.topics.map(t => ({ ...t, rack, server, unit: unitNo(si), path: `${server.dir}/${t.slug}` }))));
  const badge = s => `<span class="badge ${s}">${STATUS_LABEL[s]}</span>`;
  window.CS = { racks, flat, badge, unitNo, STATUS_LABEL, SITE_NAME, root };

  // ---------- 주제 페이지: 경로, 상태, 이전/다음 ----------
  const here = body.dataset.topic;
  if (here) {
    const idx = flat.findIndex(t => t.path === here);
    const cur = flat[idx];
    const crumb = document.querySelector("[data-crumb]");
    if (cur && crumb) {
      crumb.innerHTML =
        `<a href="${root}index.html#rack-${cur.rack.id}">Rack ${cur.rack.id} · ${cur.rack.name}</a> <span class="sep">/</span> ` +
        `<a href="${root}index.html#srv-${cur.server.dir}">${cur.unit} ${cur.server.title}</a> <span class="sep">/</span> ${badge(cur.status)}`;
    }
    const pager = document.querySelector("[data-pager]");
    if (pager && idx >= 0) {
      // 예정(todo) 주제는 아직 파일이 없으니 건너뛴다
      const prev = flat.slice(0, idx).reverse().find(t => t.status !== "todo");
      const next = flat.slice(idx + 1).find(t => t.status !== "todo");
      pager.innerHTML =
        (prev ? `<a class="prev" href="${root}${prev.path}.html"><small>← 이전</small>${prev.name}</a>` : "") +
        (next ? `<a class="next" href="${root}${next.path}.html"><small>다음 →</small>${next.name}</a>` : "");
    }
  }

  // ---------- 푸터 ----------
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `<div class="wrap-wide">${SITE_NAME} · 직접 쓰고, 직접 켜 보며 정리합니다.</div>`;
  body.append(footer);
})();
