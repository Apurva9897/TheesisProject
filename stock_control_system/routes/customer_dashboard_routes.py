from flask import Blueprint, jsonify, request
from models import db, Product, Order, OrderDetails, User, Customer
from datetime import datetime
from flask import session

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
            "stock": p.stock
        } for p in products]
        return jsonify({"success": True, "products": product_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@customer_dashboard_bp.route('/orders', methods=['GET'])
def get_client_orders():
    orders = Order.query.all()
    result = []
    for order in orders:
        order_date = order.date.strftime('%Y-%m-%d')
        status = calculate_status(order.date)
        result.append({
            'id': f'ORD-{order.id}',
            'date': order_date,
            'status': status
        })
    return jsonify(result)

def calculate_status(order_date):
    today = datetime.utcnow().date()
    days_diff = (today - order_date).days
    if days_diff < 2:
        return 'Pending'
    elif 2 <= days_diff < 4:
        return 'Processing'
    elif 4 <= days_diff < 6:
        return 'Shipped'
    else:
        return 'Delivered'

@customer_dashboard_bp.route('/confirm_order', methods=['POST'])
def confirm_order():
    data = request.get_json()
    customer_email = data.get('email')
    items = data.get('items', [])

    if not customer_email or not items:
        return jsonify({'success': False, 'message': 'Missing data'}), 400

    selected_items = []
    total_price = 0.0

    try:
        for item in items:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 0)
            product = Product.query.get(product_id)

            if not product:
                continue

            subtotal = float(product.price) * quantity
            total_price += subtotal

            selected_items.append({
                'id': product.id,
                'name': product.name,
                'price': float(product.price),
                'quantity': quantity,
                'subtotal': round(subtotal, 2),
                'image': product.name.replace(" ", "") + ".png"
            })

        return jsonify({
            'success': True,
            'items': selected_items,
            'total_price': round(total_price, 2)
        }), 200

    except Exception as e:
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

@customer_dashboard_bp.route('/track_orders', methods=['GET'])
def track_orders():
    """Fetch the order details of a customer."""
    email = request.args.get("email")  # Identify customer
    orders = Order.query.filter_by(customer_email=email).all()
    
    order_details = [
        {"order_id": order.id, "product": order.product_name, "quantity": order.quantity, "status": order.status}
        for order in orders
    ]
    
    return jsonify({"success": True, "orders": order_details}), 200
