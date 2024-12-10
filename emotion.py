import cv2
from deepface import DeepFace
import time
import logging
import threading
import numpy as np

# Class for emotion detection using OpenCV and DeepFace
class EmotionDetector:
    def __init__(self):
        # Load Haar Cascade model for face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.confidence_threshold = 0.7  # Minimum confidence for emotion detection
        self.time_window = 2  # Time interval for analyzing emotion votes
        self.emotion_votes = {}  # Store votes for detected emotions
        self.last_detected_emotion = None
        self.last_emotion_time = 0
        self.lock = threading.Lock()  # Thread-safe operations

    def detect_emotion(self, frame):
        # Resize and convert frame to grayscale for faster processing
        frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=4, minSize=(20, 20), flags=cv2.CASCADE_SCALE_IMAGE)

        if len(faces) == 0:
            return None

        # Extract ROI for the first detected face
        x, y, w, h = faces[0]
        face_roi = frame[y:y + h, x:x + w]

        try:
            # Analyze the emotion in the face ROI using DeepFace
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False, detector_backend='opencv')
            if isinstance(result, list):
                result = result[0]

            # Get the dominant emotion and confidence
            emotion = result['dominant_emotion']
            confidence = result['emotion'][emotion]

            if confidence >= self.confidence_threshold:
                with self.lock:
                    self.emotion_votes[emotion] = self.emotion_votes.get(emotion, 0) + confidence

            current_time = time.time()
            if current_time - self.last_emotion_time >= self.time_window:
                with self.lock:
                    if self.emotion_votes:
                        # Determine the emotion with the highest confidence
                        final_emotion = max(self.emotion_votes, key=self.emotion_votes.get)
                        self.emotion_votes = {}
                        self.last_detected_emotion = final_emotion
                        self.last_emotion_time = current_time
                        logging.info(f"Final emotion: {final_emotion}")
                        return final_emotion

        except Exception as e:
            logging.error(f"Error in emotion detection: {e}")

        return None

# Configure logging
logging.basicConfig(filename='emotion_detection.log', level=logging.INFO)

# Global instance of EmotionDetector
emotion_detector = EmotionDetector()

def get_emotion(frame):
    # Wrapper function to get emotion from EmotionDetector instance
    return emotion_detector.detect_emotion(frame)
