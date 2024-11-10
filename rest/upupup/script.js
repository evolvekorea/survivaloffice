document.addEventListener('DOMContentLoaded', () => {
    const stairsContainer = document.getElementById('stairs-container');
    const character = document.getElementById('character');
    const timeElement = document.getElementById('time');
    const scoreElement = document.getElementById('score-value');
    const leftButton = document.getElementById('left-btn');
    const rightButton = document.getElementById('right-btn');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');

    let timeLeft = 100;
    let score = 0;
    let currentStep = 0;
    let currentGrid = 2;
    let scrollPosition = 0;
    const gridWidth = 4;
    const TOTAL_STAIRS = 100;
    const stairPositions = [];

    // 게임 시작
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        createInitialStairs();
        setInitialPosition();
        setInterval(decreaseTime, 1000);
    });

    // 키보드 입력 처리
    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            moveCharacter('left');
        } else if (event.key === 'ArrowRight') {
            moveCharacter('right');
        }
    });

    leftButton.addEventListener('click', () => moveCharacter('left'));
    rightButton.addEventListener('click', () => moveCharacter('right'));

    // 계단 생성
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

        if (direction === 'left' && currentGrid > 1) currentGrid--;
        else if (direction === 'right' && currentGrid < gridWidth) currentGrid++;

        if (isOnStair(currentGrid, nextStep)) {
            currentStep++;
            if (currentStep < 6) character.style.bottom = `${currentStep * 60}px`;
            else {
                scrollPosition += 60;
                stairsContainer.style.transform = `translateY(${scrollPosition}px)`;
                character.style.bottom = `${5 * 60}px`;
            }
            character.style.left = `${(currentGrid - 1) * 100 + 30}px`;
            increaseScore();
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
            timeElement.textContent = timeLeft;

        // 시간 증가 효과
        timeElement.style.color = '#4caf50'; // 텍스트 색상을 초록색으로 변경
        setTimeout(() => {
            timeElement.style.color = '#000'; // 원래 색상으로 복귀
        }, 500);    
        }
    }

    function decreaseTime() {
        if (timeLeft > 0) timeLeft--;
        else gameOver();
        timeElement.textContent = timeLeft;
    }

    function gameOver() {
        alert(`게임 오버! 최종 점수: ${score}`);
        location.reload(); // 페이지 새로고침
    }

    function resetGame() {
        startScreen.style.display = 'flex';
        timeLeft = 100;
        score = 0;
        currentStep = 0;
        currentGrid = 2;
        scrollPosition = 0;
        stairsContainer.style.transform = 'translateY(0px)';
        stairPositions.length = 0;
        stairsContainer.innerHTML = '';
    }
});
