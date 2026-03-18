from services.partida_service import abandono_partida, iniciar_partida, mover_pieza
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Movimiento(BaseModel):
    casilla_inicio: str
    casilla_llegada: str
    pieza: str

partidas=[]

@router.post("/iniciar")
def iniciar():
    partida = iniciar_partida()
    partidas.append(partida)

    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "turno": partida.turno,
    }

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

@router.post("/mover")
def mover(movimiento: Movimiento):
    if not partidas:
        return {"error": "No hay partida activa"}
    
    partida = partidas[0]
    
    partida = mover_pieza(
        partida=partida,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=movimiento.pieza
    )
    
    return {
        "turno": partida.turno,
        "casilla_inicio": movimiento.casilla_inicio,
        "casilla_llegada": movimiento.casilla_llegada,
        "pieza": movimiento.pieza
    }
