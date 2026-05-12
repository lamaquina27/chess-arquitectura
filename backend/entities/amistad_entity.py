from sqlalchemy import Column, String, Integer, TIMESTAMP
from sqlalchemy.sql import func
from database import Base


class AmistadDB(Base):
    __tablename__ = "amistad"

    id = Column(String(36), primary_key=True, index=True)
    usuario_id = Column(String(255), nullable=False)
    amigo_id = Column(String(100), nullable=False)
    estado = Column(String(255), nullable=False,default="pendiente")
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    
