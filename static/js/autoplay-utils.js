/**
 * Utility functions for handling autoplay functionality
 * across the Quran application
 */

// Autoplay countdown constants
const COUNTDOWN_DURATION = 5; // seconds

/**
 * Check if autoplay should be enabled based on user preference and URL parameters
 * @returns {boolean} Whether autoplay should be enabled
 */
function shouldAutoPlay() {
    const autoPlayEnabled = localStorage.getItem('autoPlayEnabled') === 'true';
    const fromDetection = new URLSearchParams(window.location.search).get('from_detection') === 'true';
    const fromRecommendations = new URLSearchParams(window.location.search).get('source') === 'recommendations';
    
    return autoPlayEnabled && (fromDetection || fromRecommendations);
}

/**
 * Start the autoplay countdown timer
 * @param {Function} nextItemHandler Function to call when countdown completes
 */
function startAutoplayCountdown(nextItemHandler) {
    const autoplayModal = document.getElementById('autoplayModal');
    const countdownElement = document.getElementById('countdown');
    const cancelBtn = document.getElementById('cancelAutoplay');
    const circleFill = document.querySelector('.countdown-circle-fill');
    
    // Reset animation
    circleFill.style.animation = 'none';
    void circleFill.offsetWidth; // Trigger reflow
    circleFill.style.animation = 'countdown 5s linear forwards';
    
    let secondsLeft = COUNTDOWN_DURATION;
    countdownElement.textContent = secondsLeft;
    autoplayModal.classList.remove('hidden');
    
    // Start countdown
    const countdownInterval = setInterval(() => {
        secondsLeft--;
        countdownElement.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            autoplayModal.classList.add('hidden');
            nextItemHandler();
        }
    }, 1000);
    
    // Cancel button handler
    cancelBtn.onclick = () => {
        clearInterval(countdownInterval);
        autoplayModal.classList.add('hidden');
    };

    // Store the interval ID in cancelBtn's data attribute so it can be accessed elsewhere if needed
    cancelBtn.dataset.countdownInterval = countdownInterval;
}

/**
 * Handle autoplay when audio ends
 * @param {string} contentType - 'surah' or 'ayah'
 * @param {string} currentId - Current content ID
 * @param {string} emotion - Current emotion
 */
function handleAutoplayOnAudioEnd(contentType, currentId, emotion) {
    const autoPlayEnabled = localStorage.getItem('autoPlayEnabled') === 'true';
    const fromRecommendations = new URLSearchParams(window.location.search).get('source') === 'recommendations';
    
    if (autoPlayEnabled && fromRecommendations) {
        startAutoplayCountdown(() => {
            fetch(`/get_next_recommendation?current_id=${currentId}&emotion=${emotion}&type=${contentType}`)
            .then(response => response.json())
            .then(data => {
                if (data.next_id) {
                    if (contentType === 'surah') {
                        window.location.href = `/surah/${data.next_id}?from_detection=true&source=recommendations&emotion=${emotion}`;
                    } else {
                        const [surahNum, ayahNum] = data.next_id.split(':');
                        window.location.href = `/ayah/${surahNum}/${ayahNum}?source=recommendations&emotion=${emotion}`;
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching next recommendation:', error);
            });
        });
    }
}

// Export the functions
window.QuranAutoplay = {
    shouldAutoPlay,
    startAutoplayCountdown,
    handleAutoplayOnAudioEnd
};