const CONFIG = {
    easy: { label: '쉬움', blanks: 38, base: 10000, timePenalty: 2, reward: 40 },
    normal: { label: '보통', blanks: 45, base: 15000, timePenalty: 3, reward: 60 },
    hard: { label: '어려움', blanks: 50, base: 22000, timePenalty: 4, reward: 80 }
};

const ui = {
    board: document.getElementById('sudokuBoard'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    mistakes: document.getElementById('mistakes'),
    bestScore: document.getElementById('bestScore'),
    message: document.getElementById('gameMessage'),
    hintCount: document.getElementById('hintCount'),
    hintButton: document.getElementById('hintButton'),
    pauseButton: document.getElementById('pauseButton'),
    eraseButton: document.getElementById('eraseButton'),
    newGameButton: document.getElementById('newGameButton'),
    numberPad: document.getElementById('numberPad'),
    overlay: document.getElementById('gameOverlay'),
    resultIcon: document.getElementById('resultIcon'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    resultScore: document.getElementById('resultScore'),
    overlayButton: document.getElementById('overlayButton')
};

let difficulty = 'normal';
let solution = [];
let puzzle = [];
let board = [];
let selected = null;
let wrongCell = null;
let hintedCells = new Set();
let elapsed = 0;
let mistakes = 0;
let hintsLeft = 3;
let hintsUsed = 0;
let userFilled = 0;
let running = false;
let paused = false;
let finished = false;
let overlayMode = 'new';
let timerId = null;
let audioContext = null;

function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function createSolvedBoard() {
    const groups = shuffle([0, 1, 2]);
    const rows = groups.flatMap(group => shuffle([0, 1, 2]).map(row => group * 3 + row));
    const columnGroups = shuffle([0, 1, 2]);
    const columns = columnGroups.flatMap(group => shuffle([0, 1, 2]).map(column => group * 3 + column));
    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const pattern = (row, column) => (row * 3 + Math.floor(row / 3) + column) % 9;
    return rows.map(row => columns.map(column => numbers[pattern(row, column)]));
}

function candidatesFor(grid, row, column) {
    const used = new Set(grid[row]);
    for (let index = 0; index < 9; index += 1) used.add(grid[index][column]);
    const boxRow = Math.floor(row / 3) * 3;
    const boxColumn = Math.floor(column / 3) * 3;
    for (let y = boxRow; y < boxRow + 3; y += 1) {
        for (let x = boxColumn; x < boxColumn + 3; x += 1) used.add(grid[y][x]);
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(number => !used.has(number));
}

function countSolutions(grid, limit = 2) {
    let target = null;
    let options = null;
    for (let row = 0; row < 9; row += 1) {
        for (let column = 0; column < 9; column += 1) {
            if (grid[row][column] !== 0) continue;
            const nextOptions = candidatesFor(grid, row, column);
            if (nextOptions.length === 0) return 0;
            if (!options || nextOptions.length < options.length) {
                target = { row, column };
                options = nextOptions;
            }
        }
    }
    if (!target) return 1;

    let count = 0;
    for (const number of options) {
        grid[target.row][target.column] = number;
        count += countSolutions(grid, limit - count);
        grid[target.row][target.column] = 0;
        if (count >= limit) break;
    }
    return count;
}

function createPuzzle(solved, blankTarget) {
    const nextPuzzle = solved.map(row => [...row]);
    const cells = shuffle(Array.from({ length: 81 }, (_, index) => index));
    let removed = 0;
    for (const index of cells) {
        if (removed >= blankTarget) break;
        const row = Math.floor(index / 9);
        const column = index % 9;
        const previous = nextPuzzle[row][column];
        nextPuzzle[row][column] = 0;
        const testGrid = nextPuzzle.map(line => [...line]);
        if (countSolutions(testGrid) === 1) removed += 1;
        else nextPuzzle[row][column] = previous;
    }
    return nextPuzzle;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const rest = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
}

function getScore() {
    const config = CONFIG[difficulty];
    return Math.max(100, config.base - elapsed * config.timePenalty - mistakes * 700 - hintsUsed * 1200 + userFilled * config.reward);
}

function bestScoreKey() {
    return `survivaloffice-sudoku-best-${difficulty}`;
}

function updateStatus() {
    ui.timer.textContent = formatTime(elapsed);
    ui.score.textContent = getScore().toLocaleString('ko-KR');
    ui.mistakes.textContent = mistakes;
    ui.hintCount.textContent = hintsLeft;
    ui.hintButton.disabled = hintsLeft === 0 || finished;
    ui.bestScore.textContent = Number(localStorage.getItem(bestScoreKey()) || 0).toLocaleString('ko-KR');

    const numberCounts = Array(10).fill(0);
    board.flat().forEach(number => { if (number) numberCounts[number] += 1; });
    ui.numberPad.querySelectorAll('[data-number]').forEach(button => {
        button.classList.toggle('done', numberCounts[Number(button.dataset.number)] >= 9);
    });
}

function setMessage(text, kind = '') {
    ui.message.textContent = text;
    ui.message.className = `message ${kind}`.trim();
}

function isRelated(row, column) {
    if (!selected) return false;
    return row === selected.row || column === selected.column ||
        (Math.floor(row / 3) === Math.floor(selected.row / 3) && Math.floor(column / 3) === Math.floor(selected.column / 3));
}

function renderBoard() {
    ui.board.innerHTML = '';
    const selectedValue = selected ? board[selected.row][selected.column] : 0;
    for (let row = 0; row < 9; row += 1) {
        for (let column = 0; column < 9; column += 1) {
            const value = board[row][column];
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cell';
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-label', `${row + 1}행 ${column + 1}열${value ? `, 숫자 ${value}` : ', 빈칸'}`);
            cell.dataset.row = row;
            cell.dataset.column = column;
            cell.style.setProperty('--order', row * 9 + column);
            cell.textContent = value || '';
            if (puzzle[row][column]) cell.classList.add('given');
            if (column === 2 || column === 5) cell.classList.add('box-right');
            if (row === 2 || row === 5) cell.classList.add('box-bottom');
            if (isRelated(row, column)) cell.classList.add('related');
            if (selectedValue && value === selectedValue) cell.classList.add('same-number');
            if (selected && selected.row === row && selected.column === column) cell.classList.add('selected');
            if (wrongCell && wrongCell.row === row && wrongCell.column === column) cell.classList.add('wrong');
            if (hintedCells.has(`${row}-${column}`)) cell.classList.add('hint');
            cell.addEventListener('click', () => selectCell(row, column));
            ui.board.appendChild(cell);
        }
    }
    updateStatus();
}

function selectCell(row, column) {
    if (!running || paused || finished) return;
    selected = { row, column };
    renderBoard();
}

function findFirstEmpty() {
    for (let row = 0; row < 9; row += 1) {
        for (let column = 0; column < 9; column += 1) {
            if (board[row][column] === 0) return { row, column };
        }
    }
    return null;
}

function moveSelection(rowDelta, columnDelta) {
    if (!selected) selected = findFirstEmpty() || { row: 0, column: 0 };
    else selected = {
        row: (selected.row + rowDelta + 9) % 9,
        column: (selected.column + columnDelta + 9) % 9
    };
    renderBoard();
}

function inputNumber(number) {
    if (!running || paused || finished) return;
    if (!selected) selected = findFirstEmpty();
    if (!selected || puzzle[selected.row][selected.column]) {
        setMessage('빈칸을 먼저 선택해주세요.', 'bad');
        return;
    }

    const { row, column } = selected;
    if (number === solution[row][column]) {
        if (board[row][column] === 0) userFilled += 1;
        board[row][column] = number;
        hintedCells.delete(`${row}-${column}`);
        playSound('correct');
        setMessage('좋아요! 정확한 숫자예요.', 'good');
        renderBoard();
        checkCompletion();
        return;
    }

    mistakes += 1;
    wrongCell = { row, column };
    playSound('wrong');
    setMessage(`앗, 다시 생각해 볼까요? 실수 ${mistakes}/3`, 'bad');
    renderBoard();
    window.setTimeout(() => { wrongCell = null; renderBoard(); }, 320);
    if (mistakes >= 3) finishGame(false);
}

function eraseSelected() {
    if (!selected || !running || paused || finished) return;
    const { row, column } = selected;
    if (puzzle[row][column] || hintedCells.has(`${row}-${column}`)) return;
    if (board[row][column]) {
        board[row][column] = 0;
        userFilled = Math.max(0, userFilled - 1);
        renderBoard();
    }
}

function useHint() {
    if (!running || paused || finished || hintsLeft === 0) return;
    const empties = [];
    for (let row = 0; row < 9; row += 1) {
        for (let column = 0; column < 9; column += 1) {
            if (board[row][column] === 0) empties.push({ row, column });
        }
    }
    if (!empties.length) return;
    const target = selected && board[selected.row][selected.column] === 0 ? selected : empties[Math.floor(Math.random() * empties.length)];
    board[target.row][target.column] = solution[target.row][target.column];
    hintedCells.add(`${target.row}-${target.column}`);
    selected = { ...target };
    hintsLeft -= 1;
    hintsUsed += 1;
    playSound('hint');
    setMessage('반짝 힌트가 숫자 하나를 채워줬어요.', 'good');
    renderBoard();
    checkCompletion();
}

function checkCompletion() {
    if (board.every(row => row.every(Boolean))) finishGame(true);
}

function showOverlay(icon, title, message, scoreText, buttonText, mode) {
    overlayMode = mode;
    ui.resultIcon.textContent = icon;
    ui.resultTitle.textContent = title;
    ui.resultMessage.textContent = message;
    ui.resultScore.textContent = scoreText;
    ui.overlayButton.textContent = buttonText;
    ui.overlay.hidden = false;
}

function finishGame(success) {
    running = false;
    finished = true;
    paused = false;
    if (success) {
        const finalScore = getScore();
        const previousBest = Number(localStorage.getItem(bestScoreKey()) || 0);
        if (finalScore > previousBest) localStorage.setItem(bestScoreKey(), finalScore);
        ui.board.querySelectorAll('.cell').forEach(cell => cell.classList.add('completed'));
        playSound('win');
        showOverlay('🌟', '스도쿠 완성!', `${CONFIG[difficulty].label} 난이도를 ${formatTime(elapsed)}에 풀었어요.`, `${finalScore.toLocaleString('ko-KR')}점`, '한 판 더', 'new');
    } else {
        playSound('gameover');
        showOverlay('🌧️', '조금 아쉬워요', '실수 3번을 사용했어요. 새로운 퍼즐로 다시 도전해 보세요!', '', '다시 도전', 'new');
    }
    updateStatus();
}

function togglePause() {
    if (finished || !running) return;
    paused = !paused;
    if (paused) {
        ui.pauseButton.innerHTML = '<span>▶</span>계속하기';
        showOverlay('☕', '잠깐 쉬어요', '시간과 점수도 함께 멈춰 있어요.', '', '계속하기', 'resume');
    } else {
        ui.pauseButton.innerHTML = '<span>Ⅱ</span>잠시 멈춤';
        ui.overlay.hidden = true;
        setMessage('다시 차근차근 풀어볼까요?');
    }
}

function startNewGame() {
    running = false;
    finished = false;
    paused = false;
    ui.overlay.hidden = true;
    ui.pauseButton.innerHTML = '<span>Ⅱ</span>잠시 멈춤';
    setMessage('새 퍼즐을 만드는 중이에요…');
    solution = createSolvedBoard();
    puzzle = createPuzzle(solution, CONFIG[difficulty].blanks);
    board = puzzle.map(row => [...row]);
    selected = findFirstEmpty();
    wrongCell = null;
    hintedCells = new Set();
    elapsed = 0;
    mistakes = 0;
    hintsLeft = 3;
    hintsUsed = 0;
    userFilled = 0;
    running = true;
    setMessage('빈칸을 선택하고 숫자를 눌러주세요.');
    renderBoard();
}

function playSound(type) {
    try {
        audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        const notes = type === 'win' ? [523, 659, 784, 1047] : type === 'wrong' || type === 'gameover' ? [180, 145] : type === 'hint' ? [660, 880] : [520, 690];
        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = type === 'wrong' ? 'triangle' : 'sine';
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, now + index * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.09 + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.16);
            oscillator.connect(gain).connect(audioContext.destination);
            oscillator.start(now + index * 0.09);
            oscillator.stop(now + index * 0.09 + 0.18);
        });
    } catch (error) {
        console.info('이 브라우저에서는 효과음을 재생할 수 없습니다.');
    }
}

document.querySelectorAll('[data-difficulty]').forEach(button => {
    button.addEventListener('click', () => {
        difficulty = button.dataset.difficulty;
        document.querySelectorAll('[data-difficulty]').forEach(item => item.classList.toggle('active', item === button));
        startNewGame();
    });
});

ui.numberPad.addEventListener('click', event => {
    const button = event.target.closest('[data-number]');
    if (button) inputNumber(Number(button.dataset.number));
});
ui.eraseButton.addEventListener('click', eraseSelected);
ui.hintButton.addEventListener('click', useHint);
ui.pauseButton.addEventListener('click', togglePause);
ui.newGameButton.addEventListener('click', startNewGame);
ui.overlayButton.addEventListener('click', () => overlayMode === 'resume' ? togglePause() : startNewGame());

document.addEventListener('keydown', event => {
    if (/^[1-9]$/.test(event.key)) inputNumber(Number(event.key));
    else if (event.key === 'ArrowUp') moveSelection(-1, 0);
    else if (event.key === 'ArrowDown') moveSelection(1, 0);
    else if (event.key === 'ArrowLeft') moveSelection(0, -1);
    else if (event.key === 'ArrowRight') moveSelection(0, 1);
    else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') eraseSelected();
    else if (event.key.toLowerCase() === 'h') useHint();
    else if (event.key.toLowerCase() === 'p' || event.key === 'Escape') togglePause();
});

window.addEventListener('blur', () => {
    if (running && !paused && !finished) togglePause();
});

timerId = window.setInterval(() => {
    if (!running || paused || finished) return;
    elapsed += 1;
    updateStatus();
}, 1000);

startNewGame();
