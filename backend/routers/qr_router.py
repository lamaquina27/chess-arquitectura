from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from schemas.qr_schema import QRVerifyRequest
from services.qr_service import qr_login_manager
from routers.registro_router import usuario_actual
from services.sesion_service import crear_token

router = APIRouter()

@router.get("/qr/generate")
def generate_qr():
    """Genera la sala y el token para el código QR."""
    return qr_login_manager.generar_sesion_qr()

@router.websocket("/ws/qr/{sala_id}")
async def websocket_qr(websocket: WebSocket, sala_id: str):
    """Websocket al que se conecta el monitor para esperar el inicio de sesión."""
    await qr_login_manager.conectar_monitor(websocket, sala_id)
    try:
        while True:
            # Mantenemos viva la conexión, podríamos recibir mensajes tipo ping/pong
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        qr_login_manager.desconectar_monitor(sala_id)

@router.post("/qr/verify")
async def verify_qr(request: QRVerifyRequest, user=Depends(usuario_actual)):
    """Verifica el QR escaneado por la app móvil y envía el token al monitor."""
    ws = qr_login_manager.verificar_y_obtener_ws(request.sala, request.token)
    if not ws:
        raise HTTPException(status_code=400, detail="QR inválido o expirado")
    
    # Generamos un nuevo token de acceso para el monitor, correspondiente al usuario logueado
    access_token = crear_token(data={"sub": user.id})
    
    # Enviamos el token y datos del usuario al monitor vía websocket
    try:
        await ws.send_json({
            "status": "success",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "elo": user.elo
            }
        })
    except Exception as e:
        print(f"Error enviando mensaje por ws: {e}")
        raise HTTPException(status_code=500, detail="Error de comunicación con el monitor")
    
    # Limpiamos la sesión ya que el login fue exitoso
    qr_login_manager.desconectar_monitor(request.sala)
    
    return {"message": "Login exitoso en el monitor"}
