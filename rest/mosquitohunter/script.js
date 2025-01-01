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
                callback();
            }
        };

        img.onerror = () => console.error(`이미지 로드 실패: ${url}`);
    });
}

// Show Start Button After Images Load
preloadImages(
    [
        "https://www.survivaloffice.com/images/beeD.png",
        "https://www.survivaloffice.com/images/beeR.png",
        "https://www.survivaloffice.com/images/beeL.png",
        "https://www.survivaloffice.com/images/4.png",
        "https://www.survivaloffice.com/images/mosquitoL.png",
        "https://www.survivaloffice.com/images/mosquitoR.png",
        "https://www.survivaloffice.com/images/mosquitodead.png",
        "https://www.survivaloffice.com/images/9.png",
        "https://www.survivaloffice.com/images/10.png",
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
    const scoresRef = collection(db, 'mosquito');
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
    const scoresRef = collection(db, 'mosquito');

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

    const scoresRef = collection(db, 'mosquito');

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

//모기 섹션

// 모기 종류와 확률 설정
const mosquitoTypes = [
    {
        leftImage: "https://www.survivaloffice.com/images/mosquitoL.png", 
        rightImage: "https://www.survivaloffice.com/images/mosquitoR.png", 
        deadImage: "https://www.survivaloffice.com/images/mosquitodead.png", 
        score: 10, 
        clicksToKill: 1, 
        probability: 75,
        width: 40, // 모기 크기 (가로)
        height: 40, // 모기 크기 (세로)
        deadWidth: 70, // 죽은 모기 크기 (가로)
        deadHeight: 70 // 죽은 모기 크기 (세로)
    },
    {
        leftImage: "https://www.survivaloffice.com/images/beeL.png", 
        rightImage: "https://www.survivaloffice.com/images/beeR.png", 
        deadImage: "https://www.survivaloffice.com/images/beeD.png", 
        score: -10, 
        clicksToKill: 1, 
        probability: 10,
        width: 50, // 모기 크기 (가로)
        height: 50 // 모기 크기 (세로)
    },
    {
        leftImage: "https://www.survivaloffice.com/images/dfL.png", 
        rightImage: "https://www.survivaloffice.com/images/dfR.png", 
        deadImage: "https://www.survivaloffice.com/images/dfD.png", 
        score: -50, 
        clicksToKill: 1, 
        probability: 5,
        width: 50, // 모기 크기 (가로)
        height: 50 // 모기 크기 (세로)
    },
    {
        leftImage: "https://www.survivaloffice.com/images/mokL.png", 
        rightImage: "https://www.survivaloffice.com/images/mokR.png", 
        deadImage: "https://www.survivaloffice.com/images/mokD.png", 
        score: 100, 
        clicksToKill: 3, 
        probability: 10,
        width: 50, // 모기 크기 (가로)
        height: 50 // 모기 크기 (세로)
    }
];

// 디버깅 메시지로 배열 확인
console.debug("mosquitoTypes 배열 확인:", mosquitoTypes);

// 확률에 따라 모기 타입 선택
function getRandomMosquitoType() {
    if (!mosquitoTypes || mosquitoTypes.length === 0) {
        console.error("mosquitoTypes 배열이 비어 있습니다.");
        return null;
    }

    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    for (const type of mosquitoTypes) {
        cumulativeProbability += type.probability;
        if (random <= cumulativeProbability) {
            // 데이터 유효성 검증
            if (!type.leftImage || !type.rightImage || !type.deadImage) {
                console.error("선택된 모기의 이미지 데이터가 유효하지 않습니다.", type);
                return null;
            }
            console.debug(`선택된 모기: ${JSON.stringify(type)}`);
            return type;
        }
    }

    console.error("모기 타입 선택 실패: 기본 모기를 반환합니다.");
    return mosquitoTypes[0]; // 기본 모기 타입 반환
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

// 모기 수 제한
const maxMosquitoCount = 30; // 화면에 동시에 존재할 수 있는 최대 모기 수
let currentMosquitoCount = 0; // 현재 화면에 존재하는 모기 수

// "보이지 않는 영역"의 경계 설정
const boundary = {
    left: -20, // 화면 왼쪽 밖
    right: 110, // 화면 오른쪽 밖
    top: -20, // 화면 위쪽 밖
    bottom: 110, // 화면 아래쪽 밖
};

// 모기 생성 함수
function createMosquito(width, height) {
    if (isGameOver || currentMosquitoCount >= maxMosquitoCount) {
        console.debug("모기 생성 차단: 게임 종료 또는 최대 모기 수 초과");
        return;
    }

    // 랜덤 타입 선택
    const mosquitoType = getRandomMosquitoType();
    if (!mosquitoType || !mosquitoType.leftImage || !mosquitoType.rightImage) {
        console.error("모기 타입 또는 이미지 데이터가 유효하지 않습니다.");
        return;
    }

    console.debug(`선택된 모기: ${JSON.stringify(mosquitoType)}`);

    // 모기 요소 생성
    const mosquito = document.createElement('div');
    mosquito.className = 'mosquito';
    mosquito.style.width = `${mosquitoType.width}px`;
    mosquito.style.height = `${mosquitoType.height}px`;
    mosquito.style.backgroundImage = `url(${mosquitoType.leftImage})`;

    // 클릭 횟수 추적 (모기2 처리용)
    let clicksLeft = mosquitoType.clicksToKill;

    // 화면 밖에서 시작 위치 지정
    const startPosition = getStartPosition();
    mosquito.style.left = `${startPosition.x}%`;
    mosquito.style.top = `${startPosition.y}%`;
    mosquito.style.opacity = 0;

    // 클릭 이벤트 처리
    mosquito.addEventListener('click', () => {
        if (isInputBlocked) return;

        clicksLeft--;
        if (clicksLeft <= 0) {
            mosquito.style.backgroundImage = `url(${mosquitoType.deadImage})`;
            mosquito.style.width = `${mosquitoType.deadWidth}px`; // 죽은 모기 크기
            mosquito.style.height = `${mosquitoType.deadHeight}px`; // 죽은 모기 크기
            mosquito.classList.add('dead');
            updateScore(mosquitoType.score); // 점수 업데이트
            setTimeout(() => {
                mosquito.remove();
                currentMosquitoCount--;
            }, 500);
        } else {
            console.debug(`남은 클릭 수: ${clicksLeft}`); // 디버깅
        }
    });

    // 모기 추가 및 초기화
    document.getElementById('game-area').appendChild(mosquito);
    currentMosquitoCount++;

    // 부드럽게 등장 후 이동 시작
    setTimeout(() => {
        mosquito.style.opacity = 1; // 화면에 나타남
        moveMosquito(mosquito, mosquitoType); // 이동 함수에 mosquitoType 전달
    }, 1000);
}

// 항상 화면 밖에서 시작 위치를 반환하는 함수
function getStartPosition() {
    const side = Math.floor(Math.random() * 4); // 0: 상, 1: 하, 2: 좌, 3: 우
    const position = { x: 0, y: 0 };

    switch (side) {
        case 0: // 상단
            position.x = Math.random() * 100; // 화면 가로 범위
            position.y = boundary.top; // 상단 경계
            break;
        case 1: // 하단
            position.x = Math.random() * 100; // 화면 가로 범위
            position.y = boundary.bottom; // 하단 경계
            break;
        case 2: // 좌측
            position.x = boundary.left; // 좌측 경계
            position.y = Math.random() * 100; // 화면 세로 범위
            break;
        case 3: // 우측
            position.x = boundary.right; // 우측 경계
            position.y = Math.random() * 100; // 화면 세로 범위
            break;
    }
    return position;
}

// 모기 지속적인 실시간 이동 함수 (보이지 않는 영역 내에서 반전)
function moveMosquito(mosquito, mosquitoType) {

    if (!mosquitoType || !mosquitoType.leftImage || !mosquitoType.rightImage) {
        console.error("모기 타입 또는 이미지 데이터가 유효하지 않습니다:", mosquitoType);
        return;
    }
        // 모기마다 이동 속도 다양화
    let dx = Math.random() * 2 - 1; // -1 ~ 1 (랜덤 속도)
    let dy = Math.random() * 2 - 1; // -1 ~ 1 (랜덤 속도)

    const moveInterval = setInterval(() => {
        if (mosquito.classList.contains('dead')) {
            clearInterval(moveInterval); // 죽은 모기라면 이동 멈춤
            return;
        }

        // 현재 위치
        const currentLeft = parseFloat(mosquito.style.left);
        const currentTop = parseFloat(mosquito.style.top);

        // 새로운 위치 계산
        let newLeft = currentLeft + dx;
        let newTop = currentTop + dy;

        // 경계에 도달하면 이동 방향 반전
        if (newLeft < boundary.left || newLeft > boundary.right) dx = -dx;
        if (newTop < boundary.top || newTop > boundary.bottom) dy = -dy;

        // 이동 방향에 따라 이미지 변경
        if (dx > 0) {
            mosquito.style.backgroundImage = `url(${mosquitoType.rightImage})`;
        } else if (dx <= 0) {
            mosquito.style.backgroundImage = `url(${mosquitoType.leftImage})`;
        }

        // 위치 업데이트
        mosquito.style.left = `${newLeft}%`;
        mosquito.style.top = `${newTop}%`;
    }, 16); // 약 60FPS로 이동 (16ms 간격)
}

// 점수 업데이트 함수
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

// HTML 요소 가져오기
const countdownContainer = document.getElementById("countdown-container");

// 카운트다운 시작
function startCountdown() {
    countdownContainer.style.display = "block";
    let countdown = 3;

    const interval = setInterval(() => {
        countdownContainer.textContent = countdown; // 카운트다운 업데이트
        countdown--;

        if (countdown < 0) {
            clearInterval(interval); // 카운트다운 종료
            countdownContainer.style.display = "none"; // 카운트다운 숨기기
            showGameUI(); // 게임 UI 표시
        }
    }, 1000);
}

// 게임 UI 표시 및 게임 시작
function showGameUI() {
    document.getElementById('start-screen').style.display = 'none'; // 시작 화면 숨기기
    isGameOver = false; // 게임 종료 상태 초기화
    startTimer(); // 타이머 시작
    setInterval(() => createMosquito(50, 50), 1000); // 모기 생성 시작
}

// 게임 시작 버튼 클릭 이벤트 수정
document.getElementById('start-btn').addEventListener('click', () => {
    startCountdown(); // 카운트다운 시작
});

// 타이머 시작
function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // 기존 타이머 초기화
    remainingTime = 60; // 초기 시간 설정
    updateTimerUI();
    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerUI();
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000); // 1초마다 갱신
}

    // 타이머 UI 업데이트
    function updateTimerUI() {
        const timerBar = document.getElementById("timer-bar");
        const timerText = document.getElementById("timer-text");

        const percentage = (remainingTime / 60) * 100;
        timerBar.style.width = `${percentage}%`;
        timerText.textContent = `${remainingTime}초`;

        if (remainingTime <= 10) {
            timerBar.style.backgroundColor = "#e74c3c";
        } else if (remainingTime <= 20) {
            timerBar.style.backgroundColor = "#f39c12";
        } else {
            timerBar.style.backgroundColor = "#76c7c0";
        }
    }

    // 게임 종료
    function endGame() {
        if (isGameOver) return;
        isGameOver = true;
    
        // 점수 저장 팝업 표시
        showGameOverPopup();
    }