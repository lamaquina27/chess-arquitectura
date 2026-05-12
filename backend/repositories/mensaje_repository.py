import uuid
from sqlalchemy.orm import Session
from entities.mensaje_entity import MensajeDB

class MensajeRepository:
    def __init__(self, db: Session):
        self.db = db

    def guardar_mensaje(self, sala_id: str, remitente: str, destinatario: str, contenido: str):
        nuevo_mensaje = MensajeDB(
            id=str(uuid.uuid4()),
            sala_id=sala_id,
            remitente=remitente,
            destinatario=destinatario,
            contenido=contenido
        )
        self.db.add(nuevo_mensaje)
        self.db.commit()
        self.db.refresh(nuevo_mensaje)
        return nuevo_mensaje

    def obtener_mensajes_por_sala(self, sala_id: str):
        return self.db.query(MensajeDB).filter(MensajeDB.sala_id == sala_id).order_by(MensajeDB.fecha_creacion.asc()).all()
