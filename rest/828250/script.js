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

document.addEventListener("DOMContentLoaded", () => {
    // HTML 요소 가져오기
    const startButton = document.getElementById("start-button");
    const countdownContainer = document.getElementById("countdown-container");
    const gameArea = document.getElementById("game-area");
    const scoreDisplay = document.getElementById("score");
    const helpButton = document.getElementById("help-btn");
    const popup = document.getElementById("result-popup");
    const saveScoreButton = document.getElementById('saveScoreButton');

    let gameTimer;
    let startTime;
    let elapsedTime; // 게임 종료 시 경과 시간을 저장하는 변수
    let currentNumber = 1;
    let isGameOver = false;

    // 스타트 버튼 클릭 이벤트
    startButton.addEventListener("click", () => {
        helpButton.style.display = "none";
        startButton.style.display = "none";
        gameArea.style.backgroundImage = "none";
        gameArea.style.backgroundColor = "#ffffff";
        startCountdown();
    });

    // 카운트다운 시작
    function startCountdown() {
        countdownContainer.style.display = "block";
        let countdown = 3;
        countdownContainer.textContent = countdown;

        const interval = setInterval(() => {
            countdown--;
            countdownContainer.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(interval);
                countdownContainer.style.display = "none";
                startGame();
            }
        }, 1000);
    }

    function startGame() {
        scoreDisplay.textContent = "게임시간\n00:00:00";
        scoreDisplay.style.display = "block";
        startTime = new Date();
        elapsedTime = null; // 초기화
        gameTimer = setInterval(updateTimer, 1000);
        generateGridNumbers();
    }

    function updateTimer() {
        const now = new Date();
        const elapsed = new Date(now - startTime);
        const hours = String(elapsed.getUTCHours()).padStart(2, "0");
        const minutes = String(elapsed.getUTCMinutes()).padStart(2, "0");
        const seconds = String(elapsed.getUTCSeconds()).padStart(2, "0");
        scoreDisplay.textContent = `게임시간\n${hours}:${minutes}:${seconds}`;
    }

    function generateGridNumbers() {
        const numbers = Array.from({ length: 50 }, (_, i) => i + 1);
        shuffle(numbers);
    
        const rows = 10;
        const cols = 5;
        const cellWidth = gameArea.clientWidth / cols;
        const cellHeight = gameArea.clientHeight / rows;
    
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const number = numbers.pop();
                if (number === undefined) return;
    
                // 숫자 요소 생성
                const numberElement = document.createElement("div");
                numberElement.classList.add("number");
                numberElement.textContent = number;
    
                // 스타일 설정
                numberElement.style.width = `${cellWidth}px`;
                numberElement.style.height = `${cellHeight}px`;
                numberElement.style.position = "absolute";
                numberElement.style.left = `${col * cellWidth}px`;
                numberElement.style.top = `${row * cellHeight}px`;
                numberElement.style.display = "flex";
                numberElement.style.alignItems = "center";
                numberElement.style.justifyContent = "center";
                numberElement.style.border = "1px solid #ccc";
                numberElement.style.boxSizing = "border-box";

                // 클릭 이벤트 추가
                numberElement.addEventListener("click", () => {
                    if (parseInt(numberElement.textContent) === currentNumber) {
                        // 애니메이션 클래스 추가
                        numberElement.classList.add("explode");
    
                        // 애니메이션 종료 후 삭제
                        numberElement.addEventListener("animationend", () => {
                            numberElement.remove();
                        });
    
                        currentNumber++;
                        if (currentNumber > 50) {
                            endGame();
                        }
                    } else {
                        console.error("Clicked number is incorrect:", numberElement.textContent);
                    }
                });
    
                // 숫자 요소를 게임 영역에 추가
                gameArea.appendChild(numberElement);
            }
        }
    }

    function endGame() {
        if (isGameOver) return; // 이미 게임이 종료되었다면 실행하지 않음
        isGameOver = true;
    
        clearInterval(gameTimer); // 타이머 중지
        elapsedTime = calculateElapsedTime(); // 종료 시점의 시간 저장
        console.log("종료된 게임 시간:", elapsedTime); // 디버깅용
    
        // 점수 저장 팝업 표시
        showGameOverPopup();
    }

    function showGameOverPopup() {
        popup.style.display = "block";
    }

    saveScoreButton.addEventListener('click', async (event) => {
        event.preventDefault();
    
        if (saveScoreButton.disabled) {
            alert("이미 점수가 등록되었습니다.");
            return;
        }
    
        const nickname = document.getElementById('nicknameInput').value;
    
        if (nickname.length === 0) {
            alert("닉네임을 입력해주세요.");
            return;
        } else if (nickname.length > 5) {
            alert("닉네임은 5글자 이하로 입력해주세요.");
            return;
        }
    
        if (!elapsedTime) {
            alert("게임이 아직 종료되지 않았습니다!");
            return;
        }
    
        await saveScore(nickname, elapsedTime); // 고정된 elapsedTime 사용
        saveScoreButton.disabled = true;
        saveScoreButton.style.cursor = "not-allowed";
        saveScoreButton.textContent = "등록 완료";
    });
    
    async function saveScore(nickname, score) {
        console.log("Firestore에 점수 저장 시도:", nickname, score);
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);
        const date = kstDate.toISOString().split("T")[0];
    
        const scoresRef = collection(db, '828250');
        console.log("Firestore에 저장할 데이터:", { nickname, score });
        try {
            await addDoc(scoresRef, {
                nickname: nickname || 'Unknown',
                score: score, // 고정된 elapsedTime 값 사용
                date: date
            });
            alert('점수가 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error("Error adding data:", error);
            alert('점수 저장 중 오류가 발생했습니다.');
        }
    }

    function calculateElapsedTime() {
        if (!startTime) return "00:00:00"; // 시작하지 않은 경우 기본값 반환
        const now = new Date();
        const elapsed = new Date(now - startTime);
        const hours = String(elapsed.getUTCHours()).padStart(2, "0");
        const minutes = String(elapsed.getUTCMinutes()).padStart(2, "0");
        const seconds = String(elapsed.getUTCSeconds()).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});

    // 팝업 닫기 및 다시 시작 버튼
    document.getElementById('closePopupButton').addEventListener('click', () => {
        console.log("닫기 버튼 클릭됨");
        window.location.reload();
    });


// 랭킹 보기 버튼과 컨테이너 확인 및 이벤트 등록
let rankingContainer;

document.addEventListener("DOMContentLoaded", () => {
    rankingContainer = document.getElementById("ranking-container");
    const top10RankButton = document.getElementById("top10-rank");

    if (!rankingContainer) {
        console.error("ranking-container 요소를 찾을 수 없습니다.");
        return;
    }

    if (!top10RankButton) {
        console.error("top10-rank 버튼 요소를 찾을 수 없습니다.");
        return;
    }

    top10RankButton.addEventListener("click", async () => {
        rankingContainer.style.display = "block";
        rankingContainer.innerHTML = "<p>로딩 중...</p>";
        console.log("랭킹 보기 버튼 클릭됨");

        try {
            await loadTop10Rankings(); // 이번 주 랭킹 불러오기
            await loadAllTimeHighScore(); // 전체 최고 점수 불러오기
        } catch (error) {
            console.error("랭킹 데이터를 불러오는 중 오류 발생:", error);
            rankingContainer.innerHTML = "<p>랭킹 데이터를 불러오는 데 실패했습니다.</p>";
        }
    });

    rankingContainer.addEventListener("click", () => {
        rankingContainer.style.display = "none";
    });
});


// Firestore에서 이번 주 월~일 랭킹 가져오기
async function loadTop10Rankings() {
    const scoresRef = collection(db, '828250');
    const { startDate, endDate } = getCurrentWeekRange();
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    const q = query(
        scoresRef,
        where("date", ">=", startDate), // 범위 필터
        where("date", "<=", endDate),  // 범위 필터
        orderBy("score", "asc"),      // score 오름차순 정렬
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
                    ${medalEmoji} ${rank}위 - ${nickname}, ${score} <span class="date">${formattedDate}</span>
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


// Firestore에서 전체 최고 점수 가져오기
    async function loadAllTimeHighScore() {
    const scoresRef = collection(db, '828250');

    // 최고 점수를 가져오기 위한 쿼리
    const q = query(scoresRef, orderBy('score', 'asc'), limit(1));

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
                         🎉  ${nickname},  ${score}
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

// 랭킹 컨테이너 클릭 시 숨기기
rankingContainer.addEventListener('click', () => {
    rankingContainer.style.display = 'none';
});

console.log('Current rankingContainer content:', rankingContainer.innerHTML);

