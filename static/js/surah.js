document.addEventListener('DOMContentLoaded', function() {
    // Auto-play functionality
    const autoPlayEnabled = localStorage.getItem('autoPlayEnabled') === 'true';
    const fromDetection = new URLSearchParams(window.location.search).get('from_detection') === 'true';

    if (autoPlayEnabled && fromDetection) {
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.click(); // Trigger autoplay if conditions are met
        } else {
            console.error('Play button not found');
        }
    }

    // Navigation functionality
    const navContainer = document.querySelector('.nav-container');
    const navButtons = document.querySelectorAll('.nav-button');
    const translationSelector = document.querySelector('.translation-selector');
    const tafsirSelector = document.querySelector('.tafsir-selector');
    const audioTranslationSelector = document.querySelector('.audio-translation-selector');
    const verseTranslations = document.querySelectorAll('.verse-translation');
    const verseTafsirs = document.querySelectorAll('.verse-tafsir');
    
    // Audio Translation variables
    const audioTranslationModal = document.getElementById('audioTranslationModal');
    const changeAudioTranslationBtn = document.getElementById('changeAudioTranslation');
    const closeAudioTranslationBtn = document.getElementById('closeAudioTranslationModal');
    const audioTranslationsList = document.getElementById('audioTranslationsList');
    const currentAudioLanguage = document.getElementById('currentAudioLanguage');
    let currentAudioTranslationLang = localStorage.getItem('selectedAudioTranslationLang') || 'English';
    
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

    // Function to toggle tafsir visibility
    function toggleTafsirVisibility(show) {
        const tafsirSelector = document.querySelector('.tafsir-selector');
        
        if (show) {
            tafsirSelector.style.display = 'flex';
            tafsirSelector.style.opacity = '0';
            setTimeout(() => {
                tafsirSelector.style.opacity = '1';
            }, 10);
        } else {
            tafsirSelector.style.opacity = '0';
            setTimeout(() => {
                tafsirSelector.style.display = 'none';
            }, 300);
        }

        verseTafsirs.forEach(tafsir => {
            if (show) {
                tafsir.style.display = 'block';
                tafsir.style.opacity = '0';
                setTimeout(() => {
                    tafsir.style.opacity = '1';
                }, 10);
            } else {
                tafsir.style.opacity = '0';
                setTimeout(() => {
                    tafsir.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // Function to toggle audio translation selector visibility
    function toggleAudioTranslationVisibility(show) {
        if (show) {
            audioTranslationSelector.style.display = 'flex';
            audioTranslationSelector.style.opacity = '0';
            setTimeout(() => {
                audioTranslationSelector.style.opacity = '1';
            }, 10);
        } else {
            audioTranslationSelector.style.opacity = '0';
            setTimeout(() => {
                audioTranslationSelector.style.display = 'none';
            }, 300);
        }
    }

    // Qari Modal functionality
    const qariModal = document.getElementById('qariModal');
    const changeQariBtn = document.getElementById('changeQari');
    const closeQariBtn = document.getElementById('closeQariModal');
    const qariList = document.getElementById('qariList');
    const currentQariSpan = document.getElementById('currentQari');
    const qariSelector = document.querySelector('.qari-selector');
    let qaris = null;
    let currentQariId = localStorage.getItem('selectedQari') || 'ar.alafasy';

    // Tafsir Modal functionality
    const tafsirModal = document.getElementById('tafsirModal');
    const changeTafsirBtn = document.getElementById('changeTafsir');
    const closeTafsirBtn = document.getElementById('closeTafsirModal');
    const tafsirList = document.getElementById('tafsirList');
    const currentTafsirSpan = document.getElementById('currentTafsir');
    let tafsirs = null;
    let currentTafsirId = localStorage.getItem('selectedTafsirId') || 'ur-tafsir-bayan-ul-quran';

    // Function to toggle qari selector visibility
    function toggleQariVisibility(show) {
        if (show) {
            qariSelector.style.display = 'flex';
            qariSelector.style.opacity = '0';
            setTimeout(() => {
                qariSelector.style.opacity = '1';
            }, 10);
        } else {
            qariSelector.style.opacity = '0';
            setTimeout(() => {
                qariSelector.style.display = 'none';
            }, 300);
        }
    }

    // Update navigation button click handler
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const view = button.dataset.view;
            navContainer.dataset.active = view;
            
            // Toggle visibility based on view
            const showTranslation = view === 'translation' || view === 'audio';
            const showQari = view === 'translation' || view === 'reading';
            const showAudioTranslation = view === 'audio';
            const showTafsir = view === 'tafsir';
            
            toggleTranslationVisibility(showTranslation);
            toggleQariVisibility(showQari);
            toggleAudioTranslationVisibility(showAudioTranslation);
            toggleTafsirVisibility(showTafsir);
            
            if (showTranslation && currentTranslationId) {
                fetchAndDisplayTranslation(currentTranslationId);
            }
            
            if (showTafsir && currentTafsirId) {
                fetchAndDisplayTafsir(currentTafsirId);
            }
            
            if (showAudioTranslation) {
                updateAudioTranslationSource();
            }
            if(showQari) {
                updateAudioSource();
            }
        });
    });

    // Load qaris from API
    async function loadQaris() {
        try {
            qariList.innerHTML = '<div class="loading">Loading reciters...</div>';

            const response = await fetch('https://api.quran.com/api/v4/resources/recitations');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.recitations) {
                qaris = data.recitations;

                // Clear loading message
                qariList.innerHTML = '';

                // Add qaris to modal
                qaris.forEach(qari => {
                    const qariDiv = document.createElement('div');
                    qariDiv.className = `qari-option ${currentQariId === qari.id ? 'selected' : ''}`;
                    qariDiv.innerHTML = `
                        <div class="qari-info">
                            <div class="qari-name">${qari.reciter_name}${qari.style ? ' (' + qari.style + ')' : ''}</div>
                        </div>
                    `;

                    qariDiv.addEventListener('click', () => {
                        // Update selected qari
                        document.querySelectorAll('.qari-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        qariDiv.classList.add('selected');

                        // Update current qari
                        currentQariId = qari.id;
                        currentQariSpan.textContent = qari.reciter_name;
                        localStorage.setItem('selectedQari', currentQariId);
                        localStorage.setItem('selectedQariName', qari.reciter_name);

                        // Update audio source
                        updateAudioSource();

                        // Close modal
                        qariModal.classList.remove('active');
                    });

                    qariList.appendChild(qariDiv);
                });
            }
        } catch (error) {
            console.error('Error loading qaris:', error);
            qariList.innerHTML = `
                <div class="error-message">
                    <p>Error loading reciters. Please try again later.</p>
                    <p>Error details: ${error.message}</p>
                </div>
            `;
        }
    }

// Function to fetch and display tafsir
async function fetchAndDisplayTafsir(tafsirSlug) {
    try {
        const surahNumber = document.querySelector('.surah-banner2').dataset.surahNumber;
        const response = await fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${tafsirSlug}/${surahNumber}.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.ayahs) {
            data.ayahs.forEach((tafsirAyah) => {
                const verseElement = document.querySelector(`.verse[data-verse-number="${tafsirAyah.ayah}"]`);
                if (verseElement) {
                    const tafsirElement = verseElement.querySelector('.verse-tafsir');
                    if (tafsirElement) {
                        tafsirElement.textContent = tafsirAyah.text;
                        tafsirElement.style.display = 'block';
                        setTimeout(() => {
                            tafsirElement.style.opacity = '1';
                        }, 10);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching tafsir:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'translation-error';
        errorDiv.textContent = 'Failed to load tafsir. Please try again.';
        document.querySelector('.verses-container').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
}
    
    
    // Function to update audio source based on selected qari
    async function updateAudioSource() {
        try {
            const surahNumber = document.querySelector('.surah-banner2').dataset.surahNumber;
            const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${currentQariId}/${surahNumber}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.audio_file && data.audio_file.audio_url) {
                audio.src = data.audio_file.audio_url;
                // Reset player state
                isPlaying = false;
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                progress.style.width = '0%';
                timeDisplay.textContent = '0:00';
            } else {
                throw new Error('Audio URL not found in response');
            }
        } catch (error) {
            console.error('Error updating audio source:', error);
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'translation-error';
            errorDiv.textContent = 'Failed to load recitation. Please try again.';
            document.querySelector('.verses-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }
    
    // Function to update audio translation source
    async function updateAudioTranslationSource() {
        try {
            const surahNumber = document.querySelector('.surah-banner2').dataset.surahNumber;
            const audioTranslationUrl = `http://65.2.121.185:5000/get_audio?surah=${surahNumber}&lang=${currentAudioTranslationLang}`;
            
            audio.src = audioTranslationUrl;
            
            // Reset player state
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            progress.style.width = '0%';
            timeDisplay.textContent = '0:00';
            
            // Update display
            currentAudioLanguage.textContent = currentAudioTranslationLang;
        } catch (error) {
            console.error('Error updating audio translation source:', error);
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'translation-error';
            errorDiv.textContent = 'Failed to load audio translation. Please try again.';
            document.querySelector('.verses-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Open qari modal
    changeQariBtn.addEventListener('click', async () => {
        qariModal.classList.add('active');
        if (!qaris) {
            await loadQaris();
        }
    });

    // Close qari modal
    closeQariBtn.addEventListener('click', () => {
        qariModal.classList.remove('active');
    });

    // Close qari modal when clicking outside
    qariModal.addEventListener('click', (e) => {
        if (e.target === qariModal) {
            qariModal.classList.remove('active');
        }
    });

    // Open tafsir modal
    changeTafsirBtn.addEventListener('click', async () => {
        tafsirModal.classList.add('active');
        if (!tafsirs) {
            await loadTafsirs();
        }
    });

    // Close tafsir modal
    closeTafsirBtn.addEventListener('click', () => {
        tafsirModal.classList.remove('active');
    });

    // Close tafsir modal when clicking outside
    tafsirModal.addEventListener('click', (e) => {
        if (e.target === tafsirModal) {
            tafsirModal.classList.remove('active');
        }
    });

    // Load tafsirs from API
async function loadTafsirs() {
    try {
        tafsirList.innerHTML = '<div class="loading">Loading tafsirs...</div>';

        const response = await fetch('https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/editions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tafsirArray = await response.json();
        
        // Clear loading message
        tafsirList.innerHTML = '';

        // Create a map to categorize tafsirs by language
        const languages = {};
        
        // Categorize tafsirs by language
        tafsirArray.forEach(tafsir => {
            const language = tafsir.language_name;
            if (!languages[language]) {
                languages[language] = [];
            }
            languages[language].push(tafsir);
        });

        // Sort languages alphabetically
        const sortedLanguages = Object.keys(languages).sort();

        // Add tafsirs to modal, grouped by language
        sortedLanguages.forEach(language => {
            const languageGroup = languages[language];
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'translation-category';
            
            categoryDiv.innerHTML = ` 
                <div class="category-title">${language}</div>
                ${languageGroup.map(tafsir => `
                    <label class="translation-option">
                        <input type="radio" name="tafsir" class="translation-checkbox" 
                               value="${tafsir.slug}" 
                               ${currentTafsirId === tafsir.slug ? 'checked' : ''}>
                        <div class="translation-info">
                            <div class="translator-name">${tafsir.name || 'Unknown author'}</div>
                            <div class="translation-language">${tafsir.author_name}</div>
                        </div>
                    </label>
                `).join('')}
            `;

            tafsirList.appendChild(categoryDiv);
        });

        // Add event listeners to radio buttons
        document.querySelectorAll('input[name="tafsir"]').forEach(radio => {
            radio.addEventListener('change', async function() {
                const selectedSlug = this.value;
                const selectedTafsir = tafsirArray.find(t => t.slug === selectedSlug);
                
                if (selectedTafsir) {
                    // Update current tafsir display
                    currentTafsirSpan.textContent = selectedTafsir.name;
                    currentTafsirId = selectedTafsir.slug;
                    localStorage.setItem('selectedTafsirId', currentTafsirId);
                    
                    // Clear existing tafsirs
                    document.querySelectorAll('.verse-tafsir').forEach(el => {
                        el.textContent = '';
                        el.style.opacity = '0';
                        el.style.display = 'none';
                    });
                    
                    // Close the modal
                    tafsirModal.classList.remove('active');
                    
                    // Fetch and display new tafsir
                    await fetchAndDisplayTafsir(currentTafsirId);
                }
            });
        });

    } catch (error) {
        console.error('Error loading tafsirs:', error);
        tafsirList.innerHTML = `
            <div class="error-message">
                <p>Error loading tafsirs. Please try again later.</p>
                <p>Error details: ${error.message}</p>
            </div>
        `;
    }
}
    
    // Open audio translation modal
    changeAudioTranslationBtn.addEventListener('click', () => {
        audioTranslationModal.classList.add('active');
        
        // Mark the currently selected language
        document.querySelectorAll('.audio-translation-option').forEach(option => {
            if (option.dataset.language === currentAudioTranslationLang) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    });
    
    // Close audio translation modal
    closeAudioTranslationBtn.addEventListener('click', () => {
        audioTranslationModal.classList.remove('active');
    });
    
    // Close audio translation modal when clicking outside
    audioTranslationModal.addEventListener('click', (e) => {
        if (e.target === audioTranslationModal) {
            audioTranslationModal.classList.remove('active');
        }
    });
    
    // Add click event listeners to audio translation options
    document.querySelectorAll('.audio-translation-option').forEach(option => {
        option.addEventListener('click', () => {
            const language = option.dataset.language;
            
            // Update selected option
            document.querySelectorAll('.audio-translation-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Update current language
            currentAudioTranslationLang = language;
            currentAudioLanguage.textContent = language;
            localStorage.setItem('selectedAudioTranslationLang', language);
            
            // Update audio source
            updateAudioTranslationSource();
            
            // Close modal
            audioTranslationModal.classList.remove('active');
        });
    });

    // Initialize qari selector visibility based on current view
    toggleQariVisibility(true);
    
    // Initialize audio translation selector visibility based on current view
    const currentView = navContainer.dataset.active;
    if (currentView === 'audio') {
        toggleAudioTranslationVisibility(true);
        updateAudioTranslationSource();
    }

    // Translation Modal functionality
    const modal = document.getElementById('translationModal');
    const changeBtn = document.getElementById('changeTranslation');
    const closeBtn = document.getElementById('closeModal');
    const translationsList = document.getElementById('translationsList');
    const currentTranslator = document.getElementById('currentTranslator');
    let translations = null;
    let currentTranslationId = localStorage.getItem('selectedTranslationId') || 'ur.ahmedraza';

    // Function to fetch and display translations for the current surah
    async function fetchAndDisplayTranslation(translationId) {
        try {
            const surahNumber = document.querySelector('.surah-banner2').dataset.surahNumber;
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${translationId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.ayahs) {
                data.data.ayahs.forEach(ayah => {
                    const verseElement = document.querySelector(`.verse[data-verse-number="${ayah.numberInSurah}"]`);
                    if (verseElement) {
                        const translationElement = verseElement.querySelector('.verse-translation');
                        translationElement.textContent = ayah.text;
                        // Only show if in translation or audio view
                        const currentView = navContainer.dataset.active;
                        translationElement.style.display = 
                            (currentView === 'translation' || currentView === 'audio') ? 'block' : 'none';
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

    // Load initial translation if in translation or audio view
    if (currentTranslationId) {
        const currentView = navContainer.dataset.active;
        if (currentView === 'translation' || currentView === 'audio') {
            fetchAndDisplayTranslation(currentTranslationId);
        }
    }

    // Load initial tafsir if in tafsir view
    if (currentTafsirId && currentView === 'tafsir') {
        fetchAndDisplayTafsir(currentTafsirId);
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
                        localStorage.setItem('selectedTranslationId', currentTranslationId);
                        
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

    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');

            // If href starts with '#', it's an internal section link
            if (href.startsWith("#")) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // Otherwise, let the browser handle normal page navigation
        });
    });

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

    // Audio Player functionality
    const playButton = document.getElementById('playButton');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    
    const audio = new Audio();
    let isPlaying = false;

    // Get the surah number from the data attribute
    const surahNumber = document.querySelector('.surah-banner2').dataset.surahNumber;

    // Initial audio setup
    updateAudioSource();

    // Play/Pause functionality
    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
        isPlaying = !isPlaying;
    });

    // Update progress bar and time display
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = percent + '%';
        const minutes = Math.floor(audio.currentTime / 60);
        const seconds = Math.floor(audio.currentTime % 60);
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    // Update audio current time when clicking progress bar
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // Reset on audio end
    audio.addEventListener('ended', () => {
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progress.style.width = '0%';
        timeDisplay.textContent = '0:00';
    });
});