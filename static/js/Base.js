let lastScrollTop = 0;
let navbar = document.querySelector(".nav");
let timeout = null;

window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop) {
        // Scrolling Down
        navbar.style.top = "-65px"; // Hide navbar
    } else {
                // Scrolling Up or Stopped
        navbar.style.top = "0"; // Show navbar
        }

    lastScrollTop = currentScroll;

    // Show navbar when scrolling stops
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        navbar.style.top = "0";
        }, 200);
    });

    document.addEventListener('DOMContentLoaded', function() {
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');
        const navMenu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('nav-open');
            document.body.classList.toggle('menu-open');
        });

        overlay.addEventListener('click', function() {
            nav.classList.remove('nav-open');
            document.body.classList.remove('menu-open');
        });

        // Close menu when clicking a link
        navMenu.addEventListener('click', function(e) {
            if (e.target.closest('.nav-link')) {
                nav.classList.remove('nav-open');
                document.body.classList.remove('menu-open');
            }
        });
    });