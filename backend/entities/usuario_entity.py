from sqlalchemy import Column, String, Integer, TIMESTAMP
from sqlalchemy.sql import func
from database import Base


class UsuarioDB(Base):
    __tablename__ = "usuario"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    elo = Column(Integer, default=1000)
