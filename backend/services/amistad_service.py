from sqlalchemy.orm import Session
from entities.amistad_entity import AmistadDB
from utils import generar_id
from fastapi import HTTPException
from repositories.amistad_repository import obtener_solicitud,crear_solicitud,aceptar,rechazar
from repositories.amistad_repository import obtener_solicitudes_pendientes

from repositories.amistad_repository import obtener_amigos

def listar_amigos(db: Session, mi_id: str):
    return obtener_amigos(db, mi_id)

def crear_solicitud_service(db:Session,usuario_id:str,amistad_id:str):
    solicitud = obtener_solicitud(db,usuario_id,amistad_id)
    if solicitud:
        raise HTTPException(status_code=400, detail="La solicitud usuario ya existe")
    new_id = generar_id()
    solicitud_nueva = AmistadDB(
        id=new_id,
        usuario_id = usuario_id,
        amigo_id = amistad_id
    )

    try:
        crear_solicitud(db,solicitud_nueva)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar en la base de datos")

    return{
        "mensaje": "se ha creado la solcitud exitosamente",
        "id_solicitud": new_id,
    }

def aceptar_solicitud(db:Session,usuario_id:str,amistad_id:str):
    solicitud = obtener_solicitud(db,usuario_id,amistad_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="La solicitud no existe")
    
    try:
        aceptar(db,solicitud.id)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar en la base de datos")


def rechazar_solicitud(db:Session,usuario_id:str,amistad_id:str):
    solicitud = obtener_solicitud(db,usuario_id,amistad_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="La solicitud no existe")
    
    try:
        rechazar(db,solicitud.id)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar en la base de datos")



def listar_pendientes(db: Session, mi_id: str):
    return obtener_solicitudes_pendientes(db, mi_id)
