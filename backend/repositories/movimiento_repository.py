from sqlalchemy.orm import Session
from entities import MovimientoDB


def contar_por_partida(db: Session, partida_id: str) -> int:
    return db.query(MovimientoDB).filter(MovimientoDB.partida_id == partida_id).count()


def guardar(db: Session, movimiento: MovimientoDB):
    db.add(movimiento)
    db.commit()
    return movimiento

def obtener_mov_partida(db:Session,partida_id:str):
    return db.query(MovimientoDB).filter(MovimientoDB.partida_id == partida_id)