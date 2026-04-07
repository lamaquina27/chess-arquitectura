from sqlalchemy import Column, String, Integer, TIMESTAMP
from sqlalchemy.sql import func
from database import Base # Importamos la Base que creaste


class Partida(Base):
    __tablename__ = "partida"
    id = Column(String(36), primary_key=True, index=True)
    jugador_blancas = Column(String(36),nullable=False)
    jugador_negras = Column(String(36),nullable=True)
    turno = Column(String(36),nullable=False)
    jugador_actual = Column(String(36),nullable=True)
    ganador = Column(String(36),nullable=True)

    