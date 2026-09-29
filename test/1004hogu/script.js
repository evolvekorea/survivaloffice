document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  const startScreen   = document.getElementById("start-screen");
  const quizScreen    = document.getElementById("quiz-screen");
  const resultScreen  = document.getElementById("result-screen");

  const startBtn      = document.getElementById("start-btn");
  const questionText  = document.getElementById("question-text");
  const choiceA       = document.getElementById("choice-a");
  const choiceB       = document.getElementById("choice-b");
  const choiceButtons = [choiceA, choiceB];

  const resultImage   = document.getElementById("result-image");
  if (resultImage) {
    // 결과 화면 전환 즉시 보이도록 브라우저 힌트
    resultImage.loading = "eager";
    resultImage.decoding = "async";
  }

  // 진행바
  const progressFill  = document.getElementById("progress-fill");
  const progressTrack = document.getElementById("progress-track");
  const progressCount = document.getElementById("progress-count");

  let currentIndex = 0;
  let angelScore   = 0; // 천사 점수
  let hoguScore    = 0; // 호구 점수

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  // =========================
  // ✅ 결과 이미지 경로 (프리로드 대상)
  // =========================
  const RESULT_IMAGES = {
    angel: "https://www.survivaloffice.com/images/1004hogu3.png",
    hogu:  "https://www.survivaloffice.com/images/1004hogu2.png"
  };

  // =========================
  // ✅ 결과 이미지 프리로드
  // =========================
  const preloadedImages = {}; // url -> Image 객체

  function preloadImages(map){
    const urls = Object.values(map);
    return Promise.all(urls.map(url => new Promise(resolve => {
      const img = new Image();
      img.loading = "eager";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.onload = () => { preloadedImages[url] = img; resolve(img); };
      img.onerror = () => { console.warn("⚠️ preload fail:", url); resolve(null); };
      img.src = url;
    })));
  }

  // 가능한 빨리 프리로드 시작 (메인 스레드 여유 시점도 커버)
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
  // ✅ 테스트 문항 (10문항)
  //    - { text, type, weight }, type: 'angel' | 'hogu'
  //    - 6번 문항만 weight 2 (변별력)
  // =========================
  const questions = [
    {
      question: "친구가 또 돈이 없다고 밥을 사달라 한다.",
      options: [
        { text: "오늘만 힘들다니까 내가 사줄게.", type: "angel", weight: 1 },
        { text: "항상 내가 사왔으니 그냥 또 사준다.", type: "hogu",  weight: 1 }
      ]
    },
    {
      question: "동료가 내 업무까지 부탁한다.",
      options: [
        { text: "급한 상황이라면 내가 도와줄 수 있지.", type: "angel", weight: 1 },
        { text: "늘 하던 거니까 그냥 해준다.",         type: "hogu",  weight: 1 }
      ]
    },
    {
      question: "애인이 늦게 연락한다.",
      options: [
        { text: "바빴겠지 하고 이해한다.",           type: "angel", weight: 1 },
        { text: "원래 그러니까 또 참는다.",           type: "hogu",  weight: 1 }
      ]
    },
    {
      question: "모르는 사람이 길을 물어본다.",
      options: [
        { text: "친절히 설명해주고 잘 가라고 한다.",   type: "angel", weight: 1 },
        { text: "익숙하니 또 멀리까지 데려다 준다.",   type: "hogu",  weight: 1 }
      ]
    },
    {
      question: "친구가 중요한 날 약속을 어겼다.",
      options: [
        { text: "사정 있었겠지 하고 넘어간다.",       type: "angel", weight: 1 },
        { text: "늘 이런 식이라 그냥 또 넘어간다.",   type: "hogu",  weight: 1 }
      ]
    },
    {
      // 🔥 변별력 문항: weight 2
      question: "회식 자리에서 모두 계산을 미룬다.",
      options: [
        { text: "분위기 어색하니 이번엔 내가 낸다.",   type: "angel", weight: 2 },
        { text: "어차피 항상 내가 내니 그냥 또 낸다.", type: "hogu",  weight: 2 }
      ]
    },
    {
      question: "지인이 이사 도와달라 한다.",
      options: [
        { text: "힘든 날이니 기꺼이 도와준다.",       type: "angel", weight: 1 },
        { text: "늘 불려 다녀서 익숙하게 또 도와준다.", type: "hogu",  weight: 1 }
      ]
    },
    {
      question: "부탁을 거절하기 애매한 상황이다.",
      options: [
        { text: "가능한 만큼만 들어준다.",            type: "angel", weight: 1 },
        { text: "매번 그래왔으니 그냥 다 해준다.",     type: "hogu",  weight: 1 }
      ]
    },
    {
      question: "새벽에 친구가 고민 상담을 한다.",
      options: [
        { text: "잠은 부족해도 힘들다니 들어준다.",     type: "angel", weight: 1 },
        { text: "항상 이런 전화를 받으니 또 들어준다.", type: "hogu",  weight: 1 }
      ]
    },
    {
      question: "단체에서 잡일을 맡길 사람이 없다.",
      options: [
        { text: "누군가는 해야 하니 내가 맡는다.",     type: "angel", weight: 1 },
        { text: "늘 나만 하던 거라 그냥 또 맡는다.",   type: "hogu",  weight: 1 }
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

    const opts = shuffle(q.options); // 2개 섞기
    opts.forEach((opt, idx) => {
      const btn = choiceButtons[idx];
      btn.textContent   = opt.text;
      btn.dataset.type  = opt.type;     // 'angel' | 'hogu'
      btn.dataset.weight= String(opt.weight ?? 1);
    });
  }

  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type   = btn.dataset.type || "angel";
      const weight = parseInt(btn.dataset.weight || "1", 10);

      if (type === "angel") angelScore += weight;
      else                  hoguScore  += weight;

      currentIndex++;
      if (currentIndex < totalQuestions) {
        showQuestion();
      } else {
        showResult();
      }
    });
  });

  function showResult() {
    console.log("🏁 종료 - 천사:", angelScore, "/ 호구:", hoguScore);

    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    const isAngel = angelScore >= hoguScore; // 동점은 천사 우선
    const bucket  = isAngel ? "angel" : "hogu";
    const url     = RESULT_IMAGES[bucket];

    // 프리로드된 이미지가 있으면 그것을 사용 (즉시 표시)
    const cached = preloadedImages[url];
    if (cached && cached.complete) {
      resultImage.src = cached.src;
    } else {
      resultImage.src = url;
    }
    resultImage.alt = isAngel ? "천사 결과" : "호구 결과";

    bottomActions.style.display = 'flex';
    console.log(`🖼 결과: ${bucket}, 이미지: ${url}`);
  }

  // ---------- 하단 버튼 참조 ----------
  const shareBtn      = document.getElementById("share-kakao");
  const restartBtn    = document.getElementById("restart-btn");
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

  // ---------- 카카오 공유 ----------
  function shareKakao(imageUrl) {
    if (!window.Kakao || !Kakao.isInitialized()) {
      alert("⚠️ 카카오톡 공유 기능을 사용할 수 없습니다.");
      return;
    }

    const finalImage = imageUrl && imageUrl.length > 0
      ? imageUrl
      : "https://www.survivaloffice.com/images/1004hogu.png";

    Kakao.Link.sendDefault({
      objectType: "feed",
      content: {
        title: "천사 vs 호구 테스트",
        description: "나는 천사일까, 호구일까? 10문항으로 간단 체크!",
        imageUrl: finalImage,
        link: {
          mobileWebUrl: "https://www.survivaloffice.com/test/1004hogu",
          webUrl:       "https://www.survivaloffice.com/test/1004hogu"
        }
      },
      buttons: [
        {
          title: "테스트 하러 가기",
          link: {
            mobileWebUrl: "https://www.survivaloffice.com/test/1004hogu",
            webUrl:       "https://www.survivaloffice.com/test/1004hogu"
          }
        }
      ]
    });
  }

  // ---------- 다시하기 ----------
  function resetTest() {
    currentIndex = 0;
    angelScore   = 0;
    hoguScore    = 0;

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
  const shareBtnEl = document.getElementById("share-kakao");
  if (shareBtnEl) {
    shareBtnEl.addEventListener("click", () => {
      shareKakao(resultImage?.src || "");
    });
  }
  const restartBtnEl = document.getElementById("restart-btn");
  if (restartBtnEl) {
    restartBtnEl.addEventListener("click", resetTest);
  }

});
