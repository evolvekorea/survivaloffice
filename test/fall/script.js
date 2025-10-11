// script.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  // ---------- DOM 참조 ----------
  const startScreen  = document.getElementById("start-screen");
  const genderScreen = document.getElementById("gender-screen");
  const quizScreen   = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");

  const startBtn   = document.getElementById("start-btn");
  const maleBtn    = document.getElementById("male-btn");
  const femaleBtn  = document.getElementById("female-btn");

  const questionText = document.getElementById("question-text");
  const choiceA = document.getElementById("choice-a"); // O
  const choiceB = document.getElementById("choice-b"); // X
  const resultImage = document.getElementById("result-image");

  // 진행바
  const progressFill  = document.getElementById("progress-fill");
  const progressTrack = document.getElementById("progress-track");
  const progressCount = document.getElementById("progress-count");

  // 하단 액션
  const bottomActions = document.getElementById("bottom-actions");
  const shareBtn   = document.getElementById("share-kakao");
  const restartBtn = document.getElementById("restart-btn");

  // ---------- 질문 세트 (성별 분기) ----------
  // 여: 감정/수면/식욕/관계 중심 톤
  const QUESTIONS_FEMALE = [
    "괜히 눈물이 많아졌다.",
    "단 음식이 더 당긴다.",
    "낮잠을 자는 날이 늘었다.",
    "SNS에 감성 글귀를 올리고 싶어진다.",
    "외출보다 집에 있고 싶다.",
    "밤이면 외로움이 커진다.",
    "옷 쇼핑이 잦아진다.",
    "작은 일에도 예민해진다.",
    "연애 생각이 자주 난다.",
    "아침에 일어나기가 힘들다."
  ];

  // 남: 생활/의욕/외로움/자기점검 중심 톤
  const QUESTIONS_MALE = [
    "괜히 술이 땡긴다.",
    "운동 의욕이 잘 나지 않는다.",
    "늦잠을 자는 날이 많아졌다.",
    "퇴근길이 유난히 쓸쓸하다.",
    "식욕이 늘어 자꾸 배가 고프다.",
    "발라드나 잔잔한 노래를 듣게 된다.",
    "목표 달성이 더 버겁게 느껴진다.",
    "드라이브 욕구가 자주 생긴다.",
    "이유 없이 무기력하다.",
    "밤에 생각이 많아 잠이 늦어진다."
  ];

  // ---------- 상태값 ----------
  let selectedGender = null;        // 'male' | 'female'
  let questions = [];               // 현재 세트(10문항)
  let currentIndex = 0;             // 0..9
  let yesCount = 0;                 // O=1, X=0
  let latestPercent = 0;            // 결과 공유에 사용

  const TOTAL = 10;

  // ---------- 진행바 업데이트 ----------
  function updateProgress() {
    const current = Math.min(currentIndex + 1, TOTAL);
    const percent = (current / TOTAL) * 100;

    if (progressFill)  progressFill.style.width = percent + "%";
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(current));
    if (progressCount) progressCount.textContent = `${current} / ${TOTAL}`;
  }

  // ---------- 화면 전환 ----------
  function goTo(screenFrom, screenTo) {
    if (screenFrom) screenFrom.classList.remove("active");
    if (screenTo)   screenTo.classList.add("active");
  }

  // ---------- 시작/성별 선택 ----------
  startBtn.addEventListener("click", () => {
    console.log("▶ 테스트 시작");
    goTo(startScreen, genderScreen);
  });

  maleBtn.addEventListener("click", () => {
    selectedGender = "male";
    questions = QUESTIONS_MALE.slice();
    startQuiz();
  });

  femaleBtn.addEventListener("click", () => {
    selectedGender = "female";
    questions = QUESTIONS_FEMALE.slice();
    startQuiz();
  });

  function startQuiz() {
    console.log("👤 gender:", selectedGender);
    currentIndex = 0;
    yesCount = 0;

    // 진행바 초기화
    if (progressFill)  progressFill.style.width = "0%";
    if (progressTrack) {
      progressTrack.setAttribute("aria-valuemin", "0");
      progressTrack.setAttribute("aria-valuemax", String(TOTAL));
      progressTrack.setAttribute("aria-valuenow", "0");
    }
    if (progressCount) progressCount.textContent = `0 / ${TOTAL}`;

    goTo(genderScreen, quizScreen);
    renderQuestion();
  }

  // ---------- 문항 렌더 ----------
  function renderQuestion() {
    const q = questions[currentIndex];
    if (!q) return;
    updateProgress();
    questionText.textContent = q;

    // O/X 텍스트는 버튼에 이미 들어가 있으니 그대로 사용
    // 필요시 스타일만 상태로 바꾸면 됨
  }

  // ---------- 응답 처리 ----------
  choiceA.addEventListener("click", () => handleAnswer(true));   // O
  choiceB.addEventListener("click", () => handleAnswer(false));  // X

  function handleAnswer(isYes) {
    if (isYes) yesCount += 1;
    currentIndex += 1;

    if (currentIndex < TOTAL) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  // ---------- 점수→구간 매핑 ----------
  function percentFromYesCount(count) {
    return Math.round((count / TOTAL) * 100); // 0,10,20,...,100
  }

  function bucketKey(pct) {
    // 10단위 반올림 후 5구간 매핑
    const r = Math.round(pct / 10) * 10;
    if (r <= 20) return "0-20";
    if (r <= 40) return "30-40";
    if (r <= 60) return "50-60";
    if (r <= 80) return "70-80";
    return "90-100";
  }

  // 결과 이미지(성별/구간) — 파일명은 필요에 맞게 교체해서 사용
  const RESULT_IMAGES = {
    male: {
      "0-20":  "https://www.survivaloffice.com/images/fall_m_20.png",
      "30-40": "https://www.survivaloffice.com/images/fall_m_40.png",
      "50-60": "https://www.survivaloffice.com/images/fall_m_60.png",
      "70-80": "https://www.survivaloffice.com/images/fall_m_80.png",
      "90-100":"https://www.survivaloffice.com/images/fall_m_100.png"
    },
    female: {
      "0-20":  "https://www.survivaloffice.com/images/fall_f_20.png",
      "30-40": "https://www.survivaloffice.com/images/fall_f_40.png",
      "50-60": "https://www.survivaloffice.com/images/fall_f_60.png",
      "70-80": "https://www.survivaloffice.com/images/fall_f_80.png",
      "90-100":"https://www.survivaloffice.com/images/fall_f_100.png"
    }
  };

  // ---------- 결과 표시 ----------
  function showResult() {
    latestPercent = percentFromYesCount(yesCount);
    const bKey = bucketKey(latestPercent);
    const genderKey = selectedGender || "male";

    const src =
      (RESULT_IMAGES[genderKey] && RESULT_IMAGES[genderKey][bKey]) ||
      "https://www.survivaloffice.com/images/fall.png"; // 폴백

    console.log(`🏁 완료: yes=${yesCount}/${TOTAL} → ${latestPercent}% → bucket=${bKey}`);
    console.log("🖼 결과 이미지:", src);

    resultImage.src = src;
    goTo(quizScreen, resultScreen);
    bottomActions.style.display = "flex";
  }

  // ---------- 다시하기 ----------
  function resetTest() {
    // 상태값 초기화
    selectedGender = null;
    questions = [];
    currentIndex = 0;
    yesCount = 0;
    latestPercent = 0;

    // 이미지/진행바 초기화
    resultImage.src = "";
    if (progressFill)  progressFill.style.width = "0%";
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", "0");
    if (progressCount) progressCount.textContent = `0 / ${TOTAL}`;

    // 화면: 시작으로
    resultScreen.classList.remove("active");
    quizScreen.classList.remove("active");
    genderScreen.classList.remove("active");
    startScreen.classList.add("active");

    bottomActions.style.display = "none";
    console.log("🔄 리셋 완료");
  }

  restartBtn.addEventListener("click", resetTest);

  // ---------- 카카오 공유 ----------
  // HTML에서 kakao SDK를 선탑재했으므로 여기서 init만(앱키 교체)
  try {
    if (window.Kakao && !Kakao.isInitialized()) {
      Kakao.init("eee6c2e01641161de9f217ba99c6a0da"); // ← 본인 앱키로 유지/교체
      console.log("✅ Kakao.init 완료");
    }
  } catch (e) {
    console.warn("⚠️ Kakao SDK 초기화 실패:", e);
  }

  function shareKakaoWithScore() {
    if (!window.Kakao || !Kakao.isInitialized()) {
      alert("⚠️ 카카오 공유를 사용할 수 없습니다.");
      return;
    }

    const pageUrl = "https://www.survivaloffice.com/test/fall";
    const imgUrl  = resultImage?.src || "https://www.survivaloffice.com/images/fall.png";
    const desc    = `내 가을 감성 점수는 ${latestPercent}%!`;

    Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: "가을 타나봐 테스트 🍂",
        description: desc,
        imageUrl: imgUrl,
        link: { mobileWebUrl: pageUrl, webUrl: pageUrl }
      },
      buttons: [
        { title: "나도 해보기", link: { mobileWebUrl: pageUrl, webUrl: pageUrl } }
      ]
    });
  }

  shareBtn.addEventListener("click", shareKakaoWithScore);

  // ---------- 참여자 카운터 (CounterAPI) ----------
  const COUNTER_BASE = "https://api.counterapi.dev/v1";
  const ONLY_ONCE_PER_SESSION = false; // 같은 탭에서 1회만 집계하려면 true

  function counterPath(ns, key) {
    // 항상 trailing slash
    return `${COUNTER_BASE}/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/`;
  }

  function getCounterConfig() {
    const el = document.getElementById("test-counter");
    return {
      el,
      ns: el?.dataset.counterNamespace || "survivaloffice",
      key: el?.dataset.counterKey || "fall"
    };
  }

  function cacheKey(ns, key) { return `counter_${ns}_${key}`; }
  function getCachedCount(ns, key, maxAgeMs = 10 * 60 * 1000) {
    try {
      const raw = localStorage.getItem(cacheKey(ns, key));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.t > maxAgeMs) return null;
      return typeof obj.v === "number" ? obj.v : null;
    } catch { return null; }
  }
  function setCachedCount(ns, key, val) {
    try {
      localStorage.setItem(cacheKey(ns, key), JSON.stringify({ v: Number(val) || 0, t: Date.now() }));
    } catch {}
  }

  async function fetchCount(ns, key) {
    const url = counterPath(ns, key);
    try {
      const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
      if (!r.ok) return 0;
      const data = await r.json();
      return (typeof data.count === "number") ? data.count :
             (typeof data.value === "number") ? data.value : 0;
    } catch (e) {
      console.warn("[counter] fetch failed:", e);
      return 0;
    }
  }

  async function hitCount(ns, key) {
    const url = `${counterPath(ns, key)}up`;
    try {
      const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
      if (!r.ok) return null;
      const data = await r.json();
      return (typeof data.count === "number") ? data.count :
             (typeof data.value === "number") ? data.value : null;
    } catch (e) {
      console.warn("[counter] hit failed:", e);
      return null;
    }
  }

  function shouldIncreaseThisSession(ns, key) {
    if (!ONLY_ONCE_PER_SESSION) return true;
    const flag = `counted_${ns}_${key}`;
    if (sessionStorage.getItem(flag) === "1") return false;
    sessionStorage.setItem(flag, "1");
    return true;
    }

  function renderCount(el, n) {
    if (!el) return;
    el.textContent = `총 ${Number(n).toLocaleString()}명 참여`;
    el.setAttribute("data-count", String(n));
    const { ns, key } = getCounterConfig();
    if (ns && key && typeof n === "number") setCachedCount(ns, key, n);
  }

  (async function initCounter() {
    const { el, ns, key } = getCounterConfig();
    if (!el) return;

    const cached = getCachedCount(ns, key);
    if (cached !== null) renderCount(el, cached);

    const fresh = await fetchCount(ns, key);
    renderCount(el, fresh);

    const startBtnEl = document.getElementById("start-btn");
    if (startBtnEl) {
      startBtnEl.addEventListener("click", async () => {
        try {
          if (shouldIncreaseThisSession(ns, key)) {
            const after = await hitCount(ns, key);
            if (after !== null) renderCount(el, after);
          }
        } catch (e) {
          console.warn("[counter] increase on click failed:", e);
        }
      });
    }
  })();
});
