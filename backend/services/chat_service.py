from typing import List, Dict, Set
from fastapi import WebSocket

class ChatService:
    def __init__(self):
        # Diccionario para gestionar las conexiones activas por sala
        # { "sala_id": [WebSocket1, WebSocket2] }
        self.active_connections: Dict[str, List[WebSocket]] = {}

    def generar_id_sala(self, usuario1: str, usuario2: str) -> str:
        """
        Genera un ID único y determinista para dos usuarios.
        No importa el orden, el ID será el mismo.
        """
        nombres = sorted([usuario1, usuario2])
        return f"chat_{nombres[0]}_{nombres[1]}"

    async def conectar(self, websocket: WebSocket, sala_id: str):
        await websocket.accept()
        if sala_id not in self.active_connections:
            self.active_connections[sala_id] = []
        self.active_connections[sala_id].append(websocket)

    def desconectar(self, websocket: WebSocket, sala_id: str):
        if sala_id in self.active_connections:
            self.active_connections[sala_id].remove(websocket)
            if not self.active_connections[sala_id]:
                del self.active_connections[sala_id]

    async def broadcast_mensaje(self, sala_id: str, mensaje: dict):
        if sala_id in self.active_connections:
            for connection in self.active_connections[sala_id]:
                await connection.send_json(mensaje)

# Instancia global para ser usada por el router (Singleton pattern)
chat_manager = ChatService()
