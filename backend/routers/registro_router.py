from services.registro_service import generar_id
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
    id:int
    username: str
    email: str
    hashed_password: str

class Token(BaseModel):
    access_token:str
    token_type:str

users={}

id = 0
router = APIRouter()
oauth=OAuth2PasswordBearer(tokenUrl="api/token")

@router.get("/users")
def listar():
    return users


@router.post("/usuario/registro")
def registro(user:Usuario):
    
    if user.username in users:
        return {
            "mensaje":"Ya existe un usuario con ese correo"
        }
    global id
    newId=generar_id(id)
    id = newId
    password = password_to_hash(user.password)
    
    # id = generate_id()
    userdb = UsuarioDB(username=user.username,id=newId,email=user.email,hashed_password=password)
    users[user.username]=userdb
    access_token = crear_token(data={"sub":user.username})
    return {
        "mensaje":"se ha creado el usuario exitosamente",
        "id_usuario":newId,
        "access_token":access_token,
        "token_type":"bearer"
    }





@router.post("/token",response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    
    usuario = autenticar_usuario(form_data.username,form_data.password)
    if not usuario:
        raise HTTPException(status_code=401,detail="Usuario o contrasena incorrectos")
    
    access_token = crear_token(data={"sub":form_data.username})
    
    return {
        "access_token":access_token,
        "token_type":"bearer"
    }

# def generate_id():
#     return str(uuid.uuid4())

def obtener_usuario(db,username:str):
    usuariodb= db.get(username)
    
    if usuariodb:
        return usuariodb

def autenticar_usuario(username:str,password:str):
    usuario = obtener_usuario(users,username)
    if not usuario or not verificar_password(password,usuario.hashed_password):
        raise HTTPException(status_code=404,detail="Usuario o contrasena incorrectos")
    return usuario


async def usuario_actual(token : str =Depends(oauth)):
    try:
        payload = decodificar_token(token)
        usuario = payload.get("sub")
        
        if usuario is None:
            raise HTTPException(status_code=401,detail="credenciales invalidas")
        user = obtener_usuario(users,usuario)
        if user is None:
            raise HTTPException(status_code=401,detail="usuario no encontrado")
        return user
    except Exception as e:
        raise HTTPException(status_code=401,detail="credenciales invalidas")




