from models.partida import Partida


def iniciar_partida():
    partida = Partida(
        jugador_blanco= "Jugador_1",
        jugador_negro= "Jugador_2",
        tablero = [
            ['t','c','a','d','r','a','c','t'],
            ['p','p','p','p','p','p','p','p'],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['P','P','P','P','P','P','P','P'],
            ['T','C','A','D','R','A','C','T']
        ]

    )
    return partida
def abandono_partida(ganador,partida):
    partida.ganador=ganador
    return partida

