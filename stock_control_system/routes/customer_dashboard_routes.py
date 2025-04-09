from flask import Blueprint, jsonify, request
from models import db, Product, Order, OrderDetails, User, Customer
from datetime import datetime
from flask import session
from sqlalchemy import text 


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



@customer_dashboard_bp.route('/confirm_order', methods=['POST'])
def confirm_order():
    try:
        data = request.json
        email = data.get('email')
        items = data.get('items', [])

        if not email or not items:
            return jsonify({"success": False, "message": "Invalid data"}), 400

        # Find the customer
        customer = Customer.query.filter_by(email=email).first()
        if not customer:
            return jsonify({"success": False, "message": "Customer not found"}), 404

        # Create new Order
        new_order = Order(
            customer_id=customer.id,
            customer_email=customer.email,
            status="Pending",
            total_amount=0  # We will calculate later
        )
        db.session.add(new_order)
        db.session.flush()  # Get Order ID before committing

        total_price = 0
        updated_items = []

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

            # Update product stock and sold quantity
            product.stock -= quantity
            product.sold_quantity += quantity  # ✅ Increase sold quantity

            # Insert into OrderDetails
            order_detail = OrderDetails(
                order_id=new_order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                subtotal=subtotal
            )
            db.session.add(order_detail)

            # For frontend response
            updated_items.append({
                "id": product.id,
                "name": product.name,
                "price": float(product.price),
                "quantity": quantity,
                "subtotal": subtotal,
                "image": product.name.replace(' ', '') + ".png"
            })

        # Update total amount in Order
        new_order.total_amount = round(total_price, 2)

        # Commit all changes
        db.session.commit()

        return jsonify({
            "success": True,
            "total_price": float(new_order.total_amount),
            "items": updated_items
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": "Error confirming order", "error": str(e)}), 500


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
    """Fetch the order details of a customer with live status."""
    email = request.args.get("email")  # Identify customer
    
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    orders = Order.query.filter_by(customer_email=email).all()
    
    order_details = []
    for order in orders:
        # Fetch all order details (products inside this order)
        order_items = OrderDetails.query.filter_by(order_id=order.id).all()
        for item in order_items:
            product = Product.query.get(item.product_id)
            if product:
                status = calculate_status(order.order_date)
                order_details.append({
                    "order_id": order.id,
                    "product_name": product.name,
                    "quantity": item.quantity,
                    "status": status
                })

    return jsonify({"success": True, "orders": order_details}), 200

