
from models.partida import Partida
from database import get_db
from sqlalchemy.orm import Session

from routers.registro_router import usuario_actual, actualizar_elo, autenticar_usuario
from services.partida_service import  iniciar_partida, mover_pieza
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
def iniciar(user = Depends(usuario_actual),db: Session = Depends(get_db)):
    partida = iniciar_partida(user)
    db.add(partida)
    db.commit()
    db.refresh(partida)

    return {
        "jugador_blanco": partida.jugador_blancas,
        "jugador_negro": partida.jugador_negras,
        "turno": partida.turno,
        "id_partida":partida.id
    }

class AbandonoData(BaseModel):
    id_partida: int

@router.post("/iniciar_multijugador")
def iniciar_multijugador(datos_rival: CredencialesRival, user = Depends(usuario_actual),db: Session = Depends(get_db)):
    # 1. Comprobamos que el Jugador 2 de verdad existe y su clave es correcta
    try:
        rival = autenticar_usuario(datos_rival.username, datos_rival.password,db)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Las credenciales del rival son incorrectas.")
    
    if user.username == rival.username:
         raise HTTPException(status_code=400, detail="¡No puedes jugar contra ti mismo!")
    
    # 2. Fabricamos la partida, pero ahora enviamos ambos nombres 
    partida = iniciar_partida(user, rival.id)
    db.add(partida)
    db.commit()
    db.refresh(partida)

    # 3. Devolvemos los datos al frontend para que dibuje el tablero
    return {
        "jugador_blanco": partida.jugador_blancas,
        "jugador_negro": partida.jugador_negras,
        "turno": partida.turno,
        "id_partida": partida.id
    }

@router.post("/abandono")
def abandono(datos: AbandonoData, user = Depends(usuario_actual),db: Session = Depends(get_db)):
    partida = db.query(Partida).filter(Partida.id == datos.id_partida).first()
    
    if not partida:
        raise HTTPException(status_code=404, detail="partida no encontrada")
       
    # 1. Comprobamos si el usuario realmente está jugando en esta partida
    # if user.username not in [partida.jugador_blancas, partida.jugador_negras]:
    #     raise HTTPException(status_code=403, detail="No eres parte de esta partida")

    # 2. Descubrimos quién se rinde basado del turno actual en el tablero
    if partida.turno == "blanco":
        # Si era el turno de las blancas y apretaron abandonar, el Blanco pierde
        perdedor_id = partida.jugador_blancas
        ganador_id = partida.jugador_negras
    else:
        # Si era el turno de las negras, el Negro pierde
        perdedor_id = partida.jugador_negras
        ganador_id = partida.jugador_blancas


    # 3. Asignamos al verdadero ganador en la partida
    partida.ganador=ganador_id
    db.commit()
        # 4. Actualizamos ambos ELOs en la base de datos simulada
    actualizar_elo(perdedor_id, -10,db) # Pierde 10 puntos por rendirse
    actualizar_elo(ganador_id, 10,db)   # Gana 10 puntos por la victoria
    
    return {
        "jugador_blanco": partida.jugador_blancas,
        "jugador_negro": partida.jugador_negras,
        "ganador": partida.ganador
    }

@router.post("/mover")
def mover(movimiento: Movimiento, user = Depends(usuario_actual),db: Session = Depends(get_db)):
    partida = db.query(Partida).filter(Partida.id == movimiento.id_partida).first()
    print(partida)
    if not partida:
        raise HTTPException(
            status_code=404, 
            detail="Partida No Encontrada."
        )
    
    color_usuario = "blanco" if user.id == partida.jugador_actual else "negro"
    print(user.username,partida.jugador_actual)
    if partida.turno != color_usuario:
        raise HTTPException(
            status_code=403, 
            detail="No es tu turno, espera a que mueva tu oponente."
        )
    partida,movimiento = mover_pieza(
        partida=partida,
        casilla_inicio=movimiento.casilla_inicio,
        casilla_llegada=movimiento.casilla_llegada,
        pieza=movimiento.pieza,
        
    )
    db.add(movimiento)
    db.commit()

    
    return {
        "turno": partida.turno,
        "casilla_inicio": movimiento.casilla_inicio,
        "casilla_llegada": movimiento.casilla_llegada,
        "pieza": movimiento.pieza
    }
