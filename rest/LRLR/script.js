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
    const centerAnimal = document.getElementById("center-animal");
    const leftAnimal = document.getElementById("left-animal");
    const rightAnimal = document.getElementById("right-animal");
    const timerContainer = document.getElementById("timer-container");
    const LRLRArea = document.getElementById("LRLR-area");
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");
    const scoreDisplay = document.getElementById("score");
    const top10RankButton = document.getElementById("top10-rank");
    const rankingContainer = document.getElementById("ranking-container");

    // 초기 상태 설정
    centerAnimal.style.display = "none";
    leftAnimal.style.display = "none";
    rightAnimal.style.display = "none";
    timerContainer.style.display = "none";
    leftArrow.style.display = "none";
    rightArrow.style.display = "none";

    let score = 0;
    let combo = 0;
    let isGameRunning = false;
    let remainingTime = 30;
    let timerInterval;
    const availableAnimals = ["🐶", "🐱", "🐰", "🐵", "🐷", "🦁", "🐮"];
    let dynamicAnimals = ["🐶", "🐱"];

    // 스타트 버튼 클릭 이벤트
    startButton.addEventListener("click", () => {
        startButton.style.display = "none";
        LRLRArea.style.backgroundImage = "none";
        startCountdown();
    });

    // 카운트다운 시작
    function startCountdown() {
        countdownContainer.style.display = "block";
        let countdown = 5;

        const interval = setInterval(() => {
            countdownContainer.textContent = countdown;
            countdown--;

            if (countdown < 0) {
                clearInterval(interval);
                countdownContainer.style.display = "none";
                showGameUI();
            }
        }, 1000);
    }

    // 게임 UI 표시
    function showGameUI() {
        centerAnimal.style.display = "block";
        leftAnimal.style.display = "block";
        rightAnimal.style.display = "block";
        timerContainer.style.display = "block";
        leftArrow.style.display = "block";
        rightArrow.style.display = "block";
        scoreDisplay.style.display = "block";
        startTimer();
        generateInitialAnimals();
        isGameRunning = true;
        console.log("게임이 시작되었습니다!");
    }

    // 초기 동물 10개 생성 및 동적 추가
    const animalQueue = [];

    function generateInitialAnimals() {
        while (animalQueue.length < 10) {
            const randomAnimal = dynamicAnimals[Math.floor(Math.random() * dynamicAnimals.length)];
            animalQueue.push(randomAnimal);
        }
        renderCenterAnimals();
    }

    function renderCenterAnimals() {
        centerAnimal.innerHTML = "";
        animalQueue.forEach(animal => {
            const animalElement = document.createElement("div");
            animalElement.textContent = animal;
            animalElement.className = "center-animal-item";
            centerAnimal.appendChild(animalElement);
        });
    }

    function addAnimalToQueue() {
        const randomAnimal = dynamicAnimals[Math.floor(Math.random() * dynamicAnimals.length)];
        animalQueue.push(randomAnimal);
        renderCenterAnimals();
    }

    // 점수 및 콤보 업데이트
    function updateScore(isCorrect) {
        if (isCorrect) {
            score += 10;
            combo += 1;
            if (score % 200 === 0 && dynamicAnimals.length < availableAnimals.length) {
                addNewAnimal();
            }
        } else {
            combo = 0;
        }
        scoreDisplay.textContent = `SCORE: ${score}`;
    }

    // 새로운 동물 추가
    function addNewAnimal() {
        const remainingAnimals = availableAnimals.filter(animal => !dynamicAnimals.includes(animal));
        if (remainingAnimals.length > 0) {
            const newAnimal = remainingAnimals[Math.floor(Math.random() * remainingAnimals.length)];
            dynamicAnimals.push(newAnimal);

            // 좌우 화살표 위에 새로운 동물 표시
            if (dynamicAnimals.length % 2 === 1) {
                leftAnimal.textContent = newAnimal;
            } else {
                rightAnimal.textContent = newAnimal;
            }
        }
    }

    // 동물 이동 처리
    leftArrow.addEventListener("click", () => moveAnimal("left"));
    rightArrow.addEventListener("click", () => moveAnimal("right"));

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") moveAnimal("left");
        if (event.key === "ArrowRight") moveAnimal("right");
    });

    function moveAnimal(direction) {
        const firstAnimal = animalQueue.shift();
        if (!firstAnimal) return;

        const isCorrect = (direction === "left" && firstAnimal === leftAnimal.textContent) ||
                          (direction === "right" && firstAnimal === rightAnimal.textContent);

        updateScore(isCorrect);
        addAnimalToQueue();
    }

    // 타이머 시작
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        remainingTime = 30;
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

    // 타이머 UI 업데이트
    function updateTimerUI() {
        const timerBar = document.getElementById("timer-bar");
        const timerText = document.getElementById("timer-text");

        const percentage = (remainingTime / 30) * 100;
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
        isGameRunning = false;
        clearInterval(timerInterval);
        showGameOverPopup();
    }

    // 게임 종료 팝업
    function showGameOverPopup() {
        const popup = document.getElementById("result-popup");
        popup.style.display = "block";
    }

    // 점수 저장
    async function saveScore(nickname, score) {
        const scoresRef = collection(db, 'LRLR');
        const q = query(scoresRef, where('nickname', '==', nickname || 'Unknown'));

        try {
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                for (const document of querySnapshot.docs) {
                    const existingRecord = document.data();

                    if (score > existingRecord.score) {
                        await updateDoc(doc(db, 'LRLR', document.id), {
                            score: score,
                            date: new Date().toISOString()
                        });
                    }
                }
            } else {
                await addDoc(scoresRef, {
                    nickname: nickname || 'Unknown',
                    score: score,
                    date: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error("Error adding data:", error);
        }
    }

    document.getElementById('saveScoreButton').addEventListener('click', async (event) => {
        event.preventDefault();
        const nickname = document.getElementById('nicknameInput').value;
        if (nickname.trim() === "") {
            alert("닉네임을 입력해주세요.");
            return;
        }
        await saveScore(nickname, score);
    });

    document.getElementById('closePopupButton').addEventListener('click', () => {
        window.location.reload();
    });

    // 랭킹 보기 버튼과 컨테이너 확인 및 이벤트 등록
    if (top10RankButton && rankingContainer) {
        top10RankButton.addEventListener('click', () => {
            console.log("랭킹 보기 버튼 클릭됨");
            rankingContainer.style.display = 'block';
            rankingContainer.innerHTML = '<p>로딩 중...</p>';
            loadTop10Rankings();
        });
    } else {
        console.error("top10-rank 버튼 또는 ranking-container 요소를 찾을 수 없습니다.");
    }

    // Firestore에서 Top 10 랭킹 데이터 가져오기
    async function loadTop10Rankings() {
        const scoresRef = collection(db, 'LRLR');
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
                const nickname = data.nickname || 'Unknown';
                const score = data.score || 0;
                let formattedDate;

                if (typeof data.date === 'string') {
                    formattedDate = data.date.slice(0, 10);
                } else {
                    formattedDate = '날짜 없음';
                }

                let medalEmoji = '';
                if (rank === 1) medalEmoji = '🥇';
                else if (rank === 2) medalEmoji = '🥈';
                else if (rank === 3) medalEmoji = '🥉';

                rankingsHTML += `
                    <li class="ranking-item">
                        ${medalEmoji} ${rank}위 - ${nickname}, ${score}점 <span class="date">${formattedDate}</span>
                    </li>
                `;
                rank++;
            });

            rankingsHTML += '</ul>';
            rankingContainer.innerHTML = rankingsHTML;

            const rankingItems = document.querySelectorAll('.ranking-item');
            rankingItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = 1;
                    item.style.transform = 'translateY(0)';
                }, index * 500);
            });

        } catch (error) {
            console.error('Firestore에서 랭킹 데이터를 가져오는 중 오류 발생:', error);
            rankingContainer.innerHTML = '<p>랭킹 데이터를 불러오지 못했습니다.</p>';
        }
    }

    rankingContainer.addEventListener('click', () => {
        rankingContainer.style.display = 'none';
    });
});
