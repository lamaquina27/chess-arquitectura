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
    blancas = usuario_repository.obtener_por_id(db, partida.jugador_blancas)

    return {
        "jugador_blanco": blancas.username if blancas else partida.jugador_blancas,
        "jugador_blanco_elo": blancas.elo if blancas else 1000,
        "jugador_negro": "Práctica",
        "jugador_negro_elo": None,
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
    blancas = usuario_repository.obtener_por_id(db, partida.jugador_blancas)
    negras  = usuario_repository.obtener_por_id(db, partida.jugador_negras)

    return {
        "jugador_blanco": blancas.username if blancas else partida.jugador_blancas,
        "jugador_blanco_elo": blancas.elo if blancas else 1000,
        "jugador_negro": negras.username if negras else partida.jugador_negras,
        "jugador_negro_elo": negras.elo if negras else 1000,
        "turno": partida.turno,
        "id_partida": partida.id
    }


@router.post("/abandono")
async def abandono(datos: AbandonoData, user=Depends(usuario_actual), db: Session = Depends(get_db)):
    partida = partida_repository.obtener_por_id(db, datos.id_partida)

    if not partida:
        raise HTTPException(status_code=404, detail="partida no encontrada")

    partida = abandonar_partida(db, partida, user.id)
    ganador_color = "blanco" if partida.ganador == partida.jugador_blancas else "negro"
    await partida_ws_manager.broadcast_movimiento(datos.id_partida, {
        "action": "abandono",
        "ganador_color": ganador_color
    })

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
    movimientos_previos = movimiento_repository.obtener_por_partida(db, partida.id)
    es_valido, mensaje_error = validar_movimiento(
        movimientos_db=movimientos_previos,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=movimiento.pieza
    )
    if not es_valido:
        raise HTTPException(status_code=422, detail=mensaje_error)

    # ── Coronación de peón: validar y sustituir pieza ──────────────────────────
    piezas_validas_corona = {'D', 'T', 'A', 'C', 'd', 't', 'a', 'c'}
    if movimiento.pieza_coronacion:
        if movimiento.pieza_coronacion not in piezas_validas_corona:
            raise HTTPException(status_code=422, detail="Pieza de coronación inválida")
        pieza_a_guardar = movimiento.pieza_coronacion
    else:
        pieza_a_guardar = movimiento.pieza

    numero_mov = len(movimientos_previos) + 1

    partida, mov = mover_pieza(
        db=db,
        partida=partida,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=pieza_a_guardar,
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