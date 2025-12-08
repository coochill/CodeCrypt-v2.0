from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import User

game_bp = Blueprint('game', __name__)

@game_bp.route('/status', methods=['GET'])
@jwt_required()
def game_status():
    """Return placeholder info for game page"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({'message': 'Invalid token subject'}), 422

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Placeholder data
    return jsonify({
        'message': 'Game page connected',
        'user': user.to_dict(),
        'game': {
            'status': 'ready',
            'info': 'This is a placeholder for Minesweeper'
        }
    })
