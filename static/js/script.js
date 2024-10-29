// API URL constant
const API_URL = 'https://api.quran.com/api/v4/chapters';

// Fetch surahs from the API
async function fetchSurahs() {
  try {
    console.log('Fetching surahs from:', API_URL);
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.chapters;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

// Create HTML for a single surah card
function createSurahCard(surah) {
  return `
    <div class="surah-card" onclick="window.location.href='/surah/${surah.id}'">
      <div class="surah-number">${surah.id}</div>
      <div class="surah-arabic">${surah.name_arabic}</div>
      <div class="surah-english">${surah.name_simple}</div>
      <div class="surah-info">${surah.translated_name.name} (${surah.verses_count})</div>
      <div class="revelation-place">${surah.revelation_place}</div>
    </div>
  `;
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