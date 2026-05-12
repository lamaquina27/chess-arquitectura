import uuid
import secrets
from typing import Dict
from fastapi import WebSocket

class QRLoginService:
    def __init__(self):
        # Almacena el token y el websocket para cada sala (room)
        # { "sala_id": {"token": "...", "websocket": WebSocket | None} }
        self.sesiones: Dict[str, dict] = {}

    def generar_sesion_qr(self) -> dict:
        """Genera una nueva sesión de QR con un ID de sala y un token únicos."""
        sala_id = str(uuid.uuid4())
        token = secrets.token_urlsafe(16)
        self.sesiones[sala_id] = {"token": token, "websocket": None}
        return {"sala": sala_id, "token": token}

    async def conectar_monitor(self, websocket: WebSocket, sala_id: str):
        """Conecta el websocket del monitor a la sala creada."""
        await websocket.accept()
        if sala_id in self.sesiones:
            self.sesiones[sala_id]["websocket"] = websocket
        else:
            await websocket.close()

    def desconectar_monitor(self, sala_id: str):
        """Elimina la sesión una vez completada o desconectada."""
        if sala_id in self.sesiones:
            del self.sesiones[sala_id]

    def verificar_y_obtener_ws(self, sala_id: str, token: str):
        """Verifica que el token coincida con la sala y retorna el websocket si es válido."""
        sesion = self.sesiones.get(sala_id)
        if sesion and sesion["token"] == token:
            return sesion.get("websocket")
        return None

# Instancia global (Singleton pattern)
qr_login_manager = QRLoginService()
