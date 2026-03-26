from services.sesion_service import crear_token
from os import access
from services.sesion_service import decodificar_token
from services.registro_service import verificar_password
from services.registro_service import password_to_hash
from fastapi import APIRouter,HTTPException,Depends
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from pydantic import BaseModel
import uuid



class Usuario(BaseModel):
    username: str
    email:str
    password:str

class UsuarioDB(BaseModel):
    username: str
    hashed_password: str

class Token(BaseModel):
    access_token:str
    token_type:str

users={}


router = APIRouter()
oauth=OAuth2PasswordBearer(tokenUrl="token")

@router.get("/users")
def listar():
    return users


@router.post("/usuario/registro")
def registro(user:Usuario):
    
    if user.email in users:
        return {
            "mensaje":"Ya existe un usuario con ese correo"
        }
    
    password = password_to_hash(user.password)
    
    # id = generate_id()
    userdb= UsuarioDB(username=user.username,hashed_password=password)
    users[user.email]=userdb
    return {
        "mensaje":"holiii",
        "email_usuario":user.email
    }


@router.post("usuario/iniciar-sesion")
def iniciar_sesion(email : str,password  :str):
    pass



@router.post("/token",response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    usuario = autenticar_usuario(form_data.email,form_data.password)
    if not user:
        raise HTTPException(status_code=401,detail="Usuario o contrasena incorrectos")

    access_token = crear_token(data={"sub":usuario.email})
    return {
        "access_token":access_token
    }

# def generate_id():
#     return str(uuid.uuid4())

def obtener_usuario(db,username:str):
    usuariodb= db.get(username)
    if usuariodb:
        return UsuarioDB(**usuariodb)

def autenticar_usuario(username:str,password:str):
    usuario = obtener_usuario(users,username)
    if not usuario or not verificar_password(password,usuario.hashed_password):
        return {"mensaje":"no tienes licencia"}
    return usuario


async def usuario_actual(token : str =Depends(oauth)):
    payload = decodificar_token(token)
    usuario = payload.get("sub")
    if usuario is None:
        raise HTTPException(status_code=401,detail="credenciales invalidas")
    user = obtener_usuario(users,usuario)
    if user is None:
        raise HTTPException(status_code=401,detail="usuario no encontrado")
    return user

