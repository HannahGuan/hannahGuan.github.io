// A cat downpour, inspired by Atlas Kazemian's personal site.
(() => {
    const trigger = document.getElementById('show-cats');
    const layer = document.getElementById('cat-layer');
    const status = document.getElementById('cat-status');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sources = [
        'cat-spotted.png', 'cat-fluffy.png', 'cat-window.png',
        'cat-spotted-sitting.png', 'cat-fluffy-sitting.png',
        'cat-fluffy-lounging.png', 'cat-spotted-curled.png'
    ];
    let images;
    let generation = 0;
    let cleanup;

    function clearCats() {
        generation += 1;
        clearTimeout(cleanup);
        layer.replaceChildren();
        layer.hidden = true;
        trigger.removeAttribute('aria-busy');
        status.textContent = '';
    }

    function loadImages() {
        if (!images) {
            images = Promise.all(sources.map(source => new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = `static/assets/img/cats/${source}`;
            }))).catch(error => {
                images = null;
                throw error;
            });
        }
        return images;
    }

    trigger.addEventListener('click', async () => {
        // Another click starts a fresh burst without accumulating old cats.
        clearCats();
        const current = generation;
        trigger.setAttribute('aria-busy', 'true');
        status.textContent = 'The cats are on their way…';
        let photos;
        try {
            photos = await loadImages();
        } catch {
            if (current !== generation) return;
            trigger.removeAttribute('aria-busy');
            status.textContent = 'The cats could not load. Please try again.';
            return;
        }
        if (current !== generation) return;

        trigger.removeAttribute('aria-busy');
        const still = motion.matches;
        layer.classList.toggle('cat-layer-still', still);
        layer.hidden = false;
        status.textContent = 'Here are my cats!';

        const mobile = window.innerWidth < 600;
        const count = still ? photos.length : (mobile ? 35 : 60);
        const bunchSize = mobile ? 5 : 8;
        let latestFinish = 0;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i += 1) {
            const cat = photos[i % photos.length].cloneNode();
            cat.alt = '';
            cat.draggable = false;
            cat.className = 'cat-visitor';
            // Closely spaced bunches fill the width, with varied sizes and spins.
            const delay = Math.floor(i / bunchSize) * 0.16 + Math.random() * 0.12;
            const duration = 1.35 + Math.random() * 0.85;
            latestFinish = Math.max(latestFinish, delay + duration);
            cat.style.setProperty('--lane', `${Math.random() * 100}%`);
            cat.style.setProperty('--size', `${(mobile ? 65 : 95) + Math.random() * (mobile ? 55 : 85)}px`);
            cat.style.setProperty('--delay', `${delay}s`);
            cat.style.setProperty('--duration', `${duration}s`);
            cat.style.setProperty('--tilt', `${Math.random() * 70 - 35}deg`);
            cat.style.setProperty('--spin', `${Math.random() * 600 - 300}deg`);
            cat.style.setProperty('--drift', `${Math.random() * 100 - 50}px`);
            if (!still) {
                cat.addEventListener('animationend', () => {
                    if (current !== generation) return;
                    cat.remove();
                    if (!layer.childElementCount) clearCats();
                }, { once: true });
            }
            fragment.appendChild(cat);
        }
        layer.appendChild(fragment);
        // Also clear the still version and recover if an animation is interrupted.
        cleanup = setTimeout(() => {
            if (current === generation) clearCats();
        }, still ? 3000 : Math.ceil(latestFinish * 1000) + 200);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') clearCats();
    });
    motion.addEventListener('change', clearCats);
})();
