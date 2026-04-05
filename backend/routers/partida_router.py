from routers.registro_router import usuario_actual, actualizar_elo, autenticar_usuario
from services.partida_service import abandono_partida, iniciar_partida, mover_pieza
from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel


router = APIRouter()

class Movimiento(BaseModel):
    casilla_inicio: str
    casilla_llegada: str
    pieza: str
    id_partida:int

class CredencialesRival(BaseModel):
    username: str
    password: str

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

class AbandonoData(BaseModel):
    id_partida: int

@router.post("/iniciar_multijugador")
def iniciar_multijugador(datos_rival: CredencialesRival, user = Depends(usuario_actual)):
    # 1. Comprobamos que el Jugador 2 de verdad existe y su clave es correcta
    try:
        rival = autenticar_usuario(datos_rival.username, datos_rival.password)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Las credenciales del rival son incorrectas.")

    if user.username == rival.username:
         raise HTTPException(status_code=400, detail="¡No puedes jugar contra ti mismo!")
    
    # 2. Fabricamos la partida, pero ahora enviamos ambos nombres (¡El cambio que hicimos en Paso 1!)
    partida = iniciar_partida(user, rival.username)
    partidas[partida.id] = partida

    # 3. Devolvemos los datos al frontend para que dibuje el tablero
    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "turno": partida.turno,
        "id_partida": partida.id
    }

@router.post("/abandono")
def abandono(datos: AbandonoData, user = Depends(usuario_actual)):
    partida = partidas.get(datos.id_partida)
    
    if not partida:
        raise HTTPException(status_code=404, detail="partida no encontrada")
       
    # 1. Comprobamos si el usuario realmente está jugando en esta partida
    if user.username not in [partida.jugador_blanco, partida.jugador_negro]:
        raise HTTPException(status_code=403, detail="No eres parte de esta partida")

    # 2. Descubrimos quién se rinde basado del turno actual en el tablero
    if partida.turno == "blanco":
        # Si era el turno de las blancas y apretaron abandonar, el Blanco pierde
        perdedor_username = partida.jugador_blanco
        ganador_username = partida.jugador_negro
    else:
        # Si era el turno de las negras, el Negro pierde
        perdedor_username = partida.jugador_negro
        ganador_username = partida.jugador_blanco


    # 3. Asignamos al verdadero ganador en la partida
    partida = abandono_partida(ganador_username, partida)

        # 4. Actualizamos ambos ELOs en la base de datos simulada
    actualizar_elo(perdedor_username, -10) # Pierde 10 puntos por rendirse
    actualizar_elo(ganador_username, 10)   # Gana 10 puntos por la victoria
    
    return {
        "jugador_blanco": partida.jugador_blanco,
        "jugador_negro": partida.jugador_negro,
        "ganador": partida.ganador
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
