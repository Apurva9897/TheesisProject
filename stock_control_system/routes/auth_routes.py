from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required
from models import User, db
from routes import auth_bp
from flask import Blueprint, request, jsonify
from app import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        return jsonify({
            "success": True,
            "role": user.role  # Send role to frontend for redirection
        }), 200
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"success": False, "message": "User already exists"}), 400

    new_user = User(username=username, email=email, role=role, password=password)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "Registration successful"}), 201

    # ✅ If role is 'client', create a Customer entry
    if role == 'client':
        new_customer = Customer(user_id=new_user.id, name=username, email=email)
        db.session.add(new_customer)
        db.session.commit()

    return jsonify({"success": True, "message": "Registration successful"}), 201


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
