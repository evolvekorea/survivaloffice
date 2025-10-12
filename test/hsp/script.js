const TEST_DATA = {
  "meta": {
    "title": "나의 예민함 정도 테스트 (18문항)",
    "version": "HSP-R (community-adapted, 18 items, KR)",
    "disclaimer": "본 테스트는 자가보고형 참고용이며, 임상 진단을 대체하지 않습니다.",
    "scale": {
      "min": 1,
      "max": 7,
      "labels": {
        "1": "전혀 그렇지 않다",
        "2": "그렇지 않은 편이다",
        "3": "조금 그렇지 않다",
        "4": "보통이다",
        "5": "조금 그렇다",
        "6": "그렇다",
        "7": "매우 그렇다"
      }
    }
  },
  "questions": [
    { "id": 1, "text": "밝은 빛이나 큰 소리 같은 강한 감각 자극에 쉽게 피로를 느낍니다." },
    { "id": 2, "text": "주변 사람들의 감정 변화에 민감하게 반응합니다." },
    { "id": 3, "text": "한 번에 많은 일을 처리해야 할 때 쉽게 압도됩니다." },
    { "id": 4, "text": "카페인, 약물, 설탕 등 자극 물질에 민감한 편입니다." },
    { "id": 5, "text": "영화나 음악, 예술 작품에 깊이 몰입하고 쉽게 감동합니다." },
    { "id": 6, "text": "갑작스러운 변화(환경, 일정 등)가 스트레스로 느껴집니다." },
    { "id": 7, "text": "타인의 필요를 빨리 알아채고 돕고자 하는 마음이 듭니다." },
    { "id": 8, "text": "시간 압박이나 촉박한 마감이 있을 때 긴장이 크게 올라갑니다." },
    { "id": 9, "text": "강한 냄새, 거친 촉감, 불편한 옷감 등에 예민합니다." },
    { "id": 10, "text": "혼잡하거나 시끄러운 장소를 오래 있으면 지칩니다." },
    { "id": 11, "text": "문제를 깊이 생각하고 여러 가능성을 신중히 검토하는 편입니다." },
    { "id": 12, "text": "비판이나 부정적 피드백으로 쉽게 낙담합니다." },
    { "id": 13, "text": "작은 실수나 실망도 오래 떠올리며 곱씹는 편입니다." },
    { "id": 14, "text": "하루 일과 후 혼자 조용히 회복하는 시간이 필요합니다." },
    { "id": 15, "text": "주변의 미묘한 분위기 변화(표정, 말투 등)를 잘 감지합니다." },
    { "id": 16, "text": "한 공간의 조명, 온도, 좌석 배치 같은 요소가 집중도에 크게 영향을 줍니다." },
    { "id": 17, "text": "타인의 고통이나 어려움에 쉽게 공감하며 정서적으로 영향받습니다." },
    { "id": 18, "text": "여러 감각 자극이 한꺼번에 몰리면 휴식이 꼭 필요합니다." }
  ],
  "scoring": {
    "method": "sum_and_average",
    "thresholds": [
      { "id": "low",  "label": "낮은 민감성", "average_lt": 3.5 },
      { "id": "mid",  "label": "중간 민감성", "average_gte": 3.5, "average_lt": 5.0 },
      { "id": "high", "label": "높은 민감성", "average_gte": 5.0 }
    ],
    "notes": "컷오프는 참고용이며 추후 표본에 따라 조정 가능"
  },
  "results": {
    "low": {
      "title": "낮은 민감성",
      "description": "자극에 비교적 강하고 회복이 빠른 편입니다. 특정 상황에서만 선택적으로 예민함이 나타날 수 있습니다.",
      "tips": [
        "집중 환경을 약간만 정돈해도 성과가 잘 납니다.",
        "과로만 피하면 스트레스 내성이 높은 편입니다.",
        "타인의 예민함을 이해하려는 태도가 관계에 도움이 됩니다."
      ]
    },
    "mid": {
      "title": "중간 민감성",
      "description": "상황에 따라 예민함과 안정감이 번갈아 나타납니다. 환경 조절과 휴식 루틴이 성과에 큰 영향을 줍니다.",
      "tips": [
        "업무/학습 50~90분 후 5~10분 리셋 루틴을 만드세요.",
        "소음·조명 등 방해요인을 1~2개만 먼저 조정해도 체감 효율이 큽니다.",
        "스스로에게 친절한 자기대화로 과도한 반추를 줄이세요."
      ]
    },
    "high": {
      "title": "높은 민감성",
      "description": "감각·정서 자극에 매우 민감합니다. 올바른 환경 설계와 회복 전략이 삶의 질을 크게 높입니다.",
      "tips": [
        "소음 차단·조명·온도 등 기본 환경을 먼저 안정화하세요.",
        "하루 중 ‘감각 휴식’(무자극 10~15분)을 일정에 넣으세요.",
        "경계 설정(거절, 일정 조율)을 연습하면 번아웃을 예방할 수 있습니다."
      ]
    }
  },
  "products": {
    "low": [
      { "name": "블루라이트 차단 안경", "url": "https://link.coupang.com/a/cV6a3H", "why": "장시간 화면 노출 시 눈 피로 완화" },
      { "name": "인체공학 무선 마우스", "url": "https://link.coupang.com/a/cV6cGQ", "why": "미세 스트레스 감소로 작업 효율 향상" },
      { "name": "허브 티(카페인 프리)", "url": "https://link.coupang.com/a/cV6ffY", "why": "저강도 리셋 루틴에 적합" }
    ],
    "mid": [
      { "name": "수면 아이마스크(3D 폼/저압식)", "url": "https://link.coupang.com/a/cV6fW4", "why": "광자극 차단으로 회복 품질 향상" },
      { "name": "아로마 디퓨저(타이머 기능)", "url": "https://link.coupang.com/a/cV6gDE", "why": "은은한 향/습도로 과자극 완충" },
      { "name": "화이트노이즈 머신", "url": "https://link.coupang.com/a/cV6hgX", "why": "불규칙 소음 상쇄로 집중/수면 도움" }
    ],
    "high": [
      { "name": "ANC 헤드폰/이어버드", "url": "https://link.coupang.com/a/cV6hEr", "why": "소음 민감성 완충에 효과적" },
      { "name": "암막 커튼(광차단 90%+)", "url": "https://link.coupang.com/a/cV6ib4", "why": "광자극 차단으로 수면/회복 표준화" },
      { "name": "가중 담요(Weighted Blanket)", "url": "https://link.coupang.com/a/cV6iAH", "why": "심부압 자극으로 불안 완화(개인차)" }
    ]
  },
  "ui_texts": {
    "intro_title": "나의 예민함 정도 테스트",
    "intro_desc": "18문항, 약 3분. 결과는 참고용이며 임상 진단을 대체하지 않습니다.",
    "form_fields": {
      "name": "이름",
      "gender": "성별",
      "gender_options": ["남성", "여성"],
      "start_button": "테스트 시작"
    },
    "question_cta_prev": "이전",
    "question_cta_next": "다음",
    "submit_button": "결과 보기",
    "result_title": "당신의 예민함 정도",
    "score_label": "총점 / 평균",
    "product_title": "추천 아이템",
    "product_note": "아래 링크는 쿠팡 파트너스 링크입니다."
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const {
    meta,
    questions,
    results,
    products,
    scoring,
    ui_texts: ui
  } = TEST_DATA;

  const totalQuestions = questions.length;

  const screens = {
    start: document.getElementById('start-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen')
  };

  const introForm = document.getElementById('intro-form');
  const nameInput = document.getElementById('user-name');
  const introHelper = document.getElementById('intro-helper');
  const startButton = document.getElementById('start-btn');

  const progressLabel = document.getElementById('progress-label');
  const progressPercent = document.getElementById('progress-percent');
  const progressScore = document.getElementById('progress-score');
  const progressFill = document.getElementById('progress-fill');
  const progressBar = document.querySelector('.progress-bar');

  const questionTitle = document.getElementById('question-title');
  const questionText = document.getElementById('question-text');
  const likertOptions = document.getElementById('likert-options');
  const helperText = document.getElementById('question-helper');
  const prevButton = document.getElementById('prev-btn');
  const nextButton = document.getElementById('next-btn');
  const submitButton = document.getElementById('submit-btn');
  const quizCard = document.querySelector('.quiz-card');

  const resultGreeting = document.getElementById('result-greeting');
  const resultTitle = document.getElementById('result-title');
  const scoreTotalEl = document.getElementById('score-total');
  const scoreAverageEl = document.getElementById('score-average');
  const levelNameEl = document.getElementById('level-name');
  const levelDescEl = document.getElementById('level-desc');
  const tipsList = document.getElementById('tips-list');
  const productTitle = document.getElementById('product-title');
  const productNote = document.querySelector('.product-note');
  const productList = document.getElementById('product-list');

  const bottomActions = document.getElementById('bottom-actions');
  const shareBtn = document.getElementById('share-kakao');
  const restartBtn = document.getElementById('restart-btn');
  const otherTestBtn = document.getElementById('other-test-btn');
  const captureBtn = document.getElementById('capture-btn');

  let increaseCounter = () => {};

  const state = {
    currentIndex: 0,
    answers: new Array(totalQuestions).fill(null),
    name: '',
    gender: ''
  };

  function setScreen(activeKey) {
    Object.entries(screens).forEach(([key, element]) => {
      if (!element) return;
      element.classList.toggle('active', key === activeKey);
    });
  }

  function resetHelper(element) {
    if (element) element.textContent = '';
  }

  function showHelper(element, message) {
    if (element) element.textContent = message;
  }

  function scrollToTop(container) {
    if (!container) return;
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (typeof container.scrollIntoView === 'function') {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function formatPercent(current) {
    const ratio = ((current + 1) / totalQuestions) * 100;
    return `${Math.round(ratio)}%`;
  }

  function getSelectedGender() {
    const selected = introForm.querySelector('input[name="gender"]:checked');
    return selected ? selected.value : '';
  }

  function renderScaleLabels() {
    const minLabel = meta.scale.labels[String(meta.scale.min)] || '';
    const maxLabel = meta.scale.labels[String(meta.scale.max)] || '';
    const scaleMin = document.getElementById('scale-min');
    const scaleMax = document.getElementById('scale-max');
    if (scaleMin) scaleMin.textContent = minLabel;
    if (scaleMax) scaleMax.textContent = maxLabel;
  }

  function renderQuestion() {
    const index = state.currentIndex;
    const question = questions[index];
    if (!question) return;

    progressLabel.textContent = `문항 ${index + 1} / ${totalQuestions}`;
    progressPercent.textContent = formatPercent(index);
    const currentScore = state.answers[index];
    progressScore.textContent = currentScore ? `선택 점수: ${currentScore}` : '선택 점수: -';

    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', String(index + 1));
    }
    if (progressFill) {
      const percent = ((index + 1) / totalQuestions) * 100;
      progressFill.style.width = `${percent}%`;
    }

    questionTitle.textContent = `${question.id}번 문항`;
    questionText.textContent = question.text;
    resetHelper(helperText);

    likertOptions.innerHTML = '';
    const questionName = `question-${question.id}`;
    const selectedValue = state.answers[index];

    for (let value = meta.scale.min; value <= meta.scale.max; value += 1) {
      const labelText = meta.scale.labels[String(value)] || `${value}`;
      const id = `${questionName}-${value}`;

      const label = document.createElement('label');
      label.className = 'likert-option';
      label.setAttribute('for', id);

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = questionName;
      input.id = id;
      input.value = String(value);
      input.checked = selectedValue === value;

      const shell = document.createElement('span');
      shell.className = 'option-shell';

      const valueSpan = document.createElement('span');
      valueSpan.className = 'option-value';
      valueSpan.textContent = String(value);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'option-label';
      labelSpan.textContent = labelText;

      shell.append(valueSpan, labelSpan);
      label.append(input, shell);
      likertOptions.appendChild(label);

      input.addEventListener('change', () => {
        state.answers[index] = value;
        resetHelper(helperText);
        progressScore.textContent = `선택 점수: ${value}`;
        updateNavButtons();
      });
    }

    updateNavButtons();
  }

  function updateNavButtons() {
    const index = state.currentIndex;
    const isFirst = index === 0;
    const isLast = index === totalQuestions - 1;
    prevButton.textContent = ui.question_cta_prev;
    prevButton.disabled = isFirst;
    nextButton.style.display = isLast ? 'none' : 'block';
    submitButton.style.display = isLast ? 'block' : 'none';
    submitButton.style.gridColumn = isLast ? '2 / 4' : '';
    if (!isLast) {
      nextButton.textContent = ui.question_cta_next;
      nextButton.style.gridColumn = '';
    } else {
      submitButton.textContent = ui.submit_button;
    }
  }

  function validateCurrentAnswer() {
    const answer = state.answers[state.currentIndex];
    if (typeof answer !== 'number') {
      showHelper(helperText, '문항에 대한 답변을 선택해주세요.');
      const firstInput = likertOptions.querySelector('input');
      if (firstInput) firstInput.focus({ preventScroll: false });
      return false;
    }
    return true;
  }

  function findFirstUnansweredIndex() {
    return state.answers.findIndex(value => typeof value !== 'number');
  }

  function determineLevel(average) {
    const thresholds = scoring.thresholds || [];
    for (const threshold of thresholds) {
      const gte = threshold.average_gte ?? Number.NEGATIVE_INFINITY;
      const lt = threshold.average_lt ?? Number.POSITIVE_INFINITY;
      const isGte = average >= gte;
      const isLt = average < lt;
      if (isGte && isLt) {
        return threshold;
      }
    }
    return thresholds[thresholds.length - 1];
  }

  function renderResult(total, average, levelId) {
    const levelData = results[levelId];
    const productData = products[levelId] || [];

    const gender = state.gender ? ` (${state.gender})` : '';
    resultGreeting.textContent = `${state.name}님${gender}, 결과는 다음과 같습니다.`;
    resultTitle.textContent = ui.result_title;
    scoreTotalEl.textContent = total.toFixed(0);
    scoreAverageEl.textContent = average.toFixed(2);

    if (levelData) {
      levelNameEl.textContent = levelData.title;
      levelDescEl.textContent = levelData.description;
      tipsList.innerHTML = '';
      levelData.tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
      });
    }

    productTitle.textContent = ui.product_title;
    if (productNote) {
      productNote.textContent = ui.product_note;
    }

    productList.innerHTML = '';
    productData.forEach(item => {
      const card = document.createElement('article');
      card.className = 'product-card';

      const title = document.createElement('h4');
      title.textContent = item.name;

      const why = document.createElement('p');
      why.textContent = item.why;

      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '쿠팡에서 보기';

      card.append(title, why, link);
      productList.appendChild(card);
    });
  }

  function calculateAndShowResult() {
    const unanswered = findFirstUnansweredIndex();
    if (unanswered !== -1) {
      state.currentIndex = unanswered;
      renderQuestion();
      showHelper(helperText, '답변하지 않은 문항이 있습니다. 해당 문항으로 이동했어요.');
      scrollToTop(quizCard);
      return;
    }

    const total = state.answers.reduce((sum, value) => sum + value, 0);
    const average = total / totalQuestions;
    const level = determineLevel(average);
    const levelId = level?.id || scoring.thresholds?.[scoring.thresholds.length - 1]?.id || 'mid';

    renderResult(total, average, levelId);
    setScreen('result');
    bottomActions.style.display = 'flex';
    scrollToTop(document.getElementById('result-card'));
  }

  function startTest() {
    state.currentIndex = 0;
    state.answers.fill(null);
    renderScaleLabels();
    renderQuestion();
    setScreen('quiz');
    scrollToTop(quizCard);
    increaseCounter();
  }

  introForm.addEventListener('submit', event => {
    event.preventDefault();
    resetHelper(introHelper);

    const name = nameInput.value.trim();
    const gender = getSelectedGender();

    if (!name) {
      showHelper(introHelper, '이름을 입력해주세요.');
      nameInput.focus();
      return;
    }

    if (!gender) {
      showHelper(introHelper, '성별을 선택해주세요.');
      const firstRadio = introForm.querySelector('input[name="gender"]');
      if (firstRadio) firstRadio.focus();
      return;
    }

    state.name = name;
    state.gender = gender;
    startTest();
  });

  prevButton.addEventListener('click', () => {
    if (state.currentIndex === 0) return;
    state.currentIndex -= 1;
    renderQuestion();
    scrollToTop(quizCard);
  });

  nextButton.addEventListener('click', () => {
    if (!validateCurrentAnswer()) return;
    if (state.currentIndex < totalQuestions - 1) {
      state.currentIndex += 1;
      renderQuestion();
      scrollToTop(quizCard);
    }
  });

  submitButton.addEventListener('click', () => {
    if (!validateCurrentAnswer()) return;
    calculateAndShowResult();
  });

  function resetTest() {
    state.currentIndex = 0;
    state.answers = new Array(totalQuestions).fill(null);
    state.name = '';
    state.gender = '';

    introForm.reset();
    resetHelper(introHelper);
    resetHelper(helperText);

    setScreen('start');
    bottomActions.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
    if (progressBar) progressBar.setAttribute('aria-valuenow', '0');
    progressLabel.textContent = `문항 1 / ${totalQuestions}`;
    progressPercent.textContent = formatPercent(0);
    progressScore.textContent = '선택 점수: -';
    scrollToTop(screens.start?.querySelector('.card'));
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetTest();
      nameInput.focus();
    });
  }

  if (otherTestBtn) {
    otherTestBtn.addEventListener('click', () => {
      window.location.href = 'https://survivaloffice.com/test';
    });
  }

  // Kakao share
  async function loadKakaoSDK() {
    if (window.Kakao && window.Kakao.isInitialized()) {
      return;
    }
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
      script.onload = () => {
        if (!window.Kakao) {
          reject(new Error('Kakao SDK failed to load'));
          return;
        }
        window.Kakao.init('eee6c2e01641161de9f217ba99c6a0da');
        resolve();
      };
      script.onerror = () => reject(new Error('Kakao SDK load error'));
      document.head.appendChild(script);
    });
  }

  function shareKakao() {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert('카카오톡 공유 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const description = `${state.name || '나'}의 예민함 정도 테스트 결과를 확인해보세요!`;

    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: '나의 예민함 정도 테스트',
        description,
        imageUrl: 'https://www.survivaloffice.com/images/hsp1.png',
        link: {
          mobileWebUrl: 'https://www.survivaloffice.com/test/hsp',
          webUrl: 'https://www.survivaloffice.com/test/hsp'
        }
      },
      buttons: [
        {
          title: '테스트 하러 가기',
          link: {
            mobileWebUrl: 'https://www.survivaloffice.com/test/hsp',
            webUrl: 'https://www.survivaloffice.com/test/hsp'
          }
        }
      ]
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      loadKakaoSDK().then(shareKakao).catch(err => {
        console.error('[Kakao] share error', err);
        alert('카카오톡 공유를 준비하지 못했습니다. 잠시 후 다시 시도해주세요.');
      });
    });
  }

  async function captureResultCard() {
    const card = document.getElementById('result-card');
    if (!card) return;

    try {
      let html2canvasFn = window.html2canvas;
      if (!html2canvasFn) {
        const module = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js');
        html2canvasFn = module.default;
        window.html2canvas = html2canvasFn;
      }
      const canvas = await html2canvasFn(card, {
        backgroundColor: '#ffffff',
        scale: window.devicePixelRatio > 1 ? 2 : 1
      });
      const link = document.createElement('a');
      link.download = `hsp-result-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('[Capture] failed', error);
      alert('결과 이미지를 저장할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      if (!screens.result.classList.contains('active')) {
        alert('테스트 결과 확인 후 저장할 수 있습니다.');
        return;
      }
      captureResultCard();
    });
  }

  // 참여자 카운터 (CountAPI)
  const COUNTER_BASE = 'https://api.counterapi.dev/v1';
  const ONLY_ONCE_PER_SESSION = false;

  function counterPath(ns, key) {
    return `${COUNTER_BASE}/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/`;
  }

  function getCounterConfig() {
    const el = document.getElementById('test-counter');
    return {
      el,
      ns: el?.dataset.counterNamespace || 'survivaloffice',
      key: el?.dataset.counterKey || 'hsp'
    };
  }

  function cacheKey(ns, key) {
    return `counter_${ns}_${key}`;
  }

  function getCachedCount(ns, key, maxAgeMs = 10 * 60 * 1000) {
    try {
      const raw = localStorage.getItem(cacheKey(ns, key));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.t > maxAgeMs) return null;
      return typeof obj.v === 'number' ? obj.v : null;
    } catch (error) {
      console.warn('[counter] cache parse failed', error);
      return null;
    }
  }

  function setCachedCount(ns, key, value) {
    try {
      localStorage.setItem(cacheKey(ns, key), JSON.stringify({ v: Number(value) || 0, t: Date.now() }));
    } catch (error) {
      console.warn('[counter] cache store failed', error);
    }
  }

  async function fetchCount(ns, key) {
    const url = counterPath(ns, key);
    try {
      const response = await fetch(url, { cache: 'no-store', headers: { accept: 'application/json' } });
      if (!response.ok) return 0;
      const data = await response.json();
      return typeof data.count === 'number' ? data.count : (typeof data.value === 'number' ? data.value : 0);
    } catch (error) {
      console.warn('[counter] fetch failed', error);
      return 0;
    }
  }

  async function hitCount(ns, key) {
    const url = `${counterPath(ns, key)}up`;
    try {
      const response = await fetch(url, { cache: 'no-store', headers: { accept: 'application/json' } });
      if (!response.ok) return null;
      const data = await response.json();
      return typeof data.count === 'number' ? data.count : (typeof data.value === 'number' ? data.value : null);
    } catch (error) {
      console.warn('[counter] hit failed', error);
      return null;
    }
  }

  function shouldIncreaseThisSession(ns, key) {
    if (!ONLY_ONCE_PER_SESSION) return true;
    const flag = `counted_${ns}_${key}`;
    if (sessionStorage.getItem(flag) === '1') return false;
    sessionStorage.setItem(flag, '1');
    return true;
  }

  function renderCount(el, value) {
    if (!el) return;
    el.textContent = `총 ${Number(value).toLocaleString()}명 참여`;
    el.setAttribute('data-count', String(value));
    const { ns, key } = getCounterConfig();
    if (ns && key && typeof value === 'number') {
      setCachedCount(ns, key, value);
    }
  }

  (async function initCounter() {
    const { el, ns, key } = getCounterConfig();
    if (!el) return;

    increaseCounter = async () => {
      try {
        if (shouldIncreaseThisSession(ns, key)) {
          const after = await hitCount(ns, key);
          if (after !== null) renderCount(el, after);
        }
      } catch (error) {
        console.warn('[counter] increase failed', error);
      }
    };

    const cached = getCachedCount(ns, key);
    if (cached !== null) renderCount(el, cached);

    const fresh = await fetchCount(ns, key);
    renderCount(el, fresh);
  })();
});
