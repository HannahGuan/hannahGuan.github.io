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

    // Load Markdown Content (index page only - marked.js isn't loaded elsewhere)
    const sections = typeof marked === 'undefined' ? [] :
        ['about', 'education', 'experience', 'teaching', 'publications'];

    if (sections.length) {
        marked.setOptions({
            breaks: true,
            gfm: true
        });
    }

    sections.forEach(section => {
        const contentElement = document.getElementById(`${section}-content`);
        if (!contentElement) return;

        fetch(`contents/${section}.md`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${section}.md`);
                }
                return response.text();
            })
            .then(markdown => {
                contentElement.innerHTML = marked.parse(markdown);
            })
            .catch(error => {
                console.error(`Error loading ${section}:`, error);
                contentElement.innerHTML = '<p>Content coming soon...</p>';
            });
    });

    // Smooth scroll offset for fixed navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
            const hash = this.getAttribute('href');
            let id;
            try {
                id = decodeURIComponent(hash.slice(1));
            } catch {
                return;
            }
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                if (window.location.hash !== hash) {
                    history.pushState(null, '', hash);
                }
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
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
