from services.partida_service import abandono_partida, iniciar_partida
from fastapi import APIRouter

router = APIRouter()

partidas=[]

@router.post("/iniciar")
def iniciar():
    partida = iniciar_partida()
    partidas.append(partida)

    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "turno": partida.turno,
        "tablero": partida.tablero
    }

@router.post("/abandono")
def abandono():
    partida = partidas[0]
    if not partida:
        return{
            "error":"partida no encontrada"
        }
       
    partida = abandono_partida("Negro")
    
    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "Ganador ": partida.ganador
    }