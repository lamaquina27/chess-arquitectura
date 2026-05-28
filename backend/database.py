from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Estructura: mysql+pymysql://usuario:password@host:puerto/nombre_bd
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/CHESSE"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Esta función es la que usarán los routers para obtener la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
