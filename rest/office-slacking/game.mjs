import { OfficeGame } from './engine.mjs';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries(['stage','timer','score','suspicionValue','suspicionMeter','suspicionFill','pauseButton','soundButton','levelBadge','comboValue','bossSignal','signalIcon','signalText','bossAlert','overlay','overlayKicker','overlayTitle','overlayDescription','introChips','resultStats','startButton','secondaryButton','shareButton','overlayHint','toggleButton','toggleLabel','toggleIcon','modeLabel','modeDescription','modeDot','bestScore','floatingScore','deskNote','announcement'].map(id => [id, $(id)]));
const canvas = $('arcadeScreen');
for (const id of ['workButton', 'slackButton', 'focusButton']) ui[id] = $(id);
const compactScreen = window.matchMedia('(max-width: 760px), (max-width: 1100px) and (max-height: 500px)');
const pageSurroundings = document.querySelectorAll('.site-nav, .hero, .how-to, .more-games, .ad-container, footer');
const ctx = canvas.getContext('2d');
const BEST_KEY = 'survivaloffice-office-slacking-best-v1';
const SOUND_KEY = 'survivaloffice-office-slacking-sound-v1';
let state = 'intro', game = new OfficeGame(), lastTime = 0, animationTime = 0;
let best = 0, sound = false, audioContext, displayedPhase = '', resultSaved = false;
let loaded = false;
try {
  best = Math.max(0, Math.min(999999, Number(localStorage.getItem(BEST_KEY)) || 0));
  sound = localStorage.getItem(SOUND_KEY) === 'on';
} catch { /* Storage may be unavailable in private or restricted browsing. */ }

function track(name, data = {}) {
  // Local QA must not inflate the site's production analytics.
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  if (typeof window.gtag === 'function') window.gtag('event', name, { game: 'office_slacking', ...data });
}
function announce(message) { ui.announcement.textContent = message; }
function setFocusMode(enabled) {
  document.body.classList.toggle('game-focus', enabled);
  ui.focusButton.setAttribute('aria-pressed', String(enabled));
  ui.focusButton.setAttribute('aria-label', enabled ? '집중 화면 나가기' : '집중 화면 켜기');
  for (const element of pageSurroundings) element.inert = enabled;
}
function enableControls(enabled) {
  for (const button of [ui.toggleButton, ui.workButton, ui.slackButton]) button.disabled = !enabled;
}
function selectMode(slacking) {
  if (state === 'playing' && game.slacking !== slacking) toggle();
}
function updateSoundButton() {
  ui.soundButton.setAttribute('aria-pressed', String(sound));
  ui.soundButton.setAttribute('aria-label', sound ? '효과음 끄기' : '효과음 켜기');
}
function prepareAudio() {
  if (!sound) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext ||= new Audio();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  } catch { /* Audio is optional; play must continue without it. */ }
}
function tone(frequency, duration = .1, type = 'sine') {
  if (!sound || !audioContext || audioContext.state !== 'running') return;
  try {
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch { /* Some mobile audio contexts can close during app switching. */ }
}
function renderBest() { ui.bestScore.replaceChildren(document.createTextNode(Math.floor(best).toLocaleString('ko-KR')), Object.assign(document.createElement('small'), { textContent: '점' })); }
function setOverlay({ kicker, title, description, button, hint = '' }) {
  ui.overlayKicker.textContent = kicker;
  ui.overlayTitle.textContent = title;
  ui.overlayDescription.textContent = description;
  ui.startButton.textContent = button;
  ui.overlayHint.textContent = hint;
  ui.overlay.hidden = false;
  ui.startButton.disabled = !loaded;
}
function start() {
  if (!loaded) return;
  prepareAudio();
  const replay = state === 'result' || state === 'paused';
  game = new OfficeGame();
  state = 'playing';
  // Short phone viewports need the dedicated game view; taller phones fit the page.
  if (compactScreen.matches && window.innerHeight < 700) setFocusMode(true);
  displayedPhase = '';
  resultSaved = false;
  lastTime = performance.now();
  ui.overlay.hidden = true;
  ui.introChips.hidden = true;
  ui.resultStats.hidden = true;
  ui.secondaryButton.hidden = true;
  ui.shareButton.hidden = true;
  ui.pauseButton.disabled = false;
  enableControls(true);
  ui.floatingScore.classList.remove('pop');
  render();
  (compactScreen.matches ? ui.slackButton : ui.toggleButton).focus({ preventScroll: true });
  track(replay ? 'game_restart' : 'game_start');
  announce('출근했습니다. 딴짓 버튼으로 시작하세요.');
  tone(480);
}
function pause(reason = 'manual') {
  if (state !== 'playing') return;
  state = 'paused';
  enableControls(false);
  ui.pauseButton.disabled = true;
  ui.resultStats.hidden = true;
  ui.introChips.hidden = true;
  ui.secondaryButton.hidden = false;
  ui.shareButton.hidden = true;
  setOverlay({ kicker: '잠깐 쉬어가요', title: '딴짓도 휴식이 필요해요', description: reason === 'hidden' ? '화면을 떠나 게임을 잠시 멈췄습니다. 시간과 의심도는 그대로입니다.' : '팀장님도 잠깐 멈췄어요. 준비되면 이어서 플레이하세요.', button: '이어서 하기', hint: 'P 또는 ESC로도 이어서 할 수 있어요' });
  ui.startButton.focus({ preventScroll: true });
  announce('게임이 일시정지되었습니다.');
}
function resume() {
  if (state !== 'paused' || document.hidden) return;
  prepareAudio();
  state = 'playing';
  lastTime = performance.now();
  ui.overlay.hidden = true;
  ui.pauseButton.disabled = false;
  enableControls(true);
  (compactScreen.matches ? ui.workButton : ui.toggleButton).focus({ preventScroll: true });
  announce('게임을 계속합니다.');
}
function toggle() {
  if (state !== 'playing') return;
  prepareAudio();
  game.toggle();
  tone(game.slacking ? 660 : 390, .055);
  render();
}
function finish() {
  if (resultSaved) return;
  resultSaved = true;
  state = 'result';
  const score = Math.floor(game.score), survived = game.reason === 'survived';
  const newBest = score > best;
  let storageSaved = true;
  if (newBest) {
    best = score;
    try { localStorage.setItem(BEST_KEY, String(best)); } catch { storageSaved = false; }
    renderBest();
  }
  ui.pauseButton.disabled = true;
  enableControls(false);
  ui.introChips.hidden = true;
  ui.secondaryButton.hidden = true;
  ui.shareButton.hidden = false;
  ui.resultStats.hidden = false;
  const rank = survived ? (score >= 4000 ? '눈치의 신' : score >= 2500 ? '딴짓 고수' : score >= 1000 ? '능청스러운 대리' : '성실한 신입') : '팀장님과 면담 예약';
  ui.resultStats.replaceChildren();
  const total = Object.assign(document.createElement('strong'), { textContent: `${score.toLocaleString('ko-KR')}점` });
  const label = Object.assign(document.createElement('span'), { textContent: newBest ? '✦ 나의 최고 기록 달성!' : `이번 직장인 등급 · ${rank}` });
  const detail = document.createElement('div');
  for (const text of [`딴짓 ${game.slackTime.toFixed(1)}초`, `눈치 보너스 ${game.evades}회`]) detail.append(Object.assign(document.createElement('span'), { textContent: text }));
  ui.resultStats.append(total, label, detail);
  setOverlay({ kicker: survived ? '오늘도 무사히 퇴근' : '잠깐, 지금 뭐 하는 건가?', title: survived ? '칼퇴 성공!' : '딴짓 현행범!', description: survived ? '오늘의 월급도 무사히 지켰습니다.' : '의심도가 가득 찼어요. 다음에는 조금 더 빨리 업무로 전환해 보세요.', button: '한 번 더 도전', hint: storageSaved ? '기록은 이 브라우저에 저장됩니다.' : '저장 공간을 사용할 수 없어 이번 방문에서만 기록이 유지됩니다.' });
  ui.startButton.focus({ preventScroll: true });
  track('game_end', { score, result: game.reason, elapsed: Math.round(game.elapsed), evades: game.evades });
  announce(`${survived ? '퇴근 성공' : '딴짓 발각'}. 최종 ${score}점. ${rank}.`);
  tone(survived ? 780 : 170, .3, survived ? 'sine' : 'triangle');
}
function render() {
  const seconds = Math.ceil(game.remaining);
  ui.timer.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  ui.score.textContent = Math.floor(game.score).toLocaleString('ko-KR');
  const suspicion = Math.round(game.suspicion);
  ui.suspicionValue.textContent = `${suspicion}%`;
  ui.suspicionFill.style.width = `${game.suspicion}%`;
  ui.suspicionMeter.setAttribute('aria-valuenow', String(suspicion));
  ui.suspicionMeter.parentElement.classList.toggle('danger', suspicion >= 70);
  ui.stage.dataset.phase = game.phase;
  // Keep the caught pose on the result screen even though the engine stops slacking.
  const caught = state === 'result' && game.reason === 'caught';
  const slackingPose = game.slacking || caught;
  ui.stage.dataset.mode = slackingPose ? 'slack' : 'work';
  ui.stage.dataset.outcome = state === 'result' ? game.reason : '';
  ui.workButton.setAttribute('aria-pressed', String(!slackingPose));
  ui.slackButton.setAttribute('aria-pressed', String(slackingPose));
  $('workAwayArt').alt = slackingPose ? '직원이 고개를 돌려 몰래 딴짓하는 모습' : '모니터를 보며 업무에 집중하는 직원의 뒷모습';
  ui.comboValue.textContent = `×${game.multiplier}`;
  ui.levelBadge.textContent = ['ROUND 01 · 평화로운 오후', 'ROUND 02 · 팀장님의 촉', 'ROUND 03 · 퇴근 전 순찰'][game.level - 1];
  ui.toggleButton.classList.toggle('working-action', game.slacking);
  ui.toggleLabel.textContent = game.slacking ? '업무 화면으로 전환' : '몰래 딴짓하기';
  ui.toggleIcon.textContent = game.slacking ? '▦' : '▶';
  ui.modeDot.classList.toggle('slack', game.slacking);
  ui.modeLabel.textContent = caught ? '딴짓 발각!' : game.slacking ? '몰래 딴짓 중' : '일하는 척';
  ui.modeDescription.textContent = state === 'intro' ? '시작 버튼을 눌러 출근하세요'
    : caught ? '다음에는 경고가 뜰 때 업무로!'
    : game.slacking ? (game.phase === 'watching' ? '들키고 있어요! 지금 업무로!' : game.phase === 'warning' ? '지금 업무로 전환하세요!' : '콤보를 쌓아 점수를 높이세요')
    : game.phase === 'watching' ? '침착하게 보고서 작성하는 척'
    : game.phase === 'warning' ? '그대로 업무를 유지하세요' : '지금이 딴짓할 기회예요';
  ui.deskNote.textContent = caught ? '팀장님, 그게 아니라…' : game.slacking ? (game.phase === 'watching' ? '등 뒤가 따갑다…' : game.phase === 'warning' ? '빨리 보고서로 바꿔!' : '월급은 그대로, 행복은 두 배.') : game.phase === 'watching' ? '네, 보고서 작성 중입니다.' : '오늘도 일하는 척, 완벽하게.';
  if (displayedPhase !== game.phase) {
    displayedPhase = game.phase;
    const phase = { away: ['safe','●','팀장님은 바쁜 중'], warning: ['warning','!','앗! 팀장님이 돌아본다'], watching: ['watching','◉','지금 보고 있어요!'] }[game.phase];
    ui.bossSignal.className = `boss-signal ${phase[0]}`;
    ui.signalIcon.textContent = phase[1];
    ui.signalText.textContent = phase[2];
    if (state === 'playing') announce(phase[2]);
  }
}
function drawArcade(time) {
  if (!ctx || !game.slacking) return;
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#9eddd6'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e1f4da';
  for (let i = 0; i < 5; i++) {
    const x = ((i * 140 - time * 20) % 700 + 700) % 700 - 90;
    ctx.beginPath(); ctx.ellipse(x, 68 + (i % 2) * 25, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#86bfa0';
  for (let i = 0; i < 5; i++) { const x = i * 140 - (time * 30 % 140); ctx.beginPath(); ctx.moveTo(x-40,240); ctx.lineTo(x+50,118);ctx.lineTo(x+140,240); ctx.fill(); }
  ctx.fillStyle = '#487c60'; ctx.fillRect(0, 230, w, 70);
  ctx.fillStyle = '#b1cf75'; ctx.fillRect(0, 230, w, 12);
  ctx.fillStyle = '#d0d79c';
  for (let i = 0; i < 15; i++) ctx.fillRect((i * 45 - time * 90) % 600, 252+(i%2)*20, 15, 5);
  // An original tiny cat runner, animated while the employee is slacking.
  const jump = Math.max(0, Math.sin(time * 4.5)) * 55;
  ctx.save();ctx.translate(155, 204-jump);
  ctx.fillStyle='#f9dd9e';ctx.fillRect(-18,-23,36,35);ctx.fillRect(-22,-48,45,32);
  ctx.beginPath();ctx.moveTo(-22,-42);ctx.lineTo(-22,-64);ctx.lineTo(-6,-48);ctx.moveTo(22,-42);ctx.lineTo(22,-64);ctx.lineTo(6,-48);ctx.fill();
  ctx.fillStyle='#20483c';ctx.fillRect(-12,-38,5,6);ctx.fillRect(8,-38,5,6);ctx.fillRect(-2,-28,5,3);
  ctx.fillStyle='#e79c59';ctx.fillRect(-20,8,12,9+Math.sin(time*15)*4);ctx.fillRect(8,8,12,9-Math.sin(time*15)*4);ctx.fillRect(17,-8,19,8);
  ctx.restore();
  for(let i=0;i<4;i++){const x=((350+i*125-time*95)%600+600)%600;const y=160+Math.sin(time*3+i)*8;ctx.fillStyle='#fff0a0';ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d99439';ctx.lineWidth=3;ctx.stroke();}
  ctx.fillStyle='#173f35';ctx.font='bold 18px system-ui';ctx.fillText('LUNCH BREAK RUN',18,29);
  ctx.fillStyle='#f56e65';ctx.font='20px system-ui';ctx.fillText('♥ ♥ ♥',411,29);
  ctx.fillStyle='#f5ffe9';ctx.font='bold 15px system-ui';ctx.fillText(`SCORE ${Math.floor(game.score)}`,18,284);
}
function frame(now) {
  const elapsed = lastTime ? Math.max(0, (now-lastTime)/1000) : 0;
  lastTime = now;
  if (state === 'playing') {
    // Use elapsed time so a low frame rate does not turn 60 seconds into minutes.
    // An exceptional stall pauses instead of skipping the entire warning window.
    if (elapsed > 2) pause('hidden');
    else {
      game.update(elapsed);
      animationTime += elapsed;
      for (const event of game.drainEvents()) {
        if (event.type === 'warning') tone(720,.14,'triangle');
        if (event.type === 'watching') tone(260,.12,'triangle');
        if (event.type === 'evade') {
          ui.floatingScore.textContent = '눈치 보너스 +120';
          ui.floatingScore.classList.remove('pop');
          void ui.floatingScore.offsetWidth;
          ui.floatingScore.classList.add('pop');
          tone(940,.13);
        }
        if (event.type === 'level') announce(`${event.level}단계. 팀장님이 더 빨리 돌아봅니다.`);
        if (event.type === 'finish') finish();
      }
      render(); drawArcade(animationTime);
    }
  }
  requestAnimationFrame(frame);
}

ui.startButton.addEventListener('click', () => state === 'paused' ? resume() : start());
ui.secondaryButton.addEventListener('click', start);
ui.toggleButton.addEventListener('click', toggle);
ui.workButton.addEventListener('click', () => selectMode(false));
ui.slackButton.addEventListener('click', () => selectMode(true));
ui.focusButton.addEventListener('click', () => {
  const leaving = document.body.classList.contains('game-focus');
  if (leaving) pause();
  setFocusMode(!leaving);
});
ui.pauseButton.addEventListener('click', () => pause());
ui.soundButton.addEventListener('click', () => {
  sound = !sound;
  try { localStorage.setItem(SOUND_KEY, sound ? 'on' : 'off'); } catch { /* optional */ }
  updateSoundButton();prepareAudio();tone(520);
});
document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
  if (event.code === 'Space' && state === 'playing') {
    // Leave keyboard activation of pause/sound buttons to the browser.
    if (event.target.closest('button,a') && event.target !== ui.toggleButton) return;
    event.preventDefault();toggle();
  } else if (event.code === 'KeyP' || event.code === 'Escape') {
    if (state === 'playing' || state === 'paused') { event.preventDefault(); state === 'paused' ? resume() : pause(); }
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause('hidden'); });
window.addEventListener('pagehide', () => pause('hidden'));
// Keep dialog keyboard focus on its visible actions.
ui.overlay.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const buttons = [...ui.overlay.querySelectorAll('button')].filter(button => !button.hidden && !button.disabled);
  if (!buttons.length) return;
  const first = buttons[0], last = buttons.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
ui.shareButton.addEventListener('click', async () => {
  if (state !== 'result') return;
  const score = Math.floor(game.score), text = `상사 몰래 딴짓하기 ${score.toLocaleString('ko-KR')}점! ${game.reason === 'survived' ? '오늘도 무사히 퇴근 성공!' : '팀장님께 딱 걸렸어요.'} 대표 눈치왕은 누구?`;
  const url = 'https://survivaloffice.com/rest/office-slacking/';
  try {
    if (navigator.share) await navigator.share({ title: '상사 몰래 딴짓하기', text, url });
    else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      ui.overlayHint.textContent = '기록과 링크를 복사했어요! 친구에게 붙여넣어 보세요.';
    } else { ui.overlayHint.textContent = `${text} ${url}`; return; }
    track('share', { score });
  } catch (error) {
    if (error.name !== 'AbortError') ui.overlayHint.textContent = '공유하지 못했어요. 주소창의 링크를 복사해 주세요.';
  }
});
async function loadArt() {
  const images = [$('awayArt'), $('watchArt'), $('workAwayArt'), $('workWatchArt')];
  const readiness = await Promise.all(images.map(img => img.decode().then(() => true, () => false)));
  loaded = readiness.every(Boolean);
  if (loaded) { ui.startButton.disabled = false; ui.startButton.textContent = '몰래 출근하기 →'; }
  else {
    ui.startButton.textContent = '화면을 불러오지 못했어요';
    ui.overlayHint.textContent = '인터넷 연결을 확인한 뒤 페이지를 새로고침해 주세요.';
  }
}
renderBest();updateSoundButton();render();loadArt();requestAnimationFrame(frame);
