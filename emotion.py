import cv2
from deepface import DeepFace
import time
import logging
import threading
import numpy as np

# Define a class for emotion detection using OpenCV and DeepFace
class EmotionDetector:
    def __init__(self):
        # Load the pre-trained Haar Cascade model for face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        # Set the minimum confidence threshold for detected emotions to be counted
        self.confidence_threshold = 0.7
        # Set the time interval (in seconds) for analyzing emotion votes
        self.time_window = 3
        # Dictionary to store votes for each detected emotion
        self.emotion_votes = {}
        # Variables to keep track of the last detected emotion and the time it was detected
        self.last_detected_emotion = None
        self.last_emotion_time = 0
        # Thread lock to ensure thread-safe operations on shared data
        self.lock = threading.Lock()

    def detect_emotion(self, frame):
        # Convert the captured frame to grayscale for face detection
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Detect faces in the grayscale frame
        faces = self.face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        # Return None if no faces are detected
        if len(faces) == 0:
            return None

        # Extract the region of interest (ROI) for the first detected face
        x, y, w, h = faces[0]
        face_roi = frame[y:y + h, x:x + w]

        try:
            # Use DeepFace to analyze the emotion in the face ROI
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            # If DeepFace returns a list, select the first element
            if isinstance(result, list):
                result = result[0]
            
            # Get the dominant emotion and its confidence level
            emotion = result['dominant_emotion']
            confidence = result['emotion'][emotion]

            # Update the emotion_votes dictionary if the confidence is above the threshold
            if confidence >= self.confidence_threshold:
                with self.lock:  # Ensure thread-safe access to emotion_votes
                    if emotion in self.emotion_votes:
                        self.emotion_votes[emotion] += confidence  # Increment confidence for the emotion
                    else:
                        self.emotion_votes[emotion] = confidence  # Add new emotion with initial confidence

            current_time = time.time()
            # Check if enough time has passed to determine the final emotion
            if current_time - self.last_emotion_time >= self.time_window:
                with self.lock:
                    if self.emotion_votes:
                        # Determine the emotion with the highest confidence
                        final_emotion = max(self.emotion_votes, key=self.emotion_votes.get)
                        # Clear emotion_votes dictionary for the next time window
                        self.emotion_votes = {}
                        # Update last detected emotion and time
                        self.last_detected_emotion = final_emotion
                        self.last_emotion_time = current_time
                        # Log the final detected emotion
                        logging.info(f"Final emotion: {final_emotion}")
                        return final_emotion

        except Exception as e:
            # Log any errors encountered during emotion detection
            logging.error(f"Error in emotion detection: {e}")

        # Return None if no final emotion is detected within the time window
        return None

# Initialize logging to store emotion detection logs in a file
logging.basicConfig(filename='emotion_detection.log', level=logging.INFO)

# Create a global instance of EmotionDetector
emotion_detector = EmotionDetector()

def get_emotion(frame):
    # Wrapper function to get emotion from the global EmotionDetector instance
    return emotion_detector.detect_emotion(frame)
