// Store the last detected emotion and initialization state
let lastEmotion = null;
let isInitialized = false;
let confidenceCount = 0;
let isPolling = true; // Track polling state
const CONFIDENCE_THRESHOLD = 3; // Number of consistent detections needed before redirecting

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

// Function to handle the continue action
function handleContinue() {
    window.location.href = `/recommendations/${lastEmotion}`;
}

// Function to handle the retry action
function handleRetry() {
    hideConfirmationDialog();
    isPolling = true;
    startDetection();
}

// Function to handle the manual selection action
function handleManualSelection() {
    window.location.href = '/select-emotion';
}

// Function to check lighting conditions
function checkLighting(imageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width; // Use the img element's width
    canvas.height = imageElement.height; // Use the img element's height
    const ctx = canvas.getContext('2d');
    
    // Draw the current image on the canvas
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let brightness = 0;

    for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3; // Average of R, G, B
    }

    const averageBrightness = brightness / (data.length / 4); // Average brightness
    return averageBrightness;
}

// Function to display the detected emotion and show popup if changed
function showEmotion(emotion) {
    if (!isInitialized || !isPolling) return; // Don't process emotions until initialized
    
    if (emotion !== lastEmotion) {
        // Reset confidence count when emotion changes
        confidenceCount = 0;
        lastEmotion = emotion;
        showPopup(`Emotion detected: ${emotion}`);
    } else {
        // Increment confidence count for consistent emotions
        confidenceCount++;
        
        // Only redirect after reaching confidence threshold
        if (confidenceCount === CONFIDENCE_THRESHOLD) {
            showPopup(`Confirmed emotion: ${emotion}`);
            showConfirmationDialog(emotion);
            isPolling = false;
        }
    }
}

// Function to show and hide the popup notification
function showPopup(message) {
    const popup = document.getElementById("popup");
    popup.textContent = message;
    popup.style.display = "block";
    popup.style.opacity = "1";
    setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => {
            popup.style.display = "none";
        }, 300);
    }, 3000);
}

// Function to start the emotion detection process
function startDetection() {
    const videoFeed = document.getElementById("videoFeed");
    const loadingSpinner = document.getElementById('loadingSpinner');
    try {
        // Show loading state
        loadingSpinner.classList.remove('hidden');
        showStatusMessage('Starting camera...');
    
        videoFeed.style.display = "block";
        videoFeed.src = "/video_feed";
    
        // Wait for video feed to be ready
        videoFeed.onload = () => {
            console.log("Camera initialized!");
            isInitialized = true;
            showStatusMessage('Camera ready. Please keep your face centered.');
            loadingSpinner.classList.add('hidden');
            startEmotionPolling();
             // Check lighting conditions periodically
            setInterval(() => {
                const brightness = checkLighting(videoFeed);
                if (brightness < 50) {
                    showStatusMessage('Low lighting detected. Please move to a brighter area.', 'warning');
                } else {
                    showStatusMessage('Lighting conditions are good.', 'info');
                 }
            }, 3000);

        };

       
    } catch (error) {
        loadingSpinner.classList.add('hidden');
        showStatusMessage('Failed to access camera. Please check permissions.', 'error');
        console.error('Camera error:', error);
    }
}

// Function to periodically poll for the latest detected emotion
function startEmotionPolling() {
    setInterval(() => {
        if (!isInitialized || !isPolling) return; // Don't poll until initialized
        
        fetch('/get_emotion')
            .then(response => response.json())
            .then(data => {
                if (data.emotion) {
                    showEmotion(data.emotion);
                }
            })
            .catch(error => console.error('Error:', error));
    }, 1000); // Poll every second
}

// Start detection when the page loads
document.addEventListener('DOMContentLoaded', () => {
    startDetection();
    document.getElementById('continueBtn').addEventListener('click', handleContinue);
    document.getElementById('retryBtn').addEventListener('click', handleRetry);
    document.getElementById('manualBtn').addEventListener('click', handleManualSelection);
});
