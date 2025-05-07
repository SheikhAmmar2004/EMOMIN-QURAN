// Store the last detected emotion and initialization state
let lastEmotion = null;
let isInitialized = false;
let confidenceCount = 0;
let isPolling = true;
const CONFIDENCE_THRESHOLD = 2; // Reduced from 3 to 2 for faster response
let autoPlayEnabled = localStorage.getItem('autoPlayEnabled') === 'true';
let detectionInterval;
let lightingCheckInterval;

// Function to show status messages
function showStatusMessage(message, type = 'info') {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
}

// Function to show the confirmation dialog
function showConfirmationDialog(emotion) {
    const dialog = document.getElementById('confirmationDialog');
    const emotionText = document.getElementById('detectedEmotionText');
    emotionText.textContent = emotion;
    dialog.classList.remove('hidden');
}

// Function to hide the confirmation dialog
function hideConfirmationDialog() {
    const dialog = document.getElementById('confirmationDialog');
    dialog.classList.add('hidden');
}

function handleContinue() {
    localStorage.setItem('autoPlayEnabled', autoPlayEnabled);
    window.location.href = `/recommendations/${lastEmotion}?from_detection=true`;
}

function toggleAutoPlay() {
    const autoPlaySwitch = document.getElementById('autoPlaySwitch');
    autoPlayEnabled = autoPlaySwitch.checked;
    localStorage.setItem('autoPlayEnabled', autoPlayEnabled);
}

function handleRetry() {
    hideConfirmationDialog();
    isPolling = true;
    confidenceCount = 0;
    lastEmotion = null;
}

function handleManualSelection() {
    stopDetection();
    window.location.href = '/select-emotion';
}

function checkLighting(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;  // Smaller size for faster processing
    canvas.height = Math.floor(100 * videoElement.videoHeight / videoElement.videoWidth);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let brightness = 0;

    for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    return brightness / (data.length / 4);
}

function captureFrame(videoElement) {
    const canvas = document.createElement('canvas'); // Use temp canvas
    canvas.width = 320;  // Smaller size for faster processing
    canvas.height = Math.floor(320 * videoElement.videoHeight / videoElement.videoWidth);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7); // Lower quality for faster transfer
}

function showEmotion(emotion) {
    if (!isInitialized || !isPolling) return;
    
    if (emotion !== lastEmotion) {
        confidenceCount = 0;
        lastEmotion = emotion;
    } else {
        confidenceCount++;
        
        if (confidenceCount >= CONFIDENCE_THRESHOLD) {
            showConfirmationDialog(emotion);
            isPolling = false;
        }
    }
}

function startEmotionPolling() {
    // Clear any existing interval
    if (detectionInterval) clearInterval(detectionInterval);
    
    detectionInterval = setInterval(() => {
        if (!isInitialized || !isPolling) return;

        const imageData = captureFrame(document.getElementById("videoElement"));

        fetch('/get_emotion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.emotion) showEmotion(data.emotion);
        })
        .catch(error => console.error('Error:', error));
    }, 500); // Faster polling (500ms instead of 1000ms)
}

function stopDetection() {
    const videoElement = document.getElementById("videoElement");
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    if (detectionInterval) clearInterval(detectionInterval);
    if (lightingCheckInterval) clearInterval(lightingCheckInterval);
}

function startDetection() {
    const videoElement = document.getElementById("videoElement");
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    loadingSpinner.classList.remove('hidden');
    showStatusMessage('Starting camera...');

    navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: { ideal: 640 },  // Lower resolution for faster processing
            height: { ideal: 480 },
            facingMode: 'user' 
        } 
    })
    .then(stream => {
        videoElement.srcObject = stream;
        
        videoElement.onloadedmetadata = () => {
            isInitialized = true;
            showStatusMessage('Camera ready. Please keep your face centered.');
            loadingSpinner.classList.add('hidden');
            startEmotionPolling();
            
            lightingCheckInterval = setInterval(() => {
                const brightness = checkLighting(videoElement);
                if (brightness < 50) {
                    showStatusMessage('Low lighting detected. Please move to a brighter area.', 'warning');
                }
            }, 3000);
        };
    })
    .catch(error => {
        loadingSpinner.classList.add('hidden');
        showStatusMessage('Failed to access camera. Please check permissions.', 'error');
        console.error('Camera error:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const targetElement = document.getElementById('detectEmotionHeading');
    if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition - 60; 
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
    
    startDetection();
    document.getElementById('continueBtn').addEventListener('click', handleContinue);
    document.getElementById('retryBtn').addEventListener('click', handleRetry);
    document.getElementById('manualBtn').addEventListener('click', handleManualSelection);

    const autoPlaySwitch = document.getElementById('autoPlaySwitch');
    autoPlaySwitch.checked = autoPlayEnabled;
    autoPlaySwitch.addEventListener('change', toggleAutoPlay);
});

// Clean up on page unload
window.addEventListener('beforeunload', stopDetection);