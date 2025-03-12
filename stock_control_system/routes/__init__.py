from flask import Blueprint

# Registering different route groups
auth_bp = Blueprint('auth', __name__)
admin_bp = Blueprint('admin', __name__)
customer_bp = Blueprint('customer', __name__)
