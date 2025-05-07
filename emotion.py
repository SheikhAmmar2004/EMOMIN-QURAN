import cv2
import numpy as np
import tensorflow as tf
import logging
import threading
import time

class EmotionDetector:
    def __init__(self):
        # Load YuNet face detector
        self.face_detector = cv2.FaceDetectorYN_create(
            'face_detection_yunet_2023mar.onnx',
            "",
            (320, 320),  # Input size - smaller for faster processing
            score_threshold=0.9,
            nms_threshold=0.3,
            top_k=5000
        )
        
        # Load your improved custom model
        try:
            self.model = tf.keras.models.load_model('model/model_file_improved.h5')
            logging.info("Improved custom emotion model loaded successfully")
        except Exception as e:
            logging.error(f"Error loading custom model: {e}")
            raise
        
        # Emotion labels matching your training data
        self.emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
        
        # Detection parameters
        self.confidence_threshold = 0.7
        self.time_window = 1  # Reduced from 2 to 1 second for faster response
        self.emotion_votes = {}
        self.last_detected_emotion = None
        self.last_emotion_time = 0
        self.lock = threading.Lock()

        # Image dimensions matching your model
        self.IMG_HEIGHT = 48
        self.IMG_WIDTH = 48

    def preprocess_face(self, face_roi):
        """Preprocess the face image to match training preprocessing"""
        try:
            # Resize to 48x48 as per your model's input size
            face_roi = cv2.resize(face_roi, (self.IMG_WIDTH, self.IMG_HEIGHT))
            
            # Convert to grayscale (since your model was trained on grayscale)
            if len(face_roi.shape) == 3:
                face_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            
            # Normalize pixel values to [0,1] as done in training
            face_roi = face_roi.astype('float32') / 255.0
            
            # Reshape to match model's input shape
            face_roi = np.expand_dims(face_roi, axis=-1)  # Add channel dimension
            face_roi = np.expand_dims(face_roi, axis=0)   # Add batch dimension
            
            return face_roi
        except Exception as e:
            logging.error(f"Error in preprocessing: {e}")
            return None

    def detect_emotion(self, frame):
        """Detect emotion in the given frame"""
        try:
            # Resize frame for faster processing
            height, width = frame.shape[:2]
            target_width = 320  # Smaller size for faster processing
            scale = target_width / width
            target_height = int(height * scale)
            
            resized_frame = cv2.resize(frame, (target_width, target_height))
            
            # Set input size for YuNet
            self.face_detector.setInputSize((target_width, target_height))
            
            # Detect faces using YuNet
            _, faces = self.face_detector.detect(resized_frame)
            
            if faces is None or len(faces) == 0:
                return None

            # Process the first detected face (highest confidence)
            face = faces[0]
            x, y, w, h = list(map(int, face[:4]))
            
            # Expand the face region slightly
            padding = int(min(w, h) * 0.1)
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(target_width - x, w + 2 * padding)
            h = min(target_height - y, h + 2 * padding)
            
            face_roi = resized_frame[y:y+h, x:x+w]

            # Preprocess the face
            processed_face = self.preprocess_face(face_roi)
            if processed_face is None:
                return None

            # Get prediction from model
            predictions = self.model.predict(processed_face, verbose=0)
            emotion_idx = np.argmax(predictions[0])
            confidence = predictions[0][emotion_idx]
            emotion = self.emotions[emotion_idx]

            # Apply confidence threshold and voting mechanism
            if confidence >= self.confidence_threshold:
                with self.lock:
                    self.emotion_votes[emotion] = self.emotion_votes.get(emotion, 0) + confidence

            current_time = time.time()
            if current_time - self.last_emotion_time >= self.time_window:
                with self.lock:
                    if self.emotion_votes:
                        # Get the emotion with highest confidence over the time window
                        final_emotion = max(self.emotion_votes, key=self.emotion_votes.get)
                        self.emotion_votes = {}
                        self.last_detected_emotion = final_emotion
                        self.last_emotion_time = current_time
                        logging.info(f"Detected emotion: {final_emotion} (confidence: {confidence:.2f})")
                        return final_emotion.lower()  # Return lowercase to match frontend expectations

        except Exception as e:
            logging.error(f"Error in emotion detection: {e}")
            return None

        return None

# Configure logging
logging.basicConfig(
    filename='emotion_detection.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Global instance of EmotionDetector
emotion_detector = EmotionDetector()

def get_emotion(frame):
    """Wrapper function to get emotion from EmotionDetector instance"""
    return emotion_detector.detect_emotion(frame)