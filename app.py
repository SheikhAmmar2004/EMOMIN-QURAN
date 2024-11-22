from flask import Flask, render_template, Response, jsonify
import cv2
from emotion import get_emotion
import requests

# Initialize the Flask application
app = Flask(__name__)

# Variable to store the last detected emotion
last_detected_emotion = None

def generate_frames():
    """
    Capture video frames from the webcam and process each frame to detect emotion.
    The function yields frames as JPEG images to be displayed on the web page.
    """
    global last_detected_emotion
    # Open the default camera
    cap = cv2.VideoCapture(0)
    while True:
        # Read a frame from the camera
        success, frame = cap.read()
        if not success:
            break
        else:
            # Get the detected emotion for the current frame
            emotion = get_emotion(frame)
            # Update the last detected emotion if one is found
            if emotion:
                last_detected_emotion = emotion
            
            # Encode the frame as JPEG for display in the browser
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            # Yield the frame as a part of an HTTP response for streaming
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Route for the main page
@app.route('/')
def index():
    # Render the main page template
    return render_template('index.html')

# Route for the emotion detection page
@app.route('/detect-emotion')
def detect_emotion():
    # Render the emotion detection page template
    return render_template('detect_emotion.html')

# Route for the emotion selection page
@app.route('/select-emotion')
def select_emotion():
    # Render the emotion selection page template
    return render_template('select_emotion.html')

# Route to display a specific Surah with its audio
@app.route('/surah/<int:surah_id>')
def show_surah(surah_id):
    """
    Fetch Surah data and audio for a given Surah ID using external APIs.
    If successful, render the Surah page with its data and audio.
    """
    try:
        # Fetch Surah details from an API
        response = requests.get(f'https://quranapi.pages.dev/api/{surah_id}.json')
        response.raise_for_status()
        surah_data = response.json()
        
        # Add Surah number to data for displaying and audio playback
        surah_data['number'] = surah_id
        
        # Fetch the audio URL from Quran.com API for the Surah
        audio_response = requests.get(f'https://api.quran.com/api/v4/chapter_recitations/7/{surah_id}')
        if audio_response.status_code == 200:
            audio_data = audio_response.json()
            # Add the audio URL to the Surah data
            surah_data['audio_url'] = audio_data.get('audio_file', {}).get('audio_url', '')
        
        # Render the Surah page with the fetched data
        return render_template('surah.html', surah=surah_data)
    except Exception as e:
        # Print and return an error message if fetching data fails
        print("Error:", str(e))
        return f"Error loading surah: {str(e)}", 500

# Route to provide a video feed of emotion detection in real-time
@app.route('/video_feed')
def video_feed():
    # Generate a video feed response with frames from the webcam
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Route to get the current detected emotion as JSON data
@app.route('/get_emotion')
def get_current_emotion():
    global last_detected_emotion
    # Return the last detected emotion in JSON format
    return jsonify({'emotion': last_detected_emotion})

# Run the Flask application
if __name__ == '__main__':
    # Start the Flask app in debug mode
    app.run(debug=True)
