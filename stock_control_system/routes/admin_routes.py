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
from datetime import datetime, timedelta
from datetime import datetime, timezone
from sqlalchemy import and_
from models import Shelf
from models import User
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
        pending_orders = db.session.query(Order).filter(Order.status != 'Delivered').count()

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
        today = datetime.now(timezone.utc).date()
        thirty_days_ago = today - timedelta(days=30)

        products = Product.query.all()
        results = []

        for product in products:
            # Step 1: Fetch order quantities in the past 30 days
            order_data = (
                db.session.query(Order.order_date, func.sum(OrderDetails.quantity).label("total_quantity"))
                .join(Order, Order.id == OrderDetails.order_id)
                .filter(OrderDetails.product_id == product.id)
                .filter(Order.order_date >= thirty_days_ago)
                .group_by(Order.order_date)
                .all()
            )

            # Step 2: Create a dictionary of {date: quantity}
            daily_sales = {od.order_date.date(): od.total_quantity for od in order_data}

            # Step 3: Bucket into 4 weekly totals
            weekly_sales = [0, 0, 0, 0]  # 4 weeks
            for sale_date, qty in daily_sales.items():
                week_index = (today - sale_date).days // 7
                if 0 <= week_index < 4:
                    weekly_sales[3 - week_index] += qty  # reverse so most recent week is last

            # Step 4: Prepare training data
            X = np.array([1, 2, 3, 4]).reshape(-1, 1)  # Week numbers
            y = np.array(weekly_sales)

            # Avoid all-zeros training data
            if np.all(y == 0):
                predicted_sales = 0
            else:
                model = LinearRegression()
                model.fit(X, y)

                # Step 5: Predict next 4 weeks and average
                future_weeks = np.array([5, 6, 7, 8]).reshape(-1, 1)
                predictions = model.predict(future_weeks)
                predictions = [max(0, round(p)) for p in predictions]

                predicted_sales = sum(predictions)  # total 30-day forecast

            results.append({
                "name": product.name,
                "predicted_sales": predicted_sales
            })

        return jsonify({
            "success": True,
            "future_predictions": results
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


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
def predict_sales_by_product():
    try:
        data = request.get_json()
        product_name = data.get('product_name')

        if not product_name:
            return jsonify({"success": False, "message": "Product name missing"}), 400

        # Step 1: Get product ID
        product = Product.query.filter(Product.name.ilike(product_name)).first()
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404

        product_id = product.id

        today = datetime.now(timezone.utc).date()
        thirty_days_ago = today - timedelta(days=29)

        # Step 2: Get all orders in past 30 days (regardless of status)
        order_details = (
            db.session.query(OrderDetails, Order)
            .join(Order, OrderDetails.order_id == Order.id)
            .filter(OrderDetails.product_id == product_id)
            .filter(Order.order_date >= thirty_days_ago)
            .all()
        )

        # Step 3: Build sales per day dictionary
        sales_per_day = { (today - timedelta(days=i)): 0 for i in range(30) }

        for detail, order in order_details:
            order_date = order.order_date.date()
            if order_date in sales_per_day:
                sales_per_day[order_date] += detail.quantity

        # Step 4: Prepare training data
        X = np.array(range(1, 31)).reshape(-1, 1)
        y = np.array(list(sales_per_day.values()))

        # Edge case: all values are zero, skip training
        if all(qty == 0 for qty in y):
            predictions = [0 for _ in range(30)]
        else:
            model = LinearRegression()
            model.fit(X, y)

            future_days = np.array(range(31, 61)).reshape(-1, 1)  # Next 30 days
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
        # ✅ Fix: First retrieve raw query strings
        supplier_name = request.args.get('supplier_name')  # Optional
        start_date_str = request.args.get('start_date')     # Optional
        end_date_str = request.args.get('end_date')         # Optional

        # ✅ Convert to datetime if provided
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
        
        query = db.session.query(SupplierOrder, Supplier).join(Supplier, SupplierOrder.supplier_id == Supplier.id)

        if supplier_name and supplier_name != "All":
            query = query.filter(Supplier.name == supplier_name)

        if start_date:
            query = query.filter(SupplierOrder.order_date >= start_date)
        if end_date:
            query = query.filter(SupplierOrder.order_date < end_date + timedelta(days=1))  # Include end day

        orders = query.order_by(SupplierOrder.order_date.desc()).all()

        result = []
        for supplier_order, supplier in orders:
            result.append({
                "order_id": f"SO-{supplier_order.id}",
                "supplier": supplier.name,
                "order_date": supplier_order.order_date.strftime("%b %d, %Y %H:%M:%S"),
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

        from pytz import timezone  # ✅ Add this if not already at top
        uk_timezone = timezone('Europe/London')
        order_date = datetime.now(uk_timezone) 


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
            order_date=order_date, 
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

@admin_bp.route('/get_client_order_reports', methods=['GET'])
def get_client_order_reports():
    try:
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')

        # ✅ Validate date format
        if not start_date_str or not end_date_str:
            return jsonify({"success": False, "message": "Start and End dates are required"}), 400

        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

        # ✅ Get orders within the date range (inclusive)
        orders = Order.query.filter(
            and_(
                Order.order_date >= start_date,
                Order.order_date <= end_date
            )
        ).order_by(Order.order_date.desc()).all()

        # ✅ Build the report data
        report_data = []
        for order in orders:
            order_items = OrderDetails.query.filter_by(order_id=order.id).all()
            product_count = len(order_items)
            formatted_date = order.order_date.strftime('%b %d, %Y %H:%M:%S') if order.order_date else "N/A"

            # ✅ Use custom_order_id if present, else fallback to ORD{id}
            order_id = order.custom_order_id if order.custom_order_id else f"ORD{order.id}"

            report_data.append({
                "order_id": order_id,
                "customer_email": order.customer_email,
                "order_date": formatted_date,
                "products_count": product_count,
                "total_cost": float(order.total_amount),
                "status": order.status
            })

        return jsonify({"success": True, "orders": report_data}), 200

    except Exception as e:
        print("❌ Error in get_client_order_reports:", str(e))
        return jsonify({"success": False, "message": "Server error"}), 500

@admin_bp.route('/get_shelves_by_zone/<zone_name>', methods=['GET'])
def get_shelves_by_zone(zone_name):
    try:
        shelves = Shelf.query.filter_by(zone=zone_name).all()

        result = []
        for shelf in shelves:
            product = shelf.product  # via relationship
            stock = product.stock if product else 0
            capacity = shelf.capacity
            available = capacity - stock
            usage_percent = f"{int((stock / capacity) * 100)}%" if capacity > 0 else "0%"

            result.append({
                "shelf": shelf.name,
                "product": product.name if product else "Empty",
                "occupied": stock, 
                "available": available,
                "capacity": capacity,
                "status": usage_percent
            })

        return jsonify({"success": True, "shelves": result}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/trigger_update_order_status', methods=['POST'])
def trigger_update_order_status():
    try:
        orders = Order.query.all()
        updated_count = 0

        today = datetime.now(timezone.utc).date()

        for order in orders:
            order_date = order.order_date.date()
            days_diff = (today - order_date).days

            if days_diff == 0:
                new_status = 'Pending'
            elif days_diff == 1:
                new_status = 'Packaging'
            else:
                new_status = 'Delivered'

            if order.status != new_status:
                order.status = new_status
                updated_count += 1

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Order statuses updated for {updated_count} orders."
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@admin_bp.route('/search_client_order/<order_id>', methods=['GET'])
def search_client_order(order_id):
    try:
        # Extract numeric part from "ORD36"
        if not order_id.startswith("ORD"):
            return jsonify({"success": False, "message": "Invalid order ID format"}), 400
        
        numeric_id = int(order_id.replace("ORD", ""))
        order = Order.query.get(numeric_id)

        if not order:
            return jsonify({"success": False, "message": "Client order not found"}), 404

        order_items = OrderDetails.query.filter_by(order_id=order.id).all()
        products = []
        for item in order_items:
            product = Product.query.get(item.product_id)
            if product:
                products.append({
                    "name": product.name,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price),
                    "subtotal": float(item.subtotal)
                })

        return jsonify({
            "success": True,
            "order_id": f"ORD{order.id}",
            "status": order.status,
            "total_cost": float(order.total_amount),
            "customer_email": order.customer_email,
            "order_date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "products": products
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@admin_bp.route('/search_supplier_order/<order_id>', methods=['GET'])
def search_supplier_order(order_id):
    try:
        # 🧠 Extract numeric part from 'SO-101'
        if not order_id.startswith("SO-"):
            return jsonify({"success": False, "message": "Invalid supplier order ID format"}), 400

        numeric_id = int(order_id.replace("SO-", ""))
        order = SupplierOrder.query.get(numeric_id)

        if not order:
            return jsonify({"success": False, "message": "Supplier order not found"}), 404

        # Get supplier name
        supplier = Supplier.query.get(order.supplier_id)
        supplier_name = supplier.name if supplier else "Unknown Supplier"

        # Get product details
        details = SupplierOrderDetails.query.filter_by(supplier_order_id=order.id).all()
        items = []
        for detail in details:
            product = Product.query.get(detail.product_id)
            if product:
                items.append({
                    "product_name": product.name,
                    "quantity": detail.quantity,
                    "unit_price": float(detail.unit_price),
                    "subtotal": float(detail.subtotal)
                })

        return jsonify({
            "success": True,
            "supplier": supplier_name,
            "order_date": order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            "total_amount": float(order.total_amount),
            "items": items
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Server error", "error": str(e)}), 500

@admin_bp.route('/get_low_stock_alerts', methods=['GET'])
def get_low_stock_alerts():
    try:
        threshold = 10  # ⚡ You can change this to whatever low-stock threshold you want
        low_stock_products = Product.query.filter(Product.stock <= threshold).all()

        product_list = [{
            'name': p.name,
            'stock': p.stock
        } for p in low_stock_products]

        return jsonify({"success": True, "low_stock_products": product_list}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@admin_bp.route('/approve_admin', methods=['POST'])
def approve_admin():
    data = request.json
    email_to_approve = data.get('email')

    if not email_to_approve:
        return jsonify({"success": False, "message": "Email is required"}), 400

    # Optional: restrict access so only head admin can approve
    approver_email = request.headers.get('X-Admin-Email')
    if approver_email != "apu1098avk@gmail.com":
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    user = User.query.filter_by(email=email_to_approve, role='admin').first()

    if not user:
        return jsonify({"success": False, "message": "Admin not found"}), 404

    user.is_approved = True
    db.session.commit()

    return jsonify({"success": True, "message": f"{email_to_approve} approved as admin"}), 200

@admin_bp.route('/apply_discount', methods=['POST'])
def apply_discount():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        discount = data.get('discount_percent')

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404

        product.discount_percent = discount
        db.session.commit()

        return jsonify({"success": True, "message": f"{discount}% discount applied"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
