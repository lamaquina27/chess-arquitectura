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

def mover_pieza(partida, from_row: int, from_col: int, to_row: int, to_col: int):
    # 1. Copiamos la pieza que vamos a mover
    pieza_a_mover = partida.tablero[from_row][from_col]
    
    # 2. La colocamos en su nueva posicion
    partida.tablero[to_row][to_col] = pieza_a_mover
    
    # 3. Vaciamos la casilla original
    partida.tablero[from_row][from_col] = ""
    
    # 4. Alternamos el turno
    partida.turno = "negro" if partida.turno == "blanco" else "blanco"
    
    return partida
