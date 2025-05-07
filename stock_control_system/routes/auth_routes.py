from flask import Blueprint, request, jsonify
from models import db, User, Customer, Admin
from utils.email_utils import send_email
from uuid import uuid4


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        # 🔒 Block unapproved admins
        if user.role == 'admin' and not user.is_approved:
            return jsonify({"success": False, "message": "Admin account pending approval."}), 403
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
        # ✅ Create User
        new_user = User(
            username=username,
            email=email,
            role=role,
            is_approved=(role != 'admin')  # ⛔ Mark admin as pending approval
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()  # To get new_user.id

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
            approval_token = str(uuid4())
            new_user.approval_token = approval_token  # store in user table
            new_admin = Admin(
                name=username,
                user_id=new_user.id
            )
            db.session.add(new_admin)

            # Email links
            approve_link = f"http://127.0.0.1:5000/auth/approve_admin?token={approval_token}"
            reject_link = f"http://127.0.0.1:5000/auth/reject_admin?token={approval_token}"

            send_email(
                "apu1098avk@gmail.com",
                "🛂 New Admin Approval Needed",
                f"""
Hello Head Admin,

A new user has registered as Admin and requires your approval.

Details:
- Name: {username}
- Email: {email}

Please choose:
✅ Approve: {approve_link}
❌ Reject: {reject_link}

Regards,
Universal Computer Warehouse System
"""
            )
            print("Approval email sent to Head Admin.")

        db.session.commit()
        print("✅ Registration successful!")

        return jsonify({"success": True, "message": "Registration successful"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error during registration: {str(e)}")
        return jsonify({"success": False, "message": "Registration failed", "error": str(e)}), 500


@auth_bp.route('/approve_admin', methods=['GET'])
def approve_admin_via_email():
    token = request.args.get('token')
    user = User.query.filter_by(approval_token=token, role='admin').first()

    if not user:
        return "Invalid or expired approval link.", 400

    user.is_approved = True
    user.approval_token = None
    db.session.commit()

    # ✅ Send approval email to the user
    send_email(
        user.email,
        "✅ Admin Account Approved",
        f"""
Hi {user.username},

🎉 Congratulations! Your admin account has been approved by the Head Admin.

You can now log in using your registered email and password.

Regards,  
Universal Computer Warehouse System
"""
    )

    return f"✅ {user.username}'s admin account has been approved successfully!", 200


@auth_bp.route('/reject_admin', methods=['GET'])
def reject_admin_via_email():
    token = request.args.get('token')
    user = User.query.filter_by(approval_token=token, role='admin').first()

    if not user:
        return "Invalid or expired rejection link.", 400

    # ✅ Send rejection email before deleting user
    send_email(
        user.email,
        "❌ Admin Account Rejected",
        f"""
Hi {user.username},

We're sorry to inform you that your admin registration has been rejected by the Head Admin.

If you believe this was a mistake or need more information, please contact support.

Regards,  
Universal Computer Warehouse System
"""
    )

    db.session.delete(user)
    db.session.commit()

    return f"❌ {user.username}'s admin account has been rejected and removed.", 200


@auth_bp.route('/logout')
def logout():
    return jsonify({"success": True, "message": "Logged out successfully"}), 200
