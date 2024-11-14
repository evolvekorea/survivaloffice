document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('#result-popup button');
    closeButton.addEventListener('click', closePopup);
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

    let timeLeft = 100;
    let score = 0;
    let currentStep = 0;
    let currentGrid = 2;
    let scrollPosition = 0;
    const gridWidth = 4;
    const TOTAL_STAIRS = 101;
    const stairPositions = [];
    let timeInterval;

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
        document.getElementById('start-btn').disabled = false;
    });
    
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        createInitialStairs();
        setInitialPosition();

        // 이동 키를 누르기 전 기본 캐릭터 이미지 설정
        character.style.backgroundImage = "url('https://www.survivaloffice.com/images/right.png')";

        // [수정] 타이머 시작 시 반환 값을 변수에 저장
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
        if (currentStep >= 0 && currentStep <= 30) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPA.jpg')";
        } else if (currentStep >= 31 && currentStep <= 70) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPB.jpg')";
        } else if (currentStep >= 71 && currentStep <= 99) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPC.jpg')";
        } else if (currentStep >= 100) {
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
    
        // 첫 번째 계단 위치 로그
        console.log("First stair position - grid:", stairPositions[0].grid, "step:", stairPositions[0].step);
    }
    function createStair(step, lastGrid) {
        const stair = document.createElement('div');
        stair.classList.add('stair');
        stair.style.bottom = `${step * 60}px`;

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
    
        // 디버깅 로그
        console.log("Initial Position - left:", character.style.left, "bottom:", character.style.bottom);
    
        // 계단 컨테이너의 스크롤 위치 초기화
        stairsContainer.style.transform = 'translateY(0px)';
        scrollPosition = 0;
    }

    function moveCharacter(direction) {
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

    // 팝업 창을 표시하는 함수
    function showPopup(message) {
        const popup = document.getElementById('result-popup');
        const resultMessage = document.getElementById('result-message');
        resultMessage.innerHTML = `${message}<br>최종 점수: ${score}`; // 줄바꿈을 추가하여 메시지 표시
        popup.style.display = 'block';
    }

    // 닫기 버튼 클릭 시
    document.getElementById('closePopupButton').addEventListener('click', closePopup);

    function closePopup() {
        const popup = document.getElementById('result-popup');
        popup.style.display = 'none';
        window.location.reload(); // 화면 새로고침
    }

    // 게임 종료 시 호출되는 함수 (예: 타임아웃 등)
    function gameOver() {
        character.style.backgroundImage = "url('https://www.survivaloffice.com/images/end.png')";    
        showPopup("게임 오버! 다시 도전하세요.");
        clearInterval(timeInterval); // 타이머 정지
    }

    // 끝까지 올라갔을 때 메시지 표시
    function checkIfGameFinished() {
        if (currentStep >= 100) { // 게임의 최종 단계에 도달했을 때
            character.style.backgroundImage = "url('https://www.survivaloffice.com/images/goal.png')";            
            showPopup("축하합니다. 자유입니다.");
            clearInterval(timeInterval); // 타이머 정지
        }
    }

    // Firebase 설정 값
    const firebaseConfig = {
    apiKey: "AIzaSyCK4Zdkhlc0cnjqC3TpmUJmLAt8Xrh8VOw",
    authDomain: "upupup-e4c2c.firebaseapp.com",
    projectId: "upupup-e4c2c",
    storageBucket: "upupup-e4c2c.appspot.com", 
    messagingSenderId: "877963060151",
    appId: "1:877963060151:web:e70751cb30638880767e32",
    };

    // Firebase 초기화
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    async function saveScore(nickname, score) {
        try {
            // Firestore에서 'scores' 컬렉션에 문서 추가
            await db.collection("scores").add({
                nickname: nickname,         // 사용자 닉네임
                score: Number(score),       // 점수
                date: firebase.firestore.FieldValue.serverTimestamp() // 서버 시간
            });
            alert("점수가 성공적으로 Firestore에 등록되었습니다!");
        } catch (error) {
            alert("Firestore에 점수 등록에 실패했습니다: " + error.message);
        }
    }
    });
    
    // "점수 등록" 버튼 클릭 이벤트 수정
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('saveScoreButton').addEventListener('click', (event) => {
            event.preventDefault();
            const nickname = document.getElementById('nicknameInput').value;
            if (nickname.trim() === "") {
                alert("닉네임을 입력해주세요.");
                return;
            }
            saveScore(nickname, score);
        });
    });

