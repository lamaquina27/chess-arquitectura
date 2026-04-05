from services.registro_service import generar_id
from models.partida import Partida

id = 0
# Le decimos que por defecto el enemigo será "Invitado" si jugamos solos
def iniciar_partida(usuario, nombre_jugador_negro="Invitado"):
    global id
    newId = generar_id(id)
    
    id = newId
    partida = Partida(
        jugador_blanco= usuario.username,
        # Ya no usamos un texto quemado, usamos el parámetro que llegó:
        jugador_negro= nombre_jugador_negro, 
        id=newId,
        jugador_actual=usuario.username
    )
    return partida


def abandono_partida(ganador,partida):
    partida.ganador=ganador
    return partida

def mover_pieza(partida, casilla_inicio: str, casilla_llegada: str, pieza: str):
    # Registrar el movimiento (para futuras validaciones)
    print(f"Movimiento: {pieza} de {casilla_inicio} a {casilla_llegada}")
    
    # Alternamos el turno
    partida.turno = "negro" if partida.turno == "blanco" else "blanco"
    partida.jugador_actual = partida.jugador_negro if partida.turno == "negro" else partida.jugador_blanco
    return partida
