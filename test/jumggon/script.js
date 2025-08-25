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
  const choiceButtons = [choiceA, choiceB, choiceC];

  const resultImage   = document.getElementById("result-image");
  if (resultImage) {
    resultImage.loading = "eager";
    resultImage.decoding = "async";
  }

  // 진행바
  const progressFill  = document.getElementById("progress-fill");
  const progressTrack = document.getElementById("progress-track");
  const progressCount = document.getElementById("progress-count");

  let currentIndex = 0;
  let normalScore  = 0; // 정상
  let kkonScore    = 0; // 꼰대
  let mzScore      = 0; // MZ

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  // =========================
  // ✅ 결과 이미지 (프리로드 대상)
  // =========================
  const RESULT_IMAGES = {
    normal: "https://www.survivaloffice.com/images/jumggon2.png",
    kkon:   "https://www.survivaloffice.com/images/jumggon3.png",
    mz:     "https://www.survivaloffice.com/images/jumggon4.png"
  };

  // ✅ 프리로드
  const preloadedImages = {};
  function preloadImages(map){
    const urls = Object.values(map);
    return Promise.all(urls.map(url => new Promise(resolve => {
      const img = new Image();
      img.loading = "eager";
      img.decoding = "async";
      img.onload = () => { preloadedImages[url] = img; resolve(img); };
      img.onerror = () => { console.warn("⚠️ preload fail:", url); resolve(null); };
      img.src = url;
    })));
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => preloadImages(RESULT_IMAGES).then(() => {
      console.log("✅ 결과 이미지 프리로드 완료(idle)");
    }));
  } else {
    setTimeout(() => preloadImages(RESULT_IMAGES).then(() => {
      console.log("✅ 결과 이미지 프리로드 완료(timeout)");
    }), 0);
  }

  // =========================
  // ✅ 젊꼰 테스트 문항 (3지선다)
  //    각 옵션: { text, type:'normal'|'kkon'|'mz', weight }
  //    기본 weight=1 (원하면 1~2로 조정 가능)
  // =========================
  const questions = [
    {
      question: "신입이 9시 정각에 출근했다.",
      options: [
        { text: "정시에 왔으니 문제없다.",               type: "normal", weight: 1 },
        { text: "5분 전에 와서 준비하는 게 기본이지!",   type: "kkon",   weight: 1 },
        { text: "오~ 나도 9시 1분 컷 가능 ㅋㅋ",          type: "mz",     weight: 1 }
      ]
    },
    {
      question: "퇴근시간 6시, 5시 50분부터 퇴근 준비하는 후배.",
      options: [
        { text: "정시 퇴근은 당연한 권리다.",            type: "normal", weight: 1 },
        { text: "끝날 때까지 집중하는 게 직업정신이지!", type: "kkon",   weight: 1 },
        { text: "준비 잘했네, 난 5시 30분부터 치워둠 ㅋㅋ", type: "mz",   weight: 1 }
      ]
    },
    {
      question: "회의에서 후배가 사이다 발언을 했다.",
      options: [
        { text: "좋은 의견이다. 반영해보자.",            type: "normal", weight: 1 },
        { text: "어디서 감히 회의에서 나대나?",           type: "kkon",   weight: 1 },
        { text: "ㅋㅋㅋ 시원하다. 이 맛에 회의하지",      type: "mz",     weight: 1 }
      ]
    },
    {
      question: "점심 메뉴로 신입이 '샐러드'를 주장한다.",
      options: [
        { text: "오~ 건강식도 좋지.",                    type: "normal", weight: 1 },
        { text: "밥은 국밥이지, 젊은 것들이 왜 이래?",    type: "kkon",   weight: 1 },
        { text: "샐러드? 난 자리에서 시켜먹는다",         type: "mz",     weight: 1 }
      ]
    },
    {
      question: "후배가 '칼퇴해야 헬스장 가요'라며 정시 퇴근.",
      options: [
        { text: "개인 생활도 중요하니까 이해한다.",       type: "normal", weight: 1 },
        { text: "일이 먼저지, 운동은 사치야.",            type: "kkon",   weight: 1 },
        { text: "오 운동? 난 칼퇴해서 바로 겜함 ㅋㅋ",     type: "mz",     weight: 1 }
      ]
    },
    {
      question: "상사가 밤 11시에 자료를 단톡에 올렸다.",
      options: [
        { text: "내일 아침에 확인해야겠다.",             type: "normal", weight: 1 },
        { text: "읽씹은 실례지, 바로 답해야지!",          type: "kkon",   weight: 1 },
        { text: "알림 꺼놨어요 ㅋㅋ 내일 봅시다",          type: "mz",     weight: 1 }
      ]
    },
    {
      question: "신입이 '저 이거 잘 몰라요'라고 솔직히 말한다.",
      options: [
        { text: "괜찮아. 내가 알려줄게.",                type: "normal", weight: 1 },
        { text: "모르면 공부라도 해와야지, 정신 차려!",   type: "kkon",   weight: 1 },
        { text: "나도 몰라 ㅋㅋ 검색 ㄱㄱ",               type: "mz",     weight: 1 }
      ]
    },
    {
      question: "업무 중간에 후배가 이어폰 끼고 음악을 듣는다.",
      options: [
        { text: "업무 지장 없으면 괜찮다.",              type: "normal", weight: 1 },
        { text: "근무시간 음악은 집중력 해쳐!",           type: "kkon",   weight: 1 },
        { text: "굿, 난 가끔 넷플도 켬 ㅋㅋ",             type: "mz",     weight: 1 }
      ]
    },
    {
      question: "회식 자리에서 신입이 술을 거절한다.",
      options: [
        { text: "괜찮아, 편하게 해.",                    type: "normal", weight: 1 },
        { text: "사회생활 하려면 원샷은 기본이지.",        type: "kkon",   weight: 1 },
        { text: "현명하네, 난 회식 자체를 안 감 ㅋㅋ",     type: "mz",     weight: 1 }
      ]
    },
    {
      question: "프로젝트 끝나고 후배가 '저는 제 몫만 했어요'라고 말한다.",
      options: [
        { text: "회사생활은 팀워크가 중요하다고 얘기해준다.",         type: "normal", weight: 1 },
        { text: "너만 잘한다고 되는 거 아냐. 선배도 챙겼어야지!",       type: "kkon",   weight: 1 },
        { text: "회사는 서바이벌이지, 혼자 몫 다하면 된 거 아냐?",      type: "mz",     weight: 1 }
      ]
    }
  ];

  const totalQuestions = questions.length;

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

    const opts = shuffle(q.options); // 3개 섞기
    opts.forEach((opt, idx) => {
      const btn = choiceButtons[idx];
      btn.textContent    = opt.text;
      btn.dataset.type   = opt.type;                 // 'normal' | 'kkon' | 'mz'
      btn.dataset.weight = String(opt.weight ?? 1);  // 기본 1
    });
  }

  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type   = btn.dataset.type || "normal";
      const weight = parseInt(btn.dataset.weight || "1", 10);

      if (type === "normal") normalScore += weight;
      else if (type === "kkon") kkonScore += weight;
      else mzScore += weight;

      currentIndex++;
      if (currentIndex < totalQuestions) {
        showQuestion();
      } else {
        showResult();
      }
    });
  });

  function showResult() {
    console.log("🏁 종료 - 정상:", normalScore, "/ 꼰대:", kkonScore, "/ MZ:", mzScore);

    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    // 최대 득점 카테고리 계산 (동점 시 우선순위: normal > mz > kkon)
    const scores = { normal: normalScore, mz: mzScore, kkon: kkonScore };
    const max = Math.max(scores.normal, scores.mz, scores.kkon);
    let bucket = "normal";
    if (scores.mz === max && scores.normal !== max) bucket = "mz";
    if (scores.kkon === max && scores.normal !== max && scores.mz !== max) bucket = "kkon";

    const url = RESULT_IMAGES[bucket];

    const cached = preloadedImages[url];
    resultImage.src = (cached && cached.complete) ? cached.src : url;
    const altMap = { normal: "정상 결과", kkon: "젊은 꼰대 결과", mz: "MZ 결과" };
    resultImage.alt = altMap[bucket] || "결과 이미지";

    bottomActions.style.display = 'flex';
    console.log(`🖼 결과: ${bucket}, 이미지: ${url}`);
  }

  // ---------- 하단 버튼 ----------
  const bottomActions = document.getElementById("bottom-actions");
  const shareBtnEl    = document.getElementById("share-kakao");
  const restartBtnEl  = document.getElementById("restart-btn");

  // ---------- 카카오 SDK ----------
  async function loadKakaoSDK() {
    return new Promise((resolve, reject) => {
      if (window.Kakao && Kakao.isInitialized()) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
      script.onload = () => {
        if (!window.Kakao) { reject("❌ Kakao 객체가 로드되지 않음"); return; }
        Kakao.init("eee6c2e01641161de9f217ba99c6a0da");
        resolve();
      };
      script.onerror = () => reject("❌ Kakao SDK 로드 실패");
      document.head.appendChild(script);
    });
  }
  loadKakaoSDK().catch(console.error);

  // ---------- 카카오 공유 ----------
  function shareKakao(imageUrl) {
    if (!window.Kakao || !Kakao.isInitialized()) {
      alert("⚠️ 카카오톡 공유 기능을 사용할 수 없습니다.");
      return;
    }
    const finalImage = imageUrl && imageUrl.length > 0
      ? imageUrl
      : "https://www.survivaloffice.com/images/jumggon1.png";

    Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: "젊꼰 테스트 (JUMGGON)",
        description: "회사생활 밈으로 알아보는 젊은 꼰대 지수 😎",
        imageUrl: finalImage,
        link: {
          mobileWebUrl: "https://www.survivaloffice.com/test/jumggon",
          webUrl:       "https://www.survivaloffice.com/test/jumggon"
        }
      },
      buttons: [
        {
          title: "테스트 하러 가기",
          link: {
            mobileWebUrl: "https://www.survivaloffice.com/test/jumggon",
            webUrl:       "https://www.survivaloffice.com/test/jumggon"
          }
        }
      ]
    });
  }

  // ---------- 다시하기 ----------
  function resetTest() {
    currentIndex = 0;
    normalScore  = 0;
    kkonScore    = 0;
    mzScore      = 0;

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

  if (shareBtnEl) shareBtnEl.addEventListener("click", () => shareKakao(resultImage?.src || ""));
  if (restartBtnEl) restartBtnEl.addEventListener("click", resetTest);

  // =========================
  // 참여자 카운터 (CountAPI)
  // =========================
  const COUNTER_BASE = 'https://api.counterapi.dev/v1';
  const ONLY_ONCE_PER_SESSION = false;

  function counterPath(ns, key) {
    return `${COUNTER_BASE}/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/`;
  }

  function getCounterConfig() {
    const el = document.getElementById("test-counter");
    return {
      el,
      ns: el?.dataset.counterNamespace || "survivaloffice",
      key: el?.dataset.counterKey       || "jumggon", // ✅ 기본값도 jumggon
    };
  }

  function cacheKey(ns, key){ return `counter_${ns}_${key}`; }
  function getCachedCount(ns, key, maxAgeMs = 10 * 60 * 1000){
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

  async function fetchCount(ns, key) {
    const url = counterPath(ns, key);
    try {
      const r = await fetch(url, { cache: 'no-store', headers: { 'accept': 'application/json' } });
      if (!r.ok) return 0;
      const data = await r.json();
      return (typeof data.count === 'number') ? data.count :
             (typeof data.value === 'number') ? data.value : 0;
    } catch (e) {
      console.warn('[counter] fetch failed:', e);
      return 0;
    }
  }

  async function hitCount(ns, key) {
    const url = `${counterPath(ns, key)}up`;
    try {
      const r = await fetch(url, { cache: 'no-store', headers: { 'accept': 'application/json' } });
      if (!r.ok) return null;
      const data = await r.json();
      return (typeof data.count === 'number') ? data.count :
             (typeof data.value === 'number') ? data.value : null;
    } catch (e) {
      console.warn('[counter] hit failed:', e);
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
    if (ns && key && typeof n === 'number') setCachedCount(ns, key, n);
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
