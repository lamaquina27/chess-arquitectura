from models.partida import Partida


def iniciar_partida():
    partida = Partida(
        jugador_blanco= "Jugador_1",
        jugador_negro= "Jugador_2",
        tablero = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ]

    )
    return partida
def abandono_partida(ganador,partida):
    partida.ganador=ganador
    return partida

