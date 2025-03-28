from flask import Blueprint, request, jsonify
from app import db
from models import db, User, Customer, Admin
from werkzeug.security import generate_password_hash

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    phone = data.get('phone')
    address = data.get('address')

    # Check if the user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'User already exists'}), 400

    # Create a new user
    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
        address=address
    )
    db.session.add(new_user)
    db.session.flush()  # Get user ID before committing

    print(f"✅ User Created: {new_user.id}, {new_user.email}, {new_user.role}")

    # **This part is the issue — let's fix it**
    if role == 'client':
        new_customer = Customer(
            name=username,
            email=email,
            phone=phone,
            address=address,
            user_id=new_user.id  # Link to User table
        )
        db.session.add(new_customer)
        print(f"✅ Customer Created: {new_customer.name}, {new_customer.email}")

    db.session.commit()
    print("✅ Database commit successful!")

    return jsonify({'success': True, 'message': 'Registration successful'})
