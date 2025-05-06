from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin  # 🔥 Add this line!
from datetime import datetime
from time import time
import jwt
from flask import current_app
db = SQLAlchemy()

class User(db.Model, UserMixin):  # ✅ Inherit from UserMixin here
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    # Relationships
    emotion_history = db.relationship('EmotionHistory', backref='user', lazy='dynamic')
    content_history = db.relationship('ContentHistory', backref='user', lazy='dynamic')
    feedback = db.relationship('UserFeedback', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            current_app.config['SECRET_KEY'], algorithm='HS256')
    
    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, current_app.config['SECRET_KEY'],
                          algorithms=['HS256'])['reset_password']
        except:
            return None
        return User.query.get(id)
    
    def __repr__(self):
        return f'<User {self.username}>'
    
class EmotionHistory(db.Model):
    __tablename__ = 'emotion_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    emotion = db.Column(db.String(50), nullable=False)
    source = db.Column(db.String(20), nullable=False)  # 'detected' or 'selected'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class ContentHistory(db.Model):
    __tablename__ = 'content_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content_type = db.Column(db.String(20), nullable=False)  # 'surah', 'ayah', or 'hadith'
    content_id = db.Column(db.String(50), nullable=False)  # surah/ayah/hadith identifier
    emotion = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class UserFeedback(db.Model):
    __tablename__ = 'user_feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content_type = db.Column(db.String(20), nullable=False)  # 'surah', 'ayah', or 'hadith'
    content_id = db.Column(db.String(50), nullable=False)  # surah/ayah/hadith identifier
    emotion_before = db.Column(db.String(50), nullable=False)
    emotion_after = db.Column(db.String(20), nullable=True)
    feedback = db.Column(db.String(20), nullable=False)  # 'yes', 'no', or 'not sure'
    comment = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)