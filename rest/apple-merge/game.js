const boardElement = document.querySelector('#board');
const intro = document.querySelector('#intro');
const game = document.querySelector('#game');
const result = document.querySelector('#result');
const message = document.querySelector('#message');
const scoreElement = document.querySelector('#score');
const bestElement = document.querySelector('#best');
let board = [], score = 0, won = false, ended = false;
let animating = false, queuedDirection = null, gameVersion = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let best = 0;
try { best = Number(localStorage.getItem('apple-orchard-best')) || 0; } catch {}
bestElement.textContent = best.toLocaleString('ko-KR');

function addApple() {
  const empty = board.map((value, index) => value ? -1 : index).filter(index => index >= 0);
  if (!empty.length) return -1;
  const index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = Math.random() < 0.9 ? 2 : 4;
  return index;
}
function draw(spawnIndex = -1, mergedIndices = []) {
  boardElement.replaceChildren();
  board.forEach((value, index) => {
    const cell = document.createElement('div');
    cell.className = 'cell' + (value ? ' filled v' + Math.min(value, 128) : '');
    cell.setAttribute('aria-label', (Math.floor(index / 4) + 1) + '행 ' + (index % 4 + 1) + '열 ' + (value ? value + ' 사과' : '빈 칸'));
    if (value) {
      const apple = document.createElement('span');
      apple.className = 'apple';
      if (index === spawnIndex) apple.classList.add('spawn');
      if (mergedIndices.includes(index)) apple.classList.add('merge');
      const number = document.createElement('b'); number.textContent = value;
      apple.append(number); cell.append(apple);
    }
    boardElement.append(cell);
  });
  scoreElement.textContent = score.toLocaleString('ko-KR');
  bestElement.textContent = best.toLocaleString('ko-KR');
}
function start() {
  gameVersion++; animating = false; queuedDirection = null;
  boardElement.getAnimations({subtree:true}).forEach(animation => animation.cancel());
  board = Array(16).fill(0); score = 0; won = false; ended = false;
  addApple(); addApple(); intro.hidden = true; result.hidden = true; game.hidden = false;
  message.textContent = '같은 숫자 사과를 합쳐 128을 만들어 보세요.'; draw();
}
function canMove() {
  return board.some((value, i) => !value || (i % 4 < 3 && value === board[i + 1]) || (i < 12 && value === board[i + 4]));
}
async function move(direction) {
  if (ended) return;
  if (animating) { queuedDirection = direction; return; }
  const before = board.join(',');
  const version = gameVersion;
  const motions = [], mergedIndices = [];
  for (let lane = 0; lane < 4; lane++) {
    const indices = [];
    for (let pos = 0; pos < 4; pos++) {
      if (direction === 'left') indices.push(lane * 4 + pos);
      if (direction === 'right') indices.push(lane * 4 + 3 - pos);
      if (direction === 'up') indices.push(pos * 4 + lane);
      if (direction === 'down') indices.push((3 - pos) * 4 + lane);
    }
    const values = indices.filter(index => board[index]).map(index => ({value: board[index], source: index}));
    const merged = [];
    for (let i = 0; i < values.length; i++) {
      const destination = indices[merged.length];
      motions.push({source: values[i].source, destination});
      if (values[i + 1] && values[i].value === values[i + 1].value) {
        const n = values[i].value * 2;
        motions.push({source: values[i + 1].source, destination});
        merged.push(n); mergedIndices.push(destination); score += n; i++;
      } else merged.push(values[i].value);
    }
    indices.forEach((index, i) => { board[index] = merged[i] || 0; });
  }
  if (board.join(',') === before) { message.textContent = '그 방향으로 움직일 수 없어요. 다른 방향을 골라 보세요.'; return; }
  animating = true;
  const cells = Array.from(boardElement.children);
  const animations = [];
  if (!reducedMotion.matches) {
    for (const motion of motions) {
      if (motion.source === motion.destination) continue;
      const apple = cells[motion.source].querySelector('.apple');
      const from = cells[motion.source].getBoundingClientRect();
      const to = cells[motion.destination].getBoundingClientRect();
      if (apple) animations.push(apple.animate(
        [{transform:'translate(0, 0)'},{transform:`translate(${to.left - from.left}px, ${to.top - from.top}px)`}],
        {duration:150,easing:'cubic-bezier(.2,.7,.25,1)',fill:'forwards'}
      ).finished.catch(() => {}));
    }
  }
  await Promise.all(animations);
  if (version !== gameVersion) return;
  const spawnIndex = addApple();
  if (score > best) { best = score; try { localStorage.setItem('apple-orchard-best', String(best)); } catch {} }
  draw(spawnIndex, mergedIndices);
  if (!won && board.some(value => value >= 128)) {
    won = true; message.textContent = '128 사과 완성! 계속 이어서 기록에 도전하세요.';
  } else message.textContent = '사과를 모아 바구니를 채워 보세요!';
  if (!canMove()) {
    ended = true; game.hidden = true; result.hidden = false;
    document.querySelector('#result-title').textContent = won ? '풍성한 사과 수확!' : '바구니가 가득 찼어요!';
    document.querySelector('#result-score').textContent = '수확 점수 ' + score.toLocaleString('ko-KR') + '점 · 최고 사과 ' + Math.max(...board);
    document.querySelector('#result-title').focus();
  }
  animating = false;
  if (queuedDirection && !ended) {
    const next = queuedDirection;
    queuedDirection = null;
    move(next);
  } else queuedDirection = null;
}
document.querySelector('#start').addEventListener('click', start);
document.querySelector('#again').addEventListener('click', start);
document.querySelector('#restart').addEventListener('click', () => {
  if (window.confirm('지금 판을 끝내고 새로 시작할까요?')) start();
});
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => move(button.dataset.direction)));
window.addEventListener('keydown', event => {
  const keys = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
  if (!game.hidden && keys[event.key]) { event.preventDefault(); move(keys[event.key]); }
});
let pointerStart = null;
boardElement.addEventListener('pointerdown', event => {
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
  pointerStart = {id: event.pointerId, x: event.clientX, y: event.clientY};
  boardElement.setPointerCapture(event.pointerId);
});
boardElement.addEventListener('pointerup', event => {
  if (!pointerStart || event.pointerId !== pointerStart.id) return;
  const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});
boardElement.addEventListener('pointercancel', () => { pointerStart = null; });
document.querySelector('#share').addEventListener('click', async () => {
  const text = '사과 바구니 합치기에서 ' + score.toLocaleString('ko-KR') + '점 수확! https://survivaloffice.com/rest/apple-merge/';
  try { await navigator.clipboard.writeText(text); document.querySelector('#share-status').textContent = '기록을 복사했어요.'; }
  catch { document.querySelector('#share-status').textContent = '브라우저 주소를 복사해 공유해 주세요.'; }
});
document.querySelector('#kakao').addEventListener('click', () => {
  const url='https://survivaloffice.com/rest/apple-merge/', link={mobileWebUrl:url,webUrl:url};
  try {
    if (!window.Kakao?.Share?.sendDefault) throw new Error('Kakao unavailable');
    if (!window.Kakao.isInitialized()) window.Kakao.init('eee6c2e01641161de9f217ba99c6a0da');
    window.Kakao.Share.sendDefault({objectType:'feed',content:{title:'사과 바구니 합치기',description:'같은 숫자 사과를 합쳐 풍성한 수확에 도전해요!',imageUrl:url+'cover.webp',link},buttons:[{title:'게임하기',link}]});
  } catch { document.querySelector('#share-status').textContent = '카카오톡 공유를 열지 못했어요. 주소를 복사해 공유해 주세요.'; }
});
