from flask import Flask, render_template, Response, request, jsonify
import cv2
from emotion import get_emotion
import base64
import numpy as np
import time
import requests
import json
from recommendations import SURAH_RECOMMENDATIONS, AYAH_RECOMMENDATIONS, HADITH_RECOMMENDATIONS,juz_names

app = Flask(__name__)

# Add this new route to handle individual hadith display
@app.route('/hadith/<emotion>/<int:index>')
def show_hadith(emotion, index):
    try:
        hadith = HADITH_RECOMMENDATIONS[emotion.lower()][index]
        return render_template('hadith.html', hadith=hadith, emotion=emotion)
    except (KeyError, IndexError) as e:
        print("Error:", str(e))
        return f"Error loading hadith: {str(e)}", 404
# Variable to store the last detected emotion
last_detected_emotion = None

def get_recommendations(emotion):
    """
    Get recommended surahs for a given emotion.
    """
    emotion = emotion.lower()
    return SURAH_RECOMMENDATIONS.get(emotion, SURAH_RECOMMENDATIONS['neutral'])

def get_ayah_recommendations(emotion):
    """
    Get recommended ayahs for a given emotion.
    """
    emotion = emotion.lower()
    return AYAH_RECOMMENDATIONS.get(emotion, AYAH_RECOMMENDATIONS['neutral'])

def get_hadith_recommendations(emotion):
    """
    Get recommended hadith for a given emotion.
    """
    emotion = emotion.lower()
    return HADITH_RECOMMENDATIONS.get(emotion, HADITH_RECOMMENDATIONS['neutral'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/prayer-times')
def prayer_times():
    return render_template('prayer_times.html')

@app.route('/qibla')
def qibla():
    return render_template('qibla.html')

@app.route('/detect-emotion')
def detect_emotion():
    global last_detected_emotion
    last_detected_emotion = None
    return render_template('detect_emotion.html')

@app.route('/select-emotion')
def select_emotion():
    return render_template('select_emotion.html')

@app.route('/recommendations/<emotion>')
def show_recommendations(emotion):
    recommended_surahs = get_recommendations(emotion)
    recommended_ayahs = get_ayah_recommendations(emotion)
    recommended_hadiths = get_hadith_recommendations(emotion)

    from_detection = request.args.get('from_detection', 'false')
    return render_template(
        'recommendations.html', 
        emotion=emotion, 
        recommended_surahs=json.dumps(recommended_surahs),
        recommended_ayahs=json.dumps(recommended_ayahs),
        recommended_hadiths=json.dumps(recommended_hadiths),

        from_detection=from_detection
    )

@app.route('/ayah/<int:surah_number>/<int:ayah_number>')
def show_ayah(surah_number, ayah_number):
    try:
        # Fetch the ayah data from the API
        response = requests.get(f'https://api.alquran.cloud/v1/ayah/{surah_number}:{ayah_number}')
        response.raise_for_status()
        ayah_data = response.json()['data']
        
        return render_template('ayah.html', ayah=ayah_data)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading ayah: {str(e)}", 500

# ... rest of your routes remain the same ...
# Route to display a specific Surah with its audio
@app.route('/surah/<int:surah_id>')
def show_surah(surah_id):
    try:
        response = requests.get(f'https://quranapi.pages.dev/api/{surah_id}.json')
        response.raise_for_status()
        surah_data = response.json()
        surah_data['number'] = surah_id

        audio_response = requests.get(f'https://api.alquran.cloud/v1/surah/{surah_id}/ar.alafasy')
        if audio_response.status_code == 200:
            audio_data = audio_response.json()
            surah_data['audio_url'] = audio_data.get('audio_file', {}).get('audio_url', '')

        return render_template('surah.html', surah=surah_data)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading surah: {str(e)}", 500



# Add new route for juz display
@app.route('/juz/<int:juz_number>')
def show_juz(juz_number):
    try:
        # Fetch juz data from API
        response = requests.get(f'http://api.alquran.cloud/v1/juz/{juz_number}/quran-uthmani')
        response.raise_for_status()
        juz_data = response.json()

        # Get the ayahs from the juz
        ayahs = juz_data['data']['ayahs']
        return render_template('juz.html', 
                             juz_number=juz_number,
                             juz_name=juz_names.get(juz_number, ""),
                             ayahs=ayahs)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading juz: {str(e)}", 500



@app.route('/get_emotion', methods=['POST'])
def get_emotion_endpoint():
    """
    Receive base64 image data, decode it, detect emotion, and return the result.
    """
    global last_detected_emotion
    try:
        data = request.json
        image_data = data.get("image")
        if not image_data:
            return jsonify({"error": "No image data received"}), 400

        # Decode the base64 image
        image_data = base64.b64decode(image_data.split(",")[1])
        np_image = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        # Detect emotion
        emotion = get_emotion(frame)
        if emotion:
            last_detected_emotion = emotion
            return jsonify({"emotion": emotion}), 200
        else:
            return jsonify({"error": "Could not detect emotion"}), 500
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
