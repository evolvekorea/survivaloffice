// 연도별 인기 이름 검색기 (Top20 전용) — 리치요소/공유/링크/스텝퍼 하단 대응

/**********************
 * 전역
 **********************/
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const DATA_BASE = "";                 // babyname.json이 같은 폴더면 ""
const COMBINED_JSON = `${DATA_BASE}babyname.json`;

const LOADING_MS = 900;
let IS_LOADING = false;
let LAST_YEAR = null;

const yearCache = new Map();          // year -> [{year, name, rank}]
let combinedRowsCache = null;         // 전체 rows 캐시

/**********************
 * DOM
 **********************/
const startScreen   = qs("#start-screen");
const selectScreen  = qs("#select-screen");
const loadingScreen = qs("#loading-screen");
const resultScreen  = qs("#result-screen");

const startBtn    = qs("#start-btn");
const searchForm  = qs("#search-form");
const yearSelect  = qs("#year-select");

const listYear    = qs("#list-year");
const toplistGrid = qs("#toplist-grid");

const copyListBtn   = qs("#copy-list");
const shareKakaoBtn = qs("#share-kakao");
const shareLinkBtn  = qs("#share-link");
const restartBtn    = qs("#restart-btn");
const bottomActions = qs("#bottom-actions");
const appEl = document.getElementById("app");

/**********************
 * 유틸
 **********************/
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function nextFrame() { return new Promise(r => requestAnimationFrame(() => r())); }
function setStep(n) { qsa("#stepper li").forEach(li => li.classList.toggle("active", Number(li.dataset.step) === n)); }
function scrollResultToTop() { const el = resultScreen?.querySelector(".result"); if (el) { el.scrollTop = 0; el.scrollLeft = 0; } }
function esc(s=""){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/**********************
 * 화면 전환
 **********************/
function showScreen(screen) {
  qsa(".screen").forEach(el => { el.classList.remove("active"); el.hidden = true; });
  screen.hidden = false; screen.classList.add("active");
  // reflow
  // eslint-disable-next-line no-unused-expressions
  screen.offsetHeight;
  if (screen === startScreen) setStep(1);
  else if (screen === selectScreen) setStep(2);
  else if (screen === loadingScreen) setStep(3);
  else if (screen === resultScreen) { setStep(4); scrollResultToTop(); }

  // ⬇️ 시작 화면에선 스텝퍼 숨김, 그 외엔 표시
  if (screen === startScreen) appEl?.classList.remove("show-stepper");
  else appEl?.classList.add("show-stepper");
}

/**********************
 * 데이터 로드
 **********************/
async function loadCombinedRows() {
  if (combinedRowsCache) return combinedRowsCache;
  const res = await fetch(COMBINED_JSON, { cache: "no-cache" });
  if (!res.ok) throw new Error("통합 데이터(babyname.json) 로드 실패");
  const rows = await res.json(); // [{year, name, rank}]
  combinedRowsCache = rows;
  return rows;
}
async function loadYear(y) {
  if (yearCache.has(y)) return yearCache.get(y);
  const all = await loadCombinedRows();
  const rows = all
    .filter(r => Number(r.year) === Number(y))
    .map(r => ({ year: Number(r.year), name: String(r.name), rank: Number(r.rank) }))
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
  if (!rows.length) throw new Error(`연도 데이터 없음: ${y}`);
  yearCache.set(y, rows);
  return rows;
}

/**********************
 * 렌더 (리치요소: TOP5 강조, 전년 대비 변화표시)
 **********************/
function renderTopGrid(container, rows, prevMap) {
  container.innerHTML = "";
  const frag = document.createDocumentFragment();
  rows
    .slice(0, 20) // Top20
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
    .forEach(({ name, rank }) => {
      const div = document.createElement("div");
      div.className = "rank-item" + (rank <= 5 ? " top5" : "");

      // 전년 대비 변화
      let deltaHtml = "";
      if (prevMap) {
        const prev = prevMap.get(name);
        if (prev == null) {
          deltaHtml = `<span class="rank-delta new" title="전년 순위 없음">NEW</span>`;
        } else {
          const diff = prev - rank; // +면 상승
          if (diff > 0) deltaHtml = `<span class="rank-delta up" title="전년 대비 상승">▲${diff}</span>`;
          else if (diff < 0) deltaHtml = `<span class="rank-delta down" title="전년 대비 하락">▼${Math.abs(diff)}</span>`;
          else deltaHtml = `<span class="rank-delta same" title="전년과 동일">—</span>`;
        }
      }

      div.innerHTML = `
        <span class="rank-num">${rank}</span>
        <span class="rank-name">${esc(name)}</span>
        ${deltaHtml}
      `;
      frag.appendChild(div);
    });
  container.appendChild(frag);
}

/**********************
 * 검색
 **********************/
async function handleSearch(yearVal) {
  if (IS_LOADING) return;
  IS_LOADING = true;
  LAST_YEAR = Number(yearVal);

  showScreen(loadingScreen);
  await nextFrame();

  try {
    const currPromise = loadYear(LAST_YEAR);
    const prevPromise = YEARS.includes(LAST_YEAR - 1) ? loadYear(LAST_YEAR - 1) : Promise.resolve([]);
    const [rows, prevRows] = await Promise.all([currPromise, prevPromise]);
    await sleep(LOADING_MS);

    const prevMap = new Map(prevRows.map(r => [r.name, r.rank]));

    listYear.textContent = String(LAST_YEAR);
    renderTopGrid(toplistGrid, rows, prevMap);

    bottomActions.style.display = "flex";
    updateShareLink();

    gtagSafe("event", "view_result", { year: LAST_YEAR });
    showScreen(resultScreen);
  } catch (e) {
    console.error(e);
    alert("데이터를 불러오는 중 오류가 발생했습니다.");
    showScreen(selectScreen);
  } finally {
    IS_LOADING = false;
  }
}

/**********************
 * 공유/링크
 **********************/
async function loadKakaoSDK() {
  return new Promise((resolve, reject) => {
    if (window.Kakao && window.Kakao.isInitialized()) return resolve();
    const s = document.createElement("script");
    s.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    s.onload = () => { if (!window.Kakao) return reject("Kakao 로드 실패"); window.Kakao.init("eee6c2e01641161de9f217ba99c6a0da"); resolve(); };
    s.onerror = () => reject("Kakao SDK 로드 실패");
    document.head.appendChild(s);
  });
}
function buildQueryURL(year) {
  const url = new URL(location.href);
  url.searchParams.set("year", String(year));
  url.searchParams.delete("name");
  return url.toString();
}
function updateShareLink() {
  const url = buildQueryURL(LAST_YEAR);
  shareLinkBtn.dataset.href = url;
  history.replaceState(null, "", url);
}
function shareLinkCopy() {
  const url = shareLinkBtn.dataset.href || buildQueryURL(LAST_YEAR);
  navigator.clipboard.writeText(url).then(() => {
    shareLinkBtn.textContent = "복사됨!";
    setTimeout(() => (shareLinkBtn.textContent = "🔗 링크 복사"), 1200);
  });
}
async function shareKakao() {
  try {
    await loadKakaoSDK();
    const pageUrl = buildQueryURL(LAST_YEAR);
    const title = `${LAST_YEAR}년 인기 이름 Top 20`;
    const desc  = `해당 연도의 인기 이름 Top 20을 확인해보세요.`;
    const imageUrl = "https://www.survivaloffice.com/images/name1.png";
    window.Kakao.Link.sendDefault({
      objectType: "feed",
      content: { title, description: desc, imageUrl, link: { webUrl: pageUrl, mobileWebUrl: pageUrl } },
      buttons: [{ title: "검색하러 가기", link: { webUrl: pageUrl, mobileWebUrl: pageUrl } }]
    });
    gtagSafe("event", "share_kakao", { year: LAST_YEAR });
  } catch (e) {
    alert("카카오톡 공유를 사용할 수 없습니다.");
  }
}

/**********************
 * 복사
 **********************/
function copyListToClipboard(rows) {
  const text = rows
    .slice(0, 20)
    .sort((a, b) => a.rank - b.rank)
    .map(r => `${r.rank}위 ${r.name}`)
    .join("\n");
  navigator.clipboard.writeText(text).then(() => {
    copyListBtn.textContent = "복사됨!";
    setTimeout(() => (copyListBtn.textContent = "복사"), 1200);
  });
}

/**********************
 * GA4
 **********************/
function gtagSafe(...args) { try { if (typeof gtag === "function") gtag(...args); } catch {} }

/**********************
 * 이벤트
 **********************/
function bindEvents() {
  startBtn?.addEventListener("click", () => {
    showScreen(selectScreen);
    setTimeout(() => yearSelect?.focus(), 0);
    gtagSafe("event", "start_click");
  });

  searchForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const y = Number(yearSelect.value);
    if (!y) { alert("연도를 선택해주세요."); return; }
    await handleSearch(y);
  });

  copyListBtn?.addEventListener("click", async () => {
    if (!LAST_YEAR) return;
    const rows = await loadYear(LAST_YEAR);
    copyListToClipboard(rows);
    gtagSafe("event", "copy_list", { year: LAST_YEAR });
  });

  shareKakaoBtn?.addEventListener("click", shareKakao);
  shareLinkBtn?.addEventListener("click", shareLinkCopy);
  restartBtn?.addEventListener("click", resetApp);

  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(location.search);
    const y = Number(params.get("year"));
    if (y) { yearSelect.value = String(y); handleSearch(y); }
    else { resetApp(); }
  });
}

function resetApp() {
  IS_LOADING = false; LAST_YEAR = null;
  bottomActions.style.display = "none";
  searchForm?.reset();
  history.replaceState(null, "", location.pathname);
  showScreen(startScreen);
}

/**********************
 * 부트스트랩
 **********************/
async function initFromQuery() {
  const params = new URLSearchParams(location.search);
  const y = Number(params.get("year"));
  if (y && YEARS.includes(y)) {
    showScreen(selectScreen);
    yearSelect.value = String(y);
    await handleSearch(y);
  } else {
    showScreen(startScreen);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  initFromQuery();
});
