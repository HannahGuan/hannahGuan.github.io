// Life page - photo gallery with category filters and lightbox
document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    // `ar` is the photo's true width / height. The justified layout below sizes
    // every tile from it, so nothing is ever cropped — when adding a photo, set
    // this to its real ratio or it will throw the row off.
    const images = [
        { src: 'static/assets/img/cats/424bed755e9d4ab85d882303d3c4d284.png', category: 'cats', ar: 1.075 },
        { src: 'static/assets/img/cats/52b689fa9735ba4da89253cf983b77fa.png', category: 'cats', ar: 0.932 },
        { src: 'static/assets/img/cats/598c46521145877d6a1ddbeff082af65.jpg', category: 'cats', ar: 1.333 },
        { src: 'static/assets/img/cats/60ac46e8070db897c319fe4e58c5bd22.jpg', category: 'cats', ar: 1.500 },
        { src: 'static/assets/img/cats/98c6fc117a7542f8cb677aea5d406569.jpg', category: 'cats', ar: 1.333 },
        { src: 'static/assets/img/cats/e1ee6b37d3868ff82f76044d31958a62.jpg', category: 'cats', ar: 1.333 },
        { src: 'static/assets/img/cats/f831e81bcdbb37c914f6c41f4ca98c3d.jpg', category: 'cats', ar: 1.333 },
        { src: 'static/assets/img/photography/157982f48c218b19a557ea7a2fa42b85.jpg', category: 'photography', ar: 1.500 },
        { src: 'static/assets/img/photography/27dcfd4eb54f30ab776c77fbdb5f65f1.jpg', category: 'photography', ar: 1.500 },
        { src: 'static/assets/img/photography/5553cea2bd5663c3d5fe9853f62eb624.jpg', category: 'photography', ar: 0.667 },
        { src: 'static/assets/img/photography/871f2bbb5c72d145ceab4a27728906cc.jpg', category: 'photography', ar: 1.500 },
        { src: 'static/assets/img/photography/a5395c491dc02258738e4b1a33850019.jpg', category: 'photography', ar: 0.667 },
        { src: 'static/assets/img/photography/b13977919f1f5178db686b4d9a21e6bb.jpg', category: 'photography', ar: 0.667 },
        { src: 'static/assets/img/photography/cb61da187f049dc8ef914d7d750ac462.jpg', category: 'photography', ar: 1.500 },
        { src: 'static/assets/img/photography/d2731aed0a70af2858b9d57fe0de4d7e.jpg', category: 'photography', ar: 0.667 },
        { src: 'static/assets/img/photography/d74e6f02748dd1f3a02ce75fd84c53fd.jpg', category: 'photography', ar: 0.678 },
        { src: 'static/assets/img/photography/f74caac6f97a233fbecf762c1d491158.jpg', category: 'photography', ar: 1.333 },
    ];

    const labels = { cats: 'Cat', photography: 'Photograph' };

    // Rows aim for this height and then stretch to fill the width exactly, so
    // the actual heights land a little above or below — that drift is what keeps
    // the grid from reading as a uniform block.
    function targetHeight(width) {
        if (width < 600) return 150;
        if (width < 992) return 195;
        return 250;
    }

    // Height alone would let a row of portraits pack four or five across on a
    // phone, leaving each one thumbnail-sized. Cap the count by breakpoint.
    function maxPerRow(width) {
        if (width < 600) return 3;
        if (width < 992) return 4;
        return 5;
    }

    /* Deal the categories out alternately so "All" reads cat, photo, cat, photo
       instead of one block after the other. The two lists are different lengths,
       so rather than strict round-robin (which clumps the longer list's tail at
       the end) each step takes from whichever list is furthest behind its own
       share — that spreads the extra photos evenly through the whole run. */
    function interleave(items) {
        const lists = Object.values(items.reduce(function(acc, img) {
            (acc[img.category] = acc[img.category] || []).push(img);
            return acc;
        }, {}));
        if (lists.length < 2) return items.slice();

        const cursor = lists.map(() => 0);
        const out = [];
        while (out.length < items.length) {
            let pick = 0;
            let behind = Infinity;
            lists.forEach(function(list, i) {
                if (cursor[i] >= list.length) return;
                const progress = (cursor[i] + 0.5) / list.length;
                if (progress < behind) {
                    behind = progress;
                    pick = i;
                }
            });
            out.push(lists[pick][cursor[pick]++]);
        }
        return out;
    }

    /* Pack the list into rows that each span the full width: keep adding photos
       to a row until, at the target height, they would overflow — then solve for
       the height that makes that row fit exactly. */
    function buildRows(list, width, gap) {
        const target = targetHeight(width);
        const limit = maxPerRow(width);
        const rows = [];
        let items = [];
        let arSum = 0;

        list.forEach(function(img) {
            items.push(img);
            arSum += img.ar;
            const full = arSum * target + gap * (items.length - 1) >= width;
            if (full || items.length >= limit) {
                rows.push({ items: items, arSum: arSum });
                items = [];
                arSum = 0;
            }
        });
        if (items.length) rows.push({ items: items, arSum: arSum, partial: true });

        rows.forEach(function(row) {
            row.height = (width - gap * (row.items.length - 1)) / row.arSum;
            // A final row holding one or two photos would stretch to an absurd
            // height to fill the width. Cap it and let it sit short instead.
            if (row.partial && row.height > target * 1.3) {
                row.height = target;
                row.loose = true;
            }
        });
        return rows;
    }

    let visible = [];
    let laidOutAt = 0;

    function render() {
        if (!visible.length) {
            grid.innerHTML = '<p class="gallery-empty">Nothing here yet.</p>';
            return;
        }

        const width = grid.clientWidth;
        if (!width) return;
        const gap = parseFloat(getComputedStyle(grid).rowGap) || 12;
        laidOutAt = width;

        let index = 0;
        grid.innerHTML = buildRows(visible, width, gap).map(function(row) {
            const cells = row.items.map(function(img) {
                const i = index++;
                // A full row distributes width by flex-grow, which absorbs the
                // sub-pixel rounding the browser would otherwise leave at the
                // edge; a capped last row uses natural widths and stays short.
                const style = row.loose
                    ? 'flex: 0 0 ' + (img.ar * row.height).toFixed(2) + 'px'
                    : 'flex-grow: ' + img.ar;
                return '<button class="gallery-item" style="' + style + '" data-index="' + i +
                    '" aria-label="Open ' + labels[img.category] + ' ' + (i + 1) + '">' +
                    '<img src="' + img.src + '" alt="' + labels[img.category] + ' ' + (i + 1) + '" loading="lazy">' +
                    '</button>';
            }).join('');
            return '<div class="gallery-row" style="height: ' + row.height.toFixed(2) + 'px">' + cells + '</div>';
        }).join('');
    }

    function setFilter(filter) {
        visible = filter === 'all' ? interleave(images) : images.filter(img => img.category === filter);
        render();
    }

    // Repack on resize — the row breaks depend on the container width.
    let frame = null;
    window.addEventListener('resize', function() {
        if (grid.clientWidth === laidOutAt) return;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(render);
    });

    // Filters
    const filters = document.querySelectorAll('.gallery-filter');
    filters.forEach(button => {
        button.addEventListener('click', function() {
            filters.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            setFilter(this.dataset.filter);
        });
    });

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    let current = 0;

    function show(index) {
        current = (index + visible.length) % visible.length;
        const img = visible[current];
        lightboxImg.src = img.src;
        lightboxImg.alt = `${labels[img.category]} ${current + 1}`;
        counter.textContent = `${current + 1} / ${visible.length}`;
    }

    function open(index) {
        show(index);
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
        lightbox.querySelector('.lightbox-close').focus();
    }

    function close() {
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
    }

    grid.addEventListener('click', function(event) {
        const item = event.target.closest('.gallery-item');
        if (item) open(Number(item.dataset.index));
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));

    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) close();
    });

    document.addEventListener('keydown', function(event) {
        if (lightbox.hidden) return;
        if (event.key === 'Escape') close();
        if (event.key === 'ArrowLeft') show(current - 1);
        if (event.key === 'ArrowRight') show(current + 1);
    });

    setFilter('all');
});
