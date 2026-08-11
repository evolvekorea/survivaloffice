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

const COLLECTION_NAME = 'tetris_rankings';
const app = initializeApp(firebaseConfig, 'tetris-ranking');
const db = getFirestore(app);

const ui = {
    list: document.getElementById('rankingList'),
    status: document.getElementById('rankingStatus'),
    submit: document.getElementById('rankingSubmit'),
    finalScore: document.getElementById('rankingFinalScore'),
    form: document.getElementById('rankingForm'),
    nickname: document.getElementById('rankingNickname'),
    saveButton: document.getElementById('saveRankingButton'),
    refreshButton: document.getElementById('refreshRankingButton')
};

let latestResult = null;
let resultSaved = false;

function setStatus(message, type = '') {
    ui.status.textContent = message;
    ui.status.className = `ranking-status ${type}`.trim();
}

function formatDate(value) {
    try {
        const date = value?.toDate ? value.toDate() : null;
        return date ? date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : '-';
    } catch {
        return '-';
    }
}

function positionLabel(position) {
    if (position === 1) return '🥇 1';
    if (position === 2) return '🥈 2';
    if (position === 3) return '🥉 3';
    return String(position);
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
        nickname.textContent = ranking.nickname || '익명의 블록왕';

        const score = document.createElement('span');
        score.className = 'ranking-score';
        score.textContent = `${Number(ranking.score || 0).toLocaleString('ko-KR')}점`;

        const date = document.createElement('time');
        date.className = 'ranking-date';
        date.textContent = formatDate(ranking.createdAt);

        item.append(position, nickname, score, date);
        ui.list.appendChild(item);
    });
}

async function loadRankings() {
    setStatus('Firestore에서 TOP 10을 불러오는 중이에요…');
    ui.refreshButton.disabled = true;
    try {
        const rankingQuery = query(
            collection(db, COLLECTION_NAME),
            orderBy('score', 'desc'),
            limit(10)
        );
        const snapshot = await getDocs(rankingQuery);
        const rankings = snapshot.docs.map(document => document.data());
        renderRankings(rankings);
        setStatus(rankings.length ? '실시간 전체 랭킹입니다.' : '첫 번째 블록왕을 기다리고 있어요!', rankings.length ? 'success' : '');
    } catch (error) {
        console.error('테트리스 랭킹을 불러오지 못했습니다.', error);
        renderRankings([]);
        const permissionMessage = error?.code === 'permission-denied'
            ? 'Firestore 보안 규칙에서 tetris_rankings 읽기 권한을 허용해야 합니다.'
            : '랭킹 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.';
        setStatus(permissionMessage, 'error');
    } finally {
        ui.refreshButton.disabled = false;
    }
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
    if (!Number.isInteger(score) || score <= 0 || score > 99999999) {
        setStatus('등록할 수 없는 점수입니다.', 'error');
        return;
    }

    ui.saveButton.disabled = true;
    ui.nickname.disabled = true;
    setStatus('점수를 등록하는 중이에요…');
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            nickname,
            score,
            lines: Number(latestResult.lines) || 0,
            level: Number(latestResult.level) || 1,
            game: 'tetris',
            version: 1,
            createdAt: serverTimestamp()
        });
        localStorage.setItem('survivaloffice-tetris-nickname', nickname);
        resultSaved = true;
        ui.submit.hidden = true;
        setStatus('랭킹 등록 완료! TOP 10을 새로 불러왔어요.', 'success');
        await loadRankings();
    } catch (error) {
        console.error('테트리스 점수를 저장하지 못했습니다.', error);
        const permissionMessage = error?.code === 'permission-denied'
            ? 'Firestore 보안 규칙에서 tetris_rankings 쓰기 권한을 허용해야 합니다.'
            : '점수 등록에 실패했습니다. 네트워크를 확인해주세요.';
        setStatus(permissionMessage, 'error');
        ui.saveButton.disabled = false;
        ui.nickname.disabled = false;
    }
}

window.addEventListener('tetris-game-over', event => {
    latestResult = event.detail;
    resultSaved = false;
    ui.finalScore.textContent = `${Number(latestResult.score || 0).toLocaleString('ko-KR')}점`;
    ui.nickname.value = localStorage.getItem('survivaloffice-tetris-nickname') || '';
    ui.nickname.disabled = false;
    ui.saveButton.disabled = Number(latestResult.score) <= 0;
    ui.submit.hidden = false;
});

window.addEventListener('tetris-game-start', () => {
    latestResult = null;
    resultSaved = false;
    ui.submit.hidden = true;
});

ui.form.addEventListener('submit', saveRanking);
ui.refreshButton.addEventListener('click', loadRankings);
loadRankings();
