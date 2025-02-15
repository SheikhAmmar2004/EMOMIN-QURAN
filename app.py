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
     # Happy - These Surahs relate to feelings of joy, positive emotions, and uplifting the mood
    "happy": [108, 104, 93, 103, 1],  # Al-Kauthar (108), Al-Humazah (104), Al-Duha (93), Al-Asr (103), Al-Fatiha (1)
    # Justification: These Surahs reflect happiness and positive feelings. **Al-Kauthar (108)** brings joy, **Al-Humazah (104)** brings emotional reflection that uplifts, **Al-Duha (93)** lifts sadness into joy, **Al-Asr (103)** uplifts emotionally, and **Al-Fatiha (1)** promotes joy.

    # Sad - These Surahs focus on sadness, depression, and emotional stability or relief
    "sad": [2, 113, 114, 109, 5],  # Al-Baqarah (2), Al-Falaq (113), Al-Nas (114), Al-Kafirun (109), Al-Ma'idah (5)
    # Justification: These Surahs focus on improving emotional well-being. **Al-Baqarah (2)** brings relief from sadness, **Al-Falaq (113)** and **Al-Nas (114)** provide peace, **Al-Kafirun (109)** addresses emotional relief, and **Al-Ma'idah (5)** helps relieve mild stress.

    # Angry - Surahs that help reduce anger and emotional tension, promoting patience
    "angry": [111, 1, 18, 77],  # Al-Masad (111), Al-Fatiha (1), Al-Kahf (18), Al-Mursalat (77)
    # Justification: These Surahs focus on reducing emotional tension. **Al-Masad (111)** reduces anger, **Al-Fatiha (1)** calms the mind, **Al-Kahf (18)** promotes patience, and **Al-Mursalat (77)** reduces stress and brings peace.

    # Fear - Surahs that address fear, anxiety, and help with emotional stability and peace
    "fear": [113, 55, 56, 24, 3],  # Al-Falaq (113), Al-Rehman (55), Al-Waqiah (56), An-Nur (24), Al-Imran (3)
    # Justification: These Surahs address fear and anxiety by promoting calmness. **Al-Falaq (113)** reduces fear, **Al-Rehman (55)** brings peace and comfort, **Al-Waqiah (56)** provides balance, **An-Nur (24)** offers emotional stability, and **Al-Imran (3)** strengthens the believer.

    # Disgust - Surahs related to guilt, shame, self-reflection, emotional clarity, and relief
    "disgust": [19, 104, 1, 67],  # Maryam (19), Al-Humazah (104), Al-Fatiha (1), Al-Mulk (67)
    # Justification: These Surahs address internal conflicts, guilt, and emotional instability. **Maryam (19)** helps with guilt relief, **Al-Humazah (104)** promotes self-reflection, **Al-Fatiha (1)** brings clarity, and **Al-Mulk (67)** helps with emotional relief.

    # Neutral - Surahs that are associated with calmness, balance, and emotional neutrality
    "neutral": [112, 13, 11, 18, 1],  # Al-Ikhlas (112), Al-Ra'ad (13), Hud (11), Al-Kahf (18), Al-Fatiha (1)
    # Justification: These Surahs bring emotional neutrality and stability. **Al-Ikhlas (112)** promotes calmness, **Al-Ra'ad (13)** creates balance, **Hud (11)** helps focus and calm, **Al-Kahf (18)** relieves anxiety, and **Al-Fatiha (1)** brings emotional stability.

    # Surprise - These Surahs may help with shock, astonishment, or unexpected emotions
    "surprise": [1, 55, 18, 77],  # Al-Fatiha (1), Al-Rehman (55), Al-Kahf (18), Al-Mursalat (77)
    # Justification: These Surahs offer emotional stability and calming effects that help with unexpected emotions. **Al-Fatiha (1)** provides a stable foundation, **Al-Rehman (55)** offers comfort, **Al-Kahf (18)** helps with anxiety, and **Al-Mursalat (77)** provides peace and calmness.

    # Depressed - Surahs that uplift depression and sadness, help with emotional stability
    "depressed": [1, 36, 93, 112, 114],  # Al-Fatiha (1), Az-Zumar (36), Al-Duha (93), Al-Ikhlas (112), Al-Nas (114)
    # Justification: These Surahs bring relief from depressive states. **Al-Duha (93)** lifts sadness to joy, **Al-Fatiha (1)** offers emotional stability, **Al-Nas (114)** brings calmness, and **Az-Zumar (36)** provides emotional relief.

    # Anxiety - Surahs that help with anxiety and mental stress relief
    "anxiety": [2, 18, 24, 55, 56, 11],  # Al-Baqarah (2), Al-Kahf (18), An-Nur (24), Al-Rehman (55), Al-Waqiah (56), Hud (11)
    # Justification: These Surahs provide comfort and reduce anxiety. **Al-Kahf (18)** and **An-Nur (24)** are particularly focused on mental stability, **Al-Rehman (55)** brings relaxation, and **Al-Waqiah (56)** provides peace.

    # Stress - Surahs related to stress relief, calmness, and emotional stability
    "stress": [13, 5, 10, 17, 77],  # Al-Ra'ad (13), Al-Ma'idah (5), Yunus (10), Al-Isra (17), Al-Mursalat (77)
    # Justification: These Surahs help relieve stress and bring emotional calmness. **Al-Ra'ad (13)** and **Al-Ma'idah (5)** specifically deal with stress relief and promote emotional balance.

    # Pain - Surahs related to pain relief and comfort during difficult times
    "pain": [19],  # Maryam (19) - Specifically linked to pain relief (labor pain, etc.)
    # Justification: **Maryam (19)** is directly associated with alleviating pain, particularly in the context of labor and difficult situations.

}

# Variable to store the last detected emotion
last_detected_emotion = None

def get_recommendations(emotion):
    """
    Get recommended surahs for a given emotion.
    """
    emotion = emotion.lower()
    return SURAH_RECOMMENDATIONS.get(emotion, SURAH_RECOMMENDATIONS['neutral'])


# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route for the emotion detection page
@app.route('/detect-emotion')
def detect_emotion():
    global last_detected_emotion
    last_detected_emotion = None
    return render_template('detect_emotion.html')

# Route for the emotion selection page
@app.route('/select-emotion')
def select_emotion():
    return render_template('select_emotion.html')

# Route for emotion-based recommendations# Update the show_recommendations route
@app.route('/recommendations/<emotion>')
def show_recommendations(emotion):
    recommended_surahs = get_recommendations(emotion)
    # Add from_detection parameter to indicate if coming from emotion detection
    from_detection = request.args.get('from_detection', 'false')
    return render_template(
        'recommendations.html', 
        emotion=emotion, 
        recommended_surahs=json.dumps(recommended_surahs),
        from_detection=from_detection
    )

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
