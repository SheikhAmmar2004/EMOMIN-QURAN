// Store the last detected emotion and initialization state
let lastEmotion = null;
let isInitialized = false;
let confidenceCount = 0;
const CONFIDENCE_THRESHOLD = 3; // Number of consistent detections needed before redirecting

// Function to display the detected emotion and show popup if changed
function showEmotion(emotion) {
    if (!isInitialized) return; // Don't process emotions until initialized
    
    document.getElementById("detectedEmotion").textContent = `Detected Emotion: ${emotion}`;
    
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
            setTimeout(() => {
                window.location.href = `/recommendations/${emotion}`;
            }, 1500);
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
    const detectedEmotion = document.getElementById("detectedEmotion");
    
    // Show loading state
    detectedEmotion.textContent = "Initializing camera...";
    
    videoFeed.style.display = "block";
    videoFeed.src = "/video_feed";
    
    // Wait for video feed to be ready
    videoFeed.onload = () => {
        console.log("Camera initialized!");
        isInitialized = true;
        detectedEmotion.textContent = "Detecting emotion...";
        startEmotionPolling();
    };
}

// Function to periodically poll for the latest detected emotion
function startEmotionPolling() {
    setInterval(() => {
        if (!isInitialized) return; // Don't poll until initialized
        
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
});