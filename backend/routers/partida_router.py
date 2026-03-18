from services.partida_service import abandono_partida, iniciar_partida, mover_pieza
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

partidas=[]

class Movimiento(BaseModel):
    casilla_inicio: str
    casilla_llegada: str
    pieza: str

@router.post("/iniciar")
def iniciar():
    partida = iniciar_partida()
    partidas.append(partida)

    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "turno": partida.turno
    }

@router.post("/mover")
def mover(movimiento: Movimiento):
    partida = partidas[0]
    if not partida:
        return {
            "error": "partida no encontrada"
        }

    resultado = mover_pieza(
        partida,
        movimiento.casilla_inicio,
        movimiento.casilla_llegada,
        movimiento.pieza
    )

    return resultado

@router.post("/abandono")
def abandono():
    partida = partidas[0]
    if not partida:
        return{
            "error":"partida no encontrada"
        }
       
    partida = abandono_partida("Negro",partida)
    
    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "Ganador ": partida.ganador
    }