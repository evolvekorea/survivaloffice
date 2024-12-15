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
    const availableAnimals = [
        "https://survivaloffice.com/images/a.png", // 예시 이미지 경로
        "https://survivaloffice.com/images/b.png",
        "https://survivaloffice.com/images/c.png",
        "https://survivaloffice.com/images/d.png",
        "https://survivaloffice.com/images/e.png",
        "https://survivaloffice.com/images/f.png",
        "https://survivaloffice.com/images/g.png",
        "https://survivaloffice.com/images/h.png"
    ];


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
        assignRandomAnimals(); // 랜덤 동물 배치
    }

    function getRandomAnimals() {
        const shuffled = [...availableAnimals].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2); // 8가지 동물 중 랜덤으로 2개 선택
    }
    
    function assignRandomAnimals() {
        const [leftAnimalImg, rightAnimalImg] = getRandomAnimals();
    
        // 좌측 동물 렌더링
        leftAnimal.innerHTML = ""; // 기존 내용 초기화
        renderAnimal(leftAnimal, leftAnimalImg);
    
        // 우측 동물 렌더링
        rightAnimal.innerHTML = ""; // 기존 내용 초기화
        renderAnimal(rightAnimal, rightAnimalImg);
    
        // 중앙 동물 리스트와 동기화
        renderInitialAnimals();
    }

    function renderAnimal(container, imagePath) {
        const img = document.createElement("img"); // img 태그 생성
        img.src = imagePath; // 이미지 경로 설정
        img.alt = "Animal"; // 접근성 설정
        img.className = "animal-img"; // CSS 클래스 추가
    
        container.appendChild(img); // 컨테이너에 추가
    }

    function renderInitialAnimals() {
        centerAnimal.innerHTML = ""; // 초기화
        animalQueue.length = 0; // 기존 큐 초기화
    
        const leftOptions = Array.from(leftAnimal.children).map(img => img.src);
        const rightOptions = Array.from(rightAnimal.children).map(img => img.src);
        const allOptions = [...leftOptions, ...rightOptions];
    
        for (let i = 0; i < 5; i++) {
            const randomAnimal = allOptions[Math.floor(Math.random() * allOptions.length)];
            animalQueue.push(randomAnimal);
            renderAnimal(centerAnimal, randomAnimal); // 이미지 렌더링
        }
    }

    function updateAnimalQueue() {
        // UI 동기화만 수행
        const animalElements = centerAnimal.children;
        for (let i = 0; i < animalQueue.length; i++) {
            animalElements[i].textContent = animalQueue[i];
        }
    }

    const animalQueue = [];

    function generateInitialAnimals() {
        animalQueue.length = 0; // 큐 초기화
    
        for (let i = 0; i < 10; i++) {
            const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
            animalQueue.push(randomAnimal); // 이미지 경로 추가
        }
        renderCenterAnimals();
    }

    function renderCenterAnimals() {
        centerAnimal.innerHTML = ""; // 기존 내용 초기화
    
        const visibleAnimals = animalQueue.slice(0, 5); // 상위 5개만 표시
    
        visibleAnimals.forEach((animalImg) => {
            renderAnimal(centerAnimal, animalImg); // 이미지 추가
        });
    }

    function addAnimalToQueue() {
        const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
    
        // 맨 위 동물 제거
        animalQueue.shift();
    
        // 새로운 동물을 큐 맨 뒤에 추가
        animalQueue.push(randomAnimal);
    
        // 중앙 동물 렌더링
        renderCenterAnimals();
    }

    // 점수 및 콤보 업데이트
    function updateScore(isCorrect) {
        if (isCorrect) {
            score += 10;
            combo += 1;
    
            if (score % 200 === 0) {
                const remainingAnimals = availableAnimals.filter(animal => {
                    const currentImages = [
                        ...Array.from(leftAnimal.children).map(child => child.src),
                        ...Array.from(rightAnimal.children).map(child => child.src)
                    ];
                    return !currentImages.includes(animal);
                });
    
                if (remainingAnimals.length > 0) {
                    const newAnimalImg = remainingAnimals[Math.floor(Math.random() * remainingAnimals.length)];
    
                    if (Math.random() < 0.5) {
                        renderAnimal(leftAnimal, newAnimalImg); // 왼쪽에 추가
                    } else {
                        renderAnimal(rightAnimal, newAnimalImg); // 오른쪽에 추가
                    }
                }
            }
        } else {
            combo = 0;
        }
        scoreDisplay.textContent = `SCORE: ${score}`;
    }



    // 동물 이동 처리
    leftArrow.addEventListener("click", () => moveAnimal("left"));
    rightArrow.addEventListener("click", () => moveAnimal("right"));

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") moveAnimal("left");
        if (event.key === "ArrowRight") moveAnimal("right");
    });

    function moveAnimal(direction) {
        const lastAnimal = animalQueue[animalQueue.length - 1]; // 맨 아래 동물
        const leftOptions = Array.from(leftAnimal.children).map(img => img.src);
        const rightOptions = Array.from(rightAnimal.children).map(img => img.src);
    
        const isCorrect =
            (direction === "left" && leftOptions.includes(lastAnimal)) ||
            (direction === "right" && rightOptions.includes(lastAnimal));
    
        if (isCorrect) {
            updateScore(true); // 점수 상승
    
            // 중앙 동물 큐 업데이트
            animalQueue.pop(); // 맨 아래 동물 제거
            const allOptions = [...leftOptions, ...rightOptions];
            const newAnimal = allOptions[Math.floor(Math.random() * allOptions.length)];
            animalQueue.unshift(newAnimal); // 새로운 동물을 맨 위에 추가
    
            // UI 동기화
            renderCenterAnimals();
        } else {
            updateScore(false); // 점수 초기화
        }
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

            rankingsHTML += '<h4 style="color: red;">📢 랭킹은 매주 월요일 초기화됩니다.</h4></ul>';
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
