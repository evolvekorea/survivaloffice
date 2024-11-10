const stairsContainer = document.getElementById('stairs-container');
const character = document.getElementById('character');
const timeElement = document.getElementById('time');
const scoreElement = document.getElementById('score-value');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');

let timeLeft = 100;
let score = 0;
let currentStep = 0;
let currentGrid = 2;
let scrollPosition = 0;
const gridWidth = 4;
const TOTAL_STAIRS = 1000;
const stairPositions = [];

// 1000개의 계단을 미리 생성
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

    // 계단의 위치를 랜덤하게 결정
    if (lastGrid === 1) {
        currentGrid = 2;
    } else if (lastGrid === 2) {
        currentGrid = Math.random() > 0.5 ? 1 : 3;
    } else if (lastGrid === 3) {
        currentGrid = Math.random() > 0.5 ? 2 : 4;
    } else if (lastGrid === 4) {
        currentGrid = 3;
    }

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

    // 캐릭터 이동
    if (direction === 'left' && currentGrid > 1) {
        currentGrid--;
    } else if (direction === 'right' && currentGrid < gridWidth) {
        currentGrid++;
    }

    // 계단 위에 있는지 체크
    if (isOnStair(currentGrid, nextStep)) {
        currentStep++;

        if (currentStep < 6) {
            // 5번째 계단까지는 캐릭터가 올라감
            character.style.bottom = `${currentStep * 60}px`;
        } else {
            // 6번째 계단부터는 캐릭터 고정, 계단 이동
            scrollPosition += 60;
            stairsContainer.style.transform = `translateY(${scrollPosition}px)`;
            character.style.bottom = `${5 * 60}px`; // 캐릭터 고정
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
}

function decreaseTime() {
    if (timeLeft > 0) {
        timeLeft--;
        timeElement.textContent = timeLeft;
    } else {
        gameOver();
    }
}

function gameOver() {
    alert(`게임 오버! 최종 점수: ${score}`);
    resetGame();
}

function resetGame() {
    timeLeft = 100;
    score = 0;
    currentStep = 0;
    currentGrid = 2;
    scrollPosition = 0;
    stairsContainer.style.transform = `translateY(0px)`;
    stairPositions.length = 0;
    stairsContainer.innerHTML = '';
    createInitialStairs();
    setInitialPosition();
    timeElement.textContent = timeLeft;
    scoreElement.textContent = score;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        moveCharacter('left');
    } else if (event.key === 'ArrowRight') {
        moveCharacter('right');
    }
});



leftButton.addEventListener('click', () => moveCharacter('left'));
rightButton.addEventListener('click', () => moveCharacter('right'));

createInitialStairs();
setInitialPosition();
setInterval(decreaseTime, 1000);
