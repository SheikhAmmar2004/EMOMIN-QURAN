from flask import Flask, render_template, Response, jsonify
import cv2
from emotion import get_emotion
import requests

app = Flask(__name__)

# Store the last detected emotion
last_detected_emotion = None

def generate_frames():
    global last_detected_emotion
    cap = cv2.VideoCapture(0)
    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            # Get the detected emotion for the current frame
            emotion = get_emotion(frame)
            if emotion:
                last_detected_emotion = emotion
            
            # Encode the frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect-emotion')
def detect_emotion():
    return render_template('detect_emotion.html')

@app.route('/select-emotion')
def select_emotion():
    return render_template('select_emotion.html')

@app.route('/surah/<int:surah_id>')
def show_surah(surah_id):
    try:
        # Fetch surah data from the API
        response = requests.get(f'https://quranapi.pages.dev/api/{surah_id}.json')
        response.raise_for_status()
        surah_data = response.json()
        
        # Add the surah number to the data for the audio player
        surah_data['number'] = surah_id
        
        # Fetch the audio URL from the Quran.com API
        audio_response = requests.get(f'https://api.quran.com/api/v4/chapter_recitations/7/{surah_id}')
        if audio_response.status_code == 200:
            audio_data = audio_response.json()
            surah_data['audio_url'] = audio_data.get('audio_file', {}).get('audio_url', '')
        
        return render_template('surah.html', surah=surah_data)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading surah: {str(e)}", 500

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_emotion')
def get_current_emotion():
    global last_detected_emotion
    return jsonify({'emotion': last_detected_emotion})

if __name__ == '__main__':
    app.run(debug=True)