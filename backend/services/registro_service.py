from sqlalchemy.orm import Session
from fastapi import HTTPException

from entities import UsuarioDB
from repositories import usuario_repository
from services.sesion_service import crear_token
from utils import generar_id, password_to_hash


def registrar_usuario(db: Session, username: str, email: str, password: str):
    existe_usuario = usuario_repository.obtener_por_username(db, username)
    if existe_usuario:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    new_id = generar_id()
    hashed_password = password_to_hash(password)

    nuevo_usuario = UsuarioDB(
        id=new_id,
        username=username,
        email=email,
        password_hash=hashed_password,
        elo=1000
    )

    try:
        usuario_repository.crear(db, nuevo_usuario)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar en la base de datos")

    access_token = crear_token(data={"sub": new_id})

    return {
        "mensaje": "se ha creado el usuario exitosamente",
        "id_usuario": new_id,
        "access_token": access_token,
        "token_type": "bearer"
    }