'use strict';

const COLS = 10;
const ROWS = 20;
const CELL = 30;
const LINE_POINTS = [0, 100, 300, 500, 800];

const COLORS = {
    I: ['#61c8f3', '#3ba9dc'],
    J: ['#8298f7', '#6379d8'],
    L: ['#ffac65', '#f18745'],
    O: ['#ffd668', '#efb93e'],
    S: ['#70d8b5', '#46b990'],
    T: ['#b68af1', '#8c64cf'],
    Z: ['#ff8d9e', '#e9657a']
};

const SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const ui = {
    score: document.getElementById('score'),
    scoreMobile: document.getElementById('scoreMobile'),
    level: document.getElementById('level'),
    levelMobile: document.getElementById('levelMobile'),
    lines: document.getElementById('lines'),
    linesMobile: document.getElementById('linesMobile'),
    highScore: document.getElementById('highScore'),
    overlay: document.getElementById('gameOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayMessage: document.getElementById('overlayMessage'),
    startButton: document.getElementById('startButton'),
    pauseButton: document.getElementById('pauseButton'),
    soundButton: document.getElementById('soundButton'),
    restartButton: document.getElementById('restartButton'),
    pauseBadge: document.getElementById('pauseBadge'),
    particleLayer: document.getElementById('particleLayer'),
    boardWrap: document.getElementById('boardWrap')
};

let board = makeBoard();
let activePiece = null;
let nextPiece = null;
let bag = [];
let score = 0;
let lines = 0;
let level = 1;
let highScore = readHighScore();
let running = false;
let paused = false;
let gameOver = false;
let soundEnabled = true;
let lastTime = 0;
let dropAccumulator = 0;
let audioContext = null;
let pointerRepeat = null;

function makeBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
}

function readHighScore() {
    try {
        return Number(localStorage.getItem('survivaloffice-tetris-highscore')) || 0;
    } catch {
        return 0;
    }
}

function writeHighScore() {
    if (score <= highScore) return;
    highScore = score;
    try {
        localStorage.setItem('survivaloffice-tetris-highscore', String(highScore));
    } catch {
        // Storage can be disabled without affecting gameplay.
    }
}

function refillBag() {
    bag = Object.keys(SHAPES);
    for (let i = bag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
}

function takeFromBag() {
    if (bag.length === 0) refillBag();
    const type = bag.pop();
    return {
        type,
        matrix: cloneMatrix(SHAPES[type]),
        x: 0,
        y: -1
    };
}

function spawnPiece() {
    activePiece = nextPiece || takeFromBag();
    nextPiece = takeFromBag();
    activePiece.matrix = cloneMatrix(SHAPES[activePiece.type]);
    activePiece.x = Math.floor((COLS - activePiece.matrix[0].length) / 2);
    activePiece.y = activePiece.type === 'I' ? -2 : -1;
    drawNext();

    if (collides(activePiece.matrix, activePiece.x, activePiece.y)) {
        finishGame();
    }
}

function startGame() {
    ensureAudio();
    board = makeBoard();
    activePiece = null;
    nextPiece = null;
    bag = [];
    score = 0;
    lines = 0;
    level = 1;
    running = true;
    paused = false;
    gameOver = false;
    dropAccumulator = 0;
    lastTime = performance.now();
    ui.overlay.classList.add('hidden');
    ui.pauseBadge.classList.remove('show');
    ui.pauseButton.disabled = false;
    ui.pauseButton.textContent = '⏸ 일시정지';
    updateStats();
    spawnPiece();
    playTone('start');
    draw();
    window.dispatchEvent(new CustomEvent('tetris-game-start'));
}

function restartGame() {
    startGame();
}

function collides(matrix, offsetX, offsetY) {
    for (let y = 0; y < matrix.length; y += 1) {
        for (let x = 0; x < matrix[y].length; x += 1) {
            if (!matrix[y][x]) continue;
            const boardX = offsetX + x;
            const boardY = offsetY + y;
            if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
            if (boardY >= 0 && board[boardY][boardX]) return true;
        }
    }
    return false;
}

function movePiece(direction, withSound = true) {
    if (!canPlay()) return false;
    const nextX = activePiece.x + direction;
    if (collides(activePiece.matrix, nextX, activePiece.y)) {
        if (withSound) playTone('bump');
        return false;
    }
    activePiece.x = nextX;
    if (withSound) playTone('move');
    draw();
    return true;
}

function softDrop(manual = false) {
    if (!canPlay()) return false;
    if (!collides(activePiece.matrix, activePiece.x, activePiece.y + 1)) {
        activePiece.y += 1;
        if (manual) {
            score += 1;
            updateStats();
        }
        draw();
        return true;
    }
    lockPiece();
    return false;
}

function hardDrop() {
    if (!canPlay()) return;
    let distance = 0;
    while (!collides(activePiece.matrix, activePiece.x, activePiece.y + 1)) {
        activePiece.y += 1;
        distance += 1;
    }
    score += distance * 2;
    updateStats();
    playTone('drop');
    ui.boardWrap.classList.remove('shake');
    void ui.boardWrap.offsetWidth;
    ui.boardWrap.classList.add('shake');
    lockPiece();
}

function rotatePiece() {
    if (!canPlay() || activePiece.type === 'O') return;
    const rotated = rotateMatrix(activePiece.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
        if (!collides(rotated, activePiece.x + kick, activePiece.y)) {
            activePiece.matrix = rotated;
            activePiece.x += kick;
            playTone('rotate');
            draw();
            return;
        }
    }
    playTone('bump');
}

function rotateMatrix(matrix) {
    const height = matrix.length;
    const width = matrix[0].length;
    return Array.from({ length: width }, (_, y) =>
        Array.from({ length: height }, (_, x) => matrix[height - 1 - x][y])
    );
}

function lockPiece() {
    let lockedAboveBoard = false;
    activePiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (!value) return;
            const boardY = activePiece.y + y;
            const boardX = activePiece.x + x;
            if (boardY < 0) {
                lockedAboveBoard = true;
                return;
            }
            board[boardY][boardX] = activePiece.type;
        });
    });

    if (lockedAboveBoard) {
        finishGame();
        return;
    }

    const clearedRows = clearCompletedLines();
    playTone(clearedRows.length ? 'clear' : 'lock', clearedRows.length);
    spawnPiece();
    draw();
}

function clearCompletedLines() {
    const completed = [];
    for (let y = ROWS - 1; y >= 0; y -= 1) {
        if (board[y].every(Boolean)) completed.push(y);
    }
    if (completed.length === 0) return completed;

    const completedRows = new Set(completed);
    board = board.filter((_, rowIndex) => !completedRows.has(rowIndex));
    while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(null));
    }

    const count = completed.length;
    lines += count;
    level = Math.floor(lines / 10) + 1;
    const gained = LINE_POINTS[count] * level;
    score += gained;
    writeHighScore();
    updateStats();
    createLineEffect(completed, count, gained);
    return completed;
}

function finishGame() {
    running = false;
    paused = false;
    gameOver = true;
    writeHighScore();
    updateStats();
    ui.pauseButton.disabled = true;
    ui.pauseBadge.classList.remove('show');
    ui.overlayTitle.textContent = '오늘도 수고했어요!';
    ui.overlayMessage.textContent = `최종 점수 ${score.toLocaleString()}점 · ${lines}줄 완성`;
    ui.startButton.textContent = '한 판 더!';
    ui.overlay.classList.remove('hidden');
    playTone('gameover');
    createConfetti(36);
    window.dispatchEvent(new CustomEvent('tetris-game-over', {
        detail: { score, lines, level }
    }));
}

function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    ui.pauseBadge.classList.toggle('show', paused);
    ui.pauseButton.textContent = paused ? '▶ 계속하기' : '⏸ 일시정지';
    if (!paused) {
        lastTime = performance.now();
        dropAccumulator = 0;
    }
    playTone(paused ? 'pause' : 'resume');
    draw();
}

function canPlay() {
    return running && !paused && !gameOver && activePiece;
}

function gravityInterval() {
    return Math.max(85, 850 * Math.pow(0.84, level - 1));
}

function gameLoop(time = 0) {
    const delta = Math.min(100, time - lastTime || 0);
    lastTime = time;
    if (canPlay()) {
        dropAccumulator += delta;
        if (dropAccumulator >= gravityInterval()) {
            dropAccumulator = 0;
            softDrop(false);
        }
    }
    requestAnimationFrame(gameLoop);
}

function updateStats() {
    const formattedScore = score.toLocaleString();
    ui.score.textContent = formattedScore;
    ui.scoreMobile.textContent = formattedScore;
    ui.level.textContent = String(level);
    ui.levelMobile.textContent = String(level);
    ui.lines.textContent = String(lines);
    ui.linesMobile.textContent = String(lines);
    ui.highScore.textContent = Math.max(highScore, score).toLocaleString();
}

function draw() {
    drawBoardBackground();
    drawSettledBlocks();
    if (activePiece && !gameOver) {
        drawGhost();
        drawMatrix(ctx, activePiece.matrix, activePiece.x * CELL, activePiece.y * CELL, activePiece.type, CELL, 1, true);
    }
    if (paused) {
        ctx.fillStyle = 'rgba(36, 36, 61, 0.52)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawBoardBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#292944');
    gradient.addColorStop(1, '#202036');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x += 1) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, canvas.height);
        ctx.stroke();
    }
    for (let y = 1; y < ROWS; y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(canvas.width, y * CELL);
        ctx.stroke();
    }
}

function drawSettledBlocks() {
    board.forEach((row, y) => {
        row.forEach((type, x) => {
            if (type) drawCell(ctx, x * CELL, y * CELL, CELL, type, 1, false);
        });
    });
}

function drawGhost() {
    let ghostY = activePiece.y;
    while (!collides(activePiece.matrix, activePiece.x, ghostY + 1)) ghostY += 1;
    drawMatrix(ctx, activePiece.matrix, activePiece.x * CELL, ghostY * CELL, activePiece.type, CELL, 0.2, false);
}

function drawMatrix(target, matrix, offsetX, offsetY, type, size, alpha = 1, face = false) {
    const filledCells = [];
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (!value) return;
            const cellX = offsetX + x * size;
            const cellY = offsetY + y * size;
            if (cellY > -size) {
                drawCell(target, cellX, cellY, size, type, alpha, false);
                filledCells.push({ x: cellX, y: cellY });
            }
        });
    });

    if (face && alpha > 0.8 && filledCells.length) {
        const middle = filledCells[Math.floor(filledCells.length / 2)];
        drawFace(target, middle.x, middle.y, size);
    }
}

function drawCell(target, x, y, size, type, alpha = 1) {
    const [light, dark] = COLORS[type];
    const gap = Math.max(2, size * 0.075);
    const radius = Math.max(4, size * 0.25);
    target.save();
    target.globalAlpha = alpha;
    const gradient = target.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, light);
    gradient.addColorStop(1, dark);
    target.fillStyle = gradient;
    roundedRect(target, x + gap, y + gap, size - gap * 2, size - gap * 2, radius);
    target.fill();

    target.fillStyle = 'rgba(255, 255, 255, 0.34)';
    roundedRect(target, x + size * 0.18, y + size * 0.16, size * 0.5, size * 0.13, size * 0.08);
    target.fill();
    target.restore();
}

function drawFace(target, x, y, size) {
    const eyeY = y + size * 0.53;
    target.save();
    target.fillStyle = 'rgba(53, 48, 69, 0.78)';
    target.beginPath();
    target.arc(x + size * 0.38, eyeY, Math.max(1.4, size * 0.045), 0, Math.PI * 2);
    target.arc(x + size * 0.62, eyeY, Math.max(1.4, size * 0.045), 0, Math.PI * 2);
    target.fill();
    target.strokeStyle = 'rgba(53, 48, 69, 0.75)';
    target.lineWidth = Math.max(1, size * 0.035);
    target.beginPath();
    target.arc(x + size * 0.5, y + size * 0.58, size * 0.12, 0.15, Math.PI - 0.15);
    target.stroke();
    target.restore();
}

function roundedRect(target, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    target.beginPath();
    target.moveTo(x + r, y);
    target.arcTo(x + width, y, x + width, y + height, r);
    target.arcTo(x + width, y + height, x, y + height, r);
    target.arcTo(x, y + height, x, y, r);
    target.arcTo(x, y, x + width, y, r);
    target.closePath();
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const background = nextCtx.createLinearGradient(0, 0, nextCanvas.width, nextCanvas.height);
    background.addColorStop(0, '#f7f3ff');
    background.addColorStop(1, '#e9e1ff');
    nextCtx.fillStyle = background;
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextPiece) return;

    const matrix = SHAPES[nextPiece.type];
    const size = 23;
    const width = matrix[0].length * size;
    const height = matrix.length * size;
    const x = (nextCanvas.width - width) / 2;
    const y = (nextCanvas.height - height) / 2;
    drawMatrix(nextCtx, matrix, x, y, nextPiece.type, size, 1, true);
}

function createLineEffect(rows, count, gained) {
    const rect = ui.boardWrap.getBoundingClientRect();
    const colors = Object.values(COLORS).flat();
    rows.forEach(row => {
        const visualY = (row / ROWS) * rect.height;
        for (let i = 0; i < 20; i += 1) {
            const particle = document.createElement('span');
            particle.className = 'particle';
            particle.style.left = `${10 + Math.random() * 80}%`;
            particle.style.top = `${visualY}px`;
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 190}px`);
            particle.style.setProperty('--ty', `${-40 - Math.random() * 150}px`);
            particle.style.setProperty('--rot', `${Math.random() * 540 - 270}deg`);
            ui.particleLayer.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove(), { once: true });
        }
    });

    const floating = document.createElement('span');
    floating.className = 'floating-score';
    floating.textContent = count === 4 ? `TETRIS! +${gained}` : `+${gained}`;
    ui.particleLayer.appendChild(floating);
    floating.addEventListener('animationend', () => floating.remove(), { once: true });

    if (count === 4) {
        ui.boardWrap.classList.remove('shake');
        void ui.boardWrap.offsetWidth;
        ui.boardWrap.classList.add('shake');
        createConfetti(42);
    }
}

function createConfetti(amount) {
    const colors = ['#ff8d9e', '#70d8b5', '#ffd668', '#61c8f3', '#b68af1'];
    for (let i = 0; i < amount; i += 1) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.style.left = `${5 + Math.random() * 90}%`;
        particle.style.top = `${8 + Math.random() * 35}%`;
        particle.style.background = colors[i % colors.length];
        particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 260}px`);
        particle.style.setProperty('--ty', `${30 + Math.random() * 250}px`);
        particle.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
        ui.particleLayer.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
}

function ensureAudio() {
    if (!soundEnabled || audioContext) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
}

function tone(frequency, duration, type = 'sine', volume = 0.035, delay = 0) {
    if (!soundEnabled) return;
    ensureAudio();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
}

function playTone(name, intensity = 1) {
    if (!soundEnabled) return;
    switch (name) {
        case 'start':
            tone(392, 0.12, 'sine', 0.04, 0);
            tone(523, 0.16, 'sine', 0.04, 0.1);
            tone(659, 0.2, 'sine', 0.035, 0.2);
            break;
        case 'move': tone(220, 0.045, 'sine', 0.018); break;
        case 'rotate':
            tone(420, 0.06, 'triangle', 0.025);
            tone(560, 0.07, 'triangle', 0.018, 0.035);
            break;
        case 'bump': tone(110, 0.05, 'square', 0.012); break;
        case 'lock': tone(145, 0.07, 'triangle', 0.025); break;
        case 'drop':
            tone(230, 0.06, 'triangle', 0.035);
            tone(115, 0.09, 'triangle', 0.025, 0.04);
            break;
        case 'clear': {
            const notes = intensity === 4 ? [523, 659, 784, 1047] : [440, 554, 659].slice(0, Math.max(2, intensity + 1));
            notes.forEach((note, index) => tone(note, 0.16, 'sine', 0.035, index * 0.07));
            break;
        }
        case 'pause': tone(330, 0.12, 'sine', 0.025); break;
        case 'resume': tone(494, 0.12, 'sine', 0.025); break;
        case 'gameover':
            tone(330, 0.2, 'triangle', 0.035);
            tone(247, 0.22, 'triangle', 0.03, 0.16);
            tone(165, 0.3, 'triangle', 0.025, 0.34);
            break;
        default: break;
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    ui.soundButton.setAttribute('aria-pressed', String(soundEnabled));
    ui.soundButton.textContent = soundEnabled ? '🔊 효과음 켬' : '🔇 효과음 끔';
    if (soundEnabled) {
        ensureAudio();
        playTone('resume');
    }
}

function handleAction(action) {
    switch (action) {
        case 'left': movePiece(-1); break;
        case 'right': movePiece(1); break;
        case 'rotate': rotatePiece(); break;
        case 'down': softDrop(true); break;
        case 'drop': hardDrop(); break;
        default: break;
    }
}

document.addEventListener('keydown', event => {
    const key = event.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(key)) {
        event.preventDefault();
    }

    if (key === 'Enter' && (!running || gameOver)) {
        startGame();
        return;
    }
    if (key.toLowerCase() === 'r') {
        restartGame();
        return;
    }
    if (key.toLowerCase() === 'p') {
        togglePause();
        return;
    }
    if (!canPlay()) return;

    switch (key) {
        case 'ArrowLeft': movePiece(-1); break;
        case 'ArrowRight': movePiece(1); break;
        case 'ArrowUp': if (!event.repeat) rotatePiece(); break;
        case 'ArrowDown': softDrop(true); break;
        case ' ': if (!event.repeat) hardDrop(); break;
        default: break;
    }
});

document.querySelectorAll('.control-button').forEach(button => {
    const action = button.dataset.action;
    const repeatable = ['left', 'right', 'down'].includes(action);

    button.addEventListener('pointerdown', event => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        button.classList.add('pressed');
        handleAction(action);
        if (repeatable) {
            clearInterval(pointerRepeat);
            pointerRepeat = setInterval(() => handleAction(action), action === 'down' ? 70 : 115);
        }
    });

    const stop = () => {
        button.classList.remove('pressed');
        clearInterval(pointerRepeat);
        pointerRepeat = null;
    };
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
});

let gestureStart = null;
canvas.addEventListener('pointerdown', event => {
    gestureStart = { x: event.clientX, y: event.clientY, time: performance.now() };
});

canvas.addEventListener('pointerup', event => {
    if (!gestureStart || !canPlay()) return;
    const dx = event.clientX - gestureStart.x;
    const dy = event.clientY - gestureStart.y;
    const elapsed = performance.now() - gestureStart.time;
    gestureStart = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18 && elapsed < 350) {
        rotatePiece();
    } else if (Math.abs(dx) > Math.abs(dy)) {
        movePiece(dx > 0 ? 1 : -1);
    } else if (dy > 50) {
        hardDrop();
    }
});

ui.startButton.addEventListener('click', startGame);
ui.restartButton.addEventListener('click', restartGame);
ui.pauseButton.addEventListener('click', togglePause);
ui.soundButton.addEventListener('click', toggleSound);

window.addEventListener('blur', () => {
    if (running && !paused && !gameOver) togglePause();
});

updateStats();
drawBoardBackground();
drawNext();
requestAnimationFrame(gameLoop);
