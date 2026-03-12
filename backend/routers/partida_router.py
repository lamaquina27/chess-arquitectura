from services.partida_service import iniciar_partida
from fastapi import APIRouter

router = APIRouter()
@router.post("/iniciar")
def iniciar():
    partida = iniciar_partida()

    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "turno": partida.turno,
        "tablero": partida.tablero
    }