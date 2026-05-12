from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from repositories.mensaje_repository import MensajeRepository
from services.chat_service import chat_manager

router = APIRouter()

@router.get("/mensajes/{user1}/{user2}")
def obtener_historial(user1: str, user2: str, db: Session = Depends(get_db)):
    repo = MensajeRepository(db)
    sala_id = chat_manager.generar_id_sala(user1, user2)
    mensajes = repo.obtener_mensajes_por_sala(sala_id)
    return [
        {
            "id": m.id,
            "remitente": m.remitente,
            "destinatario": m.destinatario,
            "contenido": m.contenido,
            "fecha_creacion": m.fecha_creacion
        }
        for m in mensajes
    ]
