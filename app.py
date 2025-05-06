from flask import Flask, render_template, Response, request, jsonify, session
from flask_mail import Mail
import cv2
from emotion import get_emotion
import base64
import numpy as np
import time
import requests
import json
from recommendations import SURAH_RECOMMENDATIONS, AYAH_RECOMMENDATIONS, HADITH_RECOMMENDATIONS, juz_names
from flask_login import LoginManager, current_user, login_required
from models import db, User, EmotionHistory, ContentHistory, UserFeedback
from auth import auth, init_login_manager, guest_user_required
import os
from datetime import datetime, timedelta, UTC
from dotenv import load_dotenv


load_dotenv()



app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///emomin.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Mail settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

# Initialize extensions
mail=Mail(app)
db.init_app(app)
app.register_blueprint(auth, url_prefix='/auth')
init_login_manager(app)

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

@app.before_request
def default_guest_status():
    """Set default guest status for unauthenticated users"""
    if not current_user.is_authenticated and 'is_guest' not in session:
        session['is_guest'] = True

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
@guest_user_required
def detect_emotion():
    return render_template('detect_emotion.html')

@app.route('/select-emotion')
@guest_user_required
def select_emotion():
    return render_template('select_emotion.html')

@app.route('/get_emotion', methods=['POST'])
@guest_user_required
def get_emotion_endpoint():
    global last_detected_emotion
    try:
        data = request.json
        image_data = data.get("image")
        if not image_data:
            return jsonify({"error": "No image data received"}), 400

        image_data = base64.b64decode(image_data.split(",")[1])
        np_image = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        emotion = get_emotion(frame)
        if emotion:
            last_detected_emotion = emotion
            
            if current_user.is_authenticated:
                emotion_history = EmotionHistory(
                    user_id=current_user.id,
                    emotion=emotion,
                    source='detected'
                )
                db.session.add(emotion_history)
                db.session.commit()
                
            return jsonify({"emotion": emotion}), 200
        else:
            return jsonify({"error": "Could not detect emotion"}), 500
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


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

@app.route('/recommendations/<emotion>')
def show_recommendations(emotion):
    recommended_surahs = get_recommendations(emotion)
    recommended_ayahs = get_ayah_recommendations(emotion)
    recommended_hadiths = get_hadith_recommendations(emotion)

    # Capture the `source` query parameter (defaults to None if not provided)
    source = request.args.get('source', None)

    if current_user.is_authenticated:
        emotion_history = EmotionHistory(
            user_id=current_user.id,
            emotion=emotion,
            source='selected'
        )
        db.session.add(emotion_history)
        db.session.commit()

    # Pass the `source` to the template
    return render_template(
        'recommendations.html', 
        emotion=emotion, 
        recommended_surahs=json.dumps(recommended_surahs),
        recommended_ayahs=json.dumps(recommended_ayahs),
        recommended_hadiths=json.dumps(recommended_hadiths),
        source=source  # Pass source here
    )

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

@app.route('/surah/<int:surah_id>')
def show_surah(surah_id):
    try:
        response = requests.get(f'https://quranapi.pages.dev/api/{surah_id}.json')
        response.raise_for_status()
        surah_data = response.json()
        surah_data['number'] = surah_id

        if current_user.is_authenticated:
            content_history = ContentHistory(
                user_id=current_user.id,
                content_type='surah',
                content_id=str(surah_id),
                emotion=request.args.get('emotion', 'neutral')
            )
            db.session.add(content_history)
            db.session.commit()

        audio_response = requests.get(f'https://api.alquran.cloud/v1/surah/{surah_id}/ar.alafasy')
        if audio_response.status_code == 200:
            audio_data = audio_response.json()
            surah_data['audio_url'] = audio_data.get('audio_file', {}).get('audio_url', '')

        return render_template('surah.html', surah=surah_data)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading surah: {str(e)}", 500

@app.route('/ayah/<int:surah_number>/<int:ayah_number>')
def show_ayah(surah_number, ayah_number):
    try:
        response = requests.get(f'https://api.alquran.cloud/v1/ayah/{surah_number}:{ayah_number}')
        response.raise_for_status()
        ayah_data = response.json()['data']
        
        if current_user.is_authenticated:
            content_history = ContentHistory(
                user_id=current_user.id,
                content_type='ayah',
                content_id=f'{surah_number}:{ayah_number}',
                emotion=request.args.get('emotion', 'neutral')
            )
            db.session.add(content_history)
            db.session.commit()
        
        return render_template('ayah.html', ayah=ayah_data)
    except Exception as e:
        print("Error:", str(e))
        return f"Error loading ayah: {str(e)}", 500

@app.route('/hadith/<emotion>/<int:index>')
def show_hadith(emotion, index):
    try:
        hadith = HADITH_RECOMMENDATIONS[emotion.lower()][index]
        
        if current_user.is_authenticated:
            content_history = ContentHistory(
                user_id=current_user.id,
                content_type='hadith',
                content_id=str(index),
                emotion=emotion
            )
            db.session.add(content_history)
            db.session.commit()
        
        return render_template('hadith.html', hadith=hadith, emotion=emotion)
    except (KeyError, IndexError) as e:
        print("Error:", str(e))
        return f"Error loading hadith: {str(e)}", 404

@app.route('/submit_feedback', methods=['POST'])
@login_required
def submit_feedback():
    try:
        data = request.json
        feedback = UserFeedback(
            user_id=current_user.id,
            content_type=data.get('content_type'),
            content_id=data.get('content_id'),
            emotion_before=data.get('emotion_before'),
            emotion_after=data.get('emotion_after', None),
            feedback=data.get('feedback'),
            comment=data.get('comment', None)
        )
        db.session.add(feedback)
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/get_feedback_data')
@login_required
def get_feedback_data():
    try:
        time_range = request.args.get('range', 'week')
        
        # Calculate date range based on the selected time range
        if time_range == 'day':
            date_filter = datetime.now(UTC) - timedelta(days=1)
        elif time_range == 'month':
            date_filter = datetime.now(UTC) - timedelta(days=30)
        else:  # week
            date_filter = datetime.now(UTC) - timedelta(days=7)
        
        # Get feedback data
        feedback_data = UserFeedback.query.filter(
            UserFeedback.user_id == current_user.id,
            UserFeedback.timestamp >= date_filter
        ).all()
        
        # Prepare data for charts
        content_effectiveness = {
            'surah': {'yes': 0, 'no': 0, 'not sure': 0},
            'ayah': {'yes': 0, 'no': 0, 'not sure': 0},
            'hadith': {'yes': 0, 'no': 0, 'not sure': 0}
        }
        
        emotion_improvement = {}
        
        for feedback in feedback_data:
            # Count by content type and feedback
            if feedback.content_type in content_effectiveness:
                content_effectiveness[feedback.content_type][feedback.feedback] += 1
            
            # Count by emotion
            if feedback.emotion_before not in emotion_improvement:
                emotion_improvement[feedback.emotion_before] = {'yes': 0, 'no': 0, 'not sure': 0}
            emotion_improvement[feedback.emotion_before][feedback.feedback] += 1
        
        return jsonify({
            'content_effectiveness': content_effectiveness,
            'emotion_improvement': emotion_improvement,
            'raw_feedback': [
                {
                    'id': feedback.id,
                    'content_type': feedback.content_type,
                    'content_id': feedback.content_id,
                    'emotion_before': feedback.emotion_before,
                    'feedback': feedback.feedback,
                    'comment': feedback.comment,
                    'timestamp': feedback.timestamp.strftime('%Y-%m-%d %H:%M')
                }
                for feedback in feedback_data
            ]
        }), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

@app.context_processor
def inject_user_status():
    return {
        'is_authenticated': current_user.is_authenticated,
        'is_guest': session.get('is_guest', True)
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)