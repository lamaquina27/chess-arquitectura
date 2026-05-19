"""
caballo.py — Movimientos del Caballo (C/c)

El caballo es la pieza más ÚNICA del ajedrez porque:
    1. Se mueve en forma de "L": 2 casillas en una dirección + 1 en perpendicular
    2. Es la ÚNICA pieza que puede SALTAR sobre otras piezas
    3. Siempre cambia de color de casilla en cada movimiento

¿Por qué es el más fácil de implementar?
    Porque sus 8 movimientos posibles son FIJOS (offsets constantes).
    No hay que buscar en líneas ni verificar piezas en el camino.
"""

from services.chess_engine.tablero import (
    casilla_a_coordenadas,
    coordenadas_a_casilla,
    mismo_color,
)

# Los 8 posibles desplazamientos del caballo en (delta_col, delta_fila)
MOVIMIENTOS_L = [
    (-2, -1), (-2, +1),   # 2 izquierda, 1 arriba/abajo
    (+2, -1), (+2, +1),   # 2 derecha, 1 arriba/abajo
    (-1, -2), (-1, +2),   # 2 abajo/arriba, 1 izquierda
    (+1, -2), (+1, +2),   # 2 abajo/arriba, 1 derecha
]


def movimientos_validos(casilla: str, tablero: dict) -> list:
    """
    Calcula todas las casillas válidas a las que puede moverse el caballo.

    El caballo puede ir a una casilla si:
    - La casilla existe dentro del tablero (1-8, a-h)
    - La casilla está vacía O tiene una pieza del color contrario (captura)

    Args:
        casilla: Posición actual del caballo, ej: 'g1'
        tablero: Estado actual del tablero (dict casilla→pieza)

    Returns:
        list: Lista de casillas destino válidas, ej: ['f3', 'h3', 'e2']
    """
    pieza = tablero[casilla]
    col, fila = casilla_a_coordenadas(casilla)
    validos = []

    for delta_col, delta_fila in MOVIMIENTOS_L:
        destino = coordenadas_a_casilla(col + delta_col, fila + delta_fila)

        # Fuera del tablero → ignorar
        if destino is None:
            continue

        pieza_destino = tablero[destino]

        # Casilla vacía → movimiento válido
        if pieza_destino == '':
            validos.append(destino)
            continue

        # Casilla ocupada por pieza del MISMO color → no puede ir
        if mismo_color(pieza, pieza_destino):
            continue

        # Casilla ocupada por pieza del color CONTRARIO → captura válida
        validos.append(destino)

    return validos
