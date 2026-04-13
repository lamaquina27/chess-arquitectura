from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from schemas import UsuarioRegistro, Token
from services.registro_service import registrar_usuario
from services.sesion_service import crear_token
from services.auth_service import autenticar_usuario, obtener_usuario_actual
from repositories import usuario_repository


router = APIRouter()
oauth = OAuth2PasswordBearer(tokenUrl="api/token")


async def usuario_actual(token: str = Depends(oauth), db: Session = Depends(get_db)):
    return await obtener_usuario_actual(token, db)


@router.post("/usuario/registro")
def registro(user: UsuarioRegistro, db: Session = Depends(get_db)):
    return registrar_usuario(db, user.username, user.email, user.password)


@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    userdb = usuario_repository.obtener_por_username(db, form_data.username)
    if not userdb:
        raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos")

    usuario = autenticar_usuario(userdb.id, form_data.password, db)
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario o contrasena incorrectos")

    access_token = crear_token(data={"sub": usuario.id})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/usuario/perfil")
def obtener_perfil(user=Depends(usuario_actual)):
    return {
        "username": user.username,
        "elo": user.elo,
        "id_usuario": user.id
    }
