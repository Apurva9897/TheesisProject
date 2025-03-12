from flask import render_template
from flask_login import login_required, current_user
from models import Order
from routes import customer_bp

@customer_bp.route('/customer_dashboard')
@login_required
def dashboard():
    if current_user.role != 'customer':
        return redirect(url_for('auth.login'))
    orders = Order.query.filter_by(user_id=current_user.id).all()
    return render_template('customer_dashboard.html', orders=orders)
