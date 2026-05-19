from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from database import SessionLocal
from services.partida_service import partida_ws_manager, mover_pieza
from repositories import partida_repository, movimiento_repository, usuario_repository
from services.sesion_service import decodificar_token
from services.chess_engine.validador import validar_movimiento, detectar_estado_final

router = APIRouter()


def _obtener_usuario_color(db, partida_id: str, user_id: str):
    """Abre sesión fresca, obtiene partida y determina color del jugador."""
    partida = partida_repository.obtener_por_id(db, partida_id)
    if not partida:
        return None, None
    color = (
        "blanco" if partida.jugador_blancas == user_id
        else "negro" if partida.jugador_negras == user_id
        else "observador"
    )
    return partida, color


@router.websocket("/ws/online/{partida_id}")
async def websocket_online_partida(websocket: WebSocket, partida_id: str, token: str = None):
    # 1. Validar token antes de aceptar la conexión
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = decodificar_token(token)
        user_id = payload.get("sub")
    except Exception:
        await websocket.close(code=1008)
        return

    if not user_id:
        await websocket.close(code=1008)
        return

    # 2. Sesión fresca solo para la autenticación inicial
    db_init = SessionLocal()
    try:
        user = usuario_repository.obtener_por_id(db_init, user_id)
        if not user:
            await websocket.close(code=1008)
            return

        partida, color_jugador = _obtener_usuario_color(db_init, partida_id, user_id)
        if not partida:
            await websocket.close(code=1008)
            return

        turno_actual = partida.turno
    finally:
        db_init.close()

    # 3. Aceptar conexión y enviar estado inicial
    await partida_ws_manager.connect(websocket, partida_id)
    await websocket.send_json({
        "action": "init",
        "mi_color": color_jugador,
        "turno": turno_actual
    })

    # 4. Loop principal — cada movimiento usa su PROPIA sesión de DB
    try:
        while True:
            data = await websocket.receive_text()
            movimiento = json.loads(data)

            if movimiento.get("action") != "mover":
                continue

            # Sesión completamente nueva por movimiento → ve siempre el estado real de la DB
            db_mov = SessionLocal()
            try:
                partida = partida_repository.obtener_por_id(db_mov, partida_id)

                if partida is None:
                    await websocket.send_json({"error": "Partida no encontrada"})
                    continue

                if partida.turno != color_jugador:
                    await websocket.send_json({"error": "No es tu turno"})
                    continue

                try:
                    # ── Validar movimiento con el motor de ajedrez ─────────────────
                    # Obtenemos el historial para reconstruir el tablero real.
                    movimientos_previos = movimiento_repository.obtener_por_partida(db_mov, partida.id)
                    numero_mov = len(movimientos_previos) + 1   # ← agregar acá
                    es_valido, mensaje_error = validar_movimiento(
                        movimientos_db=movimientos_previos,
                        casilla_inicio=movimiento["casilla_inicio"],
                        casilla_llegada=movimiento["casilla_llegada"],
                        pieza=movimiento["pieza"]
                    )
                    if not es_valido:
                        await websocket.send_json({"error": mensaje_error})
                        continue

                    partida, mov = mover_pieza(
                        db=db_mov,
                        partida=partida,
                        casilla_inicio=movimiento["casilla_inicio"],
                        casilla_llegada=movimiento["casilla_llegada"],
                        pieza=movimiento["pieza"],
                        numero_movimiento=numero_mov
                    )

                    # ── Detectar jaque mate tras el movimiento ──────────────────
                    movimientos_actualizados = movimiento_repository.obtener_por_partida(db_mov, partida.id)
                    estado = detectar_estado_final(movimientos_actualizados, partida.turno)

                    respuesta = {
                        "action": "update_board",
                        "turno": partida.turno,
                        "casilla_inicio": mov.casilla_inicio,
                        "casilla_llegada": mov.casilla_llegada,
                        "pieza": mov.pieza,
                        "jaque": estado['jaque'],
                        "jaque_mate": estado['jaque_mate'],
                        "ahogado": estado['ahogado']
                    }

                    await partida_ws_manager.broadcast_movimiento(partida_id, respuesta)

                except Exception as e:
                    await websocket.send_json({"error": str(e)})
            finally:
                db_mov.close()

    except WebSocketDisconnect:
        partida_ws_manager.disconnect(websocket, partida_id)
