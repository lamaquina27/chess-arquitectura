from sqlalchemy.orm import Session
from fastapi import HTTPException

from repositories import usuario_repository
from utils import verificar_password
from services.sesion_service import decodificar_token


def autenticar_usuario(user_id: str, password: str, db: Session):
    usuario = usuario_repository.obtener_por_id(db, user_id)
    if not usuario or not verificar_password(password, usuario.password_hash):
        raise HTTPException(status_code=404, detail="Usuario o contrasena incorrectos")
    return usuario


async def obtener_usuario_actual(token: str, db: Session):
    try:
        payload = decodificar_token(token)
        usuario_id = payload.get("sub")

        if usuario_id is None:
            raise HTTPException(status_code=401, detail="credenciales invalidas")

        user = usuario_repository.obtener_por_id(db, usuario_id)
        if user is None:
            raise HTTPException(status_code=401, detail="usuario no encontrado")

        return user
    except Exception:
        raise HTTPException(status_code=401, detail="credenciales invalidas")
