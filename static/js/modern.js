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
