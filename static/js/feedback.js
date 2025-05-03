document.addEventListener('DOMContentLoaded', function () {
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedbackModal = document.getElementById('closeFeedbackModal');
    const feedbackOptions = document.querySelectorAll('.feedback-option');
    const submitFeedbackBtn = document.getElementById('submitFeedback');
    const feedbackValidation = document.getElementById('feedbackValidation');
    let selectedFeedback = null;
    let modalShown = false;
    let contentPercentageViewed = 0;

    // Function to show the feedback modal
    function showFeedbackModal() {
        if (modalShown) return;

        feedbackModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modalShown = true;
    }

    // Close modal function
    function closeModal() {
        feedbackModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeFeedbackModal) {
        closeFeedbackModal.addEventListener('click', closeModal);
    }

    if (feedbackModal) {
        feedbackModal.addEventListener('click', function (e) {
            if (e.target === feedbackModal) {
                closeModal();
            }
        });
    }

    // Handle feedback option selection
    feedbackOptions.forEach(option => {
        option.addEventListener('click', function () {
            feedbackOptions.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            selectedFeedback = this.getAttribute('data-feedback');
            feedbackValidation.classList.remove('visible');
        });
    });

    // Submit feedback
    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', async function () {
            if (!selectedFeedback) {
                feedbackValidation.classList.add('visible');
                return;
            }

            const contentType = document.body.dataset.contentType;
            const contentId = document.body.dataset.contentId;
            // Get emotion from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const emotionBefore = urlParams.get('emotion') || 'neutral';
            const comment = document.getElementById('feedbackComment').value;

            try {
                submitFeedbackBtn.disabled = true;
                submitFeedbackBtn.textContent = 'Submitting...';

                const response = await fetch('/submit_feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content_type: contentType,
                        content_id: contentId,
                        emotion_before: emotionBefore,
                        feedback: selectedFeedback,
                        comment: comment
                    })
                });

                const modalBody = document.querySelector('.feedback-modal-body');
                if (response.ok) {
                    modalBody.innerHTML = `
                        <div class="feedback-success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="success-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <h3>Thank you for your feedback!</h3>
                            <p>Your insights help us improve our recommendations.</p>
                        </div>
                    `;

                    localStorage.setItem(`feedback_${contentType}_${contentId}`, 'given');

                    setTimeout(closeModal, 3000);
                } else {
                    throw new Error('Failed to submit feedback');
                }
            } catch (error) {
                console.error('Error submitting feedback:', error);
                submitFeedbackBtn.disabled = false;
                submitFeedbackBtn.textContent = 'Submit Feedback';

                const errorDiv = document.createElement('div');
                errorDiv.className = 'feedback-error';
                errorDiv.textContent = 'There was an error submitting your feedback. Please try again.';
                document.querySelector('.feedback-modal-body').appendChild(errorDiv);

                setTimeout(() => {
                    errorDiv.remove();
                }, 3000);
            }
        });
    }

    // Detect content consumption to trigger modal
    function setupContentConsumptionDetection() {
        const contentType = document.body.dataset.contentType;
        const contentId = document.body.dataset.contentId;
        
        // Check if user came from recommendations page
        const urlParams = new URLSearchParams(window.location.search);
        const fromRecommendations = urlParams.get('source') === 'recommendations';
        
        // Only proceed if user came from recommendations
        if (!fromRecommendations) {
            return;
        }

        if (localStorage.getItem(`feedback_${contentType}_${contentId}`) === 'given') return;

        if (contentType === 'surah' || contentType === 'ayah') {
            const audio = document.querySelector('audio');
            if (audio) {
                audio.addEventListener('timeupdate', () => {
                    const percentPlayed = (audio.currentTime / audio.duration) * 100;
                    if (percentPlayed >= 80 && !modalShown) {
                        showFeedbackModal();
                    }
                });

                audio.addEventListener('ended', showFeedbackModal);
            }
        }

        const scrollableContent = document.querySelector('.verses-container, .hadith-container, .ayah-container');
        if (scrollableContent) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                const contentHeight = scrollableContent.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollableHeight = contentHeight - windowHeight;

                if (scrollableHeight > 0) {
                    const scrollPercentage = (scrollPosition / scrollableHeight) * 100;
                    contentPercentageViewed = Math.max(contentPercentageViewed, scrollPercentage);

                    if (contentPercentageViewed >= 80 && !modalShown) {
                        showFeedbackModal();
                    }
                }
            });
        }

        // Fallback: show modal after 3 minutes, but only if from recommendations
        setTimeout(() => {
            if (!modalShown) {
                showFeedbackModal();
            }
        }, 180000);
    }

    if (feedbackModal) {
        setupContentConsumptionDetection();
    }
});