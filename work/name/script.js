// script.js
// 반려동물 이름 검색기 - 화면 전환, 데이터 로드, 기본 렌더, 카카오 공유/다시하기

// ====== 기본 유틸 ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const fmtPct = (p, maxDigits = 3) =>
  new Intl.NumberFormat("ko-KR", { maximumFractionDigits: maxDigits }).format(p);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const normalizeName = (s) =>
  (s || "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();

const LOADING_MS = 3000;
let IS_LOADING = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));


// ====== 전역 상태 ======
let DATA = null;          // { meta:{total_count}, names:[{name, pct}] }
let NAME_MAP = new Map(); // normalized -> record
let RANK_MAP = new Map(); // name -> rank(동률포함)
let LAST_QUERY = "";      // 최근 검색 이름(원문)

// ====== DOM 캐시 ======
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM loaded");

  // 화면 요소
  const startScreen  = $("#start-screen");
  const searchScreen = $("#search-screen") || $("#quiz-screen"); // 호환 처리
  const loadingScreen = $("#loading-screen");
  const resultScreen = $("#result-screen");

  // 시작/검색
  const startBtn = $("#start-btn");
  const searchForm = $("#search-form");
  const nameInput = $("#name-input");
  const suggestBox = $("#suggest-box");
  const suggestChips = $("#suggest-chips");

  // 결과 헤더/지표
  const resName = $("#res-name");
  const resRankBadge = $("#res-rank-badge");
  const resSubcopy = $("#res-subcopy");
  const kpiPct = $("#kpi-pct");
  const kpiPerThousand = $("#kpi-per-thousand");
  const kpiOneIn = $("#kpi-one-in");
  const kpiRank = $("#kpi-rank");

  // 차트 컨테이너 (CSS/JS로 이후 구현)
  const chartOverallDonut = $("#chart-overall-donut");
  const chartTop10Bar = $("#chart-top10-bar");
  const chartWaffle = $("#chart-waffle");

  // Top 리스트
  const topTbody = $("#top-tbody");
  const topNSelect = $("#top-n");
  const btnDownloadTop = $("#btn-download-top");

  // 하단 액션
  const bottomActions = $("#bottom-actions");
  const shareBtn = $("#share-kakao");
  const restartBtn = $("#restart-btn");

  // ====== 화면 전환 ======
  function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.remove('active');
      el.hidden = true;
    });
    screen.hidden = false;
    screen.classList.add('active');
    screen.offsetHeight; // 강제 리플로우

    // ✅ 결과 화면으로 전환될 때, 내부 스크롤을 항상 맨 위로
    if (screen === resultScreen) {
      scrollResultToTop();
    }
  }

  // ✅ 결과 화면(360x550 박스) 내부 스크롤을 항상 맨 위로
  function scrollResultToTop() {
    const scrollers = [
      resultScreen?.querySelector(".result"),     // 결과 메인 스크롤 컨테이너
      resultScreen?.querySelector(".table-wrap")  // 표 스크롤 영역(보조)
    ].filter(Boolean);
    scrollers.forEach(el => { el.scrollTop = 0; el.scrollLeft = 0; });
  }

  // ====== 데이터 로드 (한 번만) ======
  async function loadDataOnce() {
    if (DATA) return DATA;
    try {
      const res = await fetch("pet_name.json", { cache: "no-store" });
      DATA = await res.json();
      console.log("📥 JSON loaded:", DATA?.meta);

      // 정렬/맵/랭크 준비
      DATA.names.sort((a, b) => b.pct - a.pct);

      // ✅ Top100 합계(%) 미리 계산해 meta에 저장
      DATA.meta = DATA.meta || {};
      DATA.meta.sumTop100Pct = DATA.names.slice(0, 100)
        .reduce((sum, r) => sum + (Number(r.pct) || 0), 0);

      // 동률 포함 순위 계산
      const pctList = DATA.names.map(r => r.pct);
      const rankByPct = new Map();
      let currentRank = 1, prev = null, seen = 0;
      for (const p of pctList) {
        seen += 1;
        if (prev === null || p < prev) { currentRank = seen; prev = p; }
        if (!rankByPct.has(p)) rankByPct.set(p, currentRank);
      }

      for (const r of DATA.names) {
        NAME_MAP.set(normalizeName(r.name), r);
        RANK_MAP.set(r.name, rankByPct.get(r.pct));
      }
      return DATA;
    } catch (e) {
      console.error("❌ 데이터 로드 실패:", e);
      alert("데이터 파일을 불러올 수 없습니다. pet_name.json을 같은 폴더에 두고 웹서버로 실행하세요.");
      throw e;
    }
  }

  // 상단 어딘가에 보조 헬퍼 추가
  let DATA_PREFETCHING = false;
  function prefetchData() {
    if (DATA || DATA_PREFETCHING) return;
    DATA_PREFETCHING = true;
    loadDataOnce()
      .catch(() => {})
      .finally(() => { DATA_PREFETCHING = false; });
  }


  // ====== 제안(비슷한 이름) ======
  function renderSuggest(prefix) {
    // ⬇️ 처음엔 DATA가 없을 수 있으니 안전 가드
    if (!DATA || !Array.isArray(DATA.names)) {
      if (suggestBox) suggestBox.hidden = true;
      if (suggestChips) suggestChips.innerHTML = "";
      return;
    }

    const q = normalizeName(prefix);
    if (!q) { 
      if (suggestBox) suggestBox.hidden = true;
      if (suggestChips) suggestChips.innerHTML = "";
      return; 
    }

    const picks = [];
    for (const r of DATA.names) {
      if (normalizeName(r.name).startsWith(q) && r.name !== prefix) {
        picks.push(r);
        if (picks.length >= 12) break;
      }
    }

  if (suggestChips) suggestChips.innerHTML = "";
  if (suggestBox) suggestBox.hidden = picks.length === 0;
  if (picks.length === 0) return;

  picks.forEach(r => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = r.name;
    chip.addEventListener("click", () => {
      nameInput.value = r.name;
      searchForm.dispatchEvent(new Event("submit"));
    });
    suggestChips.appendChild(chip);
  });
}

  // ====== 결과 렌더 ======
  function renderResult(rec) {
    // KPI/문장
    const total = DATA.meta?.total_count || 0;
    const pct = rec?.pct ?? 0;
    const rank = RANK_MAP.get(rec?.name) || "-";
    const oneIn = pct > 0 ? Math.round(100 / pct) : 0; // 1/n 환산 (100 / %)

    resName.textContent = rec?.name || "—";
    resRankBadge.textContent = (rank !== "-") ? `${rank}위` : "—위";
    resSubcopy.textContent = (pct > 0)
      ? `표본 ${total.toLocaleString()}마리 중 약 1/${oneIn.toLocaleString()} 빈도로 등록되는 이름`
      : `표본 ${total.toLocaleString()}마리에서 찾을 수 없는 이름이에요`;

    // ✅ KPI: 전체 대비 비율
    kpiPct.textContent = `${fmtPct(pct)}%`;

    // ✅ KPI: 천 마리당(Top100 기준)
    // - Top100 안에 있을 때만: (해당 이름 % / Top100 합계 %) * 1000
    // - Top100 밖이면 "Top100 외" 표시
    if (kpiPerThousand) {
      const sumTop100 = DATA.meta?.sumTop100Pct || DATA.names.slice(0, 100)
        .reduce((a, r) => a + (Number(r.pct) || 0), 0);

      if (rank !== "-" && Number(rank) <= 100 && pct > 0 && sumTop100 > 0) {
        const perThousandTop100 = (pct / sumTop100) * 1000;
        kpiPerThousand.textContent = `${fmtPct(perThousandTop100, 1)}‰`;
      } else {
        kpiPerThousand.textContent = "Top100 외";
      }
    }

    // ✅ KPI: 희소도 (1/n)
    kpiOneIn.textContent = (oneIn > 0) ? `1/${oneIn.toLocaleString()}` : "—";

    // ✅ 순위
    if (kpiRank) {
      kpiRank.textContent = (rank !== "-") ? `${rank}위` : "—위";
    }

    // 차트들(실제 그리기는 CSS/JS로 이후 단계에서 강화)
    renderDonut(chartOverallDonut, pct);
    renderTop10Bar(chartTop10Bar, rec?.name);
    renderWaffle(chartWaffle, pct);

    // Top 표
    renderTopTable(topTbody, rec?.name, Number(topNSelect.value) || 100);

    // 비슷한 이름 (결과에서도 한 번 더)
    const resSuggest = $("#res-suggest");
    const resChips = $("#res-chips");
    if (rec?.name) {
      resChips.innerHTML = "";
      const picks = [];
      const q = normalizeName(rec.name);
      for (const r of DATA.names) {
        if (normalizeName(r.name).startsWith(q) && r.name !== rec.name) {
          picks.push(r); if (picks.length >= 12) break;
        }
      }
      picks.forEach(r => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = r.name;
        chip.addEventListener("click", () => handleSearch(r.name));
        resChips.appendChild(chip);
      });
      resSuggest.hidden = picks.length === 0;
    } else {
      resSuggest.hidden = true;
    }
  }

  // 도넛(전체 대비 %만) — CSS에서 conic-gradient로 링 처리 예정
  function renderDonut(el, pct) {
    if (!el) return;
    const p = clamp(pct, 0, 100);
    // conic-gradient를 직접 스타일로 지정(색상은 CSS에서 덮어써도 됨)
    el.style.setProperty("--pct", p);
    el.style.background = `conic-gradient(#111 ${p}%, #e9ecf2 0)`;
    // 중앙에 큰 숫자 텍스트
    el.innerHTML = `<div class="donut-center">${fmtPct(p)}%</div>`;
  }

  // Top10 정규화 막대 (Top10 합을 100%로)
  function renderTop10Bar(el, highlightName) {
    if (!el) return;
    const top10 = DATA.names.slice(0, 10);
    const sum = top10.reduce((a, r) => a + r.pct, 0) || 1;
    el.innerHTML = "";
    top10.forEach((r, idx) => {
      const scaled = (r.pct / sum) * 100;
      const row = document.createElement("div");
      row.className = "bar-row" + (r.name === highlightName ? " active" : "");
      row.innerHTML = `
        <div class="bar-label">${idx + 1}. ${r.name}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${scaled}%;"></div></div>
        <div class="bar-val">${fmtPct(scaled)}%</div>
      `;
      el.appendChild(row);
    });
  }

  // 와플(1000-dot): pct% * 10개 채우기
function renderWaffle(el, pct) {
  if (!el) return;
  const totalDots = 1000;
  const need = Math.round(clamp(pct, 0, 100) * 10); // % * 10 = 1000 스케일

  // 그리드가 없거나(초기) / 이전에 비웠다면 재생성
  if (!el.dataset.built || el.children.length !== totalDots) {
    el.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("i");
      dot.className = "dot";
      frag.appendChild(dot);
    }
    el.appendChild(frag);
    el.dataset.built = "1";
  }

  const dots = el.children;
  for (let i = 0; i < totalDots; i++) {
    const on = i < need;
    const d = dots[i];
    if (d) d.classList.toggle("on", on);
  }
}

  // Top 표 렌더 + 하이라이트 + 자동 스크롤
  function renderTopTable(tbody, highlightName, topN = 100) {
    if (!tbody) return;
    const rows = DATA.names.slice(0, topN).map((r, idx) => {
      const tr = document.createElement("tr");
      if (r.name === highlightName) tr.classList.add("hl");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${r.name}</td>
        <td class="num">${fmtPct(r.pct)}%</td>
      `;
      return tr;
    });

    tbody.innerHTML = "";
    rows.forEach(tr => tbody.appendChild(tr));

    // ✅ 표/결과 컨테이너 내부 스크롤을 모두 상단으로
    const wrap = tbody.closest(".table-wrap");
    if (wrap) wrap.scrollTop = 0;
    scrollResultToTop(); // (보수적) 결과 박스도 상단

  }

  // ====== 검색 처리 ======
async function handleSearch(rawName) {
  if (IS_LOADING) return;       // 중복 방지
  IS_LOADING = true;
  LAST_QUERY = rawName;

  // 1) 먼저 로딩 화면을 확실히 보여줌
  showScreen(loadingScreen);
  await nextFrame();            // 페인트 한 프레임 보장

  try {
    // 2) 데이터 로드와 동시에 3초 대기 (항상 3초 보장)
    await Promise.all([loadDataOnce(), sleep(LOADING_MS)]);

    // 3) 결과 계산/표시
    const key = normalizeName(rawName);
    const rec = NAME_MAP.get(key) || null;

    showScreen(resultScreen);

    // ✅ 결과 화면 그리기 직전 한 프레임 보장 후 상단 고정
    await nextFrame();
    scrollResultToTop();

    bottomActions.style.display = "flex";
    renderResult(rec || { name: rawName, pct: 0 });

    // ✅ 렌더링으로 내용 늘어난 뒤에도 한 번 더 상단 고정
    scrollResultToTop();

  } catch (e) {
    console.error(e);
    showScreen(searchScreen);
  } finally {
    IS_LOADING = false;
  }
}

  // ====== 이벤트 바인딩 ======
  startBtn?.addEventListener("click", () => {
    showScreen(searchScreen);
    nameInput?.focus();
    prefetchData();            // ⬅️ 추가
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (nameInput?.value || "").trim();
    if (!q) return;
    handleSearch(q);
  });

  nameInput?.addEventListener("input", (e) => {
    const v = e.target.value;
    if (!DATA) {
      prefetchData();
      // 데이터 로드 완료 후 현재 입력값으로 한 번 더 시도
      // loadDataOnce()는 이미 실행 중이면 같은 Promise를 재사용하도록 구현되어 있어 안전
      loadDataOnce().then(() => renderSuggest(v)).catch(() => {});
      return;
    }
    renderSuggest(v);
  });
  
  topNSelect?.addEventListener("change", () => {
    renderTopTable(topTbody, LAST_QUERY, Number(topNSelect.value) || 100);
    scrollResultToTop(); // ✅ 결과 박스 내부만 상단 고정
  });

  // ====== 다시하기 ======
  function resetApp() {
  IS_LOADING = false;  // ✅ 플래그 초기화
  LAST_QUERY = "";
  bottomActions.style.display = "none";

  // 결과 UI 초기화
  resName.textContent = "—";
  resRankBadge.textContent = "—위";
  resSubcopy.textContent = "";
  if (kpiPct) kpiPct.textContent = "—%";
  if (kpiPerThousand) kpiPerThousand.textContent = "—‰";
  if (kpiOneIn) kpiOneIn.textContent = "—";
  if (kpiRank) kpiRank.textContent = "—위";

  // 차트 초기화 (와플은 built 플래그도 제거)
  if (chartOverallDonut) {
    chartOverallDonut.style.removeProperty("--pct");
    chartOverallDonut.innerHTML = "";
  }
  if (chartTop10Bar) chartTop10Bar.innerHTML = "";
  if (chartWaffle) {
    chartWaffle.innerHTML = "";
    delete chartWaffle.dataset.built; // ✅ 이 줄이 핵심
  }

  // 표/칩
  if (topTbody) topTbody.innerHTML = "";
  if (suggestChips) suggestChips.innerHTML = "";
  const resChips = document.getElementById("res-chips");
  if (resChips) resChips.innerHTML = "";
  const resSuggest = document.getElementById("res-suggest");
  if (resSuggest) resSuggest.hidden = true;
  const suggestBox = document.getElementById("suggest-box");
  if (suggestBox) suggestBox.hidden = true;

  // 화면 전환
  showScreen(startScreen);
}

  restartBtn?.addEventListener("click", resetApp);

  // ====== 카카오 SDK/공유 ======
  async function loadKakaoSDK() {
    return new Promise((resolve, reject) => {
      if (window.Kakao && window.Kakao.isInitialized()) return resolve();
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
      script.onload = () => {
        if (!window.Kakao) return reject("❌ Kakao 객체가 로드되지 않음");
        // 사용자가 기존에 쓰던 키 재사용
        window.Kakao.init("eee6c2e01641161de9f217ba99c6a0da");
        resolve();
      };
      script.onerror = () => reject("❌ Kakao SDK 로드 실패");
      document.head.appendChild(script);
    });
  }
  loadKakaoSDK().catch(console.warn);

  function shareKakao() {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("⚠️ 카카오톡 공유 기능을 사용할 수 없습니다.");
      return;
    }
    const rec = NAME_MAP.get(normalizeName(LAST_QUERY)) || null;
    const pctText = rec ? `${fmtPct(rec.pct)}%` : "미등록";
    const title = rec
      ? `반려동물 이름 "${rec.name}" — ${pctText}, ${RANK_MAP.get(rec.name)}위`
      : `반려동물 이름 "${LAST_QUERY}" — 표본에서 찾지 못했어요`;

    const shareImage = "https://www.survivaloffice.com/images/name1.png"; // 기본 OG 이미지
    const pageUrl = "https://www.survivaloffice.com/work/name"; // 실제 페이지 URL로 교체 권장

    window.Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title,
        description: "우리집 반려동물과 같은 이름은 얼마나 있을까?",
        imageUrl: shareImage,
        link: { mobileWebUrl: pageUrl, webUrl: pageUrl }
      },
      buttons: [
        { title: "이름 검색하기", link: { mobileWebUrl: pageUrl, webUrl: pageUrl } }
      ]
    });
  }
  shareBtn?.addEventListener("click", shareKakao);

  // 초기가 화면: 시작 화면
  showScreen(startScreen);
});
