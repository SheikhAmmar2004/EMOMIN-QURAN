from flask import Flask, render_template, Response, request, jsonify
import cv2
from emotion import get_emotion
import base64
import numpy as np
import time
import requests
import json

app = Flask(__name__)

# Dictionary mapping emotions to their recommended surahs
SURAH_RECOMMENDATIONS = {
    "happy": [1, 19, 104, 107, 108],  
    "sad": [2, 103, 93, 105], 
    "angry": [1], 
    "fear": [112, 113, 114],  
    "disgust": [1],  
    "neutral": [1],  
    "surprise": [1], 
    "depressed": [1, 55, 36, 112, 93, 112, 113, 114, 76, 18, 56], 
    "anxiety": [59, 67, 1, 24, 5, 9],  
    "stress": [76, 1, 36, 18, 59, 67, 56, 55, 3, 2, 112, 113, 114, 93], 
    "pain": [19],  
}

# Dictionary mapping emotions to their recommended ayahs
AYAH_RECOMMENDATIONS = {
    "happy": [
        {"surah": 2, "ayah": 11},
        {"surah": 11, "ayah": 41},
        {"surah": 27, "ayah": 19},
        {"surah": 46, "ayah": 15},
        {"surah": 14, "ayah": 37},
        {"surah": 5, "ayah": 114},
        {"surah": 25, "ayah": 65},
        {"surah": 44, "ayah": 12}
    ],
    "sad": [
        {"surah": 21, "ayah": 87},
        {"surah": 7, "ayah": 23},
        {"surah": 3, "ayah": 193},
        {"surah": 12, "ayah": 101},
        {"surah": 40, "ayah": 7},
        {"surah": 71, "ayah": 28},
        {"surah": 2, "ayah": 286},
        {"surah": 25, "ayah": 74},
        {"surah": 12, "ayah": 87},
        {"surah": 15, "ayah": 56},
        {"surah": 30, "ayah": 36}
    ],
    "angry": [
        {"surah": 7, "ayah": 47},
        {"surah": 23, "ayah": 94},
        {"surah": 3, "ayah": 194}
    ],
    "disgust": [
        {"surah": 3, "ayah": 53},
        {"surah": 3, "ayah": 194}
    ],
    "surprise": [
        {"surah": 3, "ayah": 191},
        {"surah": 21, "ayah": 83},
        {"surah": 23, "ayah": 109},
        {"surah": 26, "ayah": 83},
        {"surah": 12, "ayah": 111},
        {"surah": 27, "ayah": 19}
    ],
    "neutral": [
        {"surah": 13, "ayah": 20},
        {"surah": 17, "ayah": 82},
        {"surah": 6, "ayah": 82},
        {"surah": 18, "ayah": 16},
        {"surah": 13, "ayah": 28},
        {"surah": 22, "ayah": 46},
        {"surah": 7, "ayah": 179},
        {"surah": 41, "ayah": 44},
        {"surah": 10, "ayah": 57},
        {"surah": 17, "ayah": 45}
    ],
    "fear": [
        {"surah": 2, "ayah": 126},
        {"surah": 14, "ayah": 35},
        {"surah": 68, "ayah": 52},
        {"surah": 23, "ayah": 97},
        {"surah": 38, "ayah": 41}
    ],
    "anxiety": [
        {"surah": 13, "ayah": 28},
        {"surah": 17, "ayah": 82},
        {"surah": 20, "ayah": 124}
    ],
    "stress": [
        {"surah": 2, "ayah": 155},
        {"surah": 24, "ayah": 21},
        {"surah": 12, "ayah": 1},
        {"surah": 55, "ayah": 29}
    ],
    "depression": [
        {"surah": 2, "ayah": 156},
        {"surah": 12, "ayah": 87},
        {"surah": 39, "ayah": 53},
        {"surah": 2, "ayah": 216},
        {"surah": 2, "ayah": 155},
        {"surah": 24, "ayah": 21}
    ]
}

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
    from_detection = request.args.get('from_detection', 'false')
    return render_template(
        'recommendations.html', 
        emotion=emotion, 
        recommended_surahs=json.dumps(recommended_surahs),
        recommended_ayahs=json.dumps(recommended_ayahs),
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
        
        # Get the Arabic juz name
        juz_names = {
            1: "الم", 2: "سَيَقُولُ", 3: "تِلْكَ ٱلرُّسُلُ", 4: "لَنْ تَنَالُوا", 
            5: "وَٱلْمُحْصَنَاتُ", 6: "لَا يُحِبُّ ٱللهُ", 7: "وَإِذَا سَمِعُوا", 
            8: "وَلَوْ أَنَّنَا", 9: "قَالَ ٱلْمَلَأُ", 10: "وَٱعْلَمُوا",
            11: "يَعْتَذِرُونَ", 12: "وَمَا مِنْ دَآبَّةٍ", 13: "وَمَا أُبَرِّئُ", 
            14: "رُبَمَا", 15: "سُبْحَانَ ٱلَّذِى", 16: "قَالَ أَلَمْ",
            17: "ٱقْتَرَبَ لِلنَّاسِ", 18: "قَدْ أَفْلَحَ", 19: "وَقَالَ ٱلَّذِينَ", 
            20: "أَمَّنْ خَلَقَ", 21: "أُتْلُ مَاأُوحِیَ", 22: "وَمَنْ يَقْنُتْ",
            23: "وَمَا لِيَ", 24: "فَمَنْ أَظْلَمُ", 25: "إِلَيْهِ يُرَدُّ", 
            26: "حم", 27: "قَالَ فَمَا خَطْبُكُمْ", 28: "قَدْ سَمِعَ ٱللهُ",
            29: "تَبَارَكَ ٱلَّذِى", 30: "عَمَّ"
        }

        return render_template('juz.html', 
                             juz_number=juz_number,
                             juz_name=juz_names.get(juz_number, ""),
                             ayahs=ayahs)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading juz: {str(e)}", 500

# Rest of the code remains unchanged...


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
