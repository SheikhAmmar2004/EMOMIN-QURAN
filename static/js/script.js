// API URLs
const API_URLS = {
    surahs: 'https://api.quran.com/api/v4/chapters',
    juz: 'https://api.quran.com/api/v4/juzs'
};

let allSurahs = []; // Store all surahs for searching

// Juz data with Arabic names and verse ranges
const juzData = {
    1: { arabic: "ٱلم", english: "Alif Lām Mīm", range: "Al-Baqarah 1-141" },
    2: { arabic: "سَيَقُولُ", english: "Sayaqūlu", range: "Al-Baqarah 142-252" },
    3: { arabic: "تِلْكَ ٱلرُّسُلُ", english: "Tilka 'r-Rusul", range: "Al-Baqarah 253 - Ali 'Imran 92" },
    4: { arabic: "لَنْ تَنَالُوا", english: "Lan Tānālū", range: "Ali 'Imran 93-200" },
    5: { arabic: "وَٱلْمُحْصَنَاتُ", english: "Wa'l-Muḥṣanāt", range: "An-Nisa 1-176" },
    6: { arabic: "لَا يُحِبُّ ٱللَّهُ", english: "Lā Yuḥibbu 'llāh", range: "Al-Ma'idah 1-120" },
    7: { arabic: "وَإِذَا سَمِعُوا", english: "Wa 'Idhā Samiʿū", range: "Al-An'am 1-165" },
    8: { arabic: "وَلَوْ أَنَّنَا", english: "Wa-law annanā", range: "Al-A'raf 1-206" },
    9: { arabic: "قَالَ ٱلْمَلَأُ", english: "Qāla 'l-Mala'u", range: "Al-Anfal 1-75" },
    10: { arabic: "وَٱعْلَمُوا", english: "Wa-ʿlamū", range: "At-Tawbah 1-129" },
    11: { arabic: "يَعْتَذِرُونَ", english: "Yaʿtadhirūn", range: "At-Tawbah 93-129" },
    12: { arabic: "وَمَا مِنْ دَآبَّةٍ", english: "Wa mā min dābbah", range: "Hud 6-123" },
    13: { arabic: "وَمَا أُبَرِّئُ", english: "Wa mā ubarri'u", range: "Yusuf 53-111" },
    14: { arabic: "رُبَمَا", english: "Rubamā", range: "Al-Hijr 1-99" },
    15: { arabic: "سُبْحَانَ", english: "Subḥāna", range: "Al-Isra 1-111" },
    16: { arabic: "قَالَ أَلَمْ", english: "Qāla 'alam", range: "Al-Kahf 75-98" },
    17: { arabic: "ٱقْتَرَبَ", english: "Iqtaraba", range: "Al-Anbya 1-112" },
    18: { arabic: "قَدْ أَفْلَحَ", english: "Qad 'aflaḥa", range: "Al-Mu'minun 1-118" },
    19: { arabic: "وَقَالَ ٱلَّذِينَ", english: "Wa-qāla 'lladhīna", range: "Al-Furqan 21-77" },
    20: { arabic: "أَمَّنْ خَلَقَ", english: "A'man Khalaqa", range: "An-Naml 56-93" },
    21: { arabic: "أُتْلُ مَاأُوْحِیَ", english: "Utlu mā ūḥiya", range: "Al-'Ankabut 45-69" },
    22: { arabic: "وَمَنْ يَقْنُتْ", english: "Wa-man yaqnut", range: "Al-Ahzab 31-73" },
    23: { arabic: "وَمَا لِيَ", english: "Wa-mā liya", range: "Ya-Sin 22-83" },
    24: { arabic: "فَمَنْ أَظْلَمُ", english: "Fa-man 'aẓlamu", range: "Az-Zumar 32-75" },
    25: { arabic: "إِلَيْهِ يُرَدُّ", english: "Ilayhi yuraddu", range: "Fussilat 47-54" },
    26: { arabic: "حم", english: "Ḥā Mīm", range: "Al-Ahqaf 1-35" },
    27: { arabic: "قَالَ فَمَا خَطْبُكُمْ", english: "Qāla fa-mā khaṭbukum", range: "Adh-Dhariyat 31-60" },
    28: { arabic: "قَدْ سَمِعَ ٱللَّهُ", english: "Qad samiʿa 'llāh", range: "Al-Mujadilah 1-24" },
    29: { arabic: "تَبَارَكَ ٱلَّذِى", english: "Tabāraka 'lladhī", range: "Al-Mulk 1-30" },
    30: { arabic: "عَمَّ", english: "ʿAmma", range: "Al-Mulk 1 - An-Nas 6" }
};

// Toggle Navigation
// Toggle Navigation
function setupToggleNav() {
    const toggleContainer = document.querySelector('.toggle-container');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const sections = document.querySelectorAll('.section');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            toggleBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked button and corresponding section
            btn.classList.add('active');
            document.getElementById(section + 'Section').classList.add('active');
            
            // Update container's data-active attribute for the sliding indicator
            toggleContainer.setAttribute('data-active', section);
            
            // Load content based on section
            if (section === 'surahs') {
                if (!document.querySelector('#surahsGrid .surah-card')) {
                    initializeSurahGrid();
                }
            } else if (section === 'juz') {
                if (!document.querySelector('#juzGrid .surah-card')) {
                    initializeJuzGrid();
                }
            }
        });
    });
}

// Fetch data from API
async function fetchData(type) {
    try {
        console.log(`Fetching ${type} from:`, API_URLS[type]);
        const response = await fetch(API_URLS[type]);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (type === 'surahs') {
            allSurahs = data.chapters;
            return data.chapters;
        }
        return data.juzs;
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        throw error;
    }
}

// Create HTML for a single surah card
function createSurahCard(surah) {
    return `
        <div class="surah-card" id="surah-${surah.id}" onclick="window.location.href='/surah/${surah.id}'">
            <div class="surah-number">${surah.id}</div>
            <div class="surah-arabic">${surah.name_arabic}</div>
            <div class="surah-english">${surah.name_simple}</div>
            <div class="surah-info">${surah.translated_name.name} (${surah.verses_count})</div>
            <div class="revelation-place">${surah.revelation_place}</div>
        </div>
    `;
}

// Create HTML for a single juz card
function createJuzCard(juzNumber) {
    const juz = juzData[juzNumber];
    return `
        <div class="surah-card" id="juz-${juzNumber}" onclick="window.location.href='/juz/${juzNumber}'">
            <div class="surah-number">${juzNumber}</div>
            <div class="surah-arabic">${juz.arabic}</div>
            <div class="surah-english">${juz.english}</div>
            <div class="surah-info">${juz.range}</div>
            <div class="revelation-place">Juz ${juzNumber} of 30</div>
        </div>
    `;
}

// Initialize the juz grid
async function initializeJuzGrid() {
    const juzGrid = document.getElementById('juzGrid');
    if (!juzGrid) {
        console.error('Juz grid element not found!');
        return;
    }
    
    // Show loading state
    juzGrid.innerHTML = '<div class="loading">Loading Juz...</div>';
    
    try {
        // Create array of 30 juz
        const juzHTML = Array.from({ length: 30 }, (_, i) => createJuzCard(i + 1)).join('');
        juzGrid.innerHTML = juzHTML;

        console.log('Successfully rendered 30 juz');
    } catch (error) {
        console.error('Failed to initialize juzs:', error);
        juzGrid.innerHTML = `
            <div class="error">
                Failed to load juzs. Please try again later.<br>
                Error: ${error.message}
            </div>
        `;
    }
}

// Search functionality for surahs
function setupSearch() {
    const searchInput = document.getElementById('surahSearch');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    let debounceTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length < 1) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const suggestions = allSurahs.filter(surah => 
                surah.name_simple.toLowerCase().includes(searchTerm) ||
                surah.translated_name.name.toLowerCase().includes(searchTerm) ||
                surah.id.toString() === searchTerm
            ).slice(0, 5);

            if (suggestions.length > 0) {
                suggestionsContainer.innerHTML = suggestions.map(surah => `
                    <div class="suggestion-item" onclick="scrollToSurah(${surah.id})">
                        <span class="suggestion-number">${surah.id}</span>
                        <div class="suggestion-text">
                            <div class="suggestion-name">${surah.name_simple}</div>
                            <div class="suggestion-translation">${surah.translated_name.name}</div>
                        </div>
                    </div>
                `).join('');
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        }, 300);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
}


// Scroll to surah function
function scrollToSurah(surahId) {
    const surahElement = document.getElementById(`surah-${surahId}`);
    if (surahElement) {
        // Remove highlight from any previously highlighted surah
        const previousHighlight = document.querySelector('.surah-card.highlight');
        if (previousHighlight) {
            previousHighlight.classList.remove('highlight');
        }

        // Scroll to the surah
        surahElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
        });

        // Add highlight effect
        surahElement.classList.add('highlight');

        // Optional: Remove highlight after animation completes
        setTimeout(() => {
            surahElement.classList.remove('highlight');
        }, 1500);
    }

    // Clear search and hide suggestions
    document.getElementById('surahSearch').value = '';
    document.getElementById('searchSuggestions').style.display = 'none';
}

// Initialize the surah grid
async function initializeSurahGrid() {
    const surahsGrid = document.getElementById('surahsGrid');
    if (!surahsGrid) {
        console.error('Surahs grid element not found!');
        return;
    }
    
    // Show loading state
    surahsGrid.innerHTML = '<div class="loading">Loading Surahs...</div>';
    
    try {
        const surahs = await fetchData('surahs');
        
        if (!Array.isArray(surahs)) {
            throw new Error('Invalid surahs data received');
        }

        // Clear loading state and render surahs
        const surahsHTML = surahs.map(surah => createSurahCard(surah)).join('');
        surahsGrid.innerHTML = surahsHTML;

        // Setup search after surahs are loaded
        setupSearch();

        console.log('Successfully rendered', surahs.length, 'surahs');
    } catch (error) {
        console.error('Failed to initialize surahs:', error);
        surahsGrid.innerHTML = `
            <div class="error">
                Failed to load surahs. Please try again later.<br>
                Error: ${error.message}
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    setupToggleNav();
    initializeSurahGrid(); // Load surahs by default
});