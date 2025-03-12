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
