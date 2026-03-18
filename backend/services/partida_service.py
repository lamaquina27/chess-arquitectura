from models.partida import Partida


def iniciar_partida():
    partida = Partida(
        jugador_blanco= "Jugador_1",
        jugador_negro= "Jugador_2"
    )
    return partida

def mover_pieza(partida, casilla_inicio, casilla_llegada, pieza):
    # Alternar turno
    if partida.turno == "blanco":
        partida.turno = "negro"
    else:
        partida.turno = "blanco"

    return {
        "turno": partida.turno,
        "movimiento": {
            "from": casilla_inicio,
            "to": casilla_llegada,
            "pieza": pieza
        }
    }

def abandono_partida(ganador,partida):
    partida.ganador=ganador
    return partida

