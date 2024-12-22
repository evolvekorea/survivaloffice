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
    startButton.style.display = "none";

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

    const loadingMessage = document.getElementById("loading-message");
    
    // 이미지 프리로딩 함수
    function preloadImages(imageUrls, callback) {
        let loadedCount = 0;
        const totalImages = imageUrls.length;

        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;

            img.onload = () => {
                loadedCount++;
                loadingMessage.textContent = `이미지 로드 중... (${loadedCount}/${totalImages})`;

                // 모든 이미지가 로드되었을 때 콜백 실행
                if (loadedCount === totalImages) {
                    callback();
                }
            };

            img.onerror = () => {
                console.error(`이미지 로드 실패: ${url}`);
            };
        });
    }

    // 이미지 로드 완료 시 실행
    preloadImages(
        [
            "https://survivaloffice.com/images/a.png", // 예시 이미지 경로
            "https://survivaloffice.com/images/b.png",
            "https://survivaloffice.com/images/c.png",
            "https://survivaloffice.com/images/d.png",
            "https://survivaloffice.com/images/e.png",
            "https://survivaloffice.com/images/f.png",
            "https://survivaloffice.com/images/g.png",
            "https://survivaloffice.com/images/h.png"
        ],
        () => {
            console.log("모든 이미지가 로드되었습니다!");
            loadingMessage.textContent = ""; // 로딩 메시지 제거
            startButton.style.display = "block"; // 게임 시작 버튼 표시
        }
    );

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

// 현재 추가될 위치를 추적하는 상태 변수
let currentSide = "left"; // "left" -> "right" -> 반복

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

                // 좌 > 우 > 좌 > 우 순서로 동물 추가
                if (currentSide === "left") {
                    renderAnimal(leftAnimal, newAnimalImg); // 왼쪽에 동물 추가
                    currentSide = "right"; // 다음은 오른쪽
                } else {
                    renderAnimal(rightAnimal, newAnimalImg); // 오른쪽에 동물 추가
                    currentSide = "left"; // 다음은 왼쪽
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

    let isButtonDisabled = false; // 버튼 비활성화 상태 추적 변수

    function moveAnimal(direction) {
        if (isButtonDisabled) return; // 버튼이 비활성화 상태면 동작하지 않음
    
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
            triggerShakeEffect(); // 흔들림 효과 실행
            disableButtonsTemporarily(); // 버튼 비활성화
        }
    }

    function triggerShakeEffect() {
        const gameContainer = document.getElementById("LRLR-area"); // 흔들릴 영역 (게임 전체 영역)
    
        gameContainer.classList.add("shake"); // 흔들림 클래스 추가
    
        // 0.5초 후에 흔들림 클래스 제거
        setTimeout(() => {
            gameContainer.classList.remove("shake");
        }, 500);
    }

    function disableButtonsTemporarily() {
        isButtonDisabled = true; // 버튼 비활성화
        leftArrow.disabled = true; // 왼쪽 버튼 비활성화
        rightArrow.disabled = true; // 오른쪽 버튼 비활성화
    
        // 2초 후 버튼 활성화
        setTimeout(() => {
            isButtonDisabled = false; // 버튼 활성화
            leftArrow.disabled = false; // 왼쪽 버튼 활성화
            rightArrow.disabled = false; // 오른쪽 버튼 활성화
        }, 2000);
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

    // 점수 저장 버튼
    document.getElementById('saveScoreButton').addEventListener('click', async (event) => {
        event.preventDefault();
        const nickname = document.getElementById('nicknameInput').value;
        
        // 글자 수 제한 (5글자)
        if (nickname.length === 0) {
            alert("닉네임을 입력해주세요.");
            return;
        } else if (nickname.length > 5) {
            alert("닉네임은 5글자 이하로 입력해주세요.");
            return;
        }
        await saveScore(nickname, score);
    });

    document.getElementById('closePopupButton').addEventListener('click', () => {
        window.location.reload();
    });

// 랭킹 보기 버튼과 컨테이너 확인 및 이벤트 등록
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
    const scoresRef = collection(db, 'LRLR');
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


// Firestore에서 전체 최고 점수 가져오기
    async function loadAllTimeHighScore() {
    const scoresRef = collection(db, 'LRLR');

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

// 이번 주 월~일 날짜 계산 함수
function getCurrentWeekRange() {
    const now = new Date(); // 현재 날짜
    const dayOfWeek = now.getDay(); // 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)

    // 이번 주 월요일 계산
    const monday = new Date(now);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일은 -6, 나머지는 (1 - 요일)
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0); // 월요일 00:00:00

    // 이번 주 일요일 계산
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // 월요일 + 6일 = 일요일
    sunday.setHours(23, 59, 59, 999); // 일요일 23:59:59

    // YYYY-MM-DD 형식으로 반환
    const startDate = monday.toISOString().slice(0, 10); // 월요일
    const endDate = sunday.toISOString().slice(0, 10); // 일요일

    return { startDate, endDate };
}

// 랭킹 컨테이너 클릭 시 숨기기
rankingContainer.addEventListener('click', () => {
    rankingContainer.style.display = 'none';
});

console.log('Current rankingContainer content:', rankingContainer.innerHTML);



});