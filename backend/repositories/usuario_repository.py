from sqlalchemy.orm import Session
from entities import UsuarioDB


def obtener_por_id(db: Session, user_id: str):
    return db.query(UsuarioDB).filter(UsuarioDB.id == user_id).first()


def obtener_por_username(db: Session, username: str):
    return db.query(UsuarioDB).filter(UsuarioDB.username == username).first()


def crear(db: Session, usuario: UsuarioDB):
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def actualizar_elo(db: Session, user_id: str, cantidad: int):
    usuario = obtener_por_id(db, user_id)
    if usuario:
        usuario.elo += cantidad
        db.commit()
