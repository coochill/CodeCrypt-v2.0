from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
import os
from datetime import timedelta, datetime
import traceback

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    # Default to SQLite file in project root for dev
    db_url = 'sqlite:///codecrypt.db'
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, origins=[
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
])  # Allow React (Vite) frontend

# --- Global error handling & request diagnostics (development aid) ---
@app.before_request
def _log_request_start():
    if app.debug:
        print(f"[REQ] {request.method} {request.path}")

@app.errorhandler(Exception)
def _unhandled_exception(e):
    """Catch any unhandled exception and return JSON (helps surface 500 root causes)."""
    # If it's an HTTPException, let Flask convert normally but still log.
    code = getattr(e, 'code', 500)
    if app.debug:
        print('[ERR] Unhandled exception:', repr(e))
        traceback.print_exc()
    payload = {
        'message': 'Internal server error' if code == 500 else str(e),
        'error': type(e).__name__,
    }
    # Include the string form for quick visibility in debug mode
    if app.debug:
        payload['details'] = str(e)
    return jsonify(payload), code

# Define models directly here to avoid circular imports
class User(db.Model):
    """User model for authentication and user management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches the hash"""
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)
    
    def set_password(self, password):
        """Set new password hash"""
        self.password_hash = generate_password_hash(password)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'

class CipherHistory(db.Model):
    """Model for storing cipher operation history"""
    __tablename__ = 'cipher_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cipher_type = db.Column(db.String(50), nullable=False)
    operation = db.Column(db.String(10), nullable=False)  # 'encode' or 'decode'
    input_text = db.Column(db.Text, nullable=False)
    output_text = db.Column(db.Text, nullable=False)
    key_used = db.Column(db.String(100), nullable=True)  # For ciphers that require keys
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('cipher_history', lazy=True, cascade='all, delete-orphan'))
    
    def __init__(self, user_id, cipher_type, operation, input_text, output_text, key_used=None):
        self.user_id = user_id
        self.cipher_type = cipher_type
        self.operation = operation
        self.input_text = input_text
        self.output_text = output_text
        self.key_used = key_used
    
    def to_dict(self):
        """Convert history object to dictionary"""
        return {
            'id': self.id,
            'cipher_type': self.cipher_type,
            'operation': self.operation,
            'input_text': self.input_text,
            'output_text': self.output_text,
            'key': self.key_used,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<CipherHistory {self.cipher_type}:{self.operation}>'

class Favorite(db.Model):
    """Model for storing user favorite ciphers"""
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    cipher_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Constraint idea (not enforced automatically in SQLite without explicit UniqueConstraint in create_all) but we can enforce in code.

    user = db.relationship('User', backref=db.backref('favorites', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'cipher_type': self.cipher_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Import routes
from routes.auth import auth_bp
from routes.cipher import cipher_bp
from routes.favorites import favorites_bp
from routes.game import game_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(cipher_bp, url_prefix='/api/cipher')
app.register_blueprint(favorites_bp, url_prefix='/api/favorites')
app.register_blueprint(game_bp, url_prefix='/api/game')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': app.config['SQLALCHEMY_DATABASE_URI'],
        'message': 'CodeCrypt API running'
    })

# Initialize database
def init_db():
    """Initialize database tables"""
    db.create_all()

def create_admin_user():
    with app.app_context():
        # Use the User model defined in this file, not from models.user
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@codecrypt.com')
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                username=os.environ.get('ADMIN_USERNAME', 'admin'),
                email=admin_email,
                password=os.environ.get('ADMIN_PASSWORD', 'admin123')
            )
            db.session.add(admin)
            db.session.commit()
            print(f"Admin user created: {admin_email}")

@app.route('/api', methods=['GET'])
def api_info():
    return jsonify({
        'name': 'CodeCrypt API',
        'version': '1.0.0',
        'description': 'Cryptography tools API',
        'database': app.config['SQLALCHEMY_DATABASE_URI'],
        'endpoints': ['GET /api/health', 'POST /api/auth/login', 'POST /api/auth/register']
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() in ('1','true','yes')
    with app.app_context():
        db.create_all()
        print('[DB] Tables ensured.')
        # optional admin auto-create if env set
        if os.environ.get('CREATE_ADMIN', 'true').lower() in ('1','true','yes'):
            try:
                create_admin_user()
            except Exception as e:
                print('Admin creation skipped:', e)
    print(f"Starting CodeCrypt API on port {port} | Debug={debug}")
    print('DB URL:', app.config['SQLALCHEMY_DATABASE_URI'])
    print('[RUN] Entering app.run ...', flush=True)
    try:
        # Disable threaded for now to rule out environment thread issues
        app.run(host='0.0.0.0', port=port, debug=debug, use_reloader=False, threaded=False)
    except Exception as run_err:
        import traceback
        print('[RUN] Exception in app.run:', run_err, flush=True)
        traceback.print_exc()
    finally:
        print('[RUN] app.run exited (unexpected normal exit if no exception above).', flush=True)