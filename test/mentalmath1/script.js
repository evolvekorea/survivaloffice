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
        "https://www.survivaloffice.com/images/m1.png",
        "https://www.survivaloffice.com/images/m2.png",
        "https://www.survivaloffice.com/images/m3.png",
        "https://www.survivaloffice.com/images/m4.png",
        "https://www.survivaloffice.com/images/m5.png",
        "https://www.survivaloffice.com/images/m6.png",
        "https://www.survivaloffice.com/images/md1.png",
        "https://www.survivaloffice.com/images/md2.png",
        "https://www.survivaloffice.com/images/md3.png",
        "https://www.survivaloffice.com/images/md4.png",
        "https://www.survivaloffice.com/images/md5.png",
        "https://www.survivaloffice.com/images/md6.png",
        "https://www.survivaloffice.com/images/molemain.png"        
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

let currentProblem = 0;
const totalProblems = 20;

const questionContainer = document.getElementById("question-container");
const choicesContainer = document.getElementById("choices-container");
const feedback = document.getElementById("feedback");

// 문제 생성 함수
function generateProblem(index) {
    const isAdvanced = index >= 15;
    const operations = isAdvanced ? ["+", "-", "*", "/"] : ["+", "-"];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let a = Math.floor(Math.random() * 90) + 10;
    let b = Math.floor(Math.random() * 90) + 10;

    if (op === "/" || op === "-") {
        [a, b] = a < b ? [b, a] : [a, b];
    }

    if (op === "/") {
        a = a - (a % b);
    }

    // 보여줄 연산자 기호
    let displayOp = op;
    if (op === "*") displayOp = "×";
    if (op === "/") displayOp = "÷";

    const displayQuestion = `${a} ${displayOp} ${b}`;
    const calcQuestion = `${a} ${op} ${b}`;
    const answer = eval(calcQuestion);

    return {
        question: displayQuestion,
        answer: Math.round(answer)
    };
}

let currentAnswer = 0;
let pendingChoices = [];

// 문제 표시 메인 함수
function showProblem() {
    const { question, answer } = generateProblem(currentProblem);
    currentAnswer = answer;
    pendingChoices = generateChoices(answer);

    const parts = question.split(" "); // ex: ["1", "+", "10"]
    animateQuestionDisplay(parts, () => {
        showChoices(pendingChoices); // 모든 요소 애니메이션 후 선택지 표시
    });
}

// 숫자 + 기호 + 숫자를 하나씩 보여주는 애니메이션
function animateQuestionDisplay(parts, callback) {
    let index = 0;
    questionContainer.textContent = "";

    function showNext() {
        if (index >= parts.length) {
            questionContainer.textContent = "";
            setTimeout(callback, 300); // 선택지 표시로 넘어감
            return;
        }

        questionContainer.textContent = parts[index];
        setTimeout(() => {
            questionContainer.textContent = "";
            index++;
            setTimeout(showNext, 200); // 다음 문자로
        }, 800);
    }

    showNext();
}

// 선택지 배열 만들기
function generateChoices(answer) {
    const choices = [answer];
    while (choices.length < 3) {
        const fake = answer + Math.floor(Math.random() * 21 - 10);
        if (!choices.includes(fake)) {
            choices.push(fake);
        }
    }
    return choices.sort(() => Math.random() - 0.5);
}

// 선택지 버튼 그리기
function showChoices(choices) {
    choicesContainer.innerHTML = "";

    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice;
        btn.onclick = () => handleAnswer(choice, currentAnswer);
        choicesContainer.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    disableChoices();

    if (selected === correct) {
        score++;
        updateScore();
        feedback.textContent = "정답입니다!";
    } else {
        feedback.textContent = "틀렸습니다!";
    }

    // 선택지 및 문제 숨기고 카운트다운 시작
    setTimeout(() => {
        questionContainer.textContent = "";
        choicesContainer.innerHTML = "";
        feedback.textContent = "";

        if (currentProblem + 1 >= totalProblems) {
            endGame();
        } else {
            currentProblem++;
            startNextProblemCountdown(); // 다음 문제 카운트다운 시작
        }
    }, 800); // 약간의 반응 시간만 두고 즉시 다음 흐름
}

function disableChoices() {
    const buttons = choicesContainer.querySelectorAll("button");
    buttons.forEach(button => {
        button.disabled = true;
        button.style.cursor = "not-allowed";
        button.style.opacity = "0.5";
    });
}

function startNextProblemCountdown() {
    let countdown = 3;
    countdownContainer.style.display = "block";
    countdownContainer.textContent = countdown;

    const interval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(interval);
            countdownContainer.style.display = "none";
            showProblem(); // 다음 문제 시작
        } else {
            countdownContainer.textContent = countdown;
        }
    }, 1000);
}

// 기존 showGameUI 함수 수정
function showGameUI() {
    gamearea.style.display = 'block';
    isGameOver = false;
    score = 0;
    currentProblem = 0;
    updateScore();
    showProblem(); // 문제 표시
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
    const scoresRef = collection(db, 'mentalmath1');
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
    const scoresRef = collection(db, 'mentalmath1');

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

    const scoresRef = collection(db, 'mentalmath1');

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
}

// 점수 관리
let score = 0;
const scoreDisplay = document.getElementById("score");


let isGameOver = false; // 게임 종료 상태 플래그

// HTML 요소 가져오기
const countdownContainer = document.getElementById("countdown-container");

// 게임 시작 버튼 클릭 이벤트 수정
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').style.display = 'none'; // 시작 화면 숨기기
    startCountdown(); // 카운트다운 시작
});

// 카운트다운 시작
function startCountdown() {
    countdownContainer.style.display = "block"; // 카운트다운 표시
    let countdown = 3; // 카운트다운 초기값

    const interval = setInterval(() => {
        countdownContainer.textContent = countdown; // 카운트다운 텍스트 업데이트
        console.log(`카운트다운 중: ${countdown}`);
        countdown--;

        if (countdown < 0) {
            clearInterval(interval); // 카운트다운 종료
            countdownContainer.style.display = "none"; // 카운트다운 숨기기
            console.log("카운트다운 종료. 게임 UI 표시");
            showGameUI(); // 카운트다운 종료 후 게임 시작
        }
    }, 1000);
}

    // 게임 종료
    function endGame() {
        if (isGameOver) return;
        isGameOver = true;

    
        // 점수 저장 팝업 표시
        showGameOverPopup();

        // 게임 화면 클릭 방지
        document.getElementById("game-area").style.pointerEvents = "none";

    }


// 점수 업데이트
function updateScore() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${score}`;
    }
}
