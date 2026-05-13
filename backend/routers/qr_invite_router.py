from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import get_db
from routers.registro_router import usuario_actual
from services.invite_service import invite_manager
from services.partida_service import iniciar_partida
from pydantic import BaseModel

router = APIRouter()

class AcceptInviteRequest(BaseModel):
    invite_id: str

@router.get("/invite/generate")
def generate_invite(user=Depends(usuario_actual)):
    invite_id = invite_manager.generar_invite(user)
    return {"invite_id": invite_id}

@router.websocket("/ws/invite/{invite_id}")
async def websocket_invite(websocket: WebSocket, invite_id: str):
    await invite_manager.conectar_host(websocket, invite_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        invite_manager.desconectar_host(invite_id)

@router.post("/invite/accept")
async def accept_invite(request: AcceptInviteRequest, user=Depends(usuario_actual), db: Session = Depends(get_db)):
    invite_data = invite_manager.obtener_invite(request.invite_id)
    if not invite_data:
        raise HTTPException(status_code=404, detail="Invitación inválida o expirada")
    
    host_user = invite_data["host_user"]
    if host_user.id == user.id:
        raise HTTPException(status_code=400, detail="No puedes aceptar tu propia invitación")
    
    # Iniciar la partida
    partida = iniciar_partida(db, host_user, user.id)
    
    partida_data = {
        "jugador_blanco": partida.jugador_blancas,
        "jugador_negro": partida.jugador_negras,
        "turno": partida.turno,
        "id_partida": partida.id
    }
    
    # Notificar al host por el websocket
    ws = invite_data["websocket"]
    if ws:
        try:
            await ws.send_json({"status": "partida_iniciada", "partidaData": partida_data})
        except Exception as e:
            print("Error enviando al ws del host:", e)
    
    # Limpiar invitación
    invite_manager.desconectar_host(request.invite_id)
    
    return partida_data
