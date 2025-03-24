from flask import Blueprint, jsonify, request
from models import db, Product, Order

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

@customer_dashboard_bp.route('/place_order', methods=['POST'])
def place_order():
    data = request.json
    email = data.get('email')  # ✅ Use email to identify the user
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    # ✅ Find the customer using email
    customer = Customer.query.filter_by(email=email).first()

    if not customer:
        return jsonify({"success": False, "message": "Customer not found"}), 400

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404

    if product.stock < quantity:
        return jsonify({"success": False, "message": "Insufficient stock"}), 400

    # ✅ Place the order
    new_order = Order(customer_id=customer.id, product_id=product_id, quantity=quantity)
    product.stock -= quantity  # Deduct from stock
    db.session.add(new_order)
    db.session.commit()

    return jsonify({"success": True, "message": "Order placed successfully"}), 201

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
