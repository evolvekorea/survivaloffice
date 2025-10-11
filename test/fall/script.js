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

  // 결과 영역
  const resultTitleEl       = document.getElementById("result-title");
  const resultPercentEl     = document.getElementById("result-percent");
  const resultBarFillEl     = document.getElementById("result-bar-fill");
  const resultBarEl         = document.querySelector(".result-bar");
  const resultNameEl        = document.getElementById("result-name");
  const resultDescriptionEl = document.getElementById("result-description");

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
  let latestResultName = "";       // 공유용 결과 이름

  const TOTAL = 10;

  const RESULT_TITLES = {
    male: "가을 남자 지수",
    female: "가을 여자 지수"
  };

  const RESULT_CONTENT = {
    male: {
      "0-20": {
        name: "바람 안 타는 단풍 방패",
        description: "아직은 가을 감성보다 현실력이 앞서네요. 건조해지는 날씨만 잘 관리하면 이번 시즌도 안정적으로 지나갈 수 있어요."
      },
      "30-40": {
        name: "선선바람 적응 중 드라이버",
        description: "가끔 스며드는 쓸쓸함을 드라이브나 산책으로 날려보내는 타입! 몸을 조금만 더 움직이면 가을 무드가 즐거움으로 바뀔 거예요."
      },
      "50-60": {
        name: "감성 충전 낙엽 수집가",
        description: "가을 감성에 슬슬 물드는 중입니다. 취미 생활이나 음악 플레이리스트에 감미로운 곡을 추가하면 기분 좋은 감성 파도가 와요."
      },
      "70-80": {
        name: "가을 무드 한잔 브루마스터",
        description: "낮에는 현실, 밤에는 감성으로 꽉 채운 스타일! 따뜻한 커피 한 잔과 플레이리스트로 스스로를 달래는 능력이 탁월합니다."
      },
      "90-100": {
        name: "감성 폭발 노을 장인",
        description: "주황빛 노을만 봐도 마음이 흔들리는 진성 가을러. 낙엽 밟는 소리 하나에도 의미를 부여하는 섬세함이 매력 포인트예요."
      }
    },
    female: {
      "0-20": {
        name: "봄기운 품은 선선 요정",
        description: "가을보다는 아직 밝고 상큼한 에너지가 강하네요. 계절이 바뀌어도 페이스를 잃지 않는 균형감이 돋보여요."
      },
      "30-40": {
        name: "감성 대기 중 살랑 산들바람",
        description: "살짝 찾아온 감성 바람을 즐길 준비가 되어 있어요. 일기 쓰기나 향기로운 티타임으로 마음을 천천히 데워보세요."
      },
      "50-60": {
        name: "낭만 충전 단풍 러버",
        description: "가을 감성에 반쯤 잠긴 상태! 좋아하는 영화나 음악과 함께라면 더욱 풍성한 낭만을 즐길 수 있답니다."
      },
      "70-80": {
        name: "코지 무드 인생 편집장",
        description: "따뜻한 담요와 감성 플레이리스트로 하루를 편집하듯 꾸미는 능력자예요. 주변 사람들도 당신 덕분에 포근함을 느껴요."
      },
      "90-100": {
        name: "가을 드라마 주연 배우",
        description: "하늘빛, 공기, 향기 모두가 당신을 위한 배경음악처럼 느껴지는 순간! 가을 감성의 주인공다운 감수성이 반짝입니다."
      }
    }
  };

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

  function getResultContent(gender, bucket) {
    const fallback = {
      name: "가을 감성 여행자",
      description: "점수에 맞는 재미난 가을 별명이 곧 도착합니다!"
    };
    return RESULT_CONTENT[gender]?.[bucket] || fallback;
  }

  // ---------- 결과 표시 ----------
  function showResult() {
    latestPercent = percentFromYesCount(yesCount);
    const bKey = bucketKey(latestPercent);
    const genderKey = selectedGender || "male";

    const { name, description } = getResultContent(genderKey, bKey);
    latestResultName = name;

    if (resultTitleEl) {
      resultTitleEl.textContent = RESULT_TITLES[genderKey] || "가을 지수";
    }
    if (resultPercentEl) {
      resultPercentEl.textContent = `${latestPercent}%`;
    }
    if (resultBarFillEl) {
      resultBarFillEl.style.width = `${latestPercent}%`;
    }
    if (resultBarEl) {
      resultBarEl.setAttribute("aria-valuenow", String(latestPercent));
    }
    if (resultNameEl) {
      resultNameEl.textContent = name;
    }
    if (resultDescriptionEl) {
      resultDescriptionEl.textContent = description;
    }

    console.log(`🏁 완료: yes=${yesCount}/${TOTAL} → ${latestPercent}% → bucket=${bKey}`);

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
    latestResultName = "";

    // 진행바/결과 초기화
    if (progressFill)  progressFill.style.width = "0%";
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", "0");
    if (progressCount) progressCount.textContent = `0 / ${TOTAL}`;
    if (resultPercentEl) resultPercentEl.textContent = "0%";
    if (resultBarFillEl) resultBarFillEl.style.width = "0%";
    if (resultBarEl) resultBarEl.setAttribute("aria-valuenow", "0");
    if (resultTitleEl) resultTitleEl.textContent = "가을 지수";
    if (resultNameEl) resultNameEl.textContent = "가을 감성 수줍은 다람쥐";
    if (resultDescriptionEl) {
      resultDescriptionEl.textContent = "점수를 확인하면 가을 감성에 딱 맞는 설명이 여기에 표시됩니다.";
    }

    // 화면: 시작으로
    resultScreen.classList.remove("active");
    quizScreen.classList.remove("active");
    genderScreen.classList.remove("active");
    startScreen.classList.add("active");

    bottomActions.style.display = "none";
    console.log("🔄 리셋 완료");
  }

  restartBtn.addEventListener("click", resetTest);

// ===== Kakao SDK 동적 로더 (한 번만 로드 & 중복 init 방지) =====
const loadKakaoSDK = (() => {
  let _promise = null;

  return function loadKakaoSDK() {
    if (_promise) return _promise;

    _promise = new Promise((resolve, reject) => {
      // 이미 로드+초기화 돼 있으면 바로 OK
      if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) {
        return resolve(window.Kakao);
      }

      // 스크립트 엘리먼트 동적 삽입
      const script = document.createElement("script");
      // 안정 경로(무결성 검사 없음) — 버전 핀 필요하면 t1.kakaocdn 버전 사용 가능
      script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
      script.async = true;
      script.onload = () => {
        if (!window.Kakao) return reject(new Error("Kakao 객체가 로드되지 않음"));
        try {
          if (!window.Kakao.isInitialized()) {
            window.Kakao.init("eee6c2e01641161de9f217ba99c6a0da"); // ← 본인 자바스크립트 키
            console.log("✅ Kakao.init 완료");
          }
          resolve(window.Kakao);
        } catch (e) {
          reject(e);
        }
      };
      script.onerror = () => reject(new Error("Kakao SDK 로드 실패"));
      document.head.appendChild(script);
    });

    return _promise;
  };
})();

// ===== 공유 함수 (점수/결과를 받아서 공유) =====
async function shareKakaoWithScore({ percent, resultName, imageUrl } = {}) {
  try {
    const Kakao = await loadKakaoSDK();

    // 페이지/문구 기본값
    const pageUrl = `${location.origin}/test/fall`;
    const p = (typeof percent === "number" ? percent : (window.latestPercent ?? 0)) | 0;
    const name = resultName ?? window.latestResultName ?? "가을 감성";
    const desc = `내 가을 감성 지수는 ${p}%! ${name}`;

    Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: "가을 타나봐 테스트 🍂",
        description: desc,
        imageUrl: imageUrl || "https://www.survivaloffice.com/images/fall.png",
        link: { mobileWebUrl: pageUrl, webUrl: pageUrl }
      },
      buttons: [
        { title: "나도 해보기", link: { mobileWebUrl: pageUrl, webUrl: pageUrl } }
      ]
    });
  } catch (e) {
    console.warn("⚠️ 카카오 공유 실패:", e);
    alert("카카오 공유를 사용할 수 없습니다.");
  }
}

// ===== 버튼 바인딩(존재할 때만) =====
if (shareBtn) {
  shareBtn.addEventListener("click", () =>
    shareKakaoWithScore({
      percent: window.latestPercent,       // 당신 코드에서 계산/세팅하는 변수 사용
      resultName: window.latestResultName, // "
      // imageUrl: 결과별 커버 이미지가 있다면 전달
    })
  );
}

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
