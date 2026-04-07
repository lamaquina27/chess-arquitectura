from models.movimiento import Movimiento
from models import movimiento
from services.registro_service import generar_id
from models.partida import Partida

id = 0
id_movimiento=0
# Le decimos que por defecto el enemigo será "Invitado" si jugamos solos
def iniciar_partida(usuario, id_jugador_negro=None):
    global id
    newId = generar_id(id)
    
    id = newId
    partida = Partida(
        jugador_blancas= usuario.id,
        jugador_negras= id_jugador_negro, 
        id=newId,
        turno="blanco",
        jugador_actual=usuario.id
    )
    return partida


# def abandono_partida(ganador,partida):
#     partida.ganador=ganador
#     return partida

def mover_pieza(partida, casilla_inicio: str, casilla_llegada: str, pieza: str):
    # Registrar el movimiento (para futuras validaciones)
    global id_movimiento
    newId = generar_id(id_movimiento)
    
    id_movimiento = newId
    movimiento = Movimiento(
        id=newId,
        partida_id = partida.id,
        numero_movimiento = newId,
        pieza = pieza,
        casilla_inicio = casilla_inicio,
        casilla_llegada = casilla_llegada
    )
    
    
    # Alternamos el turno
    partida.turno = "negro" if partida.turno == "blanco" else "blanco"
    partida.jugador_actual = partida.jugador_negras if partida.turno == "negro" else partida.jugador_blancas
    return partida,movimiento
