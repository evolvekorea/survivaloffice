// script.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  const startScreen   = document.getElementById("start-screen");
  const quizScreen    = document.getElementById("quiz-screen");
  const resultScreen  = document.getElementById("result-screen");

  const startBtn      = document.getElementById("start-btn");
  const questionText  = document.getElementById("question-text");
  const choiceA       = document.getElementById("choice-a");
  const choiceB       = document.getElementById("choice-b");
  const choiceC       = document.getElementById("choice-c");
  const choiceD       = document.getElementById("choice-d");
  const choiceButtons = [choiceA, choiceB, choiceC, choiceD];

  const resultImage   = document.getElementById("result-image");
  if (resultImage) { resultImage.loading = "eager"; resultImage.decoding = "async"; }

  // 진행바
  const progressFill  = document.getElementById("progress-fill");
  const progressTrack = document.getElementById("progress-track");
  const progressCount = document.getElementById("progress-count");

  // 점수/상태
  let scores = { ENTJ:0, ESTJ:0, INFP:0, ISFP:0 };
  let currentIndex = 0;

  // 선택 로그(결정 규칙에 사용)
  const selections = []; // [{q:1..10, type:'ENTJ'.., scoreAdded:1.x}]

  // 결과 이미지
  const RESULT_IMAGES = {
    ENTJ: "https://www.survivaloffice.com/images/poorrich4.png",
    ESTJ: "https://www.survivaloffice.com/images/poorrich3.png",
    INFP: "https://www.survivaloffice.com/images/poorrich2.png",
    ISFP: "https://www.survivaloffice.com/images/poorrich1.png"
  };

  // 0.1~0.4 미세 가중치(ε) 패턴을 회전 적용해 동점 방지
  const EPS_PATTERN = [
    { ENTJ:0.40, ESTJ:0.30, INFP:0.20, ISFP:0.10 }, // Q1
    { ENTJ:0.10, ESTJ:0.40, INFP:0.30, ISFP:0.20 }, // Q2
    { ENTJ:0.20, ESTJ:0.10, INFP:0.40, ISFP:0.30 }, // Q3
    { ENTJ:0.30, ESTJ:0.20, INFP:0.10, ISFP:0.40 }, // Q4
  ];
  function epsFor(qIdx, type){
    const p = EPS_PATTERN[qIdx % EPS_PATTERN.length];
    return (p && p[type]) || 0.25;
  }

  // 질문 데이터 (10문항, 4지선다)
  const questions = [
    { question: "월급날이 되면 나는?",
      options: [
        { text:"새로운 투자처를 찾는다", type:"ENTJ" },
        { text:"예·적금에 꼬박꼬박 넣는다", type:"ESTJ" },
        { text:"책이나 창작 도구를 산다", type:"INFP" },
        { text:"맛있는 거 먹고 플렉스한다", type:"ISFP" }
      ]},
    { question: "보너스를 받았다!",
      options: [
        { text:"주식/부동산 투자에 넣는다", type:"ENTJ" },
        { text:"안전하게 저축·보험", type:"ESTJ" },
        { text:"여행·취미에 쓴다", type:"INFP" },
        { text:"친구들이랑 파티한다", type:"ISFP" }
      ]},
    { question: "친구가 '돈 버는 법 알려줘'라고 할 때?",
      options: [
        { text:"전략 세우는 법을 알려준다", type:"ENTJ" },
        { text:"금융상품을 추천한다", type:"ESTJ" },
        { text:"돈보다 행복이 중요하다 말한다", type:"INFP" },
        { text:"각자 하고 싶은 걸 하라고 말한다", type:"ISFP" }
      ]},
    { question: "쇼핑할 때 나는?",
      options: [
        { text:"필요한 것만 골라서 산다", type:"ENTJ" },
        { text:"세일 시기에 맞춰 산다", type:"ESTJ" },
        { text:"감성에 끌리면 바로 산다", type:"INFP" },
        { text:"즉흥적으로 마음 가는 대로 산다", type:"ISFP" }
      ]},
    { question: "중요 프로젝트를 맡게 되면?",
      options: [
        { text:"리더십을 발휘해 성과낸다", type:"ENTJ" },
        { text:"매뉴얼대로 착실히 진행", type:"ESTJ" },
        { text:"의미 있는 가치를 고민한다", type:"INFP" },
        { text:"창의적으로 재미있게 접근한다", type:"ISFP" }
      ]},
    { question: "은퇴 후 나는?",
      options: [
        { text:"투자 수익으로 여유롭게", type:"ENTJ" },
        { text:"연금·저축으로 안정적으로", type:"ESTJ" },
        { text:"조용히 책·예술하며 산다", type:"INFP" },
        { text:"여행하며 자유롭게 산다", type:"ISFP" }
      ]},
    { question: "돈 때문에 스트레스 받을 때?",
      options: [
        { text:"더 벌 방법을 찾는다", type:"ENTJ" },
        { text:"가계부로 지출 점검", type:"ESTJ" },
        { text:"마음을 달래며 위로받고 싶다", type:"INFP" },
        { text:"맛있는 거 먹고 잊는다", type:"ISFP" }
      ]},
    { question: "로또에 당첨된다면?",
      options: [
        { text:"사업 확장·투자", type:"ENTJ" },
        { text:"분산 투자·저축", type:"ESTJ" },
        { text:"꿈꾸던 집·문화생활", type:"INFP" },
        { text:"쇼핑·놀러다닌다", type:"ISFP" }
      ]},
    { question: "돈은 나에게?",
      options: [
        { text:"자유와 기회", type:"ENTJ" },
        { text:"안정과 안전", type:"ESTJ" },
        { text:"내 꿈을 지켜주는 힘", type:"INFP" },
        { text:"오늘을 즐기는 수단", type:"ISFP" }
      ]},
    { question: "갑자기 직장을 잃는다면?",
      options: [
        { text:"네트워킹으로 새 기회 찾기", type:"ENTJ" },
        { text:"자격증 준비·계획 세움", type:"ESTJ" },
        { text:"마음 회복할 시간 갖기", type:"INFP" },
        { text:"하고 싶은 거 먼저 해보기", type:"ISFP" }
      ]}
  ];
  const totalQuestions = questions.length;

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  function updateProgress() {
    const current = Math.min(currentIndex + 1, totalQuestions);
    const percent = (current / totalQuestions) * 100;
    if (progressFill)  progressFill.style.width = percent + "%";
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(current));
    if (progressCount) progressCount.textContent = `${current} / ${totalQuestions}`;
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

    const opts = shuffle(q.options);
    choiceButtons.forEach((btn, idx) => {
      const opt = opts[idx];
      btn.textContent    = opt.text;
      btn.dataset.type   = opt.type;
      btn.style.display  = "block";
      btn.disabled       = false;
    });
  }

  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      if (!type) return;

      const eps = epsFor(currentIndex, type); // 0.1~0.4
      const add = 1 + eps;                    // 기본 1점 + ε
      scores[type] += add;
      selections.push({ q: currentIndex + 1, type, scoreAdded: add });

      currentIndex++;
      if (currentIndex < totalQuestions) {
        showQuestion();
      } else {
        decideResult();
      }
    });
  });

  // 결정 규칙형 타이브레이크(모달 없음)
  function decideResult() {
    const values = Object.values(scores);
    const maxVal = Math.max(...values);
    let leaders = Object.keys(scores).filter(t => scores[t] === maxVal);

    if (leaders.length === 1) {
      showResult(leaders[0]);
      return;
    }

    // 1) 가장 최근에 선택된 유형 우선
    for (let i = selections.length - 1; i >= 0; i--) {
      const t = selections[i].type;
      if (leaders.includes(t)) {
        showResult(t);
        return;
      }
    }

    // 2) 고정 우선순위 (완전 동률 대비)
    const PRIORITY = ["ENTJ","ESTJ","INFP","ISFP"];
    leaders.sort((a,b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
    showResult(leaders[0]);
  }

  function showResult(finalType) {
    // (선택) 결과 로깅
    console.log("📊 RESULT", { finalType, scores, selections });

    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");
    bottomActions.style.display = "flex";

    const url = RESULT_IMAGES[finalType];
    resultImage.src = url;
    resultImage.alt = finalType + " 결과";
  }

  // ---------- 공유 & 다시하기 ----------
  const shareBtnEl   = document.getElementById("share-kakao");
  const restartBtnEl = document.getElementById("restart-btn");
  const bottomActions = document.getElementById("bottom-actions");

  async function loadKakaoSDK() {
    return new Promise((resolve, reject) => {
      if (window.Kakao && window.Kakao.isInitialized()) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init("eee6c2e01641161de9f217ba99c6a0da");
        }
        resolve();
      };
      script.onerror = () => reject("Kakao SDK 로드 실패");
      document.head.appendChild(script);
    });
  }
  loadKakaoSDK().catch(console.error);

  function shareKakao(imageUrl) {
    if (!window.Kakao || !Kakao.isInitialized()) {
      alert("⚠️ 카카오톡 공유 기능을 사용할 수 없습니다.");
      return;
    }
    const finalImage = imageUrl || "https://www.survivaloffice.com/images/poorrich.png";
    Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: "부자 vs 거지 테스트",
        description: "성격으로 알아보는 부자 vs 거지 테스트",
        imageUrl: finalImage,
        link: {
          mobileWebUrl: "https://www.survivaloffice.com/test/poorrich",
          webUrl: "https://www.survivaloffice.com/test/poorrich"
        }
      },
      buttons: [
        {
          title: "테스트 하러 가기",
          link: {
            mobileWebUrl: "https://www.survivaloffice.com/test/poorrich",
            webUrl: "https://www.survivaloffice.com/test/poorrich"
          }
        }
      ]
    });
  }

  if (shareBtnEl) shareBtnEl.addEventListener("click", () => shareKakao(resultImage?.src || ""));
  if (restartBtnEl) restartBtnEl.addEventListener("click", () => {
    scores = { ENTJ:0, ESTJ:0, INFP:0, ISFP:0 };
    currentIndex = 0;
    selections.length = 0;

    resultImage.src = "";
    resultScreen.classList.remove("active");
    quizScreen.classList.remove("active");
    startScreen.classList.add("active");
    bottomActions.style.display = "none";
    if (progressFill) progressFill.style.width = "0%";
    if (progressTrack) progressTrack.setAttribute("aria-valuenow","0");
    if (progressCount) progressCount.textContent = `0 / ${questions.length}`;
    console.log("🔄 테스트 리셋 완료");
  });

});
