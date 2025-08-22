document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ DOM fully loaded");
  
  const startScreen = document.getElementById("start-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");

  const startBtn = document.getElementById("start-btn");

  const questionText = document.getElementById("question-text");
  const choiceA = document.getElementById("choice-a");
  const choiceB = document.getElementById("choice-b");
  const choiceC = document.getElementById("choice-c");
  const choiceButtons = [choiceA, choiceB, choiceC];

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  const resultImage = document.getElementById("result-image");

  // 진행바 요소
  const progressFill  = document.getElementById("progress-fill");
  const progressTrack = document.getElementById("progress-track");
  const progressCount = document.getElementById("progress-count");

  let currentIndex = 0;
  let totalScore = 0;


// 테스트 데이터
// ※ 오락용 테스트입니다. 의학·심리학적 진단이 아닙니다.
const questions = [
  {
    question: "길에서 현금이 들어 있는 지갑을 주웠다. 어떻게 할까?",
    options: [
      { text: "주인에게 돌려주거나 경찰서/분실센터에 맡긴다.", score: 0 },
      { text: "시간 없으면 그냥 두거나 직원에게 맡기고 떠난다.", score: 10 },
      { text: "현금은 챙기고 지갑은 버리거나 놔둔다.", score: 20 }
    ]
  },
  {
    question: "가까운 지인이 민감한 비밀을 털어놓았다.",
    options: [
      { text: "철저히 비밀로 지키고, 필요하면 지지해 준다.", score: 0 },
      { text: "신뢰하는 한 사람에게만 상황 공유할 수도 있다.", score: 10 },
      { text: "상황에 따라 내 이익을 위해 활용할 수도 있다.", score: 20 }
    ]
  },
  {
    question: "주차 중 실수로 옆 차를 살짝 긁은 것 같다.",
    options: [
      { text: "연락처를 남기거나 차주에게 알리고 보상한다.", score: 0 },
      { text: "흠집이 경미해 보이면 나중에 연락하려고 사진만 찍고 떠난다.", score: 10 },
      { text: "들킨 것 같지 않으면 조용히 떠난다.", score: 20 }
    ]
  },
  {
    question: "나를 무시하는 태도를 보이는 사람을 마주했다.",
    options: [
      { text: "감정은 가라앉히고 사실 위주로 차분히 해결한다.", score: 0 },
      { text: "겉으론 웃지만 은근한 보복으로 균형을 맞춘다.", score: 10 },
      { text: "기회가 되면 망신을 주거나 크게 되갚는다.", score: 20 }
    ]
  },
  {
    question: "규칙을 어기면 빨리 성과를 낼 수 있는 상황이다.",
    options: [
      { text: "장단을 따지고 규칙 내에서 대안을 찾는다.", score: 0 },
      { text: "큰 문제만 없으면 약간은 눈감고 밀어붙인다.", score: 10 },
      { text: "재미와 성과가 크면 규칙은 걸림돌일 뿐이다.", score: 20 }
    ]
  },
  {
    question: "거짓말에 대한 나의 태도는?",
    options: [
      { text: "가능하면 피한다. 신뢰가 가장 중요하다.", score: 0 },
      { text: "작은 이익이나 분위기를 위해 가끔 쓸 수 있다.", score: 10 },
      { text: "필요하면 주저 없이 도구처럼 활용한다.", score: 20 }
    ]
  },
  {
    question: "동료가 실수를 해서 팀에 피해가 생겼다.",
    options: [
      { text: "함께 수습하고 재발 방지안을 만든다.", score: 0 },
      { text: "상부에 사실대로 보고하고 선을 분명히 한다.", score: 10 },
      { text: "내 공을 강조하고 그에게 책임을 돌린다.", score: 20 }
    ]
  },
  {
    question: "타인의 감정 표현을 볼 때 나는…",
    options: [
      { text: "상황을 이해하려 공감하고 배려하려 한다.", score: 0 },
      { text: "겉으로는 맞춰 주지만 속으론 크게 동요하지 않는다.", score: 10 },
      { text: "감정은 비효율적이다. 거리를 두는 편이 낫다.", score: 20 }
    ]
  },
  {
    question: "지루할 때 선택하는 방식은?",
    options: [
      { text: "운동·취미 같은 건설적 활동을 찾는다.", score: 0 },
      { text: "한두 번 정도는 위험하거나 자극적인 걸 시도한다.", score: 10 },
      { text: "강한 자극이 필요하다. 위험해도 상관없다.", score: 20 }
    ]
  },
  {
    question: "내 말로 누군가를 상처 입혔다는 피드백을 들었다.",
    options: [
      { text: "사과하고 되돌아보며 표현을 고친다.", score: 0 },
      { text: "상황 보며 필요하면 사과하지만 큰 문제는 아니라고 본다.", score: 10 },
      { text: "사실을 말했을 뿐이다. 죄책감은 없다.", score: 20 }
    ]
  }
];

// 총 문항 수 계산
const totalQuestions = questions.length;

function updateProgress() {
  // 현재 표시 중인 문제는 0-index이므로 +1
  const current = Math.min(currentIndex + 1, totalQuestions);
  const percent = (current / totalQuestions) * 100;

  if (progressFill) {
    progressFill.style.width = percent + "%";
  }
  if (progressTrack) {
    progressTrack.setAttribute("aria-valuenow", String(current));
  }
  if (progressCount) {
    progressCount.textContent = `${current} / ${totalQuestions}`;
  }
  }

  startBtn.addEventListener("click", () => {
    startScreen.classList.remove("active");
    quizScreen.classList.add("active");
    showQuestion();
  });

  function showQuestion() {
    const q = questions[currentIndex];
    if (!q) return;

    updateProgress();
    questionText.textContent = q.question;

    const opts = shuffle(q.options); // [{text,score}, ...]
    opts.forEach((opt, idx) => {
      const btn = choiceButtons[idx];
      btn.textContent = opt.text;
      btn.dataset.score = String(opt.score);
    });
  }

  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const s = parseInt(btn.dataset.score || "0", 10);
      totalScore += s;

      currentIndex++;
      if (currentIndex < questions.length) {
        showQuestion();
      } else {
        showResult();
      }
    });
  });

function showResult() {
  console.log("🏁 테스트 종료 - 총점:", totalScore);

  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  // 임시 이미지 3종(원하는 URL로 교체 가능)
  const resultImages = {
    normal:   "https://www.survivaloffice.com/images/psycho1.png",
    suspect:  "https://www.survivaloffice.com/images/psycho2.png",
    psycho:   "https://www.survivaloffice.com/images/psycho3.png"
  };

  let bucket = "normal";
  if (totalScore >= 140)      bucket = "psycho";   // 140~200
  else if (totalScore >= 70)  bucket = "suspect";  // 70~139
  // else 0~69 normal

  resultImage.src = resultImages[bucket];
  bottomActions.style.display = 'flex';

  console.log(`🖼 결과: ${bucket}, 이미지: ${resultImages[bucket]}`);
}

// ---------- 하단 버튼 참조 ----------
const shareBtn   = document.getElementById("share-kakao");
const restartBtn = document.getElementById("restart-btn");
const bottomActions = document.getElementById("bottom-actions");

// ---------- 카카오 SDK 로드 ----------
async function loadKakaoSDK() {
  return new Promise((resolve, reject) => {
    if (window.Kakao && Kakao.isInitialized()) {
      console.log("✅ 카카오 SDK 이미 초기화됨");
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.onload = () => {
      if (!window.Kakao) {
        reject("❌ Kakao 객체가 로드되지 않음");
        return;
      }
      Kakao.init("eee6c2e01641161de9f217ba99c6a0da");
      console.log("✅ 카카오 SDK 로드 및 초기화 완료");
      resolve();
    };
    script.onerror = () => reject("❌ Kakao SDK 로드 실패");
    document.head.appendChild(script);
  });
}
loadKakaoSDK().then(() => {
  console.log("✅ 카카오 SDK 사용 준비 완료!");
}).catch(err => console.error(err));

// ---------- 카카오 공유 함수 ----------
function shareKakao(imageUrl) {
  if (!window.Kakao || !Kakao.isInitialized()) {
    alert("⚠️ 카카오톡 공유 기능을 사용할 수 없습니다.");
    return;
  }

  // 결과 이미지가 없으면 기본 이미지로
  const finalImage = imageUrl && imageUrl.length > 0
    ? imageUrl
    : "https://www.survivaloffice.com/images/psychopath.png";

  Kakao.Link.sendDefault({
    objectType: "feed",
    content: {
      title: "싸이코패스 테스트(Psychopath Test)",
      description: "재미로 보는 싸이코패스 테스트",
      imageUrl: finalImage, // ✅ 최종 결과 이미지로!
      link: {
        mobileWebUrl: "https://www.survivaloffice.com/test/psychopath",
        webUrl: "https://www.survivaloffice.com/test/psychopath"
      }
    },
    buttons: [
      {
        title: "테스트 하러 가기",
        link: {
          mobileWebUrl: "https://www.survivaloffice.com/test/psychopath",
          webUrl: "https://www.survivaloffice.com/test/psychopath"
        }
      }
    ]
  });
}

// ---------- 다시하기(리셋) ----------
function resetTest() {
  currentIndex = 0;
  totalScore = 0;

  resultImage.src = "";
  resultScreen.classList.remove("active");
  quizScreen.classList.remove("active");
  startScreen.classList.add("active");

  bottomActions.style.display = 'none';

  if (progressFill)  progressFill.style.width = "0%";
  if (progressTrack) progressTrack.setAttribute("aria-valuenow", "0");
  if (progressCount) progressCount.textContent = `0 / ${totalQuestions}`;

  console.log("🔄 테스트 리셋 완료");
}

// ---------- 버튼 이벤트 ----------
shareBtn.addEventListener("click", () => {
  // 현재 보이는 결과 이미지를 공유
  shareKakao(resultImage?.src || "");
});

restartBtn.addEventListener("click", resetTest);

const COUNTER_BASE = 'https://api.counterapi.dev/v1';
const ONLY_ONCE_PER_SESSION = false; // 같은 탭 세션에서 1회만 집계하려면 true

// 항상 끝에 슬래시를 붙여 301 리다이렉트 방지
function counterPath(ns, key) {
  return `${COUNTER_BASE}/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/`;
}

// #test-counter에서 namespace/key 읽기 (fallback은 슬러그로)
function getCounterConfig() {
  const el = document.getElementById("test-counter");
  return {
    el,
    ns: el?.dataset.counterNamespace || "survivaloffice",
    key: el?.dataset.counterKey || "Psychopath",
  };
}

// --- 캐시 유틸 (깜빡임 제거용) ---
function cacheKey(ns, key){ return `counter_${ns}_${key}`; }
function getCachedCount(ns, key, maxAgeMs = 10 * 60 * 1000){ // 10분 캐시
  try{
    const raw = localStorage.getItem(cacheKey(ns,key));
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(Date.now() - obj.t > maxAgeMs) return null;
    return typeof obj.v === 'number' ? obj.v : null;
  }catch{ return null; }
}
function setCachedCount(ns, key, val){
  try{ localStorage.setItem(cacheKey(ns,key), JSON.stringify({ v: Number(val)||0, t: Date.now() })); }catch{}
}

// 현재 값 조회(요청 1회)
async function fetchCount(ns, key) {
  const url = counterPath(ns, key);
  try {
    const r = await fetch(url, {
      cache: 'no-store',
      headers: { 'accept': 'application/json' }
    });
    if (!r.ok) return 0;
    const data = await r.json();
    return (typeof data.count === 'number') ? data.count :
           (typeof data.value === 'number') ? data.value : 0;
  } catch (e) {
    console.warn('[counter] fetch failed:', e);
    return 0;
  }
}

// +1 증가
async function hitCount(ns, key) {
  const url = `${counterPath(ns, key)}up`;
  try {
    const r = await fetch(url, {
      cache: 'no-store',
      headers: { 'accept': 'application/json' }
    });
    if (!r.ok) return null;
    const data = await r.json();
    return (typeof data.count === 'number') ? data.count :
           (typeof data.value === 'number') ? data.value : null;
  } catch (e) {
    console.warn('[counter] hit failed:', e);
    return null;
  }
}

// 세션당 1회만 증가할지 결정
function shouldIncreaseThisSession(ns, key) {
  if (!ONLY_ONCE_PER_SESSION) return true;
  const flag = `counted_${ns}_${key}`;
  if (sessionStorage.getItem(flag) === "1") return false;
  sessionStorage.setItem(flag, "1");
  return true;
}

// UI 반영(+캐시 저장)
function renderCount(el, n) {
  if (!el) return;
  el.textContent = `총 ${Number(n).toLocaleString()}명 참여`;
  el.setAttribute("data-count", String(n));
  const { ns, key } = getCounterConfig();
  if (ns && key && typeof n === 'number') setCachedCount(ns, key, n);
}

// 초기 로드 & 버튼 연동 (이미 DOMContentLoaded 내부이므로 즉시 실행)
(async function initCounter() {
  const { el, ns, key } = getCounterConfig();
  if (!el) return; // 배지가 없으면 패스

  // 1) 캐시값을 먼저 즉시 표시(깜빡임 제거)
  const cached = getCachedCount(ns, key);
  if (cached !== null) renderCount(el, cached);

  // 2) 네트워크 1회로 최신값 가져와 덮어쓰기
  const fresh = await fetchCount(ns, key);
  renderCount(el, fresh);

  // 3) 시작 버튼 클릭 시 증가
  const startBtnEl = document.getElementById("start-btn");
  if (startBtnEl) {
    startBtnEl.addEventListener("click", async () => {
      try {
        if (shouldIncreaseThisSession(ns, key)) {
          const after = await hitCount(ns, key); // /up은 없으면 생성+증가 처리
          if (after !== null) renderCount(el, after);
        }
      } catch (e) {
        console.warn("[counter] increase on click failed:", e);
      }
    });
  }
})();

});