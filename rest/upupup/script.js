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

    // 미리 로드할 이미지 URL 목록
    const imageUrls = [
        "https://www.survivaloffice.com/images/UPA.jpg",
        "https://www.survivaloffice.com/images/UPB.jpg",
        "https://www.survivaloffice.com/images/UPC.jpg",
        "https://www.survivaloffice.com/images/UPD.jpg",
        "https://www.survivaloffice.com/images/start.png"
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
        setInterval(decreaseTime, 1000);
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
        for (let i = 0; i < TOTAL_STAIRS; i++) {
            createStair(i, lastGrid);
            lastGrid = currentGrid;
        }
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
        currentGrid = stairPositions[0].grid;
        character.style.left = `${(currentGrid - 1) * 100 + 30}px`;
        character.style.bottom = '0px';
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

    function closePopup() {
        const popup = document.getElementById('result-popup');
        popup.style.display = 'none';
        window.location.reload(); // 즉시 새로고침
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
});
