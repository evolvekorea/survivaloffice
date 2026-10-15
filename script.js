document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('newContentTrack');
    const prevButton = document.getElementById('newContentPrev');
    const nextButton = document.getElementById('newContentNext');
    const progress = document.getElementById('newContentProgress');

    // Keep the publication list newest-first; feature its first two games.
    // Tests and tools remain in the slider without replacing game previews.
    const latestGames = [...(track?.querySelectorAll('.new-content-card') || [])]
        .filter(card => card.querySelector('.content-type.game, .content-type.story'))
        .slice(0, 2);
    document.querySelectorAll('.hero-features .hero-feature').forEach((feature, index) => {
        const latest = latestGames[index];
        if (!latest) return;
        const sourceImage = latest.querySelector('img');
        const title = latest.querySelector('strong')?.textContent.trim();
        const category = latest.querySelector('.content-type')?.textContent.trim();
        const featureImage = feature.querySelector('img');
        if (sourceImage && title && featureImage) {
            feature.href = latest.href;
            feature.setAttribute('aria-label', `최신 게임 ${title} 시작`);
            featureImage.src = sourceImage.src;
            featureImage.alt = sourceImage.alt;
            feature.querySelector('h2').textContent = title;
            feature.querySelector('.feature-caption div > span').textContent = category || '새 게임';
        }
    });

    if (!track || !prevButton || !nextButton || !progress) return;

    const getStep = () => {
        const card = track.querySelector('.new-content-card');
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };

    const updateSlider = () => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const ratio = maxScroll ? track.scrollLeft / maxScroll : 0;
        const thumbRatio = Math.min(1, track.clientWidth / track.scrollWidth);
        const travel = 100 - thumbRatio * 100;

        progress.style.width = `${Math.max(12, thumbRatio * 100)}%`;
        progress.style.transform = `translateX(${ratio * travel / Math.max(thumbRatio, .12)}%)`;
        prevButton.disabled = track.scrollLeft <= 2;
        nextButton.disabled = track.scrollLeft >= maxScroll - 2;
    };

    const move = direction => {
        track.scrollBy({ left: getStep() * direction, behavior: 'smooth' });
    };

    prevButton.addEventListener('click', () => move(-1));
    nextButton.addEventListener('click', () => move(1));
    track.addEventListener('scroll', updateSlider, { passive: true });
    track.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
        }
    });
    window.addEventListener('resize', updateSlider);
    updateSlider();
});
