from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

# -------------------- User Model --------------------
class User(db.Model, UserMixin):
    __tablename__ = 'users'  

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin' or 'client'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    customer = db.relationship("Customer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin = db.relationship("Admin", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# -------------------- Customer Model --------------------
class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)  # ✅ Ensure email is included
    phone = db.Column(db.String(20)) 
    address = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship("User", back_populates="customer")
    orders = db.relationship('Order', back_populates='customer', cascade="all, delete-orphan")

    # ✅ Fix constructor: Ensure email is explicitly included
    def __init__(self, name, email, phone, address, user_id):
        print(f"📌 Creating Customer Object: name={name}, email={email}, phone={phone}, address={address}, user_id={user_id}")
        self.name = name
        self.email = email  # ✅ Ensure email is assigned properly
        self.phone = phone
        self.address = address
        self.user_id = user_id


# -------------------- Order Model --------------------
class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    customer_email = db.Column(db.String(100), nullable=False)  
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default="Pending")
    total_amount = db.Column(db.DECIMAL(10, 2), nullable=False, default=0)

    # Relationships
    customer = db.relationship('Customer', back_populates='orders')
    order_details = db.relationship('OrderDetails', back_populates='order', lazy=True, cascade="all, delete-orphan")

# -------------------- Order Details Model --------------------
class OrderDetails(db.Model):
    __tablename__ = 'order_details'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete="CASCADE"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete="CASCADE"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.DECIMAL(10, 2), nullable=False)
    subtotal = db.Column(db.DECIMAL(10, 2), nullable=False)

    order = db.relationship('Order', back_populates='order_details')
    product = db.relationship('Product', back_populates='order_details')

# -------------------- Admin Model --------------------
class Admin(db.Model):
    __tablename__ = 'admins'  

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    # Foreign Key linking to User
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship("User", back_populates="admin")

    # Admin can manage suppliers
    suppliers = db.relationship("Supplier", back_populates="admin", lazy=True, cascade="all, delete-orphan")

    def __init__(self, name, user_id):
        self.name = name
        self.user_id = user_id

# -------------------- Supplier Model --------------------
class Supplier(db.Model):
    __tablename__ = 'suppliers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)

    # Foreign Key linking to Admin
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id', ondelete='CASCADE'), nullable=False)
    admin = db.relationship("Admin", back_populates="suppliers")

    products = db.relationship("Product", back_populates="supplier", lazy=True)

# -------------------- Product Model --------------------
class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.DECIMAL(10, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    sold_quantity = db.Column(db.Integer, nullable=False, default=0)  # ✅ New column for tracking sold items
    # Link to Supplier
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id', ondelete='CASCADE'), nullable=False)
    supplier = db.relationship("Supplier", back_populates="products")
    
    category = db.Column(db.String(255))  # ✅ You added earlier
    zone = db.Column(db.String(255))   
    # Link to Inventory
    inventory = db.relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")

    # Link to Order Details
    order_details = db.relationship("OrderDetails", back_populates="product", lazy=True)

# -------------------- Inventory Model --------------------
class Inventory(db.Model):
    __tablename__ = 'inventory'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete="CASCADE"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = db.relationship("Product", back_populates="inventory")

# -------------------- Supplier Order Model --------------------
class SupplierOrder(db.Model):
    __tablename__ = 'supplier_orders'

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id', ondelete='CASCADE'), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id', ondelete='CASCADE'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Pending')  # ✅ Pending or Delivered
    total_amount = db.Column(db.DECIMAL(10, 2), default=0)

    supplier = db.relationship('Supplier', backref='supplier_orders')
    admin = db.relationship('Admin', backref='supplier_orders')
    order_details = db.relationship('SupplierOrderDetails', back_populates='supplier_order', cascade='all, delete-orphan')

# -------------------- Supplier Order Details Model --------------------
class SupplierOrderDetails(db.Model):
    __tablename__ = 'supplier_order_details'

    id = db.Column(db.Integer, primary_key=True)
    supplier_order_id = db.Column(db.Integer, db.ForeignKey('supplier_orders.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.DECIMAL(10, 2), nullable=False)
    subtotal = db.Column(db.DECIMAL(10, 2), nullable=False)

    supplier_order = db.relationship('SupplierOrder', back_populates='order_details')
    product = db.relationship('Product')

# -------------------- Shleves Model --------------------

class Shelf(db.Model):
    __tablename__ = 'shelves'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)              # e.g., "Shelf 1"
    zone = db.Column(db.String(255), nullable=False)             # e.g., "Zone A"
    capacity = db.Column(db.Integer, default=30, nullable=False) # Max capacity per shelf
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))  # Assigned product

    # Relationship to Product
    product = db.relationship("Product", backref="shelf")        # Access shelf from product

