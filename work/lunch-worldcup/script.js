(() => {
  'use strict';

  const MENU_NAMES = [
    '제육볶음', '돈까스', '김치찌개', '된장찌개',
    '비빔밥', '냉면', '칼국수', '쌀국수',
    '짜장면', '짬뽕', '초밥', '햄버거',
    '피자', '치킨', '샌드위치', '분식',
    '부대찌개', '순두부찌개', '설렁탕', '돼지국밥',
    '닭갈비', '보쌈', '족발', '삼겹살',
    '떡볶이', '김밥', '파스타', '리조또',
    '타코', '샐러드', '포케', '도시락'
  ];
  const MENUS = MENU_NAMES.map((name, index) => ({
    name,
    sheet: Math.floor(index / 8) + 1,
    tile: index % 8
  }));

  const $ = selector => document.querySelector(selector);
  const ui = {
    battle: $('#battle'),
    result: $('#result'),
    round: $('#roundTitle'),
    current: $('#matchCurrent'),
    total: $('#matchTotal'),
    progress: $('#progressBar'),
    left: $('#leftChoice'),
    right: $('#rightChoice'),
    leftImage: $('#leftImage'),
    rightImage: $('#rightImage'),
    leftName: $('#leftName'),
    rightName: $('#rightName'),
    picked: $('#pickedList'),
    winnerImage: $('#winnerImage'),
    winnerName: $('#winnerName'),
    sound: $('#soundButton')
  };

  let round = [];
  let winners = [];
  let match = 0;
  let history = [];
  let locked = false;
  let soundOn = true;
  let audio;

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function roundName(count) {
    return count === 2 ? '결승' : `${count}강`;
  }

  function pair() {
    return [round[match * 2], round[match * 2 + 1]];
  }

  function applyFoodImage(element, menu) {
    const column = menu.tile % 4;
    const row = Math.floor(menu.tile / 4);
    element.style.backgroundImage = `url('../../images/lunch-foods-${menu.sheet}.webp')`;
    element.style.backgroundPosition = `${column * 100 / 3}% ${row * 100}%`;
  }

  function render() {
    locked = false;
    ui.left.disabled = false;
    ui.right.disabled = false;
    ui.left.className = 'menu-card left';
    ui.right.className = 'menu-card right';
    const [leftMenu, rightMenu] = pair();
    const total = round.length / 2;
    ui.round.textContent = roundName(round.length);
    ui.current.textContent = match + 1;
    ui.total.textContent = total;
    ui.progress.style.width = `${(match + 1) / total * 100}%`;
    applyFoodImage(ui.leftImage, leftMenu);
    applyFoodImage(ui.rightImage, rightMenu);
    ui.leftName.textContent = leftMenu.name;
    ui.rightName.textContent = rightMenu.name;
    ui.picked.replaceChildren(...history.slice(-7).map(menu =>
      Object.assign(document.createElement('i'), { textContent: menu.name })
    ));
  }

  function choose(side) {
    if (locked) return;
    locked = true;
    const choices = pair();
    const winner = choices[side];
    winners.push(winner);
    history.push(winner);
    ui.left.disabled = true;
    ui.right.disabled = true;
    (side ? ui.right : ui.left).classList.add('winner');
    (side ? ui.left : ui.right).classList.add('loser');
    play('pick');
    setTimeout(() => {
      if (match + 1 < round.length / 2) {
        match += 1;
        render();
        return;
      }
      if (winners.length === 1) {
        showResult(winner);
        return;
      }
      round = [...winners];
      winners = [];
      match = 0;
      render();
    }, 480);
  }

  function showResult(winner) {
    ui.battle.hidden = true;
    ui.result.hidden = false;
    ui.round.textContent = '최종 선택';
    ui.current.textContent = '✓';
    ui.total.textContent = '완료';
    ui.progress.style.width = '100%';
    applyFoodImage(ui.winnerImage, winner);
    ui.winnerName.textContent = winner.name;
    makeConfetti();
    play('win');
  }

  function start() {
    round = shuffle(MENUS);
    winners = [];
    match = 0;
    history = [];
    ui.battle.hidden = false;
    ui.result.hidden = true;
    render();
    play('start');
  }

  function makeConfetti() {
    const colors = ['#7860d6', '#ffd86c', '#ff8f9f', '#79d3b4'];
    $('#confetti').replaceChildren(...Array.from({ length: 28 }, (_, index) => {
      const piece = document.createElement('span');
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.animationDelay = `${Math.random() * 1.7}s`;
      piece.style.animationDuration = `${1.7 + Math.random()}s`;
      return piece;
    }));
  }

  function play(type) {
    if (!soundOn) return;
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const notes = type === 'win' ? [523, 659, 784, 1047] : type === 'pick' ? [440, 660] : [392, 523];
      notes.forEach((frequency, index) => {
        const at = audio.currentTime + index * .08;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.exponentialRampToValueAtTime(.06, at + .015);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .13);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start(at);
        oscillator.stop(at + .15);
      });
    } catch {}
  }

  ui.left.addEventListener('click', () => choose(0));
  ui.right.addEventListener('click', () => choose(1));
  $('#restartButton').addEventListener('click', start);
  $('#shuffleButton').addEventListener('click', start);
  ui.sound.addEventListener('click', () => {
    soundOn = !soundOn;
    ui.sound.textContent = soundOn ? '🔊' : '🔇';
  });
  document.addEventListener('keydown', event => {
    if (ui.result.hidden === false) {
      if (event.key === 'Enter') start();
      return;
    }
    if (event.key === '1' || event.key === 'ArrowLeft') choose(0);
    else if (event.key === '2' || event.key === 'ArrowRight') choose(1);
  });

  start();
})();
