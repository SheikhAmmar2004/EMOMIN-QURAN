// Audio Player functionality
document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('playButton');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    
    const audio = new Audio();
    let isPlaying = false;

    // Get the surah number from the data attribute
    const surahNumber = document.querySelector('.surah-banner').dataset.surahNumber;
    const audioUrl = `https://api.quran.com/api/v4/chapter_recitations/7/${surahNumber}`;

    // Fetch audio URL
    fetch(audioUrl)
        .then(response => response.json())
        .then(data => {
            audio.src = data.audio_file.audio_url;
        })
        .catch(error => console.error('Error loading audio:', error));

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

    // Update progress bar and time
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = percent + '%';
        
        const minutes = Math.floor(audio.currentTime / 60);
        const seconds = Math.floor(audio.currentTime % 60);
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    // Click on progress bar to seek
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // Reset play button when audio ends
    audio.addEventListener('ended', () => {
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        progress.style.width = '0%';
        timeDisplay.textContent = '0:00';
    });
});