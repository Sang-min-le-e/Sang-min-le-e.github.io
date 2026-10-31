// 마크다운 파일을 불러와 사이트 스타일로 그린다. marked 라이브러리를 먼저 불러와야 한다.
// - "## 제목"마다 01, 02 … 단계 번호를 붙인다 (startStep부터)
// - 첫 "# 제목"은 돌려준다 (페이지 제목으로 쓰려고)
window.renderMarkdown = async function (el, url, { startStep = 1, dropTitle = false } = {}) {
  let text;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    text = await res.text();
  } catch (e) {
    el.innerHTML = `<div class="note"><strong>글을 불러오지 못했어요.</strong> <code>${url}</code> 파일이 있는지 확인하세요.</div>`;
    return null;
  }

  el.innerHTML = marked.parse(text);

  // 링크가 다른 사이트면 새 창으로
  el.querySelectorAll("a[href^='http']").forEach(a => { a.target = "_blank"; a.rel = "noopener"; });

  const h1 = el.querySelector("h1");
  const title = h1 ? h1.textContent : null;
  if (h1 && dropTitle) h1.remove();

  // 페이지 제목 바로 아래 첫 문단은 소개 문단으로
  if (h1 && !dropTitle) {
    const first = h1.nextElementSibling;
    if (first && first.tagName === "P") first.classList.add("lead");
  }

  let n = startStep;
  el.querySelectorAll("h2").forEach(h2 => {
    h2.insertAdjacentHTML("afterbegin", `<span class="step">${String(n++).padStart(2, "0")}</span>`);
  });
  return title;
};
