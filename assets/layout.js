// 모든 페이지가 공유하는 헤더, 목차, 이전/다음 링크.
// 페이지는 <body data-root="../" data-topic="ds/hash-table"> 처럼 위치만 알려주면 된다.
(function () {
  const SITE_NAME = "CS 노트";
  const STATUS_LABEL = { todo: "예정", draft: "초안", understood: "이해함", interview: "면접 가능" };
  const body = document.body;
  const root = body.dataset.root || "./";
  const chapters = window.TOPICS || [];

  // ---------- 헤더 ----------
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap-wide inner">
      <a class="brand" href="${root}index.html"><span class="mark" aria-hidden="true">CS</span>${SITE_NAME} <span class="sub">면접까지 가는 컴퓨터공학</span></a>
    </div>`;
  body.prepend(header);

  // ---------- 공통 유틸 ----------
  const flat = chapters.flatMap((c, ci) => c.topics.map(t => ({ ...t, chapter: c, ci, path: `${c.dir}/${t.slug}` })));
  const badge = s => `<span class="badge ${s}">${STATUS_LABEL[s]}</span>`;
  window.CS = { chapters, flat, badge, STATUS_LABEL, root };

  // ---------- 주제 페이지: 경로, 상태, 이전/다음 ----------
  const here = body.dataset.topic;
  if (here) {
    const idx = flat.findIndex(t => t.path === here);
    const cur = flat[idx];
    const crumb = document.querySelector("[data-crumb]");
    if (cur && crumb) {
      const no = String(cur.ci + 1).padStart(2, "0");
      crumb.innerHTML = `<a href="${root}index.html#ch-${cur.chapter.dir}">${no} ${cur.chapter.title}</a> <span class="sep">/</span> ${badge(cur.status)}`;
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
  footer.innerHTML = `<div class="wrap-wide">직접 쓰고, 직접 만져 보며 정리합니다. · ${SITE_NAME}</div>`;
  body.append(footer);
})();
