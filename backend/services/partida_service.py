from models.partida import Partida


def iniciar_partida():
    partida = Partida(
        jugador_blanco= "Jugador_1",
        jugador_negro= "Jugador_2",
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
    
    return partida
