from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import MovimientoRequest, CredencialesRival, AbandonoData
from services.partida_service import iniciar_partida, mover_pieza, abandonar_partida
from services.auth_service import autenticar_usuario
from repositories import usuario_repository, partida_repository, movimiento_repository
from routers.registro_router import usuario_actual


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
def mover(movimiento: MovimientoRequest, user=Depends(usuario_actual), db: Session = Depends(get_db)):
    partida = partida_repository.obtener_por_id(db, movimiento.id_partida)
    if not partida:
        raise HTTPException(status_code=404, detail="Partida No Encontrada.")

    color_usuario = "blanco" if user.id == partida.jugador_actual else "negro"
    if partida.turno != color_usuario:
        raise HTTPException(status_code=403, detail="No es tu turno, espera a que mueva tu oponente.")

    numero_mov = movimiento_repository.contar_por_partida(db, partida.id) + 1

    partida, mov = mover_pieza(
        db=db,
        partida=partida,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=movimiento.pieza,
        numero_movimiento=numero_mov
    )

    return {
        "turno": partida.turno,
        "casilla_inicio": mov.casilla_inicio,
        "casilla_llegada": mov.casilla_llegada,
        "pieza": mov.pieza
    }
