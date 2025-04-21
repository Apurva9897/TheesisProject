from flask import Blueprint, jsonify, render_template, redirect, url_for
from flask_login import login_required, current_user
from models import db, Product, Inventory, Order, OrderDetails
from sqlalchemy import func
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
import numpy as np
from flask import request
from models import SupplierOrder, SupplierOrderDetails
from models import Supplier

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
        low_stock_products = Product.query.filter(Product.stock <= 10).all()
        low_stock_list = [{"name": product.name, "remaining": product.stock} for product in low_stock_products]

        # 4. Top 3 Most Sold Products
        top_sold_products = Product.query.filter(Product.sold_quantity > 0).order_by(Product.sold_quantity.desc()).limit(3).all()
        top_sold = [{"name": p.name, "sold_quantity": p.sold_quantity} for p in top_sold_products]
        # Correct Least 3 Sold Products Query
        least_sold_products = Product.query.filter(Product.sold_quantity > 0).order_by(Product.sold_quantity.asc()).limit(3).all()
        least_sold = [{"name": p.name, "sold_quantity": p.sold_quantity} for p in least_sold_products]
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

        items = [
            {
                "item_id": f"IT-{product.id}",
                "name": product.name,
                "category": product.category,
                "quantity": product.stock,
                "status": "In Stock" if product.stock > 0 else "Out of Stock",
                "shelf": f"Shelf {index + 1}"  # 🆕 Add shelf label based on index
            } for index, product in enumerate(products_in_zone)
        ]

        return jsonify({"success": True, "items": items}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500



# --------- 📈 Future Sales Prediction (based on REAL database sales) ---------
@admin_bp.route('/future_sales_prediction', methods=['GET'])
def future_sales_prediction():
    try:
        products = Product.query.all()
        future_predictions = []

        for product in products:
            # Fetch real order details for this product in the last 10 days
            today = datetime.utcnow().date()
            ten_days_ago = today - timedelta(days=9)

            sales_per_day = { (today - timedelta(days=i)): 0 for i in range(10) }

            # Join OrderDetails with Orders to get dates
            order_details = (
                db.session.query(OrderDetails, Order)
                .join(Order, OrderDetails.order_id == Order.id)
                .filter(OrderDetails.product_id == product.id)
                .filter(Order.order_date >= ten_days_ago)
                .all()
            )

            for detail, order in order_details:
                order_date = order.order_date.date()
                if order_date in sales_per_day:
                    sales_per_day[order_date] += detail.quantity

            # Prepare X (days 1 to 10) and y (sales on each day)
            X = np.array(range(1, 11)).reshape(-1, 1)
            y = np.array(list(sales_per_day.values()))

            # Train the Linear Regression model
            model = LinearRegression()
            model.fit(X, y)

            # Predict sales for day 11
            next_day = np.array([[11]])
            predicted_sales = int(model.predict(next_day)[0])
            predicted_sales = max(0, predicted_sales)

            future_predictions.append({
                "name": product.name,
                "predicted_sales": predicted_sales
            })

        return jsonify({"success": True, "future_predictions": future_predictions}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/products_by_supplier_name/<string:supplier_name>', methods=['GET'])
#@login_required
def get_products_by_supplier_name(supplier_name):
    try:
        supplier = Supplier.query.filter_by(name=supplier_name).first()
        if not supplier:
            return jsonify({"success": False, "error": "Supplier not found"}), 404

        products = Product.query.filter_by(supplier_id=supplier.id).all()
        product_list = [{
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": float(p.price),
            "stock": p.stock,
            "zone": p.zone
        } for p in products]

        return jsonify({"success": True, "products": product_list}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@admin_bp.route('/validate_shelf_capacity', methods=['POST'])
@login_required
def validate_shelf_capacity():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        requested_quantity = data.get('requested_quantity')

        if not product_id or requested_quantity is None:
            return jsonify({"success": False, "message": "Missing product_id or requested_quantity"}), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404

        current_stock = product.stock
        shelf_capacity = 30
        available_space = shelf_capacity - current_stock

        if requested_quantity > available_space:
            return jsonify({
                "success": False,
                "message": f"Cannot add {requested_quantity} items. Shelf capacity is {shelf_capacity} and already has {current_stock}, only {available_space} more can be added."
            }), 400

        return jsonify({
            "success": True,
            "message": "Quantity is within shelf limits."
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/predict_sales_by_product', methods=['POST'])
#@login_required
def predict_sales_by_product():
    try:
        data = request.get_json()
        product_name = data.get('product_name')
        if not product_name:
            return jsonify({"success": False, "message": "Product name missing"}), 400

        today = datetime.utcnow().date()
        fifteen_days_ago = today - timedelta(days=14)

        # Get past 15 days of sales for the product
        order_details = (
            db.session.query(OrderDetails, Order)
            .join(Order, OrderDetails.order_id == Order.id)
            .join(Product, Product.id == OrderDetails.product_id)
            .filter(Product.name == product_name)
            .filter(Order.order_date >= fifteen_days_ago)
            .all()
        )

        sales_per_day = { (today - timedelta(days=i)): 0 for i in range(15) }

        for detail, order in order_details:
            order_date = order.order_date.date()
            if order_date in sales_per_day:
                sales_per_day[order_date] += detail.quantity

        # Prepare X and y
        X = np.array(range(1, 16)).reshape(-1, 1)
        y = np.array(list(sales_per_day.values()))

        model = LinearRegression()
        model.fit(X, y)

        # Predict next 90 days
        future_days = np.array(range(16, 46)).reshape(-1, 1)
        predictions = model.predict(future_days)
        predictions = [max(0, int(round(p))) for p in predictions]

        future_sales = [{"day": i + 1, "quantity": qty} for i, qty in enumerate(predictions)]

        return jsonify({
            "success": True,
            "product": product_name,
            "predicted_sales": future_sales
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/get_all_product_names', methods=['GET'])
def get_all_product_names():
    try:
        products = Product.query.all()
        names = [p.name for p in products]
        return jsonify({"success": True, "names": names}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/get_supplier_order_reports', methods=['GET'])
def get_supplier_order_reports():
    try:
        supplier_name = request.args.get('supplier_name')  # Optional
        start_date = request.args.get('start_date')         # Optional: "2025-04-01"
        end_date = request.args.get('end_date')             # Optional: "2025-04-20"

        query = db.session.query(SupplierOrder, Supplier).join(Supplier, SupplierOrder.supplier_id == Supplier.id)

        if supplier_name and supplier_name != "All":
            query = query.filter(Supplier.name == supplier_name)

        if start_date:
            query = query.filter(SupplierOrder.order_date >= start_date)
        if end_date:
            query = query.filter(SupplierOrder.order_date <= end_date)

        orders = query.order_by(SupplierOrder.order_date.desc()).all()

        result = []
        for supplier_order, supplier in orders:
            result.append({
                "order_id": f"SO-{supplier_order.id}",
                "supplier": supplier.name,
                "order_date": supplier_order.order_date.strftime("%b %d, %Y"),
                "total_cost": float(supplier_order.total_amount),
                "status": supplier_order.status,
                "products_count": len(supplier_order.order_details)
            })

        return jsonify({"success": True, "orders": result}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@admin_bp.route('/submit_supplier_orders', methods=['POST'])
def submit_supplier_orders():
    try:
        data = request.get_json()
        supplier_name = data.get('supplier_name')
        items = data.get('items', [])

        if not supplier_name or not items:
            return jsonify({"success": False, "message": "Missing supplier name or items"}), 400

        # Get supplier object
        supplier = Supplier.query.filter_by(name=supplier_name).first()
        if not supplier:
            return jsonify({"success": False, "message": "Supplier not found"}), 404

        # Mock admin_id (replace with real admin logic later)
        admin_id = 1  # Assuming 1 is your default admin for now

        # Calculate total amount
        total_amount = sum(item['unit_price'] * item['quantity'] for item in items)

        # Create SupplierOrder
        supplier_order = SupplierOrder(
            supplier_id=supplier.id,
            admin_id=admin_id,
            total_amount=total_amount,
            status='Pending'
        )
        db.session.add(supplier_order)
        db.session.flush()  # Get the ID before committing

        # Add each item
        for item in items:
            detail = SupplierOrderDetails(
                supplier_order_id=supplier_order.id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                unit_price=item['unit_price'],
                subtotal=item['unit_price'] * item['quantity']
            )
            db.session.add(detail)

        db.session.commit()

        return jsonify({"success": True, "message": "Supplier order submitted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


