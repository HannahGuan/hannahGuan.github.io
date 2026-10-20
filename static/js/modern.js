// Modern Academic Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navToggle?.contains(event.target) || navMenu?.contains(event.target);
        if (!isClickInside && navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });

    // Load Markdown Content
    const sections = ['about', 'education', 'experience', 'teaching', 'publications'];

    marked.setOptions({
        breaks: true,
        gfm: true
    });

    sections.forEach(section => {
        fetch(`contents/${section}.md`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${section}.md`);
                }
                return response.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                const contentElement = document.getElementById(`${section}-content`);
                if (contentElement) {
                    contentElement.innerHTML = html;
                }
            })
            .catch(error => {
                console.error(`Error loading ${section}:`, error);
                const contentElement = document.getElementById(`${section}-content`);
                if (contentElement) {
                    contentElement.innerHTML = '<p>Content coming soon...</p>';
                }
            });
    });

    // Smooth scroll offset for fixed navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navbar
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }

        lastScroll = currentScroll;
    });
});

// ---- Life Gallery ----
document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const images = [
        { src: 'static/assets/img/cats/424bed755e9d4ab85d882303d3c4d284.png', category: 'cats' },
        { src: 'static/assets/img/cats/52b689fa9735ba4da89253cf983b77fa.png', category: 'cats' },
        { src: 'static/assets/img/cats/598c46521145877d6a1ddbeff082af65.jpg', category: 'cats' },
        { src: 'static/assets/img/cats/60ac46e8070db897c319fe4e58c5bd22.jpg', category: 'cats' },
        { src: 'static/assets/img/cats/98c6fc117a7542f8cb677aea5d406569.jpg', category: 'cats' },
        { src: 'static/assets/img/cats/cat-fluffy-lounging.png', category: 'cats' },
        { src: 'static/assets/img/cats/cat-fluffy-sitting.png', category: 'cats' },
        { src: 'static/assets/img/cats/cat-fluffy.png', category: 'cats' },
        { src: 'static/assets/img/cats/cat-spotted-curled.png', category: 'cats' },
        { src: 'static/assets/img/cats/cat-spotted-sitting.png', category: 'cats' },
        { src: 'static/assets/img/cats/cat-spotted.png', category: 'cats' },
        { src: 'static/assets/img/cats/cat-window.png', category: 'cats' },
        { src: 'static/assets/img/cats/e1ee6b37d3868ff82f76044d31958a62.jpg', category: 'cats' },
        { src: 'static/assets/img/cats/f831e81bcdbb37c914f6c41f4ca98c3d.jpg', category: 'cats' },
        { src: 'static/assets/img/photography/157982f48c218b19a557ea7a2fa42b85.jpg', category: 'photography' },
        { src: 'static/assets/img/photography/5553cea2bd5663c3d5fe9853f62eb624.jpg', category: 'photography' },
        { src: 'static/assets/img/photography/a5395c491dc02258738e4b1a33850019.jpg', category: 'photography' },
        { src: 'static/assets/img/photography/b13977919f1f5178db686b4d9a21e6bb.jpg', category: 'photography' },
        { src: 'static/assets/img/photography/cb61da187f049dc8ef914d7d750ac462.jpg', category: 'photography' },
        { src: 'static/assets/img/photography/d2731aed0a70af2858b9d57fe0de4d7e.jpg', category: 'photography' },
        { src: 'static/assets/img/photography/d74e6f02748dd1f3a02ce75fd84c53fd.jpg', category: 'photography' },
    ];

    const labels = { cats: 'Cat', photography: 'Photograph' };
    let visible = images;

    function render(filter) {
        visible = filter === 'all' ? images : images.filter(img => img.category === filter);

        if (!visible.length) {
            grid.innerHTML = '<p class="gallery-empty">Nothing here yet.</p>';
            return;
        }

        grid.innerHTML = visible.map((img, i) => `
            <button class="gallery-item" data-index="${i}" aria-label="Open ${labels[img.category]} ${i + 1}">
                <img src="${img.src}" alt="${labels[img.category]} ${i + 1}" loading="lazy">
            </button>
        `).join('');
    }

    // Filters
    const filters = document.querySelectorAll('.gallery-filter');
    filters.forEach(button => {
        button.addEventListener('click', function() {
            filters.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            render(this.dataset.filter);
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

    render('all');
});
