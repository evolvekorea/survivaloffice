// script.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  const startScreen   = document.getElementById("start-screen");
  const quizScreen    = document.getElementById("quiz-screen");
  const resultScreen  = document.getElementById("result-screen");
  const tbModal       = document.getElementById("tiebreaker-modal");
  const tbChoices     = document.getElementById("tb-choices");

  const startBtn      = document.getElementById("start-btn");
  const questionText  = document.getElementById("question-text");
  const choiceA       = document.getElementById("choice-a");
  const choiceB       = document.getElementById("choice-b");
  const choiceC       = document.getElementById("choice-c");
  const choiceD       = document.getElementById("choice-d");
  const choiceButtons = [choiceA, choiceB, choiceC, choiceD];

  const resultImage   = document.getElementById("result-image");
  if (resultImage) {
    resultImage.loading = "eager";
    resultImage.decoding = "async";
  }

  // 진행바
  const progressFill  = document.getElementById("progress-fill");
  const progressTrack = document.getElementById("progress-track");
  const progressCount = document.getElementById("progress-count");

  // 점수/상태
  let scores = { ENTJ:0, ESTJ:0, INFP:0, ISFP:0 };
  let currentIndex = 0;

  // ✅ 추적용
  const selections = [];                     // [{q:1..10|'TB', type:'ENTJ'.., weight:1}]
  let tiebreakUsed = false;
  let tiebreakCandidates = [];

  // 결과 이미지 매핑
  const RESULT_IMAGES = {
    ENTJ: "https://www.survivaloffice.com/images/poorrich4.png",
    ESTJ: "https://www.survivaloffice.com/images/poorrich3.png",
    INFP: "https://www.survivaloffice.com/images/poorrich2.png",
    ISFP: "https://www.survivaloffice.com/images/poorrich1.png"
  };

  // 질문 데이터 (10문항, 4지선다)
  const questions = [
    {
      question: "월급날이 되면 나는?",
      options: [
        { text:"새로운 투자처를 찾는다", type:"ENTJ" },
        { text:"예·적금에 꼬박꼬박 넣는다", type:"ESTJ" },
        { text:"책이나 창작 도구를 산다", type:"INFP" },
        { text:"맛있는 거 먹고 플렉스한다", type:"ISFP" }
      ]
    },
    {
      question: "보너스를 받았다!",
      options: [
        { text:"주식/부동산 투자에 넣는다", type:"ENTJ" },
        { text:"안전하게 저축·보험", type:"ESTJ" },
        { text:"여행·취미에 쓴다", type:"INFP" },
        { text:"친구들이랑 파티한다", type:"ISFP" }
      ]
    },
    {
      question: "친구가 '돈 버는 법 알려줘'라고 할 때?",
      options: [
        { text:"전략 세우는 법을 알려준다", type:"ENTJ" },
        { text:"금융상품을 추천한다", type:"ESTJ" },
        { text:"돈보다 행복이 중요하다 말한다", type:"INFP" },
        { text:"각자 하고 싶은 걸 하라고 말한다", type:"ISFP" }
      ]
    },
    {
      question: "쇼핑할 때 나는?",
      options: [
        { text:"필요한 것만 골라서 산다", type:"ENTJ" },
        { text:"세일 시기에 맞춰 산다", type:"ESTJ" },
        { text:"감성에 끌리면 바로 산다", type:"INFP" },
        { text:"즉흥적으로 마음 가는 대로 산다", type:"ISFP" }
      ]
    },
    {
      question: "중요 프로젝트를 맡게 되면?",
      options: [
        { text:"리더십을 발휘해 성과낸다", type:"ENTJ" },
        { text:"매뉴얼대로 착실히 진행", type:"ESTJ" },
        { text:"의미 있는 가치를 고민한다", type:"INFP" },
        { text:"창의적으로 재미있게 접근한다", type:"ISFP" }
      ]
    },
    {
      question: "은퇴 후 나는?",
      options: [
        { text:"투자 수익으로 여유롭게", type:"ENTJ" },
        { text:"연금·저축으로 안정적으로", type:"ESTJ" },
        { text:"조용히 책·예술하며 산다", type:"INFP" },
        { text:"여행하며 자유롭게 산다", type:"ISFP" }
      ]
    },
    {
      question: "돈 때문에 스트레스 받을 때?",
      options: [
        { text:"더 벌 방법을 찾는다", type:"ENTJ" },
        { text:"가계부로 지출 점검", type:"ESTJ" },
        { text:"마음을 달래며 위로받고 싶다", type:"INFP" },
        { text:"맛있는 거 먹고 잊는다", type:"ISFP" }
      ]
    },
    {
      question: "로또에 당첨된다면?",
      options: [
        { text:"사업 확장·투자", type:"ENTJ" },
        { text:"분산 투자·저축", type:"ESTJ" },
        { text:"꿈꾸던 집·문화생활", type:"INFP" },
        { text:"쇼핑·놀러다닌다", type:"ISFP" }
      ]
    },
    {
      question: "돈은 나에게?",
      options: [
        { text:"자유와 기회", type:"ENTJ" },
        { text:"안정과 안전", type:"ESTJ" },
        { text:"내 꿈을 지켜주는 힘", type:"INFP" },
        { text:"오늘을 즐기는 수단", type:"ISFP" }
      ]
    },
    {
      question: "갑자기 직장을 잃는다면?",
      options: [
        { text:"네트워킹으로 새 기회 찾기", type:"ENTJ" },
        { text:"자격증 준비·계획 세움", type:"ESTJ" },
        { text:"마음 회복할 시간 갖기", type:"INFP" },
        { text:"하고 싶은 거 먼저 해보기", type:"ISFP" }
      ]
    }
  ];

  const totalQuestions = questions.length;

  // 타이브레이커 문항
  const tieBreaker = {
    question: "지금 당장 큰 지출 유혹이 왔다. 당신의 선택은?",
    options: {
      ENTJ: "기회라 생각하고 투자한다",
      ESTJ: "예산 규칙 확인 후 결정한다",
      INFP: "의미 있는 데 쓴다",
      ISFP: "즉흥적으로 질러버린다"
    }
  };

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
      btn.dataset.weight = "1";           // ✅ 문제별 가중치 제거 → 항상 1점
      btn.style.display  = "block";
    });
  }

  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type   = btn.dataset.type;
      const weight = parseFloat(btn.dataset.weight || "1"); // 항상 1
      if (type) {
        scores[type] += weight;
        selections.push({ q: currentIndex + 1, type, weight });
      }

      currentIndex++;
      if (currentIndex < totalQuestions) {
        showQuestion();
      } else {
        decideResult();
      }
    });
  });

  function decideResult() {
    const maxScore = Math.max(...Object.values(scores));
    const leaders = Object.keys(scores).filter(t => scores[t] === maxScore);

    if (leaders.length === 1) {
      showResult(leaders[0]);
    } else {
      openTiebreaker(leaders).then(finalType => {
        scores[finalType] += 1; // ✅ 타이브레이커도 +1
        tiebreakUsed = true;
        selections.push({ q: 'TB', type: finalType, weight: 1 });
        showResult(finalType);
      });
    }
  }

  function showResult(finalType) {
    trackResult(finalType);

    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");
    bottomActions.style.display = "flex";

    const url = RESULT_IMAGES[finalType];
    resultImage.src = url;
    resultImage.alt = finalType + " 결과";
  }

  // ---------- 타이브레이커 모달 ----------
  function openTiebreaker(ties) {
    return new Promise(resolve => {
      tbChoices.innerHTML = "";
      tbModal.removeAttribute("hidden");

      tiebreakCandidates = ties.slice();

      ties.forEach(type => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = tieBreaker.options[type];
        btn.onclick = () => {
          tbModal.setAttribute("hidden", "");
          resolve(type);
        };
        tbChoices.appendChild(btn);
      });

      // 바깥 영역 클릭 막기
      tbModal.querySelector(".modal__backdrop").onclick = e => {
        e.stopPropagation();
      };
    });
  }

  // ---------- 결과 추적 ----------
  function trackResult(finalType) {
    try {
      const payload = {
        test: "poorrich",
        result: finalType,
        scores: { ...scores },
        selections,
        tiebreak: {
          used: tiebreakUsed,
          candidates: tiebreakCandidates
        },
        ts: new Date().toISOString(),
        ua: navigator.userAgent
      };

      console.log("📊 RESULT_EVENT", payload);

      if (typeof gtag === "function") {
        gtag('event', 'poorrich_result', {
          result: finalType,
          used_tiebreak: tiebreakUsed ? 'yes' : 'no',
          value: Math.max(...Object.values(scores)) || 0
        });
      }

      const url = "https://www.survivaloffice.com/api/poorrich/result";
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("⚠️ trackResult failed:", e);
    }
  }

  // ---------- 참여자 카운터 ----------
  const COUNTER_BASE = 'https://api.counterapi.dev/v1';
  const COUNTER_CFG = { ns:"survivaloffice", key:"poorrich" };
  const counterEl = document.getElementById("test-counter");

  function renderCount(el, n) {
    if (!el) return;
    el.textContent = `총 ${Number(n).toLocaleString()}명 참여`;
  }

  async function fetchCount(ns, key) {
    const url = `${COUNTER_BASE}/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/`;
    try {
      const r = await fetch(url, { cache: 'no-store', headers:{'accept':'application/json'} });
      if (!r.ok) return 0;
      const d = await r.json();
      return d.count || d.value || 0;
    } catch { return 0; }
  }

  async function hitCount(ns, key) {
    const url = `${COUNTER_BASE}/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/up`;
    try {
      const r = await fetch(url, { cache:'no-store', headers:{'accept':'application/json'} });
      if (!r.ok) return null;
      const d = await r.json();
      return d.count || d.value || null;
    } catch { return null; }
  }

  (async function initCounter(){
    if(!counterEl) return;
    const n = await fetchCount(COUNTER_CFG.ns, COUNTER_CFG.key);
    renderCount(counterEl, n);
    startBtn.addEventListener("click", async ()=>{
      const after = await hitCount(COUNTER_CFG.ns, COUNTER_CFG.key);
      if(after!==null) renderCount(counterEl, after);
    });
  })();

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
    tiebreakUsed = false;
    tiebreakCandidates = [];

    resultImage.src = "";
    resultScreen.classList.remove("active");
    quizScreen.classList.remove("active");
    startScreen.classList.add("active");
    bottomActions.style.display = "none";
    if (progressFill) progressFill.style.width = "0%";
    if (progressTrack) progressTrack.setAttribute("aria-valuenow","0");
    if (progressCount) progressCount.textContent = `0 / ${totalQuestions}`;
    console.log("🔄 테스트 리셋 완료");
  });

});
