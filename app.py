from flask import Flask, render_template, Response, jsonify, redirect, url_for, json
import cv2
from emotion import get_emotion
import requests
import os
import time

# Initialize the Flask application
app = Flask(__name__)

# Dictionary mapping emotions to their recommended surahs
SURAH_RECOMMENDATIONS = {
    'happy': [1, 108, 104, 107, 59, 112, 13],  # Surah numbers for happiness
    'sad': [107, 2, 113, 103, 93, 12, 105, 36, 1, 55, 18, 112, 114],
    'fear': [113, 114, 1, 55, 56, 77, 19, 59, 67, 18, 13, 17, 24, 5, 9, 33],
    'angry': [111, 18, 1],
    'disgust': [19],
    'neutral': [1, 112, 113, 114],  # Default recommendations
    'surprise': [1, 112, 113, 114]  # Default recommendations
}

# Variable to store the last detected emotion and its timestamp
last_detected_emotion = None
emotion_detection_start_time = None

def get_recommendations(emotion):
    """
    Get recommended surahs for a given emotion.
    Returns a list of surah IDs.
    """
    emotion = emotion.lower()
    return SURAH_RECOMMENDATIONS.get(emotion, SURAH_RECOMMENDATIONS['neutral'])

def generate_frames():
    """
    Capture video frames from the webcam and process each frame to detect emotion.
    The function yields frames as JPEG images to be displayed on the web page.
    """
    global last_detected_emotion, emotion_detection_start_time
    
    # Reset emotion state when starting new detection
    last_detected_emotion = None
    emotion_detection_start_time = time.time()
    
    # Open the default camera
    cap = cv2.VideoCapture(0)
    
    # Wait for camera to initialize
    time.sleep(1)
    
    while True:
        # Read a frame from the camera
        success, frame = cap.read()
        if not success:
            break
        else:
            # Only start emotion detection after initial delay
            if time.time() - emotion_detection_start_time > 2:
                # Get the detected emotion for the current frame
                emotion = get_emotion(frame)
                if emotion:
                    last_detected_emotion = emotion
            
            # Encode the frame as JPEG for display in the browser
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route for the emotion detection page
@app.route('/detect-emotion')
def detect_emotion():
    global last_detected_emotion, emotion_detection_start_time
    # Reset emotion state when accessing the detection page
    last_detected_emotion = None
    emotion_detection_start_time = None
    return render_template('detect_emotion.html')

# Route for the emotion selection page
@app.route('/select-emotion')
def select_emotion():
    return render_template('select_emotion.html')

# Route for emotion-based recommendations
@app.route('/recommendations/<emotion>')
def show_recommendations(emotion):
    recommended_surahs = get_recommendations(emotion)
    return render_template('recommendations.html', 
                         emotion=emotion,
                         recommended_surahs=json.dumps(recommended_surahs))

# Route to display a specific Surah with its audio
@app.route('/surah/<int:surah_id>')
def show_surah(surah_id):
    try:
        response = requests.get(f'https://quranapi.pages.dev/api/{surah_id}.json')
        response.raise_for_status()
        surah_data = response.json()
        surah_data['number'] = surah_id
        
        audio_response = requests.get(f'https://api.quran.com/api/v4/chapter_recitations/7/{surah_id}')
        if audio_response.status_code == 200:
            audio_data = audio_response.json()
            surah_data['audio_url'] = audio_data.get('audio_file', {}).get('audio_url', '')
        
        return render_template('surah.html', surah=surah_data)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading surah: {str(e)}", 500

# Route to provide a video feed of emotion detection in real-time
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Route to get the current detected emotion
@app.route('/get_emotion')
def get_current_emotion():
    global last_detected_emotion
    return jsonify({'emotion': last_detected_emotion})

if __name__ == '__main__':
    app.run(debug=True)