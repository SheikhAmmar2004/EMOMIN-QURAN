// Store the last detected emotion
let lastEmotion = null;

// Function to display the detected emotion and show popup if changed
function showEmotion(emotion) {
  document.getElementById("detectedEmotion").textContent = `Detected Emotion: ${emotion}`;
  if (emotion !== lastEmotion) {
    showPopup(`Emotion change detected: ${emotion}`);
    lastEmotion = emotion;
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
  videoFeed.style.display = "block";
  videoFeed.src = "/video_feed";
  console.log("Emotion detection started!");
  startEmotionPolling();
}

// Function to periodically poll for the latest detected emotion
function startEmotionPolling() {
  setInterval(() => {
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

// Start detection automatically when the page loads
document.addEventListener('DOMContentLoaded', () => {
  startDetection();
});