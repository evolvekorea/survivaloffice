const briefingScreen = document.getElementById('briefingScreen');
const openDocumentButton = document.getElementById('openDocumentButton');
const birthdayTitle = document.getElementById('birthdayTitle');
const musicButton = document.getElementById('musicButton');
const musicLabel = musicButton.querySelector('.music-label');

openDocumentButton.addEventListener('click', () => {
    briefingScreen.classList.add('is-opening');
    document.body.classList.remove('briefing-active');
    playBirthdaySong();
    window.setTimeout(() => {
        briefingScreen.hidden = true;
        birthdayTitle.focus({ preventScroll: true });
    }, 560);
});

const wishButton = document.getElementById('wishButton');
const wishResult = document.getElementById('wishResult');
const cake = document.querySelector('.cake');
const confettiLayer = document.getElementById('confettiLayer');
const letterButton = document.getElementById('letterButton');
const birthdayLetter = document.getElementById('birthdayLetter');

const confettiColors = ['#ff6f9d', '#ffd968', '#8ddbc2', '#bca8ef', '#70bce7', '#ff9d6c'];

let birthdayAudioContext = null;
let birthdaySongNodes = [];
let birthdaySongTimer = null;
let birthdaySongPlaying = false;

const birthdayMelody = [
    [392.00, .28], [392.00, .28], [440.00, .56], [392.00, .56], [523.25, .56], [493.88, 1.0],
    [0, .18], [392.00, .28], [392.00, .28], [440.00, .56], [392.00, .56], [587.33, .56], [523.25, 1.0],
    [0, .18], [392.00, .28], [392.00, .28], [783.99, .56], [659.25, .56], [523.25, .56], [493.88, .56], [440.00, .9],
    [0, .18], [698.46, .28], [698.46, .28], [659.25, .56], [523.25, .56], [587.33, .56], [523.25, 1.15]
];

function updateMusicButton(isPlaying) {
    birthdaySongPlaying = isPlaying;
    musicButton.setAttribute('aria-pressed', String(isPlaying));
    musicLabel.textContent = isPlaying ? '노래 정지' : '생일 노래 듣기';
}

function stopBirthdaySong() {
    window.clearTimeout(birthdaySongTimer);
    birthdaySongNodes.forEach((node) => {
        try { node.stop(); } catch (error) { /* 이미 끝난 음은 무시합니다. */ }
    });
    birthdaySongNodes = [];
    if (birthdayAudioContext) {
        birthdayAudioContext.close().catch(() => {});
        birthdayAudioContext = null;
    }
    updateMusicButton(false);
}

function playBirthdaySong() {
    try {
        stopBirthdaySong();
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        birthdayAudioContext = new AudioContext();
        birthdayAudioContext.resume().catch(() => {});

        let cursor = birthdayAudioContext.currentTime + .06;
        birthdayMelody.forEach(([frequency, beats]) => {
            const duration = beats * .72;
            if (frequency > 0) {
                const oscillator = birthdayAudioContext.createOscillator();
                const gain = birthdayAudioContext.createGain();
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(frequency, cursor);
                gain.gain.setValueAtTime(.0001, cursor);
                gain.gain.exponentialRampToValueAtTime(.13, cursor + .025);
                gain.gain.setValueAtTime(.11, Math.max(cursor + .03, cursor + duration - .09));
                gain.gain.exponentialRampToValueAtTime(.0001, cursor + duration);
                oscillator.connect(gain).connect(birthdayAudioContext.destination);
                oscillator.start(cursor);
                oscillator.stop(cursor + duration + .03);
                birthdaySongNodes.push(oscillator);
            }
            cursor += duration;
        });

        updateMusicButton(true);
        const remaining = Math.max(0, cursor - birthdayAudioContext.currentTime) * 1000;
        birthdaySongTimer = window.setTimeout(() => {
            birthdaySongNodes = [];
            birthdayAudioContext?.close().catch(() => {});
            birthdayAudioContext = null;
            updateMusicButton(false);
        }, remaining + 100);
    } catch (error) {
        updateMusicButton(false);
        console.info('생일 노래를 재생하지 못했습니다.', error);
    }
}

musicButton.addEventListener('click', () => {
    if (birthdaySongPlaying) stopBirthdaySong();
    else playBirthdaySong();
});

function launchConfetti() {
    const amount = window.matchMedia('(max-width: 600px)').matches ? 72 : 120;

    for (let index = 0; index < amount; index += 1) {
        const piece = document.createElement('i');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = confettiColors[index % confettiColors.length];
        piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 280}px`);
        piece.style.setProperty('--spin', `${Math.random() * 1100 - 550}deg`);
        piece.style.setProperty('--fall-time', `${2.8 + Math.random() * 2.2}s`);
        piece.style.animationDelay = `${Math.random() * 0.6}s`;
        piece.style.transform = `scale(${0.65 + Math.random() * 0.8})`;
        confettiLayer.appendChild(piece);
        window.setTimeout(() => piece.remove(), 5800);
    }
}

wishButton.addEventListener('click', () => {
    if (cake.classList.contains('blown')) return;

    cake.classList.add('blown');
    wishButton.disabled = true;
    wishButton.querySelector('.button-icon').textContent = '🎉';
    wishButton.querySelector('strong').textContent = '소원이 이루어질 거야!';
    wishButton.querySelector('small').textContent = '상지의 반짝이는 한 해를 응원해';
    wishResult.textContent = '생일 축하해, 상지야! ✨';
    launchConfetti();
    if (!birthdaySongPlaying) playBirthdaySong();
});

letterButton.addEventListener('click', () => {
    const isOpen = letterButton.getAttribute('aria-expanded') === 'true';
    letterButton.setAttribute('aria-expanded', String(!isOpen));
    birthdayLetter.hidden = isOpen;
    letterButton.querySelector('small').textContent = isOpen ? '눌러서 열어보기' : '카드가 열렸어요';

    if (!isOpen) {
        window.setTimeout(() => birthdayLetter.scrollIntoView({ behavior: 'smooth', block: 'center' }), 90);
    }
});
