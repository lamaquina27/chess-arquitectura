from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.amistad_schema import AmistadCreate
from services.amistad_service import crear_solicitud_service, listar_pendientes, aceptar_solicitud, rechazar_solicitud
from services.amistad_service import listar_amigos 

router = APIRouter(prefix="/amistad", tags=["Amistad"])

@router.post("/enviar")
def enviar_solicitud(solicitud: AmistadCreate, db: Session = Depends(get_db)):
    # Aquí llamas a tu servicio pasándole los parámetros y el db
    return crear_solicitud_service(db,solicitud.id_usuario,solicitud.id_amistad)



@router.get("/pendientes/{mi_id}")
def obtener_pendientes(mi_id: str, db: Session = Depends(get_db)):
    return listar_pendientes(db, mi_id)

@router.post("/aceptar")
def aceptar(solicitud: AmistadCreate, db: Session = Depends(get_db)):
    return aceptar_solicitud(db, solicitud.id_usuario, solicitud.id_amistad)

@router.post("/rechazar")
def rechazar(solicitud: AmistadCreate, db: Session = Depends(get_db)):
    return rechazar_solicitud(db, solicitud.id_usuario, solicitud.id_amistad)


@router.get("/lista/{mi_id}")
def obtener_lista_amigos(mi_id: str, db: Session = Depends(get_db)):
    return listar_amigos(db, mi_id)
