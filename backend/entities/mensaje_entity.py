from sqlalchemy import Column, String, TIMESTAMP, Text
from sqlalchemy.sql import func
from database import Base

class MensajeDB(Base):
    __tablename__ = "mensaje"
    id = Column(String(36), primary_key=True, index=True)
    sala_id = Column(String(255), nullable=False, index=True)
    remitente = Column(String(255), nullable=False)
    destinatario = Column(String(255), nullable=False)
    contenido = Column(Text, nullable=False)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
