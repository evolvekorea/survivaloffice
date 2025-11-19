document.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.record-card');
  const effectSelect = document.getElementById('effectSelect');
  const slowMode = document.getElementById('slowMode');
  const glowEffect = document.getElementById('glowEffect');
  const textColor = document.getElementById('textColor');
  const recordBtn = document.getElementById('recordBtn');
  const resetBtn = document.getElementById('resetBtn');
  const kmInput = document.getElementById('kmInput');
  const kmDisplay = document.getElementById('kmDisplay');

  const metrics = [
    { input: document.getElementById('paceInput'),    display: document.getElementById('paceDisplay'),    type: 'time',   fallback: '--:--' },
    { input: document.getElementById('timeInput'),    display: document.getElementById('timeDisplay'),    type: 'time',   fallback: '00:00' },
    { input: document.getElementById('calInput'),     display: document.getElementById('calDisplay'),     type: 'number', decimals: 0, suffix: '',       fallback: '0' },
    { input: document.getElementById('elevInput'),    display: document.getElementById('elevDisplay'),    type: 'number', decimals: 0, suffix: ' m',     fallback: '0 m' },
    { input: document.getElementById('heartInput'),   display: document.getElementById('heartDisplay'),   type: 'number', decimals: 0, suffix: ' ',   fallback: '0' },
    { input: document.getElementById('cadenceInput'), display: document.getElementById('cadenceDisplay'), type: 'number', decimals: 0, suffix: ' ',   fallback: '0' }
  ];

  const easing = {
    smooth: t => t,
    bounce: t => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
    snap: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  };

  function parseTimeValue(value) {
    if (!value) return null;
    const numeric = value.replace(/[^0-9]/g, '');
    if (!numeric) return null;
    const padded = numeric.padStart(2, '0');
    const minutes = parseInt(padded.slice(0, -2) || '0', 10);
    const seconds = parseInt(padded.slice(-2), 10);
    return minutes * 60 + seconds;
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function animateNumber(el, target, { duration = 1500, decimals = 0, suffix = '' } = {}) {
    const start = performance.now();
    const ease = easing[effectSelect.value] || easing.smooth;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = ease(progress);
      const current = target * eased;
      el.textContent = `${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  function animateTime(el, seconds, duration) {
    const start = performance.now();
    const ease = easing[effectSelect.value] || easing.smooth;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = ease(progress);
      const current = seconds * eased;
      el.textContent = formatTime(current);
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  function updateColors() {
    document.documentElement.style.setProperty('--text-color', textColor.value);
  }

  function resetDisplays() {
    kmDisplay.textContent = '0.00';
    metrics.forEach(metric => {
      metric.display.textContent = metric.fallback || '0';
    });
  }

  function applyEffect(replay = false) {
    if (replay) {
      card.removeAttribute('data-effect');
      // force reflow so CSS animations restart
      void card.offsetWidth;
    }
    card.dataset.effect = effectSelect.value;
    card.classList.toggle('glow', glowEffect.checked);
  }

  function handleRecord() {
    applyEffect(true);
    updateColors();
    const duration = slowMode.checked ? 2200 : 1200;

    const distance = parseFloat(kmInput.value);
    if (!Number.isNaN(distance) && distance >= 0) {
      animateNumber(kmDisplay, distance, { duration, decimals: 2 });
    } else {
      kmDisplay.textContent = '0.00';
    }

    metrics.forEach(metric => {
      if (metric.type === 'time') {
        const seconds = parseTimeValue(metric.input.value);
        if (seconds !== null) {
          animateTime(metric.display, seconds, duration);
        } else {
          metric.display.textContent = metric.fallback || '--:--';
        }
      } else {
        const value = parseFloat(metric.input.value);
        if (!Number.isNaN(value)) {
          animateNumber(metric.display, value, {
            duration,
            decimals: metric.decimals || 0,
            suffix: metric.suffix || ''
          });
        } else {
          metric.display.textContent = metric.fallback || '0';
        }
      }
    });
  }

  function handleReset() {
    kmInput.value = '';
    metrics.forEach(metric => { metric.input.value = ''; });
    resetDisplays();
  }

  textColor.addEventListener('input', updateColors);
  glowEffect.addEventListener('change', applyEffect);
  effectSelect.addEventListener('change', applyEffect);

  recordBtn.addEventListener('click', handleRecord);
  resetBtn.addEventListener('click', handleReset);

  updateColors();
  applyEffect();
  resetDisplays();
});
