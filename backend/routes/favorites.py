from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

favorites_bp = Blueprint('favorites', __name__)

VALID_CIPHERS = {
    'affine','atbash','base64','binary','caesar','hex','morse','rail_fence','rot13','vigenere'
}

@favorites_bp.route('', methods=['GET'])
@jwt_required()
def list_favorites():
    try:
        user_id = get_jwt_identity()
        from app import Favorite
        favs = Favorite.query.filter_by(user_id=user_id).order_by(Favorite.created_at.desc()).all()
        return jsonify({'favorites':[f.to_dict() for f in favs]}), 200
    except Exception as e:
        return jsonify({'message':'Failed to fetch favorites','error':str(e)}), 500

@favorites_bp.route('', methods=['POST'])
@jwt_required()
def add_favorite():
    try:
        data = request.get_json() or {}
        cipher_type = data.get('cipher_type')
        if cipher_type not in VALID_CIPHERS:
            return jsonify({'message':'Invalid cipher type'}), 400
        from app import db, Favorite
        user_id = get_jwt_identity()
        existing = Favorite.query.filter_by(user_id=user_id, cipher_type=cipher_type).first()
        if existing:
            return jsonify({'message':'Already in favorites','favorite': existing.to_dict()}), 200
        fav = Favorite(user_id=user_id, cipher_type=cipher_type)
        db.session.add(fav)
        db.session.commit()
        return jsonify({'message':'Added to favorites','favorite': fav.to_dict()}), 201
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'message':'Failed to add favorite','error':str(e)}), 500

@favorites_bp.route('/<cipher_type>', methods=['DELETE'])
@jwt_required()
def delete_favorite(cipher_type):
    try:
        from app import db, Favorite
        user_id = get_jwt_identity()
        fav = Favorite.query.filter_by(user_id=user_id, cipher_type=cipher_type).first()
        if not fav:
            return jsonify({'message':'Favorite not found'}), 404
        db.session.delete(fav)
        db.session.commit()
        return jsonify({'message':'Removed from favorites'}), 200
    except Exception as e:
        from app import db
        db.session.rollback()
        return jsonify({'message':'Failed to remove favorite','error':str(e)}), 500
