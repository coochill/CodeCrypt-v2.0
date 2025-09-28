from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.ciphers import CIPHER_FUNCTIONS

cipher_bp = Blueprint('cipher', __name__)

@cipher_bp.route('/encode', methods=['POST'])
@jwt_required()
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
        
        # Save to history
        from app import db, CipherHistory
        user_id = get_jwt_identity()
        history_entry = CipherHistory(
            user_id=user_id,
            cipher_type=cipher_type,
            operation='encode',
            input_text=text,
            output_text=result,
            key_used=key
        )
        db.session.add(history_entry)
        db.session.commit()
        
        return jsonify({
            'result': result,
            'cipher_type': cipher_type,
            'operation': 'encode'
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'message': 'Encoding failed', 'error': str(e)}), 500

@cipher_bp.route('/decode', methods=['POST'])
@jwt_required()
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
        
        # Save to history
        from app import db, CipherHistory
        user_id = get_jwt_identity()
        history_entry = CipherHistory(
            user_id=user_id,
            cipher_type=cipher_type,
            operation='decode',
            input_text=text,
            output_text=result,
            key_used=key
        )
        db.session.add(history_entry)
        db.session.commit()
        
        return jsonify({
            'result': result,
            'cipher_type': cipher_type,
            'operation': 'decode'
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'message': 'Decoding failed', 'error': str(e)}), 500

@cipher_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get cipher operation history for current user"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Validate pagination parameters
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 10
        
        # Query history with pagination
        from app import CipherHistory
        history_query = CipherHistory.query.filter_by(user_id=user_id).order_by(
            CipherHistory.timestamp.desc()
        )
        
        total = history_query.count()
        history_items = history_query.offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            'history': [item.to_dict() for item in history_items],
            'total': total,
            'page': page,
            'limit': limit,
            'pages': (total + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get history', 'error': str(e)}), 500

@cipher_bp.route('/history/<int:history_id>', methods=['DELETE'])
@jwt_required()
def delete_history_item(history_id):
    """Delete a specific history item"""
    try:
        user_id = get_jwt_identity()
        
        # Find the history item
        from app import db, CipherHistory
        history_item = CipherHistory.query.filter_by(
            id=history_id, 
            user_id=user_id
        ).first()
        
        if not history_item:
            return jsonify({'message': 'History item not found'}), 404
        
        # Delete the item
        db.session.delete(history_item)
        db.session.commit()
        
        return jsonify({'message': 'History item deleted successfully'}), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'message': 'Failed to delete history item', 'error': str(e)}), 500

@cipher_bp.route('/history/clear', methods=['DELETE'])
@jwt_required()
def clear_history():
    """Clear all history for current user"""
    try:
        user_id = get_jwt_identity()
        
        # Delete all history items for the user
        from app import db, CipherHistory
        deleted_count = CipherHistory.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return jsonify({
            'message': f'Cleared {deleted_count} history items',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'message': 'Failed to clear history', 'error': str(e)}), 500

@cipher_bp.route('/types', methods=['GET'])
def get_cipher_types():
    """Get available cipher types and their requirements"""
    cipher_info = {}
    for cipher_type, config in CIPHER_FUNCTIONS.items():
        cipher_info[cipher_type] = {
            'requires_key': config['requires_key']
        }
    
    return jsonify(cipher_info), 200