from flask import Blueprint, jsonify, request
from models import db, Product, Order, OrderDetails, User, Customer
from datetime import datetime
from flask import session
from sqlalchemy import text 
from utils.email_utils import send_email
import random
from datetime import timedelta

customer_dashboard_bp = Blueprint('customer_dashboard', __name__)

@customer_dashboard_bp.route('/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        product_list = [{
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": float(p.price),  # Convert Decimal to float
            "stock": p.stock,
            "sold_quantity": p.sold_quantity  # ✅ ADD THIS LINE
        } for p in products]
        return jsonify({"success": True, "products": product_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@customer_dashboard_bp.route('/my_account', methods=['GET'])
def get_my_account():
    customer_email = request.args.get('email')
    
    if not customer_email:
        return jsonify({'success': False, 'message': 'Email is required.'}), 400

    try:
        result = db.session.execute(
            text("SELECT name, address, phone, email FROM customers WHERE email = :email"),
            {'email': customer_email}
        ).fetchone()

        if result:
            customer_info = dict(result._mapping)  # ✅ Important to convert SQLAlchemy row to dictionary
            return jsonify({'success': True, 'customer': customer_info}), 200
        else:
            return jsonify({'success': False, 'message': 'Customer not found.'}), 404

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@customer_dashboard_bp.route('/update_account', methods=['POST'])
def update_my_account():
    data = request.get_json()

    customer_email = data.get('email')
    new_address = data.get('address')
    new_mobile = data.get('phone') 

    if not customer_email:
        return jsonify({'success': False, 'message': 'Email is required.'}), 400

    try:
        # Update customer info
        result = db.session.execute(
            text("""
            UPDATE customers
            SET address = :address,
                phone = :phone
            WHERE email = :email
            """),
            {
                'address': new_address,
                'phone': new_mobile,
                'email': customer_email
            }
        )

        if result.rowcount == 0:
            db.session.rollback()
            return jsonify({'success': False, 'message': 'No customer found to update.'}), 404

        db.session.commit()

        return jsonify({'success': True, 'message': 'Profile updated successfully.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@customer_dashboard_bp.route('/summary', methods=['GET'])
def get_customer_summary():
    email = session.get('user_email')  # Email should be set at login
    user = User.query.filter_by(email=email).first()

    if not user or not user.customer:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'account_id': user.customer.id,
        'name': user.username,
        'email': user.email,
        'phone': user.customer.phone
    })


def calculate_status(order_datetime):
    today = datetime.utcnow().date()
    order_date = order_datetime.date()
    days_diff = (today - order_date).days

    if days_diff == 0:
        return 'Pending'
    elif days_diff == 1:
        return 'Packaging'
    else:
        return 'Delivered'

@customer_dashboard_bp.route('/track_orders', methods=['GET'])
def track_orders():
    email = request.args.get("email")
    
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    orders = Order.query.filter_by(customer_email=email).all()
    result = []

    for order in orders:
        items = OrderDetails.query.filter_by(order_id=order.id).all()
        product_list = []

        for item in items:
            product = Product.query.get(item.product_id)
            if product:
                product_list.append({
                    "name": product.name,
                    "quantity": item.quantity
                })

    order_id = order.custom_order_id if order.custom_order_id else f"ORD{order.id}"

    # ✅ 2. Use it inside your result dictionary
    result.append({
        "order_id": order_id,
        "placed_on": order.order_date.strftime("%Y-%m-%d %H:%M:%S"),
        "status": calculate_status(order.order_date),
        "total": float(order.total_amount),
        "items": product_list
    })

    return jsonify({"success": True, "orders": result}), 200

@customer_dashboard_bp.route('/confirm_order', methods=['POST'])
def confirm_order():
    try:
        data = request.json
        email = data.get('email')
        items = data.get('items', [])
        if not email or not items:
            return jsonify({"success": False, "message": "Invalid data"}), 400

        customer = Customer.query.filter_by(email=email).first()
        if not customer:
            return jsonify({"success": False, "message": "Customer not found"}), 404

        new_order = Order(
            customer_id=customer.id,
            customer_email=customer.email,
            status="Pending",
            total_amount=0
        )
        db.session.add(new_order)
        db.session.flush()
        new_order.custom_order_id = f"ORD{new_order.id}"

        total_price = 0
        updated_items = []
        low_stock_alerts = []  # <-- ✅ collect low stock products here

        for item in items:
            product_id = item.get('product_id')
            quantity = item.get('quantity')
            if not product_id or not quantity:
                continue

            product = Product.query.get(product_id)
            if not product:
                continue

            if product.stock < quantity:
                return jsonify({"success": False, "message": f"Not enough stock for {product.name}"}), 400

            subtotal = float(product.price) * quantity
            total_price += subtotal

            product.stock -= quantity
            product.sold_quantity += quantity

            # ✅ Check low stock
            threshold = 10
            if product.stock <= threshold:
                low_stock_alerts.append(f"- {product.name}: {product.stock} units left")

            order_detail = OrderDetails(
                order_id=new_order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                subtotal=subtotal
            )
            db.session.add(order_detail)

            updated_items.append({
                "id": product.id,
                "name": product.name,
                "price": float(product.price),
                "quantity": quantity,
                "subtotal": subtotal,
                "image": product.name.replace(' ', '') + ".png"
            })

        new_order.total_amount = round(total_price, 2)
        db.session.commit()

        # ✅ AFTER committing all changes, now send a single email if needed
        if low_stock_alerts:
            subject = "⚠️ Low Stock Alerts Summary"
            body = f"""
Dear Admin,

The following products have low stock levels:

{chr(10).join(low_stock_alerts)}

Please consider reordering these items soon.

Thanks,
Universal Computer Warehouse System
"""
            admin_users = User.query.filter_by(role="admin").all()
            admin_emails = [admin.email for admin in admin_users]

            for admin_email in admin_emails:
                send_email(admin_email, subject, body)

        return jsonify({
            "success": True,
            "total_price": float(new_order.total_amount),
            "order_id": new_order.formatted_id,
            "items": updated_items
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": "Error confirming order", "error": str(e)}), 500

@customer_dashboard_bp.route('/send_order_receipt', methods=['POST'])
def send_order_receipt():
    try:
        data = request.json
        email = data.get('email')
        items = data.get('items', [])
        total_price = data.get('total_price')
        order_id = data.get('order_id')
        if not email or not items or total_price is None:
            return jsonify({"success": False, "message": "Incomplete data"}), 400

        # Prepare email content
        item_lines = [f"- {item['name']} (Qty: {item['quantity']})" for item in items]
        item_text = "\n".join(item_lines)
        subject = "🧾 Order Confirmation - Thank You for Your Purchase!"
        body = f"""
Hi there,

Thank you for your order! 🎉

Here’s what you purchased:
Order ID: {order_id}
{item_text}

Total Paid: ${total_price:.2f}

We appreciate your business!

Best regards,  
Universal Computer Warehouse
"""

        # Send the email
        success = send_email(email, subject, body)
        if success:
            return jsonify({"success": True, "message": "Receipt sent successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Failed to send email"}), 500

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@customer_dashboard_bp.route('/send_otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    otp = str(random.randint(100000, 999999))

    # Send OTP via Email
    subject = "🔐 Your OTP for Registration"
    body = f"""
Hi there,

Your One-Time Password (OTP) for completing your registration is: {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Best regards,
Universal Computer Warehouse
"""
    send_success = send_email(email, subject, body)

    if send_success:
        # ✅ Now also return OTP in the response for frontend check (secretly!)
        return jsonify({'success': True, 'message': 'OTP sent successfully', 'otp': otp}), 200
    else:
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500
