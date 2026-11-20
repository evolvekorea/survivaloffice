const stages = [
  { name: '산길', ink: '#176352', rows: ['00100', '01110', '01110', '11111', '11111'] },
  { name: '섬을 잇는 배', ink: '#215f82', rows: ['00100', '00110', '00100', '11111', '01110'] },
  { name: '옛 성문', ink: '#a14328', rows: ['01110', '11111', '11011', '10001', '10001'] },
];

const byId = (id) => document.getElementById(id);
const game = byId('game');
const board = byId('board');
const finish = byId('finish');
const ink = byId('ink');
const mark = byId('mark');
const hint = byId('hint');
const reset = byId('reset');
const next = byId('next');
const message = byId('message');

let stageIndex = 0;
let solution;
let cells;
let cellButtons;
let mode;
let solved;

function clues(line) {
  return (line.match(/1+/g) ?? []).map((group) => group.length);
}

function makeClue(values, direction, index) {
  const element = document.createElement('div');
  element.className = 'clue ' + direction;
  element.setAttribute('aria-label', (index + 1) + (direction === 'row' ? '행 ' : '열 ') + (values.join(', ') || '0'));
  for (const value of values.length ? values : [0]) {
    const number = document.createElement('span');
    number.textContent = value;
    element.append(number);
  }
  return element;
}

function changeMode(value) {
  mode = value;
  ink.setAttribute('aria-pressed', String(mode === 'filled'));
  mark.setAttribute('aria-pressed', String(mode === 'marked'));
}

function openStage(index) {
  stageIndex = index;
  const stage = stages[index];
  solution = stage.rows.join('').split('').map(Number);
  cells = Array(25).fill('');
  cellButtons = [];
  solved = false;
  game.hidden = false;
  finish.hidden = true;
  game.style.setProperty('--ink', stage.ink);
  byId('progress').textContent = '스탬프 ' + (index + 1) + ' / ' + stages.length;
  byId('stage-title').textContent = stage.name;
  message.textContent = '가장 긴 숫자가 있는 줄부터 살펴보세요.';
  next.hidden = true;
  for (const button of [hint, ink, mark, reset]) button.disabled = false;
  changeMode('filled');

  const corner = document.createElement('div');
  corner.className = 'corner';
  board.replaceChildren(corner);
  for (let col = 0; col < 5; col++) {
    board.append(makeClue(clues(stage.rows.map((row) => row[col]).join('')), 'column', col));
  }
  for (const [row, line] of stage.rows.entries()) {
    board.append(makeClue(clues(line), 'row', row));
    for (let col = 0; col < 5; col++) {
      const position = row * 5 + col;
      const button = document.createElement('button');
      button.className = 'cell';
      button.addEventListener('click', () => {
        if (!solved) updateCell(position, cells[position] === mode ? '' : mode);
      });
      cellButtons.push(button);
      board.append(button);
      renderCell(position);
    }
  }
  byId('stage-title').focus({ preventScroll: true });
  game.scrollIntoView({ block: 'start' });
}

function renderCell(position) {
  const state = cells[position];
  const cell = cellButtons[position];
  cell.dataset.state = state;
  cell.textContent = state === 'marked' ? '×' : '';
  const row = Math.floor(position / 5) + 1;
  const col = position % 5 + 1;
  const label = { filled: '칠함', marked: '빈칸으로 표시', '': '미선택' };
  cell.setAttribute('aria-label', row + '행 ' + col + '열, ' + label[state]);
}

function updateCell(position, value) {
  cells[position] = value;
  renderCell(position);
  if (!cells.every((cell, i) => Number(cell === 'filled') === solution[i])) return;

  solved = true;
  message.textContent = '스탬프를 찍었어요!';
  for (const button of [hint, ink, mark, reset, ...cellButtons]) button.disabled = true;
  next.textContent = stageIndex + 1 === stages.length ? '여행 수첩 보기' : '다음 스탬프';
  next.hidden = false;
  next.focus({ preventScroll: true });
}

function showCollection() {
  const collection = byId('collection');
  collection.replaceChildren();
  for (const stage of stages) {
    const stamp = document.createElement('figure');
    stamp.className = 'stamp';
    stamp.style.setProperty('--ink', stage.ink);
    const pattern = document.createElement('div');
    pattern.className = 'stamp-pattern';
    pattern.setAttribute('aria-hidden', 'true');
    for (const value of stage.rows.join('')) {
      const pixel = document.createElement('i');
      if (value === '1') pixel.className = 'printed';
      pattern.append(pixel);
    }
    const label = document.createElement('figcaption');
    label.textContent = stage.name;
    stamp.append(pattern, label);
    collection.append(stamp);
  }
  game.hidden = true;
  finish.hidden = false;
  byId('share-status').textContent = '';
  byId('finish-title').focus({ preventScroll: true });
  finish.scrollIntoView({ block: 'start' });
}

byId('start').addEventListener('click', () => {
  byId('intro').hidden = true;
  openStage(0);
});
byId('replay').addEventListener('click', () => openStage(0));
reset.addEventListener('click', () => openStage(stageIndex));
ink.addEventListener('click', () => changeMode('filled'));
mark.addEventListener('click', () => changeMode('marked'));
hint.addEventListener('click', () => {
  const position = cells.findIndex((cell, index) => Number(cell === 'filled') !== solution[index]);
  if (position < 0) return;
  updateCell(position, solution[position] ? 'filled' : 'marked');
  if (!solved) message.textContent = cellButtons[position].getAttribute('aria-label') + ' · 힌트 적용';
});
next.addEventListener('click', () => {
  if (stageIndex + 1 < stages.length) openStage(stageIndex + 1);
  else showCollection();
});
byId('share').addEventListener('click', async () => {
  const url = document.querySelector('link[rel="canonical"]').href;
  const title = '여행 스탬프 네모로직';
  try {
    if (navigator.share) await navigator.share({ title, text: '여행 스탬프 3개를 모았어요!', url });
    else {
      await navigator.clipboard.writeText(url);
      byId('share-status').textContent = '링크를 복사했어요.';
    }
  } catch (error) {
    if (error.name !== 'AbortError') byId('share-status').textContent = '주소창에서 게임 링크를 복사해 주세요.';
  }
});
