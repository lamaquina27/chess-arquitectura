import secrets
from typing import Dict, Optional
from fastapi import WebSocket

class InviteService:
    def __init__(self):
        # { "invite_id": {"host_user": user_obj, "websocket": WebSocket | None, "color_host": str, "tiempo": int | None} }
        self.invites: Dict[str, dict] = {}

    def generar_invite(self, host_user, color_host: str = "aleatorio", tiempo: Optional[int] = None) -> str:
        invite_id = secrets.token_urlsafe(16)
        self.invites[invite_id] = {
            "host_user": host_user,
            "websocket": None,
            "color_host": color_host,
            "tiempo": tiempo
        }
        return invite_id

    async def conectar_host(self, websocket: WebSocket, invite_id: str):
        await websocket.accept()
        if invite_id in self.invites:
            self.invites[invite_id]["websocket"] = websocket
        else:
            await websocket.close()

    def desconectar_host(self, invite_id: str):
        if invite_id in self.invites:
            del self.invites[invite_id]

    def obtener_invite(self, invite_id: str):
        return self.invites.get(invite_id)

invite_manager = InviteService()
