"""
alfil.py — Movimientos del Alfil (A/a)

El Alfil se mueve en DIAGONALES: cualquier cantidad de casillas.
Reglas idénticas a la Torre, pero en las 4 direcciones diagonales.

Observación importante:
    Un alfil que empieza en casilla blanca SIEMPRE permanece en casillas blancas.
    Por eso cada jugador tiene DOS alfiles (uno en blanca, uno en negra).

    Esta restricción NO necesita código especial — emerge naturalmente
    del algoritmo de diagonales (los offsets (+1,+1) siempre cambian
    ambas coordenadas, manteniendo el mismo color de casilla).
"""

from services.chess_engine.tablero import (
    casilla_a_coordenadas,
    coordenadas_a_casilla,
    mismo_color,
)

# Las 4 diagonales del alfil: (delta_col, delta_fila)
DIRECCIONES = [
    (+1, +1),   # Diagonal arriba-derecha
    (+1, -1),   # Diagonal abajo-derecha
    (-1, +1),   # Diagonal arriba-izquierda
    (-1, -1),   # Diagonal abajo-izquierda
]


def movimientos_validos(casilla: str, tablero: dict) -> list:
    """
    Calcula todas las casillas válidas a las que puede moverse el Alfil.

    Usa el mismo algoritmo de "rayo" que la Torre, pero en diagonales.

    Args:
        casilla: Posición actual del alfil, ej: 'c1'
        tablero: Estado actual del tablero

    Returns:
        list: Lista de casillas destino válidas
    """
    pieza = tablero[casilla]
    col, fila = casilla_a_coordenadas(casilla)
    validos = []

    for delta_col, delta_fila in DIRECCIONES:
        paso_col = col + delta_col
        paso_fila = fila + delta_fila

        while True:
            destino = coordenadas_a_casilla(paso_col, paso_fila)

            if destino is None:
                break

            pieza_destino = tablero[destino]

            if pieza_destino == '':
                validos.append(destino)
            elif mismo_color(pieza, pieza_destino):
                break
            else:
                validos.append(destino)
                break

            paso_col += delta_col
            paso_fila += delta_fila

    return validos
