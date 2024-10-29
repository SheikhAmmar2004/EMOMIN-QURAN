import cv2
from deepface import DeepFace
import time
import logging
import threading
import numpy as np

class EmotionDetector:
    def __init__(self):
        # Load the face detection cascade classifier
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.confidence_threshold = 0.7
        self.time_window = 3
        self.emotion_votes = {}
        self.last_detected_emotion = None
        self.last_emotion_time = 0
        self.lock = threading.Lock()

    def detect_emotion(self, frame):
        # Convert the frame to grayscale for face detection
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Detect faces in the frame
        faces = self.face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            return None

        # Extract the region of interest (ROI) for the first detected face
        x, y, w, h = faces[0]
        face_roi = frame[y:y + h, x:x + w]

        try:
            # Analyze the emotion in the face ROI
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            if isinstance(result, list):
                result = result[0]
            
            emotion = result['dominant_emotion']
            confidence = result['emotion'][emotion]

            # Update emotion votes if confidence is above threshold
            if confidence >= self.confidence_threshold:
                with self.lock:
                    if emotion in self.emotion_votes:
                        self.emotion_votes[emotion] += confidence
                    else:
                        self.emotion_votes[emotion] = confidence

            current_time = time.time()
            # Check if it's time to determine the final emotion
            if current_time - self.last_emotion_time >= self.time_window:
                with self.lock:
                    if self.emotion_votes:
                        final_emotion = max(self.emotion_votes, key=self.emotion_votes.get)
                        self.emotion_votes = {}
                        self.last_detected_emotion = final_emotion
                        self.last_emotion_time = current_time
                        logging.info(f"Final emotion: {final_emotion}")
                        return final_emotion

        except Exception as e:
            logging.error(f"Error in emotion detection: {e}")

        return None

# Initialize logging
logging.basicConfig(filename='emotion_detection.log', level=logging.INFO)

# Create a global instance of EmotionDetector
emotion_detector = EmotionDetector()

def get_emotion(frame):
    # Wrapper function to get emotion from the global EmotionDetector instance
    return emotion_detector.detect_emotion(frame)