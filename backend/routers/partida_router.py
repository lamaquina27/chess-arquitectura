from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import MovimientoRequest, CredencialesRival, AbandonoData
from services.partida_service import iniciar_partida, mover_pieza, abandonar_partida, partida_ws_manager
from fastapi import WebSocket, WebSocketDisconnect
from services.auth_service import autenticar_usuario
from repositories import usuario_repository, partida_repository, movimiento_repository
from routers.registro_router import usuario_actual
from services.chess_engine.validador import validar_movimiento, detectar_estado_final, obtener_movimientos_validos


router = APIRouter()


@router.get("/iniciar")
def iniciar(user=Depends(usuario_actual), db: Session = Depends(get_db)):
    partida = iniciar_partida(db, user)

    return {
        "jugador_blanco": partida.jugador_blancas,
        "jugador_negro": partida.jugador_negras,
        "turno": partida.turno,
        "id_partida": partida.id
    }


@router.post("/iniciar_multijugador")
def iniciar_multijugador(datos_rival: CredencialesRival, user=Depends(usuario_actual), db: Session = Depends(get_db)):
    try:
        rivaldb = usuario_repository.obtener_por_username(db, datos_rival.username)
        rival = autenticar_usuario(rivaldb.id, datos_rival.password, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Las credenciales del rival son incorrectas.")

    if user.username == rival.username:
        raise HTTPException(status_code=400, detail="¡No puedes jugar contra ti mismo!")

    partida = iniciar_partida(db, user, rival.id)

    return {
        "jugador_blanco": partida.jugador_blancas,
        "jugador_negro": partida.jugador_negras,
        "turno": partida.turno,
        "id_partida": partida.id
    }


@router.post("/abandono")
def abandono(datos: AbandonoData, user=Depends(usuario_actual), db: Session = Depends(get_db)):
    partida = partida_repository.obtener_por_id(db, datos.id_partida)

    if not partida:
        raise HTTPException(status_code=404, detail="partida no encontrada")

    partida = abandonar_partida(db, partida)

    return {
        "jugador_blanco": partida.jugador_blancas,
        "jugador_negro": partida.jugador_negras,
        "ganador": partida.ganador
    }


@router.post("/mover")
async def mover(movimiento: MovimientoRequest, user=Depends(usuario_actual), db: Session = Depends(get_db)):
    partida = partida_repository.obtener_por_id(db, movimiento.id_partida)
    if not partida:
        raise HTTPException(status_code=404, detail="Partida No Encontrada.")

    color_usuario = "blanco" if user.id == partida.jugador_actual else "negro"
    if partida.turno != color_usuario:
        raise HTTPException(status_code=403, detail="No es tu turno, espera a que mueva tu oponente.")

    # ── Validación de movimiento legal (motor de ajedrez) ─────────────────────
    # Obtenemos todos los movimientos previos de la partida para reconstruir
    # el tablero y luego verificar si el movimiento propuesto es legal.
    movimientos_previos = movimiento_repository.obtener_por_partida(db, partida.id)
    es_valido, mensaje_error = validar_movimiento(
        movimientos_db=movimientos_previos,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=movimiento.pieza
    )
    if not es_valido:
        raise HTTPException(status_code=422, detail=mensaje_error)

    numero_mov = len(movimientos_previos) + 1

    partida, mov = mover_pieza(
        db=db,
        partida=partida,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=movimiento.pieza,
        numero_movimiento=numero_mov
    )

    # ── Detectar jaque mate tras el movimiento ────────────────────────────────
    movimientos_actualizados = movimiento_repository.obtener_por_partida(db, partida.id)
    estado = detectar_estado_final(movimientos_actualizados, partida.turno)

    respuesta = {
        "turno": partida.turno,
        "casilla_inicio": mov.casilla_inicio,
        "casilla_llegada": mov.casilla_llegada,
        "pieza": mov.pieza,
        "usuario_movimiento": user.id,
        "jaque": estado['jaque'],
        "jaque_mate": estado['jaque_mate'],
        "ahogado": estado['ahogado']
    }

    # Transmitimos el movimiento a todos los conectados
    await partida_ws_manager.broadcast_movimiento(partida.id, respuesta)

    return respuesta

@router.get("/movimientos")
def obtener_movimientos(
    partida_id: str,
    casilla: str,
    user=Depends(usuario_actual),
    db: Session = Depends(get_db)
):
    partida = partida_repository.obtener_por_id(db, partida_id)
    if not partida:
        raise HTTPException(status_code=404, detail="Partida no encontrada.")

    movimientos_db = movimiento_repository.obtener_por_partida(db, partida_id)

    
    casillas_validas = obtener_movimientos_validos(movimientos_db, casilla)

    return {"casillas": casillas_validas}