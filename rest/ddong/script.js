// 모듈 방식으로 Firebase와 Firestore 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyCK4Zdkhlc0cnjqC3TpmUJmLAt8Xrh8VOw",
    authDomain: "upupup-e4c2c.firebaseapp.com",
    projectId: "upupup-e4c2c",
    storageBucket: "upupup-e4c2c.appspot.com",
    messagingSenderId: "877963060151",
    appId: "1:877963060151:web:e70751cb30638880767e32"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const loadingMessage = document.getElementById("loading-message");
const startButton = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const gamearea = document.getElementById("game-area");

function preloadImages(imageUrls, callback) {
    let loadedCount = 0;
    const totalImages = imageUrls.length;

    imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;

        img.onload = () => {
            loadedCount++;
            loadingMessage.textContent = `이미지 로드 중... (${loadedCount}/${totalImages})`;

            if (loadedCount === totalImages) {
                callback(); // 모든 이미지가 로드되었을 때 콜백 호출
            }
        };

        img.onerror = () => {
            console.error(`이미지 로드 실패: ${url}`);
            loadedCount++; // 실패한 이미지도 로드 카운트에 포함
            loadingMessage.textContent = `이미지 로드 중... (${loadedCount}/${totalImages})`;

            if (loadedCount === totalImages) {
                callback();
            }
        };
    });
}

// Show Start Button After Images Load
preloadImages(
    [
        "https://www.survivaloffice.com/images/ddong.png",
        "https://www.survivaloffice.com/images/ddong2.png",
        "https://www.survivaloffice.com/images/ddong3.png",   
        "https://www.survivaloffice.com/images/zol.png"     
    ],
    () => {
        console.log("모든 이미지가 로드되었습니다!");
        loadingMessage.textContent = ""; // 로딩 메시지 제거
        startButton.style.display = "block"; // 게임 시작 버튼 표시
    }
);

let isGameStarted = false; // 게임 시작 상태를 나타내는 플래그

// Start Game
startButton.addEventListener("click", (event) => {
    event.stopPropagation(); // 클릭 이벤트 전파 방지
    isGameStarted = true; // 게임이 시작되었음을 표시
    startScreen.style.display = "none"; // 시작 화면 숨기기
    gamearea.style.display = "block"; // 게임 화면 표시
    console.log("게임 시작!");
});


// 랭킹 보기 버튼과 컨테이너 요소 가져오기
const top10RankButton = document.getElementById('top10-rank');
const rankingContainer = document.getElementById('ranking-container');

// 버튼과 컨테이너가 존재하는지 확인
if (top10RankButton && rankingContainer) {
    top10RankButton.addEventListener('click', async () => {
        console.log("랭킹 보기 버튼 클릭됨");
        rankingContainer.style.display = 'block';
        rankingContainer.innerHTML = '<p>로딩 중...</p>';
        
        await loadTop10Rankings(); // 이번 주 랭킹 불러오기
        await loadAllTimeHighScore(); // 전체 최고 점수 불러오기
    });
} else {
    console.error("top10-rank 버튼 또는 ranking-container 요소를 찾을 수 없습니다.");
}

// Firestore에서 이번 주 월~일 랭킹 가져오기
async function loadTop10Rankings() {
    const scoresRef = collection(db, 'ddong');
    const { startDate, endDate } = getCurrentWeekRange();
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    const q = query(
        scoresRef,
        where("date", ">=", startDate), // 범위 필터
        where("date", "<=", endDate),  // 범위 필터
        orderBy("score", "desc"),      // score 내림차순 정렬
        orderBy("date", "desc"),        // date 내림차순 정렬
        limit(10)
    );

    const querySnapshot = await getDocs(q);
    console.log("쿼리 결과 개수:", querySnapshot.size);
    querySnapshot.forEach(doc => {
        console.log(doc.data());
    });

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            rankingContainer.innerHTML = '<p>랭킹 데이터가 없습니다.</p>';
            return;
        }

        let rankingsHTML = '<h2>Top 10 랭킹</h2><ul>';
        let rank = 1;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const nickname = data.nickname || 'Unknown'; // 닉네임 기본값
            const score = data.score || 0; // 점수 기본값
            let formattedDate;

            // 날짜 필드 처리
            if (typeof data.date === 'string') {
                formattedDate = data.date.slice(0, 10); // "YYYY-MM-DD" 형식
            } else {
                formattedDate = '날짜 없음';
            }

            // 순위에 따른 메달 이모지 추가
            let medalEmoji = '';
            if (rank === 1) medalEmoji = '🥇';
            else if (rank === 2) medalEmoji = '🥈';
            else if (rank === 3) medalEmoji = '🥉';

            // HTML 리스트 아이템 생성
            rankingsHTML += 
                `<li class="ranking-item">
                    ${medalEmoji} ${rank}위 - ${nickname}, ${score}점 <span class="date">${formattedDate}</span>
                </li>`;
            rank++;
        });

        rankingsHTML += '</ul><h4 style="color: red;">📢 랭킹은 매주 월요일 초기화됩니다.</h4>';
        console.log('Before updating:', rankingContainer.innerHTML);
        rankingContainer.innerHTML = rankingsHTML; // HTML 업데이트
        console.log('After updating:', rankingContainer.innerHTML);

        // 순차적으로 나타나는 애니메이션
        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.5}s`; // 0.5초 간격으로 딜레이 설정
        });

    } catch (error) {
        console.error('Firestore에서 랭킹 데이터를 가져오는 중 오류 발생:', error);
        rankingContainer.innerHTML = '<p>랭킹 데이터를 불러오지 못했습니다.</p>';
    }
}

// 이번 주 월~일 날짜 계산 함수
function getCurrentWeekRange() {
    const now = new Date(); // 현재 날짜
    const dayOfWeek = now.getDay(); // 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)

    console.log(`현재 날짜: ${now}`);
    console.log(`현재 요일: ${dayOfWeek}`); // 디버깅

    // 오늘 기준으로 주의 시작(월요일) 날짜 계산
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일(0)은 -6, 나머지는 1 - 요일
    console.log(`월요일까지의 차이: ${diffToMonday}`); // 디버깅

    const monday = new Date(now); // 현재 날짜 복사
    monday.setDate(now.getDate() + diffToMonday); // 월요일 날짜 설정
    monday.setHours(0, 0, 0, 0); // 월요일 00:00:00

    console.log(`계산된 월요일: ${monday}`); // 디버깅

    // 월요일 기준으로 주의 끝(일요일) 날짜 계산
    const sunday = new Date(monday); // 월요일 날짜 복사
    sunday.setDate(monday.getDate() + 6); // 월요일 + 6일 = 일요일
    sunday.setHours(23, 59, 59, 999); // 일요일 23:59:59

    console.log(`계산된 일요일: ${sunday}`); // 디버깅

    // YYYY-MM-DD 형식으로 반환 (로컬 시간대 기준)
    const startDate = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    const endDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;

    console.log(`이번 주 날짜 범위: ${startDate} ~ ${endDate}`); // 디버그 로그 추가
    return { startDate, endDate };
}

// Firestore에서 전체 최고 점수 가져오기
async function loadAllTimeHighScore() {
    const scoresRef = collection(db, 'ddong');

    // 최고 점수를 가져오기 위한 쿼리
    const q = query(scoresRef, orderBy('score', 'desc'), limit(1));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            rankingContainer.innerHTML += '<h3>최고 점수 데이터가 없습니다.</h3>';
            return;
        }

        let highScoreHTML = '<h2>🏆역대 최고 기록🏆</h2>';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const nickname = data.nickname || 'Unknown';
            const score = data.score || 0;

            let formattedDate;

            // date 필드가 Firestore Timestamp인지 확인 후 처리
            if (data.date && typeof data.date.toDate === 'function') {
                const dateObj = data.date.toDate();
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                formattedDate = `${year}-${month}-${day}`;
            } else if (typeof data.date === 'string') {
                formattedDate = data.date.slice(0, 10); // "YYYY-MM-DD" 형식 추출
            } else {
                formattedDate = '날짜 없음';
            }

            highScoreHTML += `
                <p>
                    <h3 style="display: flex; justify-content: space-between; align-items: center;">
                         🎉  ${nickname},  ${score}점
                        <span class="date" style="margin-left: auto; text-align: right;">${formattedDate}</span>
                    </h3>
                </p>
            `;
        });

        // 기존 랭킹 컨테이너 하단에 추가
        rankingContainer.innerHTML += highScoreHTML;
        
    } catch (error) {
        console.error("Firestore에서 최고 점수 데이터를 가져오는 중 오류 발생:", error);
        rankingContainer.innerHTML += '<p>최고 점수 데이터를 불러오지 못했습니다.</p>';
    }
}

// 랭킹 컨테이너 클릭 시 닫기 이벤트 등록
if (rankingContainer) {
    rankingContainer.addEventListener('click', () => {
        rankingContainer.style.display = 'none'; // 컨테이너 닫기
    });
} else {
    console.error("ranking-container 요소를 찾을 수 없습니다.");
}

// 점수 저장 함수
async function saveScore(nickname, score) {
    console.log("Firestore에 점수 저장 시도:", nickname, score);
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // UTC+9 (밀리초)
    const kstDate = new Date(now.getTime() + kstOffset);
    const date = kstDate.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식

    const scoresRef = collection(db, 'ddong');

    try {
        console.log("새로운 점수 저장 중...");
        await addDoc(scoresRef, {
            nickname: nickname || 'Unknown',
            score: score,
            date: date
        });
        alert('점수가 성공적으로 저장되었습니다.');
    } catch (error) {
        console.error("Error adding data:", error);
        alert('점수 저장 중 오류가 발생했습니다.');
    };
}

// 팝업 닫기 및 다시 시작 버튼
document.getElementById('closePopupButton').addEventListener('click', () => {
    console.log("닫기 버튼 클릭됨");
    window.location.reload();
});

// 점수 저장 버튼
const saveScoreButton = document.getElementById('saveScoreButton');

saveScoreButton.addEventListener('click', async (event) => {
    event.preventDefault();

    // 이미 비활성화된 버튼이라면 실행하지 않음
    if (saveScoreButton.disabled) {
        alert("이미 점수가 등록되었습니다.");
        return;
    }

    const nickname = document.getElementById('nicknameInput').value;
    
    // 글자 수 제한 (5글자)
    if (nickname.length === 0) {
        alert("닉네임을 입력해주세요.");
        return;
    } else if (nickname.length > 5) {
        alert("닉네임은 5글자 이하로 입력해주세요.");
        return;
    }

    // 점수 저장 로직
    await saveScore(nickname, score);

    // 버튼 비활성화
    saveScoreButton.disabled = true;
    saveScoreButton.style.cursor = "not-allowed";
    saveScoreButton.textContent = "등록 완료"; // 버튼 텍스트 변경
});

// 게임 종료 팝업 표시 함수
function showGameOverPopup() {
    const popup = document.getElementById('result-popup');
    popup.style.display = 'block'; // 팝업 표시
    isInputBlocked = true; // 입력 차단 활성화
}

// 점수 관리
let score = 0;
const scoreDisplay = document.getElementById("score");

// 타이머 관리리
const timerContainer = document.getElementById("timer-container");
let remainingTime = 60;
let timerInterval;
let isGameOver = false; // 게임 종료 상태 플래그
let isInputBlocked = false; // 입력 차단 플래그

// 점수 업데이트 함수
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

// HTML 요소 가져오기
const countdownContainer = document.getElementById("countdown-container");

// 게임 시작 버튼 클릭 이벤트 수정
document.getElementById('start-btn').addEventListener('click', () => {
    startCountdown(); // 카운트다운 시작
});

// 카운트다운 시작
function startCountdown() {
    countdownContainer.style.display = "block";
    let countdown = 3;

    const interval = setInterval(() => {
        countdownContainer.textContent = countdown; // 카운트다운 업데이트
        console.log(`카운트다운 중: ${countdown}`);
        countdown--;

        if (countdown < 0) {
            clearInterval(interval); // 카운트다운 종료
            countdownContainer.style.display = "none"; // 카운트다운 숨기기
            console.log("카운트다운 종료. 게임 UI 표시");
            showGameUI(); // 게임 UI 표시
        }
    }, 1000);
}

// 게임 UI 표시 및 게임 시작
function showGameUI() {
    document.getElementById('start-screen').style.display = 'none'; // 시작 화면 숨기기
    console.log("게임 화면 표시");

    isGameOver = false; // 게임 종료 상태 초기화

    // 캐릭터 등장
    character.style.display = 'block'; // 캐릭터를 보이도록 설정
    
    gameInterval = requestAnimationFrame(movePoops); // 똥 이동 시작
    poopInterval = setInterval(() => createPoop(), poopSpawnRate); // 똥 생성 시작
    increaseDifficulty(); // 난이도 증가 시작
}

    // 캐릭터와 똥 관리
const gameArea = document.getElementById('game-area');

// 캐릭터 생성
const character = document.createElement('img');
character.id = 'character';
character.src = 'https://www.survivaloffice.com/images/zol.png';
gameArea.appendChild(character);

let characterX = gameArea.offsetWidth / 2; // 초기 캐릭터 위치
let targetX = characterX; // 목표 위치
let isDragging = false; // 드래그 상태

// 캐릭터 부드러운 이동
function moveCharacter() {
    characterX += (targetX - characterX) * 0.1; // 목표 위치로 점진적 이동
    character.style.left = `${characterX}px`;
    requestAnimationFrame(moveCharacter);
}
moveCharacter();

let gameInterval;
let poopSpeed = 2; // 초기 똥 속도
let poopSpawnRate = 1000; // 초기 똥 생성 간격
let difficultyInterval; // 전역 변수로 선언
let poopInterval;
const poops = [];

// 캐릭터 키보드 이동
document.addEventListener('keydown', (event) => {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const characterRect = character.getBoundingClientRect();

    if (event.key === 'ArrowLeft') {
        // 왼쪽 경계 제한
        if (characterRect.left > gameAreaRect.left) {
            targetX = Math.max(0, targetX - 20); // 왼쪽으로 이동
        }
    } else if (event.key === 'ArrowRight') {
        // 오른쪽 경계 제한
        if (characterRect.right < gameAreaRect.right) {
            targetX = Math.min(gameArea.offsetWidth - character.offsetWidth, targetX + 20); // 오른쪽으로 이동
        }
    }
});

// 캐릭터 마우스 드래그/터치 이동
gameArea.addEventListener('mousedown', (event) => {
    isDragging = true;
    const gameAreaRect = gameArea.getBoundingClientRect();
    const newX = event.clientX - gameAreaRect.left;

    // 좌우 경계 제한
    targetX = Math.max(0, Math.min(newX, gameArea.offsetWidth - character.offsetWidth));
});
gameArea.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const newX = event.clientX - gameAreaRect.left;

        // 좌우 경계 제한
        targetX = Math.max(0, Math.min(newX, gameArea.offsetWidth - character.offsetWidth));
    }
});
gameArea.addEventListener('mouseup', () => {
    isDragging = false;
});
gameArea.addEventListener('touchstart', (event) => {
    isDragging = true;
    const touch = event.touches[0];
    const gameAreaRect = gameArea.getBoundingClientRect();
    const newX = touch.clientX - gameAreaRect.left;

    // 좌우 경계 제한
    targetX = Math.max(0, Math.min(newX, gameArea.offsetWidth - character.offsetWidth));
});
gameArea.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const gameAreaRect = gameArea.getBoundingClientRect();
    const newX = touch.clientX - gameAreaRect.left;

    // 좌우 경계 제한
    targetX = Math.max(0, Math.min(newX, gameArea.offsetWidth - character.offsetWidth));
});
gameArea.addEventListener('touchend', () => {
    isDragging = false;
});

// 똥 생성 함수
function createPoop() {
    const poop = document.createElement('img'); // 이미지 태그 생성
    poop.src = 'https://www.survivaloffice.com/images/ddong.png'; // 똥 이미지
    poop.classList.add('poop'); // 클래스 추가
    poop.style.position = 'absolute';
    poop.style.width = '20px';
    poop.style.height = 'auto';
    poop.style.left = `${Math.random() * (gameArea.offsetWidth - 20)}px`; // 랜덤 X 위치
    poop.style.top = `0px`; // 시작 위치는 화면 상단
    gameArea.appendChild(poop);

    // 똥 객체 생성
    const poopObj = {
        element: poop,
        currentY: 0, // 초기 위치
        speed: Math.random() * (poopSpeed - 1) + 1.5, // 속도: 기본 속도에서 랜덤
    };

    poops.push(poopObj); // 배열에 추가
}


// 똥 이동 및 충돌 처리
function movePoops() {
    for (let i = poops.length - 1; i >= 0; i--) {
        const poopObj = poops[i];
        const poopElement = poopObj.element;

        // 이미 제거된 똥은 처리하지 않음
        if (poopObj.isRemoved) continue;

        // 똥 이동
        poopObj.currentY += poopObj.speed;
        poopElement.style.top = `${poopObj.currentY}px`;

        const poopRect = poopElement.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();

        // 캐릭터와 충돌 감지
        if (
            poopRect.top < characterRect.bottom &&
            poopRect.bottom > characterRect.top &&
            poopRect.left < characterRect.right &&
            poopRect.right > characterRect.left
        ) {
            endGame(); // 게임 종료
            return; // 더 이상 처리하지 않음
        }

        // 바닥 충돌 감지
        if (poopRect.bottom >= gameAreaRect.bottom) {
            poopObj.isRemoved = true; // 상태 플래그 설정
            poopElement.src = 'https://www.survivaloffice.com/images/ddong2.png'; // 이미지 변경
            poopElement.style.top = `${gameArea.offsetHeight - poopElement.offsetHeight}px`; // 바닥에 고정

            // 점수 증가
            updateScore(10); // 점수 추가

            // 배열에서 즉시 제거
            poops.splice(i, 1);

            // 화면에서 300ms 후 제거
            setTimeout(() => {
                poopElement.remove();
            }, 300);

            continue; // 다음 똥으로 이동
        }

        // 화면 밖으로 나간 똥 제거 (안전망)
        if (poopObj.currentY > gameArea.offsetHeight) {
            poopObj.isRemoved = true; // 상태 플래그 설정
            poops.splice(i, 1);
            poopElement.remove(); // 화면에서 제거
        }
    }

    // 다음 프레임 호출
    if (!isGameOver) {
        requestAnimationFrame(movePoops);
    }
}

setInterval(() => {
    console.log(`Poops Array Length: ${poops.length}`);
    poops.forEach((poopObj, index) => {
        console.log(
            `Poop ${index}: isRemoved=${poopObj.isRemoved}, currentY=${poopObj.currentY}`
        );
    });
}, 1000);

// 난이도 증가 로직
function increaseDifficulty() {
    difficultyInterval = setInterval(() => {
        // 똥 속도 증가
        if (poopSpeed < 10) { // 최대 속도 제한
            poopSpeed += 0.5;
        }

        // 똥 생성 간격 단축
        if (poopSpawnRate > 200) { // 최소 간격 제한
            poopSpawnRate -= 100;

            // 기존 생성 인터벌 초기화 후 새로운 주기로 설정
            clearInterval(poopInterval);
            poopInterval = setInterval(() => createPoop(), poopSpawnRate);
        }

        console.log(`똥 속도: ${poopSpeed}, 생성 간격: ${poopSpawnRate}ms`);
    }, 5000); // 5초마다 난이도 증가
}

// 게임 종료 함수 수정
function endGame() {
    clearInterval(poopInterval); // 똥 생성 멈춤
    clearInterval(difficultyInterval); // 난이도 증가 멈춤

    // 캐릭터 숨김
    character.style.display = 'none'; // 캐릭터를 화면에서 숨김    

    // 모든 똥 제거
    poops.forEach(poopObj => {
        poopObj.element.remove(); // 화면에서 제거
    });
    poops.length = 0; // 배열 초기화

    showGameOverPopup(); // 게임 종료 팝업 표시
}