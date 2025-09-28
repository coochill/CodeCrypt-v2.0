from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')

# Initialize extensions
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'])  # Allow React frontend

# For now, let's create a simple working version without database
# We'll use in-memory storage for demonstration

# Mock data storage
users = {}
current_user_id = 1

# Import cipher utilities
from utils.ciphers import CIPHER_FUNCTIONS

# Health check route
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'CodeCrypt Backend API is running',
        'available_ciphers': list(CIPHER_FUNCTIONS.keys())
    }), 200

# Auth routes (simplified without JWT for now)
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user (simplified version)"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'message': 'Missing required fields'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate input
        if len(username) < 3:
            return jsonify({'message': 'Username must be at least 3 characters long'}), 400
        
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists (simplified)
        for user in users.values():
            if user['email'] == email:
                return jsonify({'message': 'Email already registered'}), 409
            if user['username'] == username:
                return jsonify({'message': 'Username already taken'}), 409
        
        # Create new user (simplified)
        global current_user_id
        user_id = current_user_id
        current_user_id += 1
        
        users[user_id] = {
            'id': user_id,
            'username': username,
            'email': email,
            'password': password  # In real app, hash this!
        }
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            },
            'token': f'mock_token_{user_id}'  # Mock token
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user (simplified version)"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('email', 'password')):
            return jsonify({'message': 'Email and password required'}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # Find user (simplified)
        user = None
        for u in users.values():
            if u['email'] == email and u['password'] == password:
                user = u
                break
        
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            },
            'token': f'mock_token_{user["id"]}'  # Mock token
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

# Cipher routes
@app.route('/api/cipher/encode', methods=['POST'])
def encode_text():
    """Encode text using specified cipher"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('text', 'cipher_type')):
            return jsonify({'message': 'Text and cipher_type required'}), 400
        
        text = data['text']
        cipher_type = data['cipher_type']
        key = data.get('key')
        
        # Validate cipher type
        if cipher_type not in CIPHER_FUNCTIONS:
            return jsonify({'message': f'Unsupported cipher type: {cipher_type}'}), 400
        
        cipher_config = CIPHER_FUNCTIONS[cipher_type]
        
        # Check if key is required
        if cipher_config['requires_key'] and not key:
            return jsonify({'message': f'{cipher_type} cipher requires a key'}), 400
        
        # Encode the text
        encode_func = cipher_config['encode']
        if cipher_config['requires_key']:
            result = encode_func(text, key)
        else:
            result = encode_func(text)
        
        return jsonify({
            'result': result,
            'cipher_type': cipher_type,
            'operation': 'encode'
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Encoding failed', 'error': str(e)}), 500

@app.route('/api/cipher/decode', methods=['POST'])
def decode_text():
    """Decode text using specified cipher"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('text', 'cipher_type')):
            return jsonify({'message': 'Text and cipher_type required'}), 400
        
        text = data['text']
        cipher_type = data['cipher_type']
        key = data.get('key')
        
        # Validate cipher type
        if cipher_type not in CIPHER_FUNCTIONS:
            return jsonify({'message': f'Unsupported cipher type: {cipher_type}'}), 400
        
        cipher_config = CIPHER_FUNCTIONS[cipher_type]
        
        # Check if key is required
        if cipher_config['requires_key'] and not key:
            return jsonify({'message': f'{cipher_type} cipher requires a key'}), 400
        
        # Decode the text
        decode_func = cipher_config['decode']
        if cipher_config['requires_key']:
            result = decode_func(text, key)
        else:
            result = decode_func(text)
        
        return jsonify({
            'result': result,
            'cipher_type': cipher_type,
            'operation': 'decode'
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Decoding failed', 'error': str(e)}), 500

@app.route('/api/cipher/types', methods=['GET'])
def get_cipher_types():
    """Get available cipher types and their requirements"""
    cipher_info = {}
    for cipher_type, config in CIPHER_FUNCTIONS.items():
        cipher_info[cipher_type] = {
            'requires_key': config['requires_key']
        }
    
    return jsonify(cipher_info), 200

if __name__ == '__main__':
    print("Starting CodeCrypt Backend (Simplified Version)")
    print("Available endpoints:")
    print("  - Health: GET /api/health")
    print("  - Auth: POST /api/auth/register, POST /api/auth/login")
    print("  - Cipher: POST /api/cipher/encode, POST /api/cipher/decode")
    print("  - Cipher Types: GET /api/cipher/types")
    
    app.run(host='0.0.0.0', port=5000, debug=True)