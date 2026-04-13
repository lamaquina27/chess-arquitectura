from sqlalchemy.orm import Session
from entities import PartidaDB


def obtener_por_id(db: Session, partida_id: str):
    return db.query(PartidaDB).filter(PartidaDB.id == partida_id).first()


def guardar(db: Session, partida: PartidaDB):
    db.add(partida)
    db.commit()
    db.refresh(partida)
    return partida


def actualizar(db: Session):
    db.commit()
