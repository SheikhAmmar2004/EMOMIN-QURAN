document.addEventListener('DOMContentLoaded', function() {
    // Handle user dropdown toggle in nav
    const userDropdownToggle = document.querySelector('.user-dropdown-toggle');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');
    
    if (userDropdownToggle && userDropdownMenu) {
        userDropdownToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdownMenu.classList.remove('show');
        });
    }
    
    // Add event handlers for feature restrictions
    const restrictedLinks = document.querySelectorAll('.restricted-feature');
    restrictedLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            if (document.body.classList.contains('is-guest')) {
                event.preventDefault();
                showRestrictionModal();
            }
        });
    });
    
    // Modal handling
    function showRestrictionModal() {
        const modal = document.getElementById('restriction-modal');
        if (modal) {
            modal.classList.add('show');
            
            // Close modal when clicking close button or outside
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    modal.classList.remove('show');
                });
            }
            
            // Close when clicking outside modal content
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    }
    
    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordField = document.getElementById(this.dataset.target);
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
});

// Flash message auto-hide
setTimeout(function() {
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(message => {
        message.style.opacity = '0';
        setTimeout(() => {
            message.style.display = 'none';
        }, 300);
    });
}, 5000);