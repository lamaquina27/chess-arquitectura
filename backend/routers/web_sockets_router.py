from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.chat_service import chat_manager
from database import SessionLocal
from repositories.mensaje_repository import MensajeRepository

router = APIRouter()

# Ahora la ruta recibe quién envía y a quién va dirigido
@router.websocket("/ws/{me_user}/{friend_user}")
async def websocket_chat(websocket: WebSocket, me_user: str, friend_user: str):
    
    # 1. El servicio genera el ID único automáticamente (ej: chat_Alice_Bob)
    sala_id = chat_manager.generar_id_sala(me_user, friend_user)
    
    # 2. Conectamos al usuario a esa sala
    await chat_manager.conectar(websocket, sala_id)
    
    try:
        while True:
            # 3. Recibimos el mensaje
            datos = await websocket.receive_text()
            
            # Guardamos en base de datos
            db = SessionLocal()
            try:
                repo = MensajeRepository(db)
                repo.guardar_mensaje(sala_id, remitente=me_user, destinatario=friend_user, contenido=datos)
            finally:
                db.close()
            
            # 4. Difundimos el mensaje a ambos participantes de la sala
            await chat_manager.broadcast_mensaje(sala_id, {
                "user": me_user,
                "message": datos
            })
            
    except WebSocketDisconnect:
        # 5. Si alguien se va, lo desconectamos limpiamente
        chat_manager.desconectar(websocket, sala_id)
