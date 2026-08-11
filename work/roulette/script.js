(() => {
  'use strict';

  const FOODS = [
    '제육볶음', '김치찌개', '된장찌개', '순두부찌개', '부대찌개', '비빔밥', '냉면', '칼국수',
    '수제비', '잔치국수', '쌀국수', '짜장면', '짬뽕', '마라탕', '탕수육', '초밥',
    '라멘', '우동', '카레', '돈까스', '햄버거', '피자', '파스타', '리조또',
    '샌드위치', '치킨', '닭갈비', '찜닭', '삼겹살', '보쌈', '족발', '돼지국밥',
    '설렁탕', '갈비탕', '감자탕', '떡볶이', '김밥', '오므라이스', '볶음밥', '샤브샤브',
    '월남쌈', '타코', '샐러드', '포케', '도시락', '백반', '생선구이', '낙지볶음'
  ];

  const COLORS = [
    '#ffd86c', '#a98bea', '#ff9f9f', '#79d3b4', '#8cc9f2', '#ffb76c',
    '#c4a7f2', '#f486a3', '#a8dfc8', '#f5ca64', '#94bce9', '#f3a67f'
  ];

  const canvas = document.querySelector('#rouletteWheel');
  const context = canvas.getContext('2d');
  const spinButton = document.querySelector('#spinButton');
  const spinAgainButton = document.querySelector('#spinAgainButton');
  const resultBox = document.querySelector('#resultBox');
  const resultLabel = document.querySelector('#resultLabel');
  const resultFood = document.querySelector('#resultFood');
  const allMenus = document.querySelector('#allMenus');
  const toggleMenuButton = document.querySelector('#toggleMenuButton');
  const arc = Math.PI * 2 / FOODS.length;

  let rotation = 0;
  let spinning = false;
  let selectedIndex = -1;
  let logicalSize = 680;

  function normalizeAngle(angle) {
    const full = Math.PI * 2;
    return ((angle % full) + full) % full;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const deviceScale = Math.min(window.devicePixelRatio || 1, 2);
    logicalSize = Math.max(280, Math.round(rect.width));
    const bitmapSize = Math.round(logicalSize * deviceScale);
    if (canvas.width !== bitmapSize || canvas.height !== bitmapSize) {
      canvas.width = bitmapSize;
      canvas.height = bitmapSize;
    }
    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    drawWheel(rotation);
  }

  function drawWheel(angleOffset) {
    const center = logicalSize / 2;
    const radius = center - 9;
    context.clearRect(0, 0, logicalSize, logicalSize);

    FOODS.forEach((food, index) => {
      const start = angleOffset + index * arc;
      const end = start + arc;
      const middle = start + arc / 2;

      context.beginPath();
      context.moveTo(center, center);
      context.arc(center, center, radius, start, end);
      context.closePath();
      context.fillStyle = COLORS[index % COLORS.length];
      context.fill();
      context.strokeStyle = '#ffffffaa';
      context.lineWidth = 1.5;
      context.stroke();

      context.save();
      context.translate(center, center);
      context.rotate(middle);
      context.translate(radius * .61, 0);
      const normalized = normalizeAngle(middle);
      if (normalized > Math.PI / 2 && normalized < Math.PI * 1.5) context.rotate(Math.PI);
      context.fillStyle = '#332b43';
      context.font = `800 ${Math.max(8, logicalSize * .015)}px Pretendard, "Noto Sans KR", sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(food, 0, 0, radius * .31);
      context.restore();
    });

    context.beginPath();
    context.arc(center, center, radius * .18, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();
    context.strokeStyle = '#e2d8ec';
    context.lineWidth = 3;
    context.stroke();
  }

  function randomIndex() {
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % FOODS.length;
    }
    return Math.floor(Math.random() * FOODS.length);
  }

  function easeOutQuint(progress) {
    return 1 - Math.pow(1 - progress, 5);
  }

  function setSpinningState(active) {
    spinning = active;
    spinButton.disabled = active;
    spinAgainButton.disabled = active;
    spinButton.querySelector('span').textContent = active ? 'WAIT' : 'SPIN';
    spinButton.querySelector('small').textContent = active ? '회전 중' : '돌리기';
  }

  function spin() {
    if (spinning) return;

    setSpinningState(true);
    resultBox.classList.remove('decided');
    resultLabel.textContent = '메뉴를 고르는 중...';
    resultFood.textContent = '두근두근';
    selectedIndex = randomIndex();

    const full = Math.PI * 2;
    const desired = -Math.PI / 2 - (selectedIndex + .5) * arc;
    let alignedTarget = desired;
    while (alignedTarget <= rotation) alignedTarget += full;
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const finalRotation = alignedTarget + extraTurns * full;
    const startRotation = rotation;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 650 : 4200;
    const startedAt = performance.now();

    function animate(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      rotation = startRotation + (finalRotation - startRotation) * easeOutQuint(progress);
      drawWheel(rotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      rotation = normalizeAngle(finalRotation);
      drawWheel(rotation);
      resultLabel.textContent = '오늘의 메뉴 당첨';
      resultFood.textContent = FOODS[selectedIndex];
      resultBox.classList.add('decided');
      setSpinningState(false);
    }

    requestAnimationFrame(animate);
  }

  function toggleMenuList() {
    const willOpen = allMenus.hidden;
    allMenus.hidden = !willOpen;
    toggleMenuButton.textContent = willOpen ? '접기' : '전체 보기';
    toggleMenuButton.setAttribute('aria-expanded', String(willOpen));
  }

  allMenus.replaceChildren(...FOODS.map(food =>
    Object.assign(document.createElement('span'), { textContent: food })
  ));

  spinButton.addEventListener('click', spin);
  spinAgainButton.addEventListener('click', spin);
  toggleMenuButton.addEventListener('click', toggleMenuList);
  window.addEventListener('resize', resizeCanvas, { passive: true });
  document.fonts?.ready.then(resizeCanvas);
  resizeCanvas();
})();
