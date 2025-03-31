from flask import Blueprint, request, jsonify
from models import db, User, Customer, Admin # ✅ Uses bcrypt via models
# ❌ REMOVE werkzeug.security import

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
            "role": user.role
        }), 200
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    phone = data.get('phone')
    address = data.get('address')

    print(f"Received registration request for {username} ({email}) as {role}")

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        print("User already exists, registration failed.")
        return jsonify({"success": False, "message": "User already exists"}), 400

    try:
        # ✅ Use bcrypt via set_password()
        new_user = User(
            username=username,
            email=email,
            role=role
        )
        new_user.set_password(password)  # ✅ Uses your bcrypt method

        db.session.add(new_user)
        db.session.flush()

        print(f"User {username} created with ID {new_user.id}")

        if role == 'client':
            new_customer = Customer(
                name=username,
                email=email,
                phone=phone,
                address=address,
                user_id=new_user.id
            )
            db.session.add(new_customer)
            print(f"Customer {username} added to customers table.")

        elif role == 'admin':
            new_admin = Admin(
                name=username,
                user_id=new_user.id
            )
            db.session.add(new_admin)

        db.session.commit()
        print("✅ Registration successful!")

        return jsonify({"success": True, "message": "Registration successful"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error during registration: {str(e)}")
        return jsonify({"success": False, "message": "Registration failed", "error": str(e)}), 500

@auth_bp.route('/logout')
def logout():
    return jsonify({"success": True, "message": "Logged out successfully"}), 200
