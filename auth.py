from flask import Blueprint, render_template, redirect, url_for, flash, request, session, jsonify, current_app
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from urllib.parse import urlparse
from models import User, EmotionHistory, ContentHistory, UserFeedback, db
from forms import LoginForm, RegistrationForm,RequestPasswordResetForm, ResetPasswordForm
from datetime import datetime, timedelta
import functools
from flask_mail import Mail, Message


auth = Blueprint('auth', __name__)
login_manager = LoginManager()
mail = Mail()


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def init_login_manager(app):
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    mail.init_app(app)

def send_password_reset_email(user):
    token = user.get_reset_password_token()
    msg = Message('Password Reset Request',
                  sender=current_app.config['MAIL_DEFAULT_SENDER'],
                  recipients=[user.email])
    msg.body = f'''To reset your password, visit the following link:
{url_for('auth.reset_password', token=token, _external=True)}

If you did not make this request then simply ignore this email and no changes will be made.
'''
    mail.send(msg)

def guest_user_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('is_guest', True) and not current_user.is_authenticated:
            flash('This feature is only available for registered users. Please sign up or login.', 'warning')
            return render_template('auth/guest_restriction.html')
        return f(*args, **kwargs)
    return decorated_function

@auth.route('/reset_password_request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RequestPasswordResetForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            send_password_reset_email(user)
        flash('Check your email for the instructions to reset your password', 'info')
        return redirect(url_for('auth.login'))
    return render_template('auth/reset_password_request.html', form=form)

@auth.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    user = User.verify_reset_password_token(token)
    if not user:
        return redirect(url_for('index'))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        user.set_password(form.password.data)
        db.session.commit()
        flash('Your password has been reset.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('auth/reset_password.html', form=form)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid email or password', 'danger')
            return render_template('auth/login.html', form=form)
        
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        login_user(user, remember=form.remember_me.data)
        session['is_guest'] = False
        
        next_page = request.args.get('next')
        if not next_page or urlparse(next_page).netloc != '':
            next_page = url_for('index')
        
        #flash(f'Welcome back, {user.username}!', 'success')
        return redirect(next_page)
    
    return render_template('auth/login.html', form=form)

@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        
        db.session.add(user)
        db.session.commit()
        
        flash('Your account has been created! You can now log in.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/signup.html', form=form)

@auth.route('/logout')
def logout():
    logout_user()
    session['is_guest'] = True
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@auth.route('/guest')
def guest_login():
    if not current_user.is_authenticated:
        session['is_guest'] = True
        flash('You are now browsing as a guest. Some features are restricted.', 'info')
    return redirect(url_for('index'))

@auth.route('/profile')
@login_required
def profile():
    return render_template('auth/profile.html')

@auth.route('/history')
@login_required
def history():
    emotion_history = EmotionHistory.query.filter_by(user_id=current_user.id)\
        .order_by(EmotionHistory.timestamp.desc()).limit(10).all()
    content_history = ContentHistory.query.filter_by(user_id=current_user.id)\
        .order_by(ContentHistory.timestamp.desc()).limit(10).all()
    feedback_history = UserFeedback.query.filter_by(user_id=current_user.id)\
        .order_by(UserFeedback.timestamp.desc()).limit(10).all()
    
    
    return render_template('auth/history.html',
                         emotion_history=emotion_history,
                         content_history=content_history,
                         feedback_history=feedback_history)

@auth.route('/history/data')
@login_required
def history_data():
    time_range = request.args.get('range', 'week')
    
    if time_range == 'day':
        delta = timedelta(days=1)
    elif time_range == 'month':
        delta = timedelta(days=30)
    else:  # week
        delta = timedelta(days=7)
    
    start_date = datetime.utcnow() - delta
    
    # Get emotion data
    emotion_data = db.session.query(
        EmotionHistory.emotion,
        db.func.count(EmotionHistory.id)
    ).filter(
        EmotionHistory.user_id == current_user.id,
        EmotionHistory.timestamp >= start_date
    ).group_by(EmotionHistory.emotion).all()
    
    # Get content data
    content_data = db.session.query(
        ContentHistory.content_type,
        db.func.count(ContentHistory.id)
    ).filter(
        ContentHistory.user_id == current_user.id,
        ContentHistory.timestamp >= start_date
    ).group_by(ContentHistory.content_type).all()

    # Get feedback data
    feedback_data = db.session.query(
        UserFeedback.feedback,
        db.func.count(UserFeedback.id)
    ).filter(
        UserFeedback.user_id == current_user.id,
        UserFeedback.timestamp >= start_date
    ).group_by(UserFeedback.feedback).all()
    
    
    return jsonify({
        'emotions': {
            'labels': [e[0] for e in emotion_data],
            'data': [e[1] for e in emotion_data]
        },
        'content': {
            'labels': [c[0] for c in content_data],
            'data': [c[1] for c in content_data]
        },
        'feedback': {
            'labels': [f[0] for f in feedback_data],
            'data': [f[1] for f in feedback_data]
        }
    })