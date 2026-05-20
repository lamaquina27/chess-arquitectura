from sqlalchemy.orm import Session
from typing import Dict, List
from fastapi import WebSocket

from entities import PartidaDB, MovimientoDB
from repositories import usuario_repository, partida_repository, movimiento_repository
from utils import generar_id


def iniciar_partida(db: Session, usuario, id_jugador_negro=None):
    new_id = generar_id()

    partida = PartidaDB(
        jugador_blancas=usuario.id,
        jugador_negras=id_jugador_negro,
        id=new_id,
        turno="blanco",
        jugador_actual=usuario.id
    )

    return partida_repository.guardar(db, partida)


def mover_pieza(db: Session, partida, casilla_inicio: str, casilla_llegada: str, pieza: str, numero_movimiento: int):
    new_id = generar_id()

    movimiento = MovimientoDB(
        id=new_id,
        partida_id=partida.id,
        numero_movimiento=numero_movimiento,
        pieza=pieza,
        casilla_inicio=casilla_inicio,
        casilla_llegada=casilla_llegada
    )

    # Alternamos el turno
    partida.turno = "negro" if partida.turno == "blanco" else "blanco"
    partida.jugador_actual = partida.jugador_negras if partida.turno == "negro" else partida.jugador_blancas

    movimiento_repository.guardar(db, movimiento)

    # Persistir el nuevo turno de la partida en la DB
    partida_repository.actualizar(db)
    db.refresh(partida)

    return partida, movimiento


def abandonar_partida(db: Session, partida):
    if partida.turno == "blanco":
        perdedor_id = partida.jugador_blancas
        ganador_id = partida.jugador_negras
    else:
        perdedor_id = partida.jugador_negras
        ganador_id = partida.jugador_blancas

    partida.ganador = ganador_id
    partida_repository.actualizar(db)

    usuario_repository.actualizar_elo(db, perdedor_id, -10)
    usuario_repository.actualizar_elo(db, ganador_id, 10)

    return partida
def listar_mov(db:Session,partida_id:str):
    movimientos_db = movimiento_repository.obtener_mov_partida(db,partida_id)
    historial = []
    for m in movimientos_db:
        historial.append(
            {
                "numero":m.numero_movimiento,
                "pieza":m.pieza,
                "casilla_inicio":m.casilla_inicio,
                "casilla_llegada":m.casilla_llegada
            }
        )
    return historial

class GameConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, partida_id: str):
        await websocket.accept()
        if partida_id not in self.active_connections:
            self.active_connections[partida_id] = []
        self.active_connections[partida_id].append(websocket)

    def disconnect(self, websocket: WebSocket, partida_id: str):
        if partida_id in self.active_connections:
            if websocket in self.active_connections[partida_id]:
                self.active_connections[partida_id].remove(websocket)
            if not self.active_connections[partida_id]:
                del self.active_connections[partida_id]

    async def broadcast_movimiento(self, partida_id: str, movimiento_data: dict):
        if partida_id in self.active_connections:
            for connection in self.active_connections[partida_id]:
                try:
                    await connection.send_json(movimiento_data)
                except:
                    pass

partida_ws_manager = GameConnectionManager()
