const monthSyllables = [
  '', '웅', '석', '만', '용', '옥', '칠', '복', '삼', '상', '경', '연', '순'
];

const daySyllables = [
  '', '식', '구', '단', '춘', '양', '덕', '년', '복', '승', '도',
  '중', '박', '성', '장', '룡', '갑', '수', '덕', '창', '박',
  '손', '봉', '한', '독', '국', '공', '만', '선', '정', '호', '진'
];

const surnames = {
  male: ['김', '이', '박', '최', '정', '윤', '장', '임', '한', '권', '오', '신'],
  female: ['김', '박', '정', '유', '노', '심', '양', '우', '남', '현', '문', '변']
};

const descriptions = {
  male: [
    '호적에는 충직하고 우직한 인물로 기록돼 있습니다.',
    '성품이 강직하여 관아에서도 눈여겨봤다고 하네요.',
    '농사에 능해 동네 사람들의 든든한 버팀목이 되었다고 합니다.'
  ],
  female: [
    '맑은 목소리로 풍속가를 잘 불러 장날마다 사람들이 모였대요.',
    '살림살이를 똑 부러지게 하기로 유명했답니다.',
    '약초를 잘 알아 동네 아주머니들이 늘 찾아왔대요.'
  ]
};

const state = {
  gender: null,
  month: null,
  day: null,
  typingTimer: null
};

const screens = {
  start: document.getElementById('start-screen'),
  story: document.getElementById('story-screen'),
  gender: document.getElementById('gender-screen'),
  birth: document.getElementById('birth-screen'),
  loading: document.getElementById('loading-screen'),
  result: document.getElementById('result-screen')
};

const storyText = document.getElementById('story-text');
const storyNext = document.getElementById('story-next');
const birthForm = document.getElementById('birth-form');
const birthError = document.getElementById('birth-error');

function showScreen(target) {
  Object.values(screens).forEach(section => {
    section.classList.toggle('active', section === target);
  });
}

function typeStory(text, callback) {
  storyText.textContent = '';
  storyNext.hidden = true;
  storyNext.onclick = null;

  let index = 0;
  clearInterval(state.typingTimer);
  state.typingTimer = setInterval(() => {
    storyText.textContent += text[index];
    index += 1;
    if (index >= text.length) {
      clearInterval(state.typingTimer);
      storyNext.hidden = false;
      if (typeof callback === 'function') {
        storyNext.onclick = () => {
          storyNext.onclick = null;
          callback();
        };
      }
    }
  }, 80);
}

function validateBirth(month, day) {
  if (!month || !day) {
    birthError.textContent = '모든 값을 입력해주세요.';
    return false;
  }

  if (month < 1 || month > 12) {
    birthError.textContent = '달은 1에서 12 사이로 입력해주세요.';
    return false;
  }

  if (day < 1 || day > 31) {
    birthError.textContent = '날짜는 1에서 31 사이로 입력해주세요.';
    return false;
  }

  birthError.textContent = '';
  return true;
}

function pickFromArray(arr, seed) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  const index = seed % arr.length;
  return arr[index];
}

function buildName(gender, month, day) {
  const surnameList = surnames[gender] || surnames.male;
  const surname = pickFromArray(surnameList, month + day);
  const monthPart = monthSyllables[month] || '';
  const dayPart = daySyllables[day] || '';
  return `${surname}${monthPart}${dayPart}`;
}

function buildDescription(gender, name) {
  const pool = descriptions[gender] || descriptions.male;
  const message = pickFromArray(pool, name.length * 7);
  return `"${name}"은/는 ${message}`;
}

function revealResult() {
  const name = buildName(state.gender, state.month, state.day);
  const desc = buildDescription(state.gender, name);

  document.getElementById('result-name').textContent = name;
  document.getElementById('result-desc').textContent = desc;
  showScreen(screens.result);
}

function startLoading() {
  showScreen(screens.loading);
  setTimeout(revealResult, 5000);
}

function restart() {
  state.gender = null;
  state.month = null;
  state.day = null;
  birthForm.reset();
  birthError.textContent = '';
  storyText.textContent = '';
  storyNext.hidden = true;
  showScreen(screens.start);
}

function setupEvents() {
  document.getElementById('start-btn').addEventListener('click', () => {
    showScreen(screens.story);
    typeStory('조선시대 대부분의 사람들은 평민 아니면 노비였으니....', () => {
      showScreen(screens.gender);
    });
  });

  document.querySelectorAll('.gender-card').forEach(button => {
    button.addEventListener('click', () => {
      state.gender = button.dataset.gender;
      showScreen(screens.birth);
    });
  });

  birthForm.addEventListener('submit', event => {
    event.preventDefault();
    const month = Number.parseInt(document.getElementById('birth-month').value, 10);
    const day = Number.parseInt(document.getElementById('birth-day').value, 10);

    if (!validateBirth(month, day)) {
      return;
    }

    state.month = month;
    state.day = day;
    startLoading();
  });

  document.getElementById('restart-btn').addEventListener('click', restart);
}

window.addEventListener('DOMContentLoaded', setupEvents);
