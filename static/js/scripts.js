

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'projects', 'awards']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        // Skip projects as it's now in HTML
        if (name === 'projects') return;

        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

    // Still run MathJax for the entire page
    MathJax.typeset();

});

// Image Carousel Functions
let currentImageIndex = 1;

function showImage(index) {
    const images = document.getElementsByClassName('carousel-image');
    const dots = document.getElementsByClassName('dot');

    if (index > images.length) {
        currentImageIndex = 1;
    }
    if (index < 1) {
        currentImageIndex = images.length;
    }

    for (let i = 0; i < images.length; i++) {
        images[i].classList.remove('active');
        dots[i].classList.remove('active');
    }

    images[currentImageIndex - 1].classList.add('active');
    dots[currentImageIndex - 1].classList.add('active');
}

function changeImage(direction) {
    currentImageIndex += direction;
    showImage(currentImageIndex);
}

function currentImage(index) {
    currentImageIndex = index;
    showImage(currentImageIndex);
}

