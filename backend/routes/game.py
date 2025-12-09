from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from minecipher.constants import (
    DIFFICULTY_PRESETS,
    DIFFICULTY_WORD_LENGTH,
    MINECIPHER_CIPHERS,
    MINECIPHER_INFO_CARDS,
    MAX_GUESSES,
    LAUNCH_COMMAND,
    OVERVIEW,
)

game_bp = Blueprint('game', __name__)

@game_bp.route('/status', methods=['GET'])
@jwt_required()
def game_status():
    """Return placeholder info for game page"""
    from app import User  # <-- 👈 Add this here

    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({'message': 'Invalid token subject'}), 422

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'message': 'Game page connected',
        'user': user.to_dict(),
        'game': {
            'status': 'ready',
            'info': 'This is a placeholder for Minesweeper'
        }
    })


@game_bp.route('/minecipher', methods=['GET'])
@jwt_required()
def minecipher_info():
    difficulties = []
    for name, (rows, cols) in DIFFICULTY_PRESETS.items():
        difficulties.append({
            'name': name,
            'rows': rows,
            'cols': cols,
            'word_length': DIFFICULTY_WORD_LENGTH.get(name),
        })

    ciphers = []
    for name, info in MINECIPHER_CIPHERS.items():
        ciphers.append({
            'name': name,
            'example': info.get('example', ''),
        })

    return jsonify({
        'message': 'MineCipher metadata',
        'minecipher': {
            'overview': OVERVIEW,
            'launch_command': LAUNCH_COMMAND,
            'max_guesses': MAX_GUESSES,
            'info_cards': MINECIPHER_INFO_CARDS,
            'difficulties': difficulties,
            'ciphers': ciphers,
        }
    })


@game_bp.route('/minecipher', methods=['OPTIONS'])
def minecipher_options():
    return '', 204
