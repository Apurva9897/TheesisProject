from flask import Blueprint, request, jsonify
from app import db
from models import User

register_bp = Blueprint('register', __name__)

@register_bp.route('/new', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    email = data['email']
    password = data['password']
    role = data['role']

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"success": False, "message": "User already exists"}), 400

    new_user = User(username, email, password, role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "User registered successfully"})
