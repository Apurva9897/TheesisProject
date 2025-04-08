from flask import render_template
from flask_login import login_required, current_user
from models import Inventory, db
from routes import admin_bp

@admin_bp.route('/admin_dashboard')
@login_required
def dashboard():
    if current_user.role != 'admin':
        return redirect(url_for('auth.login'))
    products = Inventory.query.all()
    return render_template('admin_dashboard.html', products=products)


@admin_bp.route('/admin/top_sold_products', methods=['GET'])
def get_top_sold_products():
    """
    Fetch top 10 products sorted by sold quantity (best selling products).
    """
    try:
        products = Product.query.order_by(Product.sold_quantity.desc()).limit(10).all()

        top_products = [{
            "id": product.id,
            "name": product.name,
            "sold_quantity": product.sold_quantity,
            "price": float(product.price),
            "stock": product.stock
        } for product in products]

        return jsonify({
            "success": True,
            "top_sold_products": top_products
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to fetch top sold products",
            "error": str(e)
        }), 500
