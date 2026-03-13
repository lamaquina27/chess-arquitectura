class Partida:
    id = 0
    ganador = ""
    def __init__(self,jugador_blanco,jugador_negro,tablero):
        self.jugador_blanco=jugador_blanco
        self.jugador_negro=jugador_negro
        self.tablero=tablero
        self.turno = "blanco"
        

    