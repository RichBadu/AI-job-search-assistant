from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"🔍 DATABASE_URL loaded: {DATABASE_URL}")  
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL not found in .env file!") 
# Create SQLAlchemy engine - connectie tussen Python en PostgreSQL database
engine = create_engine(
    DATABASE_URL,
    echo=True,
    future=True  
)

# Create a session factory - connecite opent en sluit verbindingen met de database

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

Base = declarative_base()

# Dependency voor FastAPI
def get_db():

    db = SessionLocal()
    try:
        yield db # Generator functie die een database sessie levert aan FastAPI routes
    finally:
        db.close()