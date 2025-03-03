// API URL constant
const API_URL = 'https://api.quran.com/api/v4/chapters';
let allSurahs = []; // Store all surahs for searching

// Fetch surahs from the API
async function fetchSurahs() {
    try {
        console.log('Fetching surahs from:', API_URL);
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allSurahs = data.chapters; // Store surahs globally
        return data.chapters;
    } catch (error) {
        console.error('Error fetching surahs:', error);
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

// Search functionality
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
      }, 1500); // Match this with the CSS animation duration
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
        const surahs = await fetchSurahs();
        
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
    console.log('DOM loaded, initializing surah grid...');
    initializeSurahGrid();
});

