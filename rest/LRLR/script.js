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
// 랭킹 보기 버튼과 컨테이너 요소 가져오기
const top10RankButton = document.getElementById('top10-rank');
const rankingContainer = document.getElementById('ranking-container');

// 버튼과 컨테이너가 존재하는지 확인
if (top10RankButton && rankingContainer) {
    // 랭킹 보기 버튼 클릭 이벤트 등록
    top10RankButton.addEventListener('click', () => {
        console.log("랭킹 보기 버튼 클릭됨");
        rankingContainer.style.display = 'block'; // 랭킹 컨테이너 표시
        rankingContainer.innerHTML = '<p>로딩 중...</p>'; // 로딩 중 메시지
        loadTop10Rankings(); // Firestore에서 랭킹 데이터 로드
    });
} else {
    console.error("top10-rank 버튼 또는 ranking-container 요소를 찾을 수 없습니다.");
}

// Firestore에서 Top 10 랭킹 데이터 가져오기
async function loadTop10Rankings() {
    const scoresRef = collection(db, 'LRLR'); // 'LRLR' 컬렉션 사용
    const q = query(scoresRef, orderBy('score', 'desc'), orderBy('date', 'desc'), limit(10));

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
            rankingsHTML += `
                <li class="ranking-item">
                    ${medalEmoji} ${rank}위 - ${nickname}, ${score}점 <span class="date">${formattedDate}</span>
                </li>
            `;
            rank++;
        });

        rankingsHTML += '</ul>';
        rankingContainer.innerHTML = rankingsHTML; // HTML 업데이트

        // 순차적으로 나타나는 애니메이션
        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            }, index * 500); // 0.3초 간격
        });

    } catch (error) {
        console.error('Firestore에서 랭킹 데이터를 가져오는 중 오류 발생:', error);
        rankingContainer.innerHTML = '<p>랭킹 데이터를 불러오지 못했습니다.</p>';
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

    const scoresRef = collection(db, 'LRLR');
    const q = query(scoresRef, where('nickname', '==', nickname || 'Unknown'));

    try {
        console.log("쿼리 시작");
        const querySnapshot = await getDocs(q);
        console.log("쿼리 결과 개수:", querySnapshot.size);

        if (!querySnapshot.empty) {
            console.log("기존 기록 발견, 업데이트 시도 중...");
            for (const document of querySnapshot.docs) {
                const existingRecord = document.data();
                console.log("기존 기록:", existingRecord);

                if (score > existingRecord.score) {
                    await updateDoc(doc(db, 'LRLR', document.id), {
                        score: score,
                        date: date
                    });
                    alert('기록이 업데이트되었습니다.');
                } else {
                    alert('기록이 업데이트되지 않았습니다. 기존 점수가 더 높습니다.');
                }
            }
        } else {
            console.log("기존 기록이 없음, 새로운 문서 추가 중...");
            await addDoc(scoresRef, {
                nickname: nickname || 'Unknown',
                score: score,
                date: date
            });
            alert('점수가 성공적으로 저장되었습니다.');
        }
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
document.getElementById('saveScoreButton').addEventListener('click', async (event) => {
    event.preventDefault();
    const nickname = document.getElementById('nicknameInput').value;
    if (nickname.trim() === "") {
        alert("닉네임을 입력해주세요.");
        return;
    }
    await saveScore(nickname, score);
});

// 게임 종료 팝업 표시 함수
function showGameOverPopup() {
    const popup = document.getElementById('result-popup');
    popup.style.display = 'block';
}

// 점수 표시
let score = 0;
const scoreDisplay = document.getElementById("score");
let isGameRunning = false;

// HTML 요소 가져오기
const centerAnimal = document.getElementById("center-animal");
const leftAnimal = document.getElementById("left-animal");
const rightAnimal = document.getElementById("right-animal");
const startButton = document.getElementById("start-button");

// 동물 목록
const animals = ["🐶", "🐱", "🐰", "🐵", "🐷", "🦁", "🐮"];

// 기존 게임 시작 함수에 추가 기능 포함
startButton.addEventListener("click", startGame);

function startGame() {
    // 1. 초기화 로직
    score = 0;
    scoreDisplay.textContent = score;
    isGameRunning = true;

    // 2. 새로운 동작 추가
    // 스타트 버튼 숨기기
    startButton.style.display = "none";

    // 게임 영역에서 배경 이미지 제거 및 검은색 배경 설정
    LRLRArea.style.setProperty("background-image", "none", "important");
    LRLRArea.style.setProperty("background-color", "black", "important");

    // 게임 UI 표시
    centerAnimal.style.display = "block";
    leftAnimal.style.display = "block";
    rightAnimal.style.display = "block";
    timerContainer.style.display = "block";

    // 3. 기존 동작 실행
    generateAnimals(); // 동물 생성 함수 실행
    console.log("게임이 시작되었습니다!");
}

// 동물 생성 함수
function generateAnimals() {
  if (!isGameRunning) return;

  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const leftAnimalRandom = animals[Math.floor(Math.random() * animals.length)];
  const rightAnimalRandom = animals[Math.floor(Math.random() * animals.length)];

  centerAnimal.textContent = randomAnimal;
  leftAnimal.textContent = leftAnimalRandom;
  rightAnimal.textContent = rightAnimalRandom;

  // 정답 이벤트 설정
  leftAnimal.onclick = () => checkAnswer(leftAnimalRandom, randomAnimal);
  rightAnimal.onclick = () => checkAnswer(rightAnimalRandom, randomAnimal);
}

// 정답 확인 함수
function checkAnswer(selected, target) {
  if (!isGameRunning) return;

  if (selected === target) {
    score++;
    scoreDisplay.textContent = score;
    generateAnimals(); // 새로운 동물 생성
  } else {
    endGame(); // 게임 종료
  }
}


// 타이머 관련 변수
const timerBar = document.getElementById("timer-bar");
const timerText = document.getElementById("timer-text");
let remainingTime = 30; // 30초로 초기화
let timerInterval; // 타이머 인터벌

// 타이머 시작 함수
function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // 기존 타이머 중단
    remainingTime = 30; // 초기화
    updateTimerUI();
    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerUI();
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// 타이머 UI 업데이트 함수
function updateTimerUI() {
    const percentage = (remainingTime / 30) * 100;
    timerBar.style.width = `${percentage}%`;
    timerText.textContent = `${remainingTime}초`;
    if (remainingTime <= 10) {
        timerBar.style.backgroundColor = '#e74c3c'; // 빨간색
    } else if (remainingTime <= 20) {
        timerBar.style.backgroundColor = '#f39c12'; // 주황색
    } else {
        timerBar.style.backgroundColor = '#76c7c0'; // 기본 색상
    }
}
// 게임 종료 함수에 타이머 종료 추가
function endGame() {
    isGameRunning = false; // 게임 종료 상태 반영
    clearInterval(timerInterval); // 타이머 정지
    showGameOverPopup();
}

// 게임 시작 시 타이머 시작
startButton.addEventListener("click", () => {
    startTimer(); // 타이머 시작
})
});
