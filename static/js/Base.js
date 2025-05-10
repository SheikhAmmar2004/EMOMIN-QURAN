// Global variables for navigation
let lastScrollTop = 0;
let navbar = document.querySelector(".nav");
let timeout = null;

// Scroll effect for navbar
window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
        // Scrolling Down - Hide navbar after scrolling 100px
        navbar.style.top = "-70px"; 
        navbar.style.boxShadow = "none";
    } else {
        // Scrolling Up or at the top
        navbar.style.top = "0"; 
        navbar.style.boxShadow = currentScroll > 10 ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none";
    }

    lastScrollTop = currentScroll;

    // Show navbar when scrolling stops
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        navbar.style.top = "0";
        navbar.style.boxShadow = currentScroll > 10 ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none";
    }, 250);
});

// Initialize menu functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Menu elements
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.menu-close');
    const nav = document.querySelector('.nav');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle menu open/close
    menuToggle.addEventListener('click', function() {
        openMenu();
    });
    
    // Close menu with X button
    if (menuClose) {
        menuClose.addEventListener('click', function() {
            closeMenu();
        });
    }

    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        closeMenu();
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
            closeMenu();
        }
    });
    
    // Handle restricted features modal
    const restrictedFeatures = document.querySelectorAll('.restricted-feature');
    const restrictionModal = document.getElementById('restriction-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    if (restrictedFeatures.length > 0 && restrictionModal) {
        restrictedFeatures.forEach(feature => {
            feature.addEventListener('click', function(e) {
                e.preventDefault();
                restrictionModal.style.display = 'flex';
                
                // Animate modal in
                setTimeout(() => {
                    restrictionModal.classList.add('show-modal');
                }, 10);
            });
        });
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                restrictionModal.classList.remove('show-modal');
                
                // Wait for animation to finish before hiding
                setTimeout(() => {
                    restrictionModal.style.display = 'none';
                }, 300);
            });
        }
    }
    
    // Helper functions for menu
    function openMenu() {
        nav.classList.add('nav-open');
        document.body.classList.add('menu-open');
        
        // Focus trap inside menu for accessibility
        setTimeout(() => {
            navMenu.querySelector('a').focus();
        }, 300);
    }
    
    function closeMenu() {
        nav.classList.remove('nav-open');
        document.body.classList.remove('menu-open');
        
        // Return focus
        menuToggle.focus();
    }
    
    // Set active link based on current page
    highlightCurrentPage();
    
    // Generate breadcrumbs on page load
    generateBreadcrumbs();
    
    // Update breadcrumbs when the page changes (for SPA use if needed)
    window.addEventListener('popstate', generateBreadcrumbs);
});

// Highlight the current page in the navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && (linkPath === currentPath || currentPath.includes(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
        }
    });
}

// Generate dynamic breadcrumbs based on the current page
// Wait for DOM to be fully loaded before generating breadcrumbs
document.addEventListener('DOMContentLoaded', function() {
    generateBreadcrumbs();
});

function generateBreadcrumbs() {
    const breadcrumbsElement = document.querySelector('.breadcrumbs ol');
    if (!breadcrumbsElement) return;
    
    breadcrumbsElement.innerHTML = '';
    
    // Always start with Home
    addBreadcrumbItem(breadcrumbsElement, '/', 'Home', false);
    
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const fromDetection = searchParams.get('from_detection') === 'true';
    const source = searchParams.get('source');
    const endpoint = document.body.dataset.endpoint || '';

    
    // If we're on home page, stop here
   // if (path === '/' || path === '/index') return;
    // Handle basic routes first
    addSeparator(breadcrumbsElement);

    switch(endpoint) {
        case 'auth.profile':
            addBreadcrumbItem(breadcrumbsElement, '', 'My Profile', true);
            return;
        case 'auth.history':
            addBreadcrumbItem(breadcrumbsElement, '', 'My History', true);
            return;
        case 'prayer_times':
            addBreadcrumbItem(breadcrumbsElement, '', 'Prayer Timings', true);
            return;
        case 'qibla':
            addBreadcrumbItem(breadcrumbsElement, '', 'Qibla Locator', true);
            return;
        case 'auth.login':
            addBreadcrumbItem(breadcrumbsElement, '', 'Login', true);
            return;
        case 'auth.signup':
            addBreadcrumbItem(breadcrumbsElement, '', 'Sign Up', true);
            return;
        case 'auth.reset_password_request':
            addBreadcrumbItem(breadcrumbsElement, '/auth/login', 'Login', false);
            addSeparator(breadcrumbsElement);
            addBreadcrumbItem(breadcrumbsElement, '', 'Reset Password', true);
            return;
        case 'auth.reset_password':
            addBreadcrumbItem(breadcrumbsElement, '', 'Set New Password', true);
            return;
    }
    
    // Handle all possible cases
    if (path.startsWith('/surah/') && source !== 'recommendations') {
        // Standalone Surah page
        addBreadcrumbItem(breadcrumbsElement, '', 'Surah', true);
    }
    else if (path.startsWith('/juz/')) {
        // Juz page
        addBreadcrumbItem(breadcrumbsElement, '', 'Juz', true);
    }
    else if (path === '/detect-emotion') {
        // Scan Emotion page
        addBreadcrumbItem(breadcrumbsElement, '', 'Scan Emotion', true);
    }
    else if (path === '/select-emotion') {
        // Choose Emotion page
        addBreadcrumbItem(breadcrumbsElement, '', 'Choose Emotion', true);
    }
    else if (path.startsWith('/recommendations/')) {
        // Recommendations page
        const emotionType = fromDetection ? 'Scan Emotion' : 'Choose Emotion';
        const emotionUrl = fromDetection ? '/detect-emotion' : '/select-emotion';
        
        addBreadcrumbItem(breadcrumbsElement, emotionUrl, emotionType, false);
        addSeparator(breadcrumbsElement);
        addBreadcrumbItem(breadcrumbsElement, '', 'Recommendations', true);
    }
    else if (path.startsWith('/hadith/') && source === 'recommendations') {
        // Hadiths from recommendations
        const emotionType = fromDetection ? 'Scan Emotion' : 'Choose Emotion';
        const emotionUrl = fromDetection ? '/detect-emotion' : '/select-emotion';
        
        addBreadcrumbItem(breadcrumbsElement, emotionUrl, emotionType, false);
        addSeparator(breadcrumbsElement);
        addBreadcrumbItem(breadcrumbsElement, path.substring(0, path.indexOf('/hadith')) + '/recommendations/' + searchParams.get('emotion'), 'Recommendations', false);
        addSeparator(breadcrumbsElement);
        addBreadcrumbItem(breadcrumbsElement, '', 'Hadiths', true);
    }
    else if (path.startsWith('/surah/') && source === 'recommendations') {
        // Surah from recommendations
        const emotionType = fromDetection ? 'Scan Emotion' : 'Choose Emotion';
        const emotionUrl = fromDetection ? '/detect-emotion' : '/select-emotion';
        
        addBreadcrumbItem(breadcrumbsElement, emotionUrl, emotionType, false);
        addSeparator(breadcrumbsElement);
        addBreadcrumbItem(breadcrumbsElement, '/recommendations/' + searchParams.get('emotion'), 'Recommendations', false);
        addSeparator(breadcrumbsElement);
        addBreadcrumbItem(breadcrumbsElement, '', 'Surah', true);
    }
    else if (path.startsWith('/ayah/') && source === 'recommendations') {
        // Ayah from recommendations
        const emotionType = fromDetection ? 'Scan Emotion' : 'Choose Emotion';
        const emotionUrl = fromDetection ? '/detect-emotion' : '/select-emotion';
        
        addBreadcrumbItem(breadcrumbsElement, emotionUrl, emotionType, false);
        addSeparator(breadcrumbsElement);
        addBreadcrumbItem(breadcrumbsElement, '/recommendations/' + searchParams.get('emotion'), 'Recommendations', false);
        addSeparator(breadcrumbsElement);
        addBreadcrumbItem(breadcrumbsElement, '', 'Ayah', true);
    }
    // Add other routes as needed
}

function addBreadcrumbItem(container, url, text, isActive) {
    const li = document.createElement('li');
    if (isActive) {
        li.className = 'active';
        li.textContent = text;
    } else {
        const a = document.createElement('a');
        a.href = url;
        a.textContent = text;
        li.appendChild(a);
    }
    container.appendChild(li);
}

function addSeparator(container) {
    const separator = document.createElement('li');
    separator.className = 'separator';
    container.appendChild(separator);
}

