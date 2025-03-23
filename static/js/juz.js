document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navContainer = document.querySelector('.juz-nav-container');
    const navButtons = document.querySelectorAll('.juz-nav-button');
    const translationSelector = document.querySelector('.translation-selector');
    const verseTranslations = document.querySelectorAll('.verse-translation');
    
    // Check if we're on a Juz page
    const isJuzPage = document.querySelector('.juz-number') !== null;
    
    // Function to toggle translation visibility
    function toggleTranslationVisibility(show) {
        if (show) {
            translationSelector.style.display = 'flex';
            translationSelector.style.opacity = '0';
            setTimeout(() => {
                translationSelector.style.opacity = '1';
            }, 10);
        } else {
            translationSelector.style.opacity = '0';
            setTimeout(() => {
                translationSelector.style.display = 'none';
            }, 300);
        }

        verseTranslations.forEach(translation => {
            if (show) {
                translation.style.display = 'block';
                translation.style.opacity = '0';
                setTimeout(() => {
                    translation.style.opacity = '1';
                }, 10);
            } else {
                translation.style.opacity = '0';
                setTimeout(() => {
                    translation.style.display = 'none';
                }, 300);
            }
        });
    }

    // Update navigation button click handler
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const view = button.dataset.view;
            navContainer.dataset.active = view;
            
            // Toggle visibility based on view
            const showTranslation = view === 'translation';
            toggleTranslationVisibility(showTranslation);
            
            if (showTranslation && currentTranslationId) {
                fetchAndDisplayTranslation(currentTranslationId);
            }
        });
    });

    // Translation Modal functionality
    const modal = document.getElementById('translationModal');
    const changeBtn = document.getElementById('changeTranslation');
    const closeBtn = document.getElementById('closeModal');
    const translationsList = document.getElementById('translationsList');
    const currentTranslator = document.getElementById('currentTranslator');
    let translations = null;
    let currentTranslationId = localStorage.getItem('selectedJuzTranslationId') || 'en.asad';

    // Function to fetch and display translations for the current juz
    async function fetchAndDisplayTranslation(translationId) {
        try {
            const juzNumber = document.getElementById("juzNumber").textContent.trim();
            const response = await fetch(`http://api.alquran.cloud/v1/juz/${juzNumber}/${translationId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.ayahs) {
                data.data.ayahs.forEach((ayah, index) => {
                    const verseElement = document.querySelector(`.verse[data-verse-number="${index + 1}"]`);
                    if (verseElement) {
                        const translationElement = verseElement.querySelector('.verse-translation');
                        translationElement.textContent = ayah.text;
                        // Only show if in translation view
                        const currentView = navContainer.dataset.active;
                        translationElement.style.display = currentView === 'translation' ? 'block' : 'none';
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching translation:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'translation-error';
            errorDiv.textContent = 'Failed to load translation. Please try again.';
            document.querySelector('.verses-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Load initial translation if in translation view
    if (currentTranslationId) {
        const currentView = navContainer.dataset.active;
        if (currentView === 'translation') {
            fetchAndDisplayTranslation(currentTranslationId);
        }
    }

    // Open modal and load translations if not already loaded
    changeBtn.addEventListener('click', async () => {
        modal.classList.add('active');
        if (!translations) {
            await loadTranslations();
        }
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Load translations from API
    async function loadTranslations() {
        try {
            translationsList.innerHTML = '<div class="loading">Loading translations...</div>';

            const response = await fetch('https://api.alquran.cloud/v1/edition');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            translations = await response.json();
            
            // Clear loading message
            translationsList.innerHTML = '';

            // Create a map to categorize translations by language
            const languages = {};

            // Categorize translations by language
            translations.data.forEach(translation => {
                if (translation.format === 'text' && translation.type === 'translation') {
                    if (!languages[translation.language]) {
                        languages[translation.language] = [];
                    }
                    languages[translation.language].push(translation);
                }
            });

            // Sort languages alphabetically
            const sortedLanguages = Object.keys(languages).sort();

            // Add translations to modal, grouped by language
            sortedLanguages.forEach(language => {
                const languageGroup = languages[language];
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'translation-category';
                
                categoryDiv.innerHTML = ` 
                    <div class="category-title">${language}</div>
                    ${languageGroup.map(translation => `
                        <label class="translation-option">
                            <input type="radio" name="translation" class="translation-checkbox" 
                                   value="${translation.identifier}" 
                                   ${currentTranslationId === translation.identifier ? 'checked' : ''}>
                            <div class="translation-info">
                                <div class="translator-name">${translation.name || 'Unknown translator'}</div>
                            </div>
                        </label>
                    `).join('')}
                `;

                translationsList.appendChild(categoryDiv);
            });

            // Add event listeners to radio buttons
            document.querySelectorAll('input[name="translation"]').forEach(radio => {
                radio.addEventListener('change', async function() {
                    const selectedTranslation = translations.data.find(t => t.identifier === this.value);
                    if (selectedTranslation) {
                        currentTranslator.textContent = selectedTranslation.name;
                        currentTranslationId = selectedTranslation.identifier;
                        localStorage.setItem('selectedJuzTranslationId', currentTranslationId);
                        
                        // Clear existing translations
                        document.querySelectorAll('.verse-translation').forEach(el => {
                            el.textContent = '';
                            el.style.display = 'none';
                        });
                        
                        // Fetch and display new translation
                        await fetchAndDisplayTranslation(currentTranslationId);
                        modal.classList.remove('active');
                    }
                });
            });

        } catch (error) {
            console.error('Error loading translations:', error);
            translationsList.innerHTML = `
                <div class="error-message">
                    <p>Error loading translations. Please try again later.</p>
                    <p>Error details: ${error.message}</p>
                </div>
            `;
        }
    }

    // Intersection Observer for verse animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    });

    document.querySelectorAll('.verse').forEach(verse => {
        observer.observe(verse);
    });
});