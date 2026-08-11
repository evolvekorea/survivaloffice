import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyCK4Zdkhlc0cnjqC3TpmUJmLAt8Xrh8VOw',
    authDomain: 'upupup-e4c2c.firebaseapp.com',
    projectId: 'upupup-e4c2c',
    storageBucket: 'upupup-e4c2c.appspot.com',
    messagingSenderId: '877963060151',
    appId: '1:877963060151:web:e70751cb30638880767e32'
};

const DIFFICULTIES = {
    easy: '쉬움',
    normal: '보통',
    hard: '어려움'
};

const app = initializeApp(firebaseConfig, 'sudoku-ranking');
const db = getFirestore(app);

const ui = {
    list: document.getElementById('rankingList'),
    status: document.getElementById('rankingStatus'),
    submit: document.getElementById('rankingSubmit'),
    finalScore: document.getElementById('rankingFinalScore'),
    finalDifficulty: document.getElementById('rankingFinalDifficulty'),
    form: document.getElementById('rankingForm'),
    nickname: document.getElementById('rankingNickname'),
    saveButton: document.getElementById('saveRankingButton'),
    refreshButton: document.getElementById('refreshRankingButton'),
    overlay: document.getElementById('gameOverlay'),
    overlayRankingButton: document.getElementById('overlayRankingButton'),
    tabs: [...document.querySelectorAll('[data-ranking-difficulty]')]
};

let activeDifficulty = 'normal';
let latestResult = null;
let resultSaved = false;

function rankingCollection(difficulty) {
    return collection(db, 'sudoku_rankings', difficulty, 'scores');
}

function setStatus(message, type = '') {
    ui.status.textContent = message;
    ui.status.className = `ranking-status ${type}`.trim();
}

function positionLabel(position) {
    if (position === 1) return '🥇 1';
    if (position === 2) return '🥈 2';
    if (position === 3) return '🥉 3';
    return String(position);
}

function formatTime(seconds) {
    const value = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const rest = Math.floor(value % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
}

function renderRankings(rankings) {
    ui.list.replaceChildren();
    rankings.forEach((ranking, index) => {
        const item = document.createElement('li');
        item.className = 'ranking-item';

        const position = document.createElement('span');
        position.className = 'ranking-position';
        position.textContent = positionLabel(index + 1);

        const nickname = document.createElement('strong');
        nickname.className = 'ranking-name';
        nickname.textContent = ranking.nickname || '익명의 도전자';

        const score = document.createElement('span');
        score.className = 'ranking-score';
        score.textContent = `${Number(ranking.score || 0).toLocaleString('ko-KR')}점`;

        const detail = document.createElement('span');
        detail.className = 'ranking-detail';
        detail.textContent = formatTime(ranking.elapsed);

        item.append(position, nickname, score, detail);
        ui.list.appendChild(item);
    });
}

function syncTabs() {
    ui.tabs.forEach(tab => {
        const active = tab.dataset.rankingDifficulty === activeDifficulty;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
    });
}

async function loadRankings() {
    const requestedDifficulty = activeDifficulty;
    setStatus(`${DIFFICULTIES[requestedDifficulty]} TOP 10을 불러오는 중이에요…`);
    ui.refreshButton.disabled = true;
    try {
        const rankingQuery = query(
            rankingCollection(requestedDifficulty),
            orderBy('score', 'desc'),
            limit(10)
        );
        const snapshot = await getDocs(rankingQuery);
        if (requestedDifficulty !== activeDifficulty) return;
        const rankings = snapshot.docs.map(document => document.data());
        renderRankings(rankings);
        setStatus(
            rankings.length ? `${DIFFICULTIES[requestedDifficulty]} 랭킹입니다.` : `${DIFFICULTIES[requestedDifficulty]} 첫 번째 도전자를 기다리고 있어요!`,
            rankings.length ? 'success' : ''
        );
    } catch (error) {
        console.error('스도쿠 랭킹을 불러오지 못했습니다.', error);
        if (requestedDifficulty !== activeDifficulty) return;
        renderRankings([]);
        setStatus(
            error?.code === 'permission-denied'
                ? 'Firestore 보안 규칙에서 스도쿠 랭킹 권한을 허용해야 합니다.'
                : '랭킹 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.',
            'error'
        );
    } finally {
        if (requestedDifficulty === activeDifficulty) ui.refreshButton.disabled = false;
    }
}

async function selectDifficulty(difficulty) {
    if (!DIFFICULTIES[difficulty]) return;
    activeDifficulty = difficulty;
    syncTabs();
    await loadRankings();
}

function validateNickname(value) {
    const nickname = value.trim();
    if (!/^[가-힣a-zA-Z0-9 _-]{1,10}$/.test(nickname)) {
        throw new Error('닉네임은 한글·영문·숫자로 1~10자까지 입력해주세요.');
    }
    return nickname;
}

async function saveRanking(event) {
    event.preventDefault();
    if (!latestResult || resultSaved) return;

    let nickname;
    try {
        nickname = validateNickname(ui.nickname.value);
    } catch (error) {
        setStatus(error.message, 'error');
        ui.nickname.focus();
        return;
    }

    const score = Number(latestResult.score);
    const elapsed = Number(latestResult.elapsed);
    const difficulty = latestResult.difficulty;
    if (!Number.isInteger(score) || score <= 0 || score > 99999999 ||
        !Number.isInteger(elapsed) || elapsed < 0 || elapsed > 86400 ||
        !DIFFICULTIES[difficulty]) {
        setStatus('등록할 수 없는 게임 기록입니다.', 'error');
        return;
    }

    ui.saveButton.disabled = true;
    ui.nickname.disabled = true;
    setStatus('점수를 등록하는 중이에요…');
    try {
        await addDoc(rankingCollection(difficulty), {
            nickname,
            score,
            elapsed,
            mistakes: Math.max(0, Number(latestResult.mistakes) || 0),
            hintsUsed: Math.max(0, Number(latestResult.hintsUsed) || 0),
            difficulty,
            game: 'sudoku',
            version: 1,
            createdAt: serverTimestamp()
        });
        localStorage.setItem('survivaloffice-sudoku-nickname', nickname);
        resultSaved = true;
        ui.overlayRankingButton.hidden = true;
        ui.submit.hidden = true;
        setStatus('점수 등록 완료! 랭킹을 새로 불러왔어요.', 'success');
        await selectDifficulty(difficulty);
    } catch (error) {
        console.error('스도쿠 점수를 저장하지 못했습니다.', error);
        setStatus(
            error?.code === 'permission-denied'
                ? 'Firestore 보안 규칙에서 스도쿠 점수 등록 권한을 허용해야 합니다.'
                : '점수 등록에 실패했습니다. 네트워크를 확인해주세요.',
            'error'
        );
        ui.saveButton.disabled = false;
        ui.nickname.disabled = false;
    }
}

window.addEventListener('sudoku-game-complete', event => {
    latestResult = event.detail;
    resultSaved = false;
    ui.finalScore.textContent = `${Number(latestResult.score || 0).toLocaleString('ko-KR')}점`;
    ui.finalDifficulty.textContent = DIFFICULTIES[latestResult.difficulty] || '';
    ui.nickname.value = localStorage.getItem('survivaloffice-sudoku-nickname') || '';
    ui.nickname.disabled = false;
    ui.saveButton.disabled = false;
    ui.submit.hidden = false;
    ui.overlayRankingButton.hidden = false;
    selectDifficulty(latestResult.difficulty);
});

window.addEventListener('sudoku-game-start', event => {
    latestResult = null;
    resultSaved = false;
    ui.submit.hidden = true;
    ui.overlayRankingButton.hidden = true;
    selectDifficulty(event.detail?.difficulty || 'normal');
});

ui.overlayRankingButton.addEventListener('click', () => {
    if (!latestResult || resultSaved) return;
    ui.overlay.hidden = true;
    ui.submit.hidden = false;
    ui.submit.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => ui.nickname.focus(), 450);
});

ui.tabs.forEach(tab => {
    tab.addEventListener('click', () => selectDifficulty(tab.dataset.rankingDifficulty));
});
ui.form.addEventListener('submit', saveRanking);
ui.refreshButton.addEventListener('click', loadRankings);
syncTabs();
loadRankings();
