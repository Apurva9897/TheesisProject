import os
class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'd95847aff14a63e84b48ab36ecd80c6729e5cfa944b545a8418c48970d7d2ba9')  
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:Ujwala74%40%23@127.0.0.1:3306/stock_control'
    SQLALCHEMY_TRACK_MODIFICATIONS = False