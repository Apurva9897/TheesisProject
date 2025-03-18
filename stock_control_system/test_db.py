from config import Config
from sqlalchemy import create_engine

try:
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    with engine.connect() as connection:
        print("✅ Successfully connected to the database!")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
