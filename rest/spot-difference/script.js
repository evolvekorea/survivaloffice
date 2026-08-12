(() => {
  'use strict';

  const PUZZLES = [
    { id:1, title:'포근한 사무실', points:[[.14,.17],[.68,.16],[.84,.46],[.47,.63],[.15,.75]] },
    { id:2, title:'향긋한 카페', points:[[.16,.18],[.48,.14],[.82,.20],[.29,.58],[.73,.72]] },
    { id:3, title:'햇살 좋은 공원', points:[[.14,.22],[.46,.14],[.81,.25],[.33,.63],[.72,.76]] },
    { id:4, title:'알록달록 편의점', points:[[.13,.17],[.49,.16],[.84,.25],[.27,.69],[.71,.73]] },
    { id:5, title:'따뜻한 주방', points:[[.16,.18],[.47,.15],[.82,.22],[.31,.62],[.72,.73]] },
    { id:6, title:'조용한 도서관', points:[[.14,.19],[.49,.14],[.83,.21],[.28,.64],[.72,.72]] },
    { id:7, title:'숲속 캠핑장', points:[[.15,.18],[.47,.15],[.82,.24],[.31,.61],[.72,.74]] },
    { id:8, title:'귀여운 펫숍', points:[[.14,.17],[.48,.14],[.83,.22],[.28,.65],[.73,.73]] },
    { id:9, title:'시원한 해변', points:[[.14,.19],[.47,.15],[.83,.22],[.28,.65],[.72,.75]] },
    { id:10, title:'달콤한 베이커리', points:[[.14,.17],[.48,.14],[.83,.22],[.28,.64],[.72,.74]] }
  ];

  const $ = selector => document.querySelector(selector);
  const ui = {
    startScreen: $('#startScreen'), playScreen: $('#playScreen'), finishScreen: $('#finishScreen'),
    startButton: $('#startButton'), restartButton: $('#restartButton'), round: $('#roundNumber'),
    found: $('#foundNumber'), timer: $('#timer'), progress: $('#progressBar'), sceneNumber: $('#sceneNumber'),
    sceneTitle: $('#sceneTitle'), message: $('#message'), imageA: $('#imageA'), imageB: $('#imageB'),
    pictures: [...document.querySelectorAll('.picture')], finalTime: $('#finalTime')
  };

  let gamePuzzles = [];
  let currentRound = 0;
  let found = new Set();
  let startedAt = 0;
  let timerId = null;
  let busy = false;
  let audioContext;

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function imagePath(id, side) {
    return `/images/spot-difference/puzzle-${String(id).padStart(2, '0')}-${side}.webp`;
  }

  function formatTime(milliseconds) {
    const tenths = Math.floor(milliseconds / 100) % 10;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
  }

  function updateTimer() {
    ui.timer.textContent = formatTime(performance.now() - startedAt);
  }

  async function preload(puzzles) {
    const paths = puzzles.flatMap(puzzle => [imagePath(puzzle.id, 'a'), imagePath(puzzle.id, 'b')]);
    await Promise.all(paths.map(source => new Promise(resolve => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = source;
    })));
  }

  async function startGame() {
    if (busy) return;
    busy = true;
    ui.startButton.disabled = true;
    ui.startButton.textContent = '그림 준비 중...';
    gamePuzzles = shuffle(PUZZLES).slice(0, 3);
    await preload(gamePuzzles);
    currentRound = 0;
    startedAt = performance.now();
    clearInterval(timerId);
    timerId = setInterval(updateTimer, 100);
    ui.startScreen.hidden = true;
    ui.finishScreen.hidden = true;
    ui.playScreen.hidden = false;
    await loadPuzzle();
    busy = false;
    ui.startButton.disabled = false;
    ui.startButton.textContent = '게임 시작';
  }

  async function loadPuzzle() {
    busy = true;
    found = new Set();
    const puzzle = gamePuzzles[currentRound];
    ui.round.textContent = currentRound + 1;
    ui.found.textContent = '0';
    ui.sceneNumber.textContent = `SCENE ${String(puzzle.id).padStart(2, '0')}`;
    ui.sceneTitle.textContent = puzzle.title;
    ui.message.textContent = '다른 부분 5개를 찾아보세요!';
    ui.progress.style.width = `${currentRound / 3 * 100}%`;
    ui.pictures.forEach(picture => {
      picture.classList.remove('solved');
      picture.querySelector('.markers').replaceChildren();
      picture.disabled = true;
    });
    ui.imageA.src = imagePath(puzzle.id, 'a');
    ui.imageB.src = imagePath(puzzle.id, 'b');
    await Promise.all([ui.imageA.decode().catch(() => {}), ui.imageB.decode().catch(() => {})]);
    ui.pictures.forEach(picture => { picture.disabled = false; });
    busy = false;
  }

  function addFoundMarker(point) {
    ui.pictures.forEach(picture => {
      const marker = document.createElement('i');
      marker.className = 'found-marker';
      marker.style.left = `${point[0] * 100}%`;
      marker.style.top = `${point[1] * 100}%`;
      picture.querySelector('.markers').append(marker);
    });
  }

  function showMiss(picture, x, y) {
    const marker = document.createElement('i');
    marker.className = 'miss-marker';
    marker.style.left = `${x * 100}%`;
    marker.style.top = `${y * 100}%`;
    picture.querySelector('.markers').append(marker);
    setTimeout(() => marker.remove(), 450);
  }

  function playSound(correct) {
    try {
      audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(correct ? 620 : 180, audioContext.currentTime);
      if (correct) oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + .09);
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.06, audioContext.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .15);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + .16);
    } catch {}
  }

  function handlePictureClick(event) {
    if (busy) return;
    const picture = event.currentTarget;
    const imageRect = picture.querySelector('img').getBoundingClientRect();
    const x = (event.clientX - imageRect.left) / imageRect.width;
    const y = (event.clientY - imageRect.top) / imageRect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    const puzzle = gamePuzzles[currentRound];
    const matchIndex = puzzle.points.findIndex((point, index) =>
      !found.has(index) && Math.hypot(x - point[0], y - point[1]) <= .065
    );

    if (matchIndex === -1) {
      showMiss(picture, x, y);
      playSound(false);
      ui.message.textContent = '조금만 더 자세히 살펴보세요.';
      return;
    }

    found.add(matchIndex);
    addFoundMarker(puzzle.points[matchIndex]);
    playSound(true);
    ui.found.textContent = found.size;
    ui.progress.style.width = `${(currentRound * 5 + found.size) / 15 * 100}%`;
    ui.message.textContent = found.size < 5 ? `좋아요! 이제 ${5 - found.size}개 남았어요.` : '이 장면의 차이를 모두 찾았어요!';

    if (found.size === 5) completeRound();
  }

  function completeRound() {
    busy = true;
    ui.pictures.forEach(picture => {
      picture.disabled = true;
      picture.classList.add('solved');
    });

    if (currentRound < 2) {
      setTimeout(async () => {
        currentRound += 1;
        await loadPuzzle();
      }, 900);
      return;
    }

    const elapsed = performance.now() - startedAt;
    clearInterval(timerId);
    ui.timer.textContent = formatTime(elapsed);
    setTimeout(() => finishGame(elapsed), 650);
  }

  function finishGame(elapsed) {
    ui.playScreen.hidden = true;
    ui.finishScreen.hidden = false;
    ui.finalTime.textContent = formatTime(elapsed);
    makeConfetti();
    busy = false;
  }

  function makeConfetti() {
    const colors = ['#8065d8','#ffd967','#ff7d9b','#79d3b4','#6fb7ed'];
    $('.confetti').replaceChildren(...Array.from({ length: 34 }, (_, index) => {
      const piece = document.createElement('span');
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.animationDelay = `${Math.random() * 1.8}s`;
      piece.style.animationDuration = `${1.8 + Math.random()}s`;
      return piece;
    }));
  }

  ui.startButton.addEventListener('click', startGame);
  ui.restartButton.addEventListener('click', startGame);
  ui.pictures.forEach(picture => picture.addEventListener('click', handlePictureClick));
})();
