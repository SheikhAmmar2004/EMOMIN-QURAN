document.addEventListener('DOMContentLoaded', function() {
    // Reading Progress Bar functionality
    const readingProgressBar = document.getElementById('readingProgressBar');
    const footer = document.querySelector('footer');
    
    // Function to update the reading progress
    function updateReadingProgress() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight - footer.offsetHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        readingProgressBar.style.width = `${scrollPercentage}%`;
    }
    
    window.addEventListener('scroll', updateReadingProgress);
    updateReadingProgress();
    
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
    
    // Qari Modal functionality
    const qariModal = document.getElementById('qariModal');
    const changeQariBtn = document.getElementById('changeQari');
    const closeQariBtn = document.getElementById('closeQariModal');
    const qariList = document.getElementById('qariList');
    const currentQariSpan = document.getElementById('currentQari');
    const qariSelector = document.querySelector('.qari-selector');
    let qaris = null;
    let currentQariId = localStorage.getItem('selectedQari') || '7'; // Default to Alafasy's ID in quran.com API

    // Tafsir Modal functionality
    const tafsirModal = document.getElementById('tafsirModal');
    const changeTafsirBtn = document.getElementById('changeTafsir');
    const closeTafsirBtn = document.getElementById('closeTafsirModal');
    const tafsirList = document.getElementById('tafsirList');
    const currentTafsirSpan = document.getElementById('currentTafsir');
    let tafsirs = null;
    let currentTafsirId = localStorage.getItem('selectedTafsirId') || 'ur-tafsir-bayan-ul-quran';

    // Audio Player elements
    const audio = document.getElementById('audioElement') || new Audio();
    const playButton = document.getElementById('playButton');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    let isPlaying = false;

    // Get surah number
    const surahNumber = document.querySelector('.surah-banner2').dataset.surahNumber;

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
            
            if (showQari && !audio.src) {
                updateAudioSource();
            }
        });
    });

    // Load qaris from quran.com API (original API)
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
                qariList.innerHTML = '';

                qaris.forEach(qari => {
                    const qariDiv = document.createElement('div');
                    qariDiv.className = `qari-option ${currentQariId === qari.id.toString() ? 'selected' : ''}`;
                    qariDiv.innerHTML = `
                        <div class="qari-info">
                            <div class="qari-name">${qari.reciter_name}${qari.style ? ' (' + qari.style + ')' : ''}</div>
                        </div>
                    `;

                    qariDiv.addEventListener('click', () => {
                        document.querySelectorAll('.qari-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        qariDiv.classList.add('selected');

                        currentQariId = qari.id.toString();
                        currentQariSpan.textContent = qari.reciter_name;
                        localStorage.setItem('selectedQari', currentQariId);
                        localStorage.setItem('selectedQariName', qari.reciter_name);

                        updateAudioSource();
                        qariModal.classList.remove('active');
                    });

                    qariList.appendChild(qariDiv);
                });

                // Set default qari name if not already set
                if (!localStorage.getItem('selectedQariName')) {
                    const defaultQari = qaris.find(q => q.id.toString() === currentQariId);
                    if (defaultQari) {
                        localStorage.setItem('selectedQariName', defaultQari.reciter_name);
                        currentQariSpan.textContent = defaultQari.reciter_name;
                    }
                }
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

    // Function to update audio source based on selected qari using quran.com API
    async function updateAudioSource() {
        try {
            const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${currentQariId}/${surahNumber}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.audio_file && data.audio_file.audio_url) {
                audio.src = data.audio_file.audio_url;
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
            document.querySelector('.verses-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Function to update audio translation source
    async function updateAudioTranslationSource() {
        try {
            const audioTranslationUrl = `http://65.2.121.185:5000/get_audio?surah=${surahNumber}&lang=${currentAudioTranslationLang}`;
            
            audio.src = audioTranslationUrl;
            audio.load();
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            progress.style.width = '0%';
            timeDisplay.textContent = '0:00';
            currentAudioLanguage.textContent = currentAudioTranslationLang;
        } catch (error) {
            console.error('Error updating audio translation source:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'translation-error';
            errorDiv.textContent = 'Failed to load audio translation. Please try again.';
            document.querySelector('.verses-container').prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Audio player functionality (improved to match ayah.js)
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
                    // Try to reload the audio source if playback fails
                    const currentView = navContainer.dataset.active;
                    if (currentView === 'audio') {
                        updateAudioTranslationSource();
                    } else {
                        updateAudioSource();
                    }
                });
        }
        isPlaying = !isPlaying;
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = percent + '%';
            const minutes = Math.floor(audio.currentTime / 60);
            const seconds = Math.floor(audio.currentTime % 60);
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    });

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progress.style.width = '0%';
        timeDisplay.textContent = '0:00';
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
            tafsirList.innerHTML = '';
            
            const languages = {};
            tafsirArray.forEach(tafsir => {
                const language = tafsir.language_name;
                if (!languages[language]) {
                    languages[language] = [];
                }
                languages[language].push(tafsir);
            });

            const sortedLanguages = Object.keys(languages).sort();
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

            document.querySelectorAll('input[name="tafsir"]').forEach(radio => {
                radio.addEventListener('change', async function() {
                    const selectedSlug = this.value;
                    const selectedTafsir = tafsirArray.find(t => t.slug === selectedSlug);
                    
                    if (selectedTafsir) {
                        currentTafsirSpan.textContent = selectedTafsir.name;
                        currentTafsirId = selectedTafsir.slug;
                        localStorage.setItem('selectedTafsirId', currentTafsirId);
                        
                        document.querySelectorAll('.verse-tafsir').forEach(el => {
                            el.textContent = '';
                            el.style.opacity = '0';
                            el.style.display = 'none';
                        });
                        
                        tafsirModal.classList.remove('active');
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

    // Function to fetch and display tafsir
    async function fetchAndDisplayTafsir(tafsirSlug) {
        try {
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

    // Translation Modal functionality
    const translationModal = document.getElementById('translationModal');
    const changeTranslationBtn = document.getElementById('changeTranslation');
    const closeTranslationBtn = document.getElementById('closeModal');
    const translationsList = document.getElementById('translationsList');
    const currentTranslator = document.getElementById('currentTranslator');
    let translations = null;
    let currentTranslationId = localStorage.getItem('selectedTranslationId') || 'en.sahih';

    // Function to fetch and display translations for the current surah
    async function fetchAndDisplayTranslation(translationId) {
        try {
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
                        
                        document.querySelectorAll('.verse-translation').forEach(el => {
                            el.textContent = '';
                            el.style.display = 'none';
                        });
                        
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

    // Event listeners for modals
    changeQariBtn.addEventListener('click', async () => {
        qariModal.classList.add('active');
        if (!qaris) {
            await loadQaris();
        }
    });

    closeQariBtn.addEventListener('click', () => {
        qariModal.classList.remove('active');
    });

    qariModal.addEventListener('click', (e) => {
        if (e.target === qariModal) {
            qariModal.classList.remove('active');
        }
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

    tafsirModal.addEventListener('click', (e) => {
        if (e.target === tafsirModal) {
            tafsirModal.classList.remove('active');
        }
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

    translationModal.addEventListener('click', (e) => {
        if (e.target === translationModal) {
            translationModal.classList.remove('active');
        }
    });

    // Audio translation modal handlers
    changeAudioTranslationBtn.addEventListener('click', () => {
        audioTranslationModal.classList.add('active');
        document.querySelectorAll('.audio-translation-option').forEach(option => {
            if (option.dataset.language === currentAudioTranslationLang) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    });

    closeAudioTranslationBtn.addEventListener('click', () => {
        audioTranslationModal.classList.remove('active');
    });

    audioTranslationModal.addEventListener('click', (e) => {
        if (e.target === audioTranslationModal) {
            audioTranslationModal.classList.remove('active');
        }
    });

    document.querySelectorAll('.audio-translation-option').forEach(option => {
        option.addEventListener('click', () => {
            const language = option.dataset.language;
            document.querySelectorAll('.audio-translation-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            currentAudioTranslationLang = language;
            currentAudioLanguage.textContent = language;
            localStorage.setItem('selectedAudioTranslationLang', language);
            updateAudioTranslationSource();
            audioTranslationModal.classList.remove('active');
        });
    });

    // Intersection Observer for verse animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                updateReadingProgress();
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.verse').forEach(verse => {
        observer.observe(verse);
    });

    // Surah Navigation
    const prevSurahBtn = document.querySelector('.prev-surah');
    const nextSurahBtn = document.querySelector('.next-surah');
    const currentSurahNumber = parseInt(document.querySelector('.surah-banner2').dataset.surahNumber);

    if (prevSurahBtn) {
        prevSurahBtn.addEventListener('click', () => {
            if (currentSurahNumber > 1) {
                window.location.href = `/surah/${currentSurahNumber - 1}`;
            }
        });
    }

    if (nextSurahBtn) {
        nextSurahBtn.addEventListener('click', () => {
            if (currentSurahNumber < 114) {
                window.location.href = `/surah/${currentSurahNumber + 1}`;
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentSurahNumber > 1) {
            window.location.href = `/surah/${currentSurahNumber - 1}`;
        }
        else if (e.key === 'ArrowRight' && currentSurahNumber < 114) {
            window.location.href = `/surah/${currentSurahNumber + 1}`;
        }
    });

    // Initialize the page
    function initializePage() {
        // Set default qari name if not set
        if (!localStorage.getItem('selectedQariName')) {
            localStorage.setItem('selectedQari', '7'); // Default to Alafasy's ID in quran.com API
            localStorage.setItem('selectedQariName', 'Mishary Rashid Alafasy');
            currentQariSpan.textContent = 'Mishary Rashid Alafasy';
        } else {
            currentQariSpan.textContent = localStorage.getItem('selectedQariName');
        }

        // Set current view based on navigation
        const currentView = navContainer.dataset.active;
        const showQari = currentView === 'translation' || currentView === 'reading';
        const showAudioTranslation = currentView === 'audio';
        
        toggleQariVisibility(showQari);
        toggleAudioTranslationVisibility(showAudioTranslation);

        // Load initial content based on view
        if (currentView === 'translation' && currentTranslationId) {
            fetchAndDisplayTranslation(currentTranslationId);
        }
        if (currentView === 'tafsir' && currentTafsirId) {
            fetchAndDisplayTafsir(currentTafsirId);
        }
        if (showAudioTranslation) {
            updateAudioTranslationSource();
        }
        if (showQari && !audio.src) {
            updateAudioSource();
        }
    }

    // Initialize the page when DOM is loaded
    initializePage();
});