from routers.registro_router import usuario_actual
from services.partida_service import abandono_partida, iniciar_partida, mover_pieza
from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel


router = APIRouter()

class Movimiento(BaseModel):
    casilla_inicio: str
    casilla_llegada: str
    pieza: str
    id_partida:int
    

partidas={}


@router.get("/iniciar")
def iniciar(user = Depends(usuario_actual)):
    partida = iniciar_partida(user)
    partidas[partida.id]=partida

    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "turno": partida.turno,
        "id_partida":partida.id
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
        "ganador ": partida.ganador
    }

@router.post("/mover")
def mover(movimiento: Movimiento, user = Depends(usuario_actual)):
    partida = partidas.get(movimiento.id_partida)
    if partida.id not in partidas:
        return {"error": "No hay partida activa"}
    
    color_usuario = "blanco" if user.username == partida.jugador_actual else "negro"
    if partida.turno != color_usuario:
        raise HTTPException(
            status_code=403, 
            detail="No es tu turno, espera a que mueva tu oponente."
        )
    partida = mover_pieza(
        partida=partida,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=movimiento.pieza,
        
    )
    
    return {
        "turno": partida.turno,
        "casilla_inicio": movimiento.casilla_inicio,
        "casilla_llegada": movimiento.casilla_llegada,
        "pieza": movimiento.pieza
    }
