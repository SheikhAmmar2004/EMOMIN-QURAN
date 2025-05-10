document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navContainer = document.querySelector('.ayah-nav-container');
    const navButtons = document.querySelectorAll('.nav-button');
    const translationSelector = document.querySelector('.translation-selector');
    const tafsirSelector = document.querySelector('.tafsir-selector');
    const verseTranslation = document.querySelector('.verse-translation');
    const verseTafsir = document.querySelector('.verse-tafsir');

    // Get ayah and surah numbers from the verse element
    const verseElement = document.querySelector('.verse');
    const surahNumber = document.getElementById('surahNumber').textContent;
    const ayahNumber = verseElement.dataset.verseNumber;

    // Audio player elements
    const audio = document.getElementById('audioElement') || new Audio();
    const playButton = document.getElementById('playButton');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    let isPlaying = false;

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

        if (show) {
            verseTranslation.style.display = 'block';
            verseTranslation.style.opacity = '0';
            setTimeout(() => {
                verseTranslation.style.opacity = '1';
            }, 10);
        } else {
            verseTranslation.style.opacity = '0';
            setTimeout(() => {
                verseTranslation.style.display = 'none';
            }, 300);
        }
    }

    // Function to toggle tafsir visibility
    function toggleTafsirVisibility(show) {
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

        if (show) {
            verseTafsir.style.display = 'block';
            verseTafsir.style.opacity = '0';
            setTimeout(() => {
                verseTafsir.style.opacity = '1';
            }, 10);
        } else {
            verseTafsir.style.opacity = '0';
            setTimeout(() => {
                verseTafsir.style.display = 'none';
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
            
            const showTranslation = view === 'translation';
            const showQari = view === 'translation' || view === 'reading' || view === 'tafsir';
            const showTafsir = view === 'tafsir';
            
            toggleTranslationVisibility(showTranslation);
            toggleQariVisibility(showQari);
            toggleTafsirVisibility(showTafsir);
            
            if (showTranslation && currentTranslationId) {
                fetchAndDisplayTranslation(currentTranslationId);
            }
            
            if (showTafsir && currentTafsirId) {
                fetchAndDisplayTafsir(currentTafsirId);
            }

            if(showQari) {
                // Ensure audio is ready when switching to a view with audio
                if (!audio.src) {
                    updateAudioSource();
                }
            }
        });
    });

    // Load qaris from AlQuran Cloud API
    async function loadQaris() {
        try {
            qariList.innerHTML = '<div class="loading">Loading reciters...</div>';
            const response = await fetch('https://api.alquran.cloud/v1/edition/format/audio');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const qaris = data.data.filter(qari => qari.language === 'ar'); // Filter only Arabic reciters
            qariList.innerHTML = '';

            qaris.forEach(qari => {
                const qariDiv = document.createElement('div');
                qariDiv.className = `qari-option ${currentQariId === qari.identifier ? 'selected' : ''}`;
                qariDiv.innerHTML = `
                    <div class="qari-info">
                        <div class="qari-name">${qari.englishName} (${qari.name})</div>
                    </div>
                `;

                qariDiv.addEventListener('click', () => {
                    document.querySelectorAll('.qari-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    qariDiv.classList.add('selected');

                    currentQariId = qari.identifier;
                    currentQariSpan.textContent = qari.englishName;
                    localStorage.setItem('selectedQari', currentQariId);
                    localStorage.setItem('selectedQariName', qari.englishName);

                    updateAudioSource();
                    qariModal.classList.remove('active');
                });

                qariList.appendChild(qariDiv);
            });
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

    // Function to update audio source based on selected qari using AlQuran.cloud API
    async function updateAudioSource() {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${currentQariId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check if audio exists
            if (data.data.audio) {
                audio.src = data.data.audio;
                // Preload the audio
                audio.load();
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
            const errorDiv = document.createElement('div');
            errorDiv.className = 'translation-error';
            errorDiv.textContent = 'Failed to load recitation. Please try again.';
            document.querySelector('.ayah-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Translation Modal functionality
    const translationModal = document.getElementById('translationModal');
    const changeTranslationBtn = document.getElementById('changeTranslation');
    const closeTranslationBtn = document.getElementById('closeModal');
    const translationsList = document.getElementById('translationsList');
    const currentTranslator = document.getElementById('currentTranslator');
    let translations = null;
    let currentTranslationId = localStorage.getItem('selectedTranslationId') || 'en.sahih';

    // Function to fetch and display translation
    async function fetchAndDisplayTranslation(translationId) {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${translationId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                verseTranslation.textContent = data.data.text;
                const currentView = navContainer.dataset.active;
                verseTranslation.style.display = 
                    (currentView === 'translation' || currentView === 'audio') ? 'block' : 'none';
            }
        } catch (error) {
            console.error('Error fetching translation:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'translation-error';
            errorDiv.textContent = 'Failed to load translation. Please try again.';
            document.querySelector('.ayah-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Load translations from API
    async function loadTranslations() {
        try {
            translationsList.innerHTML = '<div class="loading">Loading translations...</div>';
            const response = await fetch('https://api.alquran.cloud/v1/edition/type/translation');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            translations = data.data;
            
            translationsList.innerHTML = '';
            const languages = {};

            translations.forEach(translation => {
                if (!languages[translation.language]) {
                    languages[translation.language] = [];
                }
                languages[translation.language].push(translation);
            });

            const sortedLanguages = Object.keys(languages).sort();

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

            document.querySelectorAll('input[name="translation"]').forEach(radio => {
                radio.addEventListener('change', async function() {
                    const selectedTranslation = translations.find(t => t.identifier === this.value);
                    if (selectedTranslation) {
                        currentTranslator.textContent = selectedTranslation.name;
                        currentTranslationId = selectedTranslation.identifier;
                        localStorage.setItem('selectedTranslationId', currentTranslationId);
                        
                        verseTranslation.textContent = '';
                        verseTranslation.style.display = 'none';
                        
                        await fetchAndDisplayTranslation(currentTranslationId);
                        translationModal.classList.remove('active');
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

    // Tafsir functionality
    const tafsirModal = document.getElementById('tafsirModal');
    const changeTafsirBtn = document.getElementById('changeTafsir');
    const closeTafsirBtn = document.getElementById('closeTafsirModal');
    const tafsirList = document.getElementById('tafsirList');
    const currentTafsirSpan = document.getElementById('currentTafsir');
    let tafsirs = null;
    let currentTafsirId = localStorage.getItem('selectedTafsirId') || 'ur-tafsir-bayan-ul-quran';

    // Function to fetch and display tafsir
    async function fetchAndDisplayTafsir(tafsirSlug) {
        try {
            const response = await fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${tafsirSlug}/${surahNumber}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.ayahs) {
                const tafsirAyah = data.ayahs.find(a => a.ayah === parseInt(ayahNumber));
                if (tafsirAyah) {
                    verseTafsir.textContent = tafsirAyah.text;
                    verseTafsir.style.display = 'block';
                    setTimeout(() => {
                        verseTafsir.style.opacity = '1';
                    }, 10);
                }
            }
        } catch (error) {
            console.error('Error fetching tafsir:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'translation-error';
            errorDiv.textContent = 'Failed to load tafsir. Please try again.';
            document.querySelector('.ayah-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

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

    // Event Listeners
    changeQariBtn.addEventListener('click', async () => {
        qariModal.classList.add('active');
        if (!qaris) {
            await loadQaris();
        }
    });

    closeQariBtn.addEventListener('click', () => {
        qariModal.classList.remove('active');
    });

    changeTranslationBtn.addEventListener('click', async () => {
        translationModal.classList.add('active');
        if (!translations) {
            await loadTranslations();
        }
    });

    closeTranslationBtn.addEventListener('click', () => {
        translationModal.classList.remove('active');
    });

    changeTafsirBtn.addEventListener('click', async () => {
        tafsirModal.classList.add('active');
        if (!tafsirs) {
            await loadTafsirs();
        }
    });

    closeTafsirBtn.addEventListener('click', () => {
        tafsirModal.classList.remove('active');
    });

    // Audio player functionality
    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            audio.play()
                .then(() => {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    // If there's an error, try updating the audio source
                    updateAudioSource();
                });
        }
        isPlaying = !isPlaying;
    });

    // Update progress bar and time display
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = percent + '%';
            const minutes = Math.floor(audio.currentTime / 60);
            const seconds = Math.floor(audio.currentTime % 60);
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
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

    // Initialize the page
    function initializePage() {
        // Set default qari name if not set
        if (!localStorage.getItem('selectedQariName')) {
            localStorage.setItem('selectedQari', 'ar.alafasy');
            localStorage.setItem('selectedQariName', 'Mishary Rashid Alafasy');
            currentQariSpan.textContent = 'Mishary Rashid Alafasy';
        } else {
            currentQariSpan.textContent = localStorage.getItem('selectedQariName');
        }

        // Set current view based on navigation
        const currentView = navContainer.dataset.active;
        const showQari = currentView === 'translation' || currentView === 'reading' || currentView === 'tafsir';
        toggleQariVisibility(showQari);

        // If we don't have an audio source (and we're in a view that needs it), fetch it
        if (showQari && !audio.src) {
            updateAudioSource();
        }

        // Load initial content based on view
        if (currentView === 'translation') {
            fetchAndDisplayTranslation(currentTranslationId);
        }
        if (currentView === 'tafsir') {
            fetchAndDisplayTafsir(currentTafsirId);
        }
    }

    // Initialize the page when DOM is loaded
    initializePage();
});