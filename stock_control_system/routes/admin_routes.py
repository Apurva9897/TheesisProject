from flask import Blueprint, jsonify, render_template, redirect, url_for
from flask_login import login_required, current_user
from models import db, Product, Inventory, Order, OrderDetails
from sqlalchemy import func
from datetime import datetime, timedelta

admin_bp = Blueprint('admin_bp', __name__)  # ✅ Make sure this is already there

# ---------- Existing dashboard route ----------
@admin_bp.route('/admin_dashboard')
@login_required
def dashboard():
    if current_user.role != 'admin':
        return redirect(url_for('auth.login'))
    products = Inventory.query.all()
    return render_template('admin_dashboard.html', products=products)

# ---------- NEW: Overview Data API ----------
@admin_bp.route('/overview', methods=['GET'])
def get_admin_dashboard_data():
    try:
        # 1. Total Inventory (Sum of stock)
        total_inventory = db.session.query(func.sum(Product.stock)).scalar() or 0

        # 2. Pending Orders
        pending_orders = db.session.query(Order).filter(Order.status == 'Pending').count()

        # 3. Low Stock Alerts (Products with stock <= 5)
        low_stock_products = Product.query.filter(Product.stock <= 5).all()
        low_stock_list = [{"name": product.name, "remaining": product.stock} for product in low_stock_products]

        # 4. Top 3 Most Sold Products
        top_sold_products = Product.query.order_by(Product.sold_quantity.desc()).limit(3).all()
        top_sold = [{"name": product.name, "sold_quantity": product.sold_quantity} for product in top_sold_products]

        # 5. Top 3 Least Sold Products
        least_sold_products = Product.query.order_by(Product.sold_quantity.asc()).limit(3).all()
        least_sold = [{"name": product.name, "sold_quantity": product.sold_quantity} for product in least_sold_products]

        # 6. Profit Trend Over Last 10 Days
        today = datetime.utcnow().date()
        ten_days_ago = today - timedelta(days=9)

        profit_per_day = { (today - timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(10) }

        recent_orders = db.session.query(Order).filter(Order.order_date >= ten_days_ago).all()

        for order in recent_orders:
            order_items = OrderDetails.query.filter_by(order_id=order.id).all()
            for item in order_items:
                order_date_str = order.order_date.strftime('%Y-%m-%d')
                profit = float(item.unit_price) * item.quantity * 0.3  # 30% profit
                if order_date_str in profit_per_day:
                    profit_per_day[order_date_str] += profit

        profit_trend = [{"date": date, "profit": round(profit, 2)} for date, profit in sorted(profit_per_day.items())]

        return jsonify({
            "success": True,
            "total_inventory": total_inventory,
            "pending_orders": pending_orders,
            "low_stock": low_stock_list,
            "top_sold": top_sold,
            "least_sold": least_sold,
            "profit_trend": profit_trend
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/zones', methods=['GET'])
def get_zones():
    try:
        zones = [
            {"zone_name": "Zone A", "zone_description": "Small Equipments (Mice, RAM, Keyboards)"},
            {"zone_name": "Zone B", "zone_description": "Expensive Products (Laptops, MacBooks)"},
            {"zone_name": "Zone C", "zone_description": "Big Items (Motherboards, CPUs)"},
            {"zone_name": "Zone D", "zone_description": "Special Conditions (SSD, Batteries, Ethernet Cables)"}
        ]

        return jsonify({"success": True, "zones": zones}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/items_by_zone/<zone_name>', methods=['GET'])
def get_items_by_zone(zone_name):
    try:
        # Fetch products in that zone
        products_in_zone = Product.query.filter_by(zone=zone_name).all()

        items = [{
            "item_id": f"IT-{product.id}",
            "name": product.name,
            "category": product.category, 
            "quantity": product.stock,
            "status": "In Stock" if product.stock > 0 else "Out of Stock"
} for product in products_in_zone]

        return jsonify({"success": True, "items": items}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500