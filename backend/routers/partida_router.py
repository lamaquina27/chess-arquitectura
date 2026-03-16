from services.partida_service import abandono_partida, iniciar_partida, mover_pieza
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Movimiento(BaseModel):
    from_row: int
    from_col: int
    to_row: int
    to_col: int

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
        from_row=movimiento.from_row,
        from_col=movimiento.from_col,
        to_row=movimiento.to_row,
        to_col=movimiento.to_col
    )
    
    return {
        "turno": partida.turno,
        "tablero": partida.tablero
    }