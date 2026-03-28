class Partida:
    
    ganador = ""
    def __init__(self,jugador_blanco,jugador_negro,id,jugador_actual):
        self.jugador_blanco=jugador_blanco
        self.jugador_negro=jugador_negro
        self.turno = "blanco"
        self.id = id
        self.jugador_actual = jugador_actual

    