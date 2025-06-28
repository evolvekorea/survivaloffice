// 모듈 방식으로 Firebase와 Firestore 가져오기 (최상단에 위치)
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

    // `db` 인스턴스 확인
    console.log("Firestore DB 인스턴스 확인:", db);    

document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('closePopupButton');
    const stairsContainer = document.getElementById('stairs-container');
    const character = document.getElementById('character'); 
    const timeElement = document.getElementById('time');
    const scoreElement = document.getElementById('score-value');
    const leftButton = document.getElementById('left-btn');
    const rightButton = document.getElementById('right-btn');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const background = document.getElementById('background');
    const gameContainer = document.getElementById('game-container');
    
    const rankingList = document.getElementById('ranking-list');
    if (rankingList) {
        rankingList.style.display = 'block';
        rankingList.style.flexDirection = 'column'; // Flex 속성 제거
    }
 
    
    let timeLeft = 100;
    let score = 0;
    let currentStep = 0;
    let currentGrid = 2;
    let scrollPosition = 0;
    const gridWidth = 4;
    const TOTAL_STAIRS = 1001;
    const stairPositions = [];
    let timeInterval;
    let isGameOver = false;

    // 미리 로드할 이미지 URL 목록
    const imageUrls = [
        "https://www.survivaloffice.com/images/UPA.jpg",
        "https://www.survivaloffice.com/images/UPB.jpg",
        "https://www.survivaloffice.com/images/UPC.jpg",
        "https://www.survivaloffice.com/images/UPD.jpg",
        "https://www.survivaloffice.com/images/start.png",
        "https://www.survivaloffice.com/images/left.png",
        "https://www.survivaloffice.com/images/right.png",
        "https://www.survivaloffice.com/images/end.png",
        "https://www.survivaloffice.com/images/goal.png"
    ];

    // 이미지 미리 로드 함수
    function preloadImages(callback) {
        let loadedImages = 0;

        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedImages++;
                if (loadedImages === imageUrls.length) {
                    callback();
                }
            };
            img.onerror = () => {
                loadedImages++;
                if (loadedImages === imageUrls.length) {
                    callback();
                }
            };
        });
    }

    // 게임 시작 준비
    preloadImages(() => {
        startBtn.disabled = false;
    });
    
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        createInitialStairs();
        setInitialPosition();

        // 이동 키를 누르기 전 기본 캐릭터 이미지 설정
        character.style.backgroundImage = "url('https://www.survivaloffice.com/images/right.png')";

        // 타이머 시작
        timeInterval = setInterval(decreaseTime, 1000);
        updateBackground(score);
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            moveCharacter('left');
        } else if (event.key === 'ArrowRight') {
            moveCharacter('right');
        }
    });

    leftButton.addEventListener('click', () => moveCharacter('left'));
    rightButton.addEventListener('click', () => moveCharacter('right'));

    function updateBackground(currentStep) {
        if (currentStep >= 0 && currentStep <= 300) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPA.jpg')";
        } else if (currentStep >= 301 && currentStep <= 700) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPB.jpg')";
        } else if (currentStep >= 701 && currentStep <= 999) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPC.jpg')";
        } else if (currentStep >= 1000) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPD.jpg')";
        }
    }

    function createInitialStairs() {
        let lastGrid = 2;
        stairPositions.length = 0; // 이전 데이터를 초기화
        for (let i = 0; i < TOTAL_STAIRS; i++) {
            createStair(i, lastGrid);
            lastGrid = currentGrid;
        }
    }

    function createStair(step, lastGrid) {
        const stair = document.createElement('div');
        stair.classList.add('stair');
        stair.style.bottom = `${step * 60}px`;

        // 계단의 위치에 따른 스타일 적용
        const stairBottom = step;
        if (stairBottom >= 0 && stairBottom <= 300) {
            stair.classList.add('low'); // 0 ~ 300px
        } else if (stairBottom >= 301 && stairBottom <= 700) {
            stair.classList.add('mid'); // 301 ~ 700px
        } else if (stairBottom >= 701 && stairBottom <= 1000) {
            stair.classList.add('high'); // 701 ~ 1000px
        }

        if (lastGrid === 1) currentGrid = 2;
        else if (lastGrid === 2) currentGrid = Math.random() > 0.5 ? 1 : 3;
        else if (lastGrid === 3) currentGrid = Math.random() > 0.5 ? 2 : 4;
        else if (lastGrid === 4) currentGrid = 3;

        stair.style.left = `${(currentGrid - 1) * 100}px`;
        stairsContainer.appendChild(stair);
        stairPositions.push({ step: step, grid: currentGrid, element: stair });
    }

    function setInitialPosition() {
        const firstStair = stairPositions[0];
        currentGrid = firstStair.grid;
    
        // 초기 위치 설정
        character.style.left = `${(currentGrid - 1) * 100 + 30}px`;
        character.style.bottom = `${firstStair.step * 60}px`;
        character.style.display = 'block'; // 캐릭터 표시
    
        // 계단 컨테이너의 스크롤 위치 초기화
        stairsContainer.style.transform = 'translateY(0px)';
        scrollPosition = 0;
    }

    function moveCharacter(direction) {
        if (isGameOver) return; // 게임 종료 시 이동 불가

        const nextStep = currentStep + 1;

        // 방향에 맞는 이미지 변경
        if (direction === 'left' && currentGrid > 1) {
            currentGrid--;
            character.style.backgroundImage = "url('https://www.survivaloffice.com/images/left.png')";
        } else if (direction === 'right' && currentGrid < gridWidth) {
            currentGrid++;
            character.style.backgroundImage = "url('https://www.survivaloffice.com/images/right.png')";
        }

        if (isOnStair(currentGrid, nextStep)) {
            currentStep++;
            if (currentStep < 6) character.style.bottom = `${currentStep * 60}px`;
            else {
                scrollPosition += 60;
                stairsContainer.style.transform = `translateY(${scrollPosition}px)`;
                character.style.bottom = `${5 * 60}px`;
            }
            character.style.left = `${(currentGrid - 1) * 100 + 30}px`;

            updateBackground(currentStep);
            increaseScore();
            checkIfGameFinished();
        } else {
            gameOver();
        }
    }

    function isOnStair(grid, step) {
        return stairPositions.some(pos => pos.step === step && pos.grid === grid);
    }

    function increaseScore() {
        score++;
        scoreElement.textContent = score;
        if (score % 10 === 0) {
            timeLeft += 1;
            timeElement.style.color = '#4caf50';
            setTimeout(() => {
                timeElement.style.color = '#000';
            }, 500);
        }
    }

    function decreaseTime() {
        if (timeLeft > 0) timeLeft--;
        else gameOver();
        timeElement.textContent = timeLeft;
    }

    function showPopup(message) {
        const popup = document.getElementById('result-popup');
        const resultMessage = document.getElementById('result-message');
        resultMessage.innerHTML = `${message}<br>최종 점수: ${score}`;
        popup.style.display = 'block';
    }

    function closePopup() {
        const popup = document.getElementById('result-popup');
        popup.style.display = 'none';
    }

    function gameOver() {
        isGameOver = true; // 게임 종료 상태로 설정
        character.style.backgroundImage = "url('https://www.survivaloffice.com/images/end.png')";    
        showPopup("게임 오버! 다시 도전하세요.");
        clearInterval(timeInterval); // 타이머 정지
    }

    function checkIfGameFinished() {
        if (currentStep >= 1000) {
            character.style.backgroundImage = "url('https://www.survivaloffice.com/images/goal.png')";            
            showPopup("축하합니다. 자유입니다.");
            clearInterval(timeInterval); // 타이머 정지
        }
    }

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
    const scoresRef = collection(db, 'scores');
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
    const scoresRef = collection(db, 'scores');

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

    const scoresRef = collection(db, 'scores');

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
    resetGame();
});

function resetGame() {
    console.log("🔄 resetGame() 호출됨");

    // 변수 초기화
    timeLeft = 100;
    score = 0;
    currentStep = 0;
    currentGrid = 2;
    scrollPosition = 0;
    isGameOver = false;

    // 타이머 정지
    clearInterval(timeInterval);

    // UI 초기화
    document.getElementById('score-value').textContent = score;
    document.getElementById('time').textContent = timeLeft;

    // 캐릭터 숨기기
    character.style.display = 'none';

    // 계단 초기화
    stairsContainer.innerHTML = '';

    // 계단 배열 초기화
    stairPositions.length = 0;

    // 배경 초기화
    background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPA.jpg')";

    // start-screen 다시 보이기
    startScreen.style.display = 'block';
    startBtn.disabled = false;

    // result popup 숨기기
    const popup = document.getElementById('result-popup');
    popup.style.display = 'none';

    // 닉네임 입력 및 등록 버튼 초기화
    const nicknameInput = document.getElementById('nicknameInput');
    const saveScoreButton = document.getElementById('saveScoreButton');
    if (nicknameInput) nicknameInput.value = '';
    if (saveScoreButton) {
        saveScoreButton.disabled = false;
        saveScoreButton.style.cursor = "pointer";
        saveScoreButton.textContent = "점수 등록";
    }

    // ranking 창도 숨기기
    const rankingContainer = document.getElementById('ranking-container');
    if (rankingContainer) rankingContainer.style.display = 'none';
}

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
    popup.style.display = 'block';
}
});