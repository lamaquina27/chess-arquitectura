from sqlalchemy import Column, String, Integer
from database import Base


class PartidaDB(Base):
    __tablename__ = "partida"

    id = Column(String(36), primary_key=True, index=True)
    jugador_blancas = Column(String(36), nullable=False)
    jugador_negras = Column(String(36), nullable=True)
    turno = Column(String(36), nullable=False)
    jugador_actual = Column(String(36), nullable=True)
    ganador = Column(String(36), nullable=True)
    tiempo_inicial = Column(Integer, nullable=True)
