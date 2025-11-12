document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ 조선시대 이름 테스트 로드 완료");

  // --- 화면 요소 ---
  const screens = {
    start: document.getElementById("start-screen"),
    story: document.getElementById("story-screen"),
    gender: document.getElementById("gender-screen"),
    birth: document.getElementById("birth-screen"),
    loading: document.getElementById("loading-screen"),
    result: document.getElementById("result-screen"),
  };

  const startBtn   = document.getElementById("start-btn");
  const storyText  = document.getElementById("story-text");
  const storyNext  = document.getElementById("story-next");
  const genderBtns = document.querySelectorAll(".gender-card");
  const revealBtn  = document.getElementById("reveal-btn");
  const restartBtn = document.getElementById("restart-btn");
  const shareBtn   = document.getElementById("share-kakao");
  const bottomActions = document.getElementById("bottom-actions");

  const birthMonth = document.getElementById("birth-month");
  const birthDay   = document.getElementById("birth-day");
  const birthError = document.getElementById("birth-error");

  const resultName = document.getElementById("result-name");
  const resultDesc = document.getElementById("result-desc");

  let state = { gender: null, month: null, day: null };

  // --- 이름 데이터 ---
  const maleNames = [
    "돌쇠","칠복","만석","복길","용식","철수","갑돌","상팔","칠수","춘복",
    "봉구","말돌","칠돌","상득","복남","학수","득복","칠성","용태","칠구"
  ];

  const femaleNames = [
    "꽃분","춘심","봉순","덕순","분이","옥녀","순덕","미향","정순","복녀",
    "영심","분례","향단","난순","옥분","금향","영숙","복순","향이","금이"
  ];

  // --- 결과 설명 ---
  const maleDescriptions = [
    "는 농사에 능해 사람들의 든든한 버팀목이 되었다고 합니다.",
    "는 말수가 적지만 일솜씨가 뛰어나 마을의 신뢰를 얻었다고 합니다.",
    "는 힘이 세고 성격이 호탕해 장정들 사이에서 인기가 많았다고 합니다.",
    "는 주인댁의 일을 묵묵히 해내 늘 인정받았다고 합니다.",
    "는 일을 마치고도 이웃의 일을 거들어주는 인심 좋은 인물이었다고 합니다.",
    "는 낮에는 밭일, 밤에는 나무를 해오며 가족을 지켰다고 합니다.",
    "는 마을의 장정을 대표해 큰 행사를 도왔다는 기록이 남아 있습니다.",
    "는 젊을 적부터 성실해 주막집에서도 신용이 좋았다고 합니다.",
    "는 말보단 행동으로 믿음을 쌓은 사람이었다고 합니다.",
    "는 남의 일도 자기 일처럼 챙기는 성품으로 유명했습니다.",
    "는 어려운 상황에서도 웃음을 잃지 않았다고 합니다.",
    "는 농한기마다 장터에서 품을 팔며 집안을 일으켰다고 합니다.",
    "는 허리춤에 낫을 차고 새벽마다 들판을 누볐다고 합니다.",
    "는 벼를 베는 솜씨가 좋아 장원급 농사꾼으로 불렸다고 합니다.",
    "는 어릴 적부터 우직하다는 말을 자주 들었다고 합니다.",
    "는 성격이 곧고 정의로워 다툼을 말리는 역할을 했다고 합니다.",
    "는 겨울에도 맨손으로 물길을 트던 근면한 인물이었습니다.",
    "는 이웃과 정을 나누며 살던 정 많은 사람이었다고 합니다.",
    "는 품삯보다 신의를 먼저 챙겼다고 전해집니다.",
    "는 하늘이 내린 일꾼이라 불릴 만큼 성실했다고 합니다."
  ];

  const femaleDescriptions = [
    "는 살림이 야무지고 손재주가 좋아 동네 사람들이 자주 찾았다고 합니다.",
    "는 마음씨가 곱고 노래를 잘 불러 장터의 인기인이었다고 합니다.",
    "는 새벽마다 물을 길어와 주인댁의 우물을 채웠다고 합니다.",
    "는 부지런하고 어질어 노모를 잘 모셨다고 합니다.",
    "는 바느질 솜씨가 좋아 근처 고을에서도 주문이 끊이지 않았다고 합니다.",
    "는 웃음소리가 예뻐 마을의 활력소가 되었다고 합니다.",
    "는 이웃의 아이들을 돌보며 모두의 누이로 불렸다고 합니다.",
    "는 사계절 내내 바느질로 가족을 먹여 살렸다고 합니다.",
    "는 명절마다 떡을 빚어 나눠주던 인심 좋은 여인이었다고 합니다.",
    "는 어릴 적부터 말수가 적고 마음이 깊었다고 합니다.",
    "는 눈이 맑고 손끝이 섬세해 옷감에 생명을 불어넣었다고 합니다.",
    "는 약초를 다뤄 마을 사람들의 병을 자주 고쳐줬다고 합니다.",
    "는 소문난 손맛으로 주막집의 간판 요리사가 되었다고 합니다.",
    "는 장날마다 어깨에 보자기를 메고 웃으며 장터를 누볐다고 합니다.",
    "는 새벽마다 장작을 패던 어여쁜 기개로 유명했습니다.",
    "는 낯선 이에게도 따뜻하게 대해줬다고 합니다.",
    "는 꾸밈없는 성격으로 많은 이들의 신뢰를 얻었다고 합니다.",
    "는 어두운 밤에도 등불을 들고 사람을 맞이했다고 합니다.",
    "는 고운 마음씨 덕분에 아이들에게 존경받았다고 합니다.",
    "는 주인댁에서도 인정받은 성실한 여인이었다고 합니다."
  ];

  // --- 공용 함수 ---
  function showScreen(target) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    target.classList.add("active");
    bottomActions.style.display = target === screens.result ? "flex" : "none";
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getName(gender, month, day) {
    const list = gender === "female" ? femaleNames : maleNames;
    return list[(month * 31 + day) % list.length];
  }

  function getDescription(gender) {
    return gender === "female" ? pick(femaleDescriptions) : pick(maleDescriptions);
  }

  function validateBirth(month, day) {
    if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
      birthError.textContent = "올바른 월과 일을 입력해주세요.";
      return false;
    }
    birthError.textContent = "";
    return true;
  }

  // --- 한글 받침 판별 & '이' 자동 처리 ---
  function hasBatchim(korChar) {
    const code = korChar.charCodeAt(0) - 0xac00;
    if (code < 0 || code > 11171) return false;
    return code % 28 !== 0; // 종성이 있으면 true
  }
  function formatNameWithParticle(name) {
    if (!name || typeof name !== "string") return name;
    const last = name.charAt(name.length - 1);
    return hasBatchim(last) ? `${name}이` : name;
  }

  // --- 결과 표시 ---
  function showResult() {
    const rawName  = getName(state.gender, state.month, state.day) || "이름미상";
    const desc     = getDescription(state.gender);
    const finalName = formatNameWithParticle(rawName); // ← 여기!

    resultName.textContent = finalName;                // 제목에도 '이' 반영
    resultDesc.textContent = `${finalName}${desc}`;    // 설명도 자연스럽게
    showScreen(screens.result);
  }

  // --- 스토리 타자효과 ---
  function typeStory(text, callback) {
    storyText.textContent = "";
    storyNext.hidden = true;
    let i = 0;
    const timer = setInterval(() => {
      storyText.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        storyNext.hidden = false;
        storyNext.onclick = callback;
      }
    }, 45);
  }

  // --- 실행 흐름 ---
  startBtn.onclick = () => {
    showScreen(screens.story);
    typeStory(
      "조선시대, 당신은 양반이 아닌 노비로 태어났습니다.\n\n삶은 고되고 자유는 없었지만, 그래도 하늘 아래 모두 사람이라 믿으며 하루하루를 살아갔죠.\n주인댁의 심부름부터 밭일, 물지게까지… 당신의 손은 언제나 바쁘게 움직였습니다.\n그 시절, 사람들은 이름에 마음을 담았으니까요.\n\n이제 조선시대에 태어난 당신의 이름을 찾아보겠습니다.",
      () => showScreen(screens.gender)
    );
  };

  genderBtns.forEach(btn => {
    btn.onclick = () => {
      // 선택 강조
      genderBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      state.gender = btn.dataset.gender;
      showScreen(screens.birth);
    };
  });

  revealBtn.onclick = e => {
    e.preventDefault();
    const month = parseInt(birthMonth.value, 10);
    const day   = parseInt(birthDay.value, 10);
    if (!validateBirth(month, day)) return;
    state.month = month;
    state.day   = day;
    showScreen(screens.loading);
    setTimeout(showResult, 5000);
  };

  restartBtn.onclick = () => {
    birthMonth.value = "";
    birthDay.value = "";
    // 리셋 시 선택 강조 제거
    genderBtns.forEach(b => b.classList.remove("selected"));
    showScreen(screens.start);
  };

// --- 카카오 공유 ---
function loadKakao() {
  const s = document.createElement("script");
  s.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
  s.onload = () => {
    try { Kakao.init("eee6c2e01641161de9f217ba99c6a0da"); }
    catch (e) { console.warn("Kakao init 실패:", e); }
  };
  document.head.appendChild(s);
}
loadKakao();

// 👇 성별에 따른 공유 이미지 선택 함수
function getShareImage(gender) {
  if (gender === "male") return "https://www.survivaloffice.com/images/slavem.png";
  if (gender === "female") return "https://www.survivaloffice.com/images/slavef.png";
  return "https://www.survivaloffice.com/images/slave1.png"; // fallback
}

// --- 카카오 공유 버튼 ---
shareBtn.onclick = () => {
  if (!window.Kakao || !Kakao.isInitialized()) {
    alert("⚠️ 카카오톡 공유 기능을 사용할 수 없습니다.");
    return;
  }

  const shownName = resultName.textContent || "이름 미상";   // 최종 이름
  const descText  = resultDesc.textContent || "";             // 결과 설명
  const imageUrl  = getShareImage(state.gender);              // 성별별 이미지 선택

  Kakao.Link.sendDefault({
    objectType: "feed",
    content: {
      title: `나의 조선시대 이름은 ${shownName}!`, // ✅ 이름이 제목에 포함됨
      description: descText,                        // ✅ 결과 설명도 함께 표시
      imageUrl: imageUrl,
      imageWidth: 600,
      imageHeight: 600,
      link: { mobileWebUrl: location.href, webUrl: location.href },
    },
    buttons: [
      { 
        title: "나도 테스트 해보기", 
        link: { mobileWebUrl: location.href, webUrl: location.href } 
      }
    ],
  });
};

  // --- 참여 카운터 ---
  const COUNTER_BASE = "https://api.counterapi.dev/v1";
  async function fetchCount(ns, key) {
    try {
      const r = await fetch(`${COUNTER_BASE}/${ns}/${key}/`, { cache: "no-store" });
      const d = await r.json();
      return d.count || d.value || 0;
    } catch {
      return 0;
    }
  }
  async function hitCount(ns, key) {
    try {
      const r = await fetch(`${COUNTER_BASE}/${ns}/${key}/up`, { cache: "no-store" });
      const d = await r.json();
      return d.count || d.value || null;
    } catch {
      return null;
    }
  }
  function renderCount(el, n) {
    if (!el) return;
    el.textContent = `총 ${Number(n).toLocaleString()}명 참여`;
  }

  (async function initCounter() {
    const el = document.getElementById("test-counter");
    if (!el) return;
    const ns = el.dataset.counterNamespace || "survivaloffice";
    const key = el.dataset.counterKey || "NobiName";
    const val = await fetchCount(ns, key);
    renderCount(el, val);
    startBtn.addEventListener("click", async () => {
      const after = await hitCount(ns, key);
      if (after !== null) renderCount(el, after);
    });
  })();
});
