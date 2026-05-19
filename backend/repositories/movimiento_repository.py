from sqlalchemy.orm import Session
from entities import MovimientoDB


def contar_por_partida(db: Session, partida_id: str) -> int:
    return db.query(MovimientoDB).filter(MovimientoDB.partida_id == partida_id).count()


def obtener_por_partida(db: Session, partida_id: str) -> list:
    """
    Retorna todos los movimientos de una partida ordenados cronológicamente.
    El motor de ajedrez usa esta lista para reconstruir el tablero actual.
    """
    return (
        db.query(MovimientoDB)
        .filter(MovimientoDB.partida_id == partida_id)
        .order_by(MovimientoDB.numero_movimiento)
        .all()
    )


def guardar(db: Session, movimiento: MovimientoDB):
    db.add(movimiento)
    db.commit()
    return movimiento
