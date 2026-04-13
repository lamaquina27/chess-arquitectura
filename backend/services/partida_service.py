from sqlalchemy.orm import Session

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
