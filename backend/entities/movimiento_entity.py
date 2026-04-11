from sqlalchemy import Column, String, Integer
from database import Base


class MovimientoDB(Base):
    __tablename__ = "movimiento"

    id = Column(String(36), primary_key=True, index=True)
    partida_id = Column(String(36), nullable=False)
    numero_movimiento = Column(Integer, nullable=False)
    pieza = Column(String(20), nullable=False)
    casilla_inicio = Column(String(5), nullable=False)
    casilla_llegada = Column(String(5), nullable=False)
