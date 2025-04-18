from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS
from config import Config
from models import db, User
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.customer_routes import customer_bp
from routes.customer_dashboard_routes import customer_dashboard_bp


app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:4200"])

app.config.from_object(Config)
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:4200"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
# Initialize database
db.init_app(app)
migrate = Migrate(app, db) 
CORS(app)


# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(customer_bp, url_prefix='/customer')
app.register_blueprint(customer_dashboard_bp, url_prefix='/customer_dashboard')

if __name__ == "__main__":
    print("🚀 Flask Server is running at http://127.0.0.1:5000/")
    app.run(host="0.0.0.0", port=5000, debug=True)
