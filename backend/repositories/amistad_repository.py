from database import get_db
from sqlalchemy.orm import Session
from entities.amistad_entity import AmistadDB

from sqlalchemy import or_ # IMPORTANTE: Pon esto arriba del todo en tus imports

def obtener_amigos(db: Session, mi_id: str):
    # 1. Buscamos todas las amistades donde participe el usuario y estén aceptadas
    amistades = db.query(AmistadDB).filter(
        or_(AmistadDB.usuario_id == mi_id, AmistadDB.amigo_id == mi_id),
        AmistadDB.estado == "aceptado"
    ).all()
    
    lista_amigos = []
    for amistad in amistades:
        # 2. Identificamos el ID de la otra persona (el que NO soy yo)
        id_amigo = amistad.amigo_id if amistad.usuario_id == mi_id else amistad.usuario_id
        
        # 3. Buscamos los datos de esa otra persona
        usuario = db.query(UsuarioDB).filter(UsuarioDB.id == id_amigo).first()
        if usuario:
            lista_amigos.append({
                "id": usuario.id,
                "nombre": usuario.username,
                "avatar": usuario.username[:2].upper(), # Tomamos 2 letras de su nombre para el circulito
                "estado": "online" # Lo dejaremos fijo por ahora
            })
            
    return lista_amigos

def obtener_solicitud(db:Session,usuario_id:str,amistad_id:str):
    solicitud = db.query(AmistadDB).filter(AmistadDB.usuario_id == usuario_id, AmistadDB.amigo_id == amistad_id).first()
    return solicitud
def crear_solicitud(db:Session,amistad :AmistadDB):
    db.add(amistad)
    db.commit()
    db.refresh(amistad)
    return amistad


def aceptar(db:Session,solicitud_id : str):
    solicitud = db.query(AmistadDB).filter(AmistadDB.id == solicitud_id).first()   
    if solicitud:
        solicitud.estado = "aceptado"
        db.commit()
        db.refresh(solicitud)
    return solicitud

def rechazar(db:Session,solicitud_id : str):
    solicitud = db.query(AmistadDB).filter(AmistadDB.id == solicitud_id).first()   
    if solicitud:
        solicitud.estado = "rechazada"
        db.commit()
        db.refresh(solicitud)
    return solicitud


from entities.usuario_entity import UsuarioDB # Asegúrate de importar esto arriba

def obtener_solicitudes_pendientes(db: Session, mi_id: str):
    # Hacemos un JOIN con UsuarioDB para poder devolver el nombre del que nos envía la solicitud
    resultados = db.query(AmistadDB, UsuarioDB).join(
        UsuarioDB, AmistadDB.usuario_id == UsuarioDB.id
    ).filter(
        AmistadDB.amigo_id == mi_id,
        AmistadDB.estado == "pendiente"
    ).all()
    
    # Formateamos la respuesta para que sea fácil de leer en el frontend
    lista = []
    for amistad, usuario in resultados:
        lista.append({
            "solicitud_id": amistad.id,
            "emisor_id": usuario.id,
            "emisor_username": usuario.username,
            "fecha": amistad.fecha_creacion
        })
    return lista
