from database import get_db
from services.registro_service import generar_id
from services.sesion_service import crear_token
from services.sesion_service import decodificar_token
from services.registro_service import verificar_password
from services.registro_service import password_to_hash
from fastapi import APIRouter,HTTPException,Depends
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from pydantic import BaseModel
from models.usuario import UsuarioDB as USERDB
from sqlalchemy.orm import Session



class Usuario(BaseModel):
    username: str
    email:str
    password:str

class UsuarioDB(BaseModel):
    id:int
    username: str
    email: str
    hashed_password: str
    elo:int

class Token(BaseModel):
    access_token:str
    token_type:str



id = 0
router = APIRouter()
oauth=OAuth2PasswordBearer(tokenUrl="api/token")

@router.get("/users")
def listar():
    return users


@router.post("/usuario/registro")
def registro(user:Usuario,db: Session = Depends(get_db)):
    existe_usuario = db.query(USERDB).filter(USERDB.username == user.username).first()
    if existe_usuario:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    global id
    newId=generar_id(id)
    id = newId
    password = password_to_hash(user.password)
    
    # 3. Crear la instancia del modelo ORM
    nuevo_usuario = USERDB(
        id=newId, # Generamos un ID único universal (36 caracteres)
        username=user.username,
        email=user.email,
        password_hash=password,
        elo=1000
    )
    # 4. Guardar en MySQL
    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar en la base de datos")
    access_token = crear_token(data={"sub":user.username})
    return {
        "mensaje":"se ha creado el usuario exitosamente",
        "id_usuario":newId,
        "access_token":access_token,
        "token_type":"bearer"
    }


@router.post("/token",response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db)):
    
    usuario = autenticar_usuario(form_data.username,form_data.password,db)
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
    
    usuariodb = db.query(USERDB).filter(USERDB.username == username).first()
    if usuariodb:
        return usuariodb

def actualizar_elo(username: str, cantidad: int,db):
    # Usamos la función que ya tenías escrita para buscar al perfil
    usuario = obtener_usuario(db, username)
    if usuario:
        usuario.elo += cantidad
        db.commit()

def autenticar_usuario(username:str,password:str,db):
    usuario = obtener_usuario(db,username)
    if not usuario or not verificar_password(password,usuario.password_hash):
        raise HTTPException(status_code=404,detail="Usuario o contrasena incorrectos")
    return usuario


async def usuario_actual(token : str =Depends(oauth),db: Session = Depends(get_db)):
    try:
        payload = decodificar_token(token)
        usuario = payload.get("sub")
        
        if usuario is None:
            raise HTTPException(status_code=401,detail="credenciales invalidas")
        user = obtener_usuario(db,usuario)
        if user is None:
            raise HTTPException(status_code=401,detail="usuario no encontrado")
        return user
    except Exception as e:
        raise HTTPException(status_code=401,detail="credenciales invalidas")


@router.get("/usuario/perfil")
def obtener_perfil(user = Depends(usuario_actual)):
    return {
        "username": user.username,
        "elo": user.elo,
        "id_usuario": user.id
    }

