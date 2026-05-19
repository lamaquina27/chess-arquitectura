"""
dama.py — Movimientos de la Dama (D/d)

La Dama es la pieza más poderosa del ajedrez porque combina:
    Torre + Alfil

    → Se mueve en líneas rectas (horizontal/vertical) como la Torre
    → Se mueve en diagonales como el Alfil
    → En total: 8 direcciones posibles

¿Por qué es tan fácil de implementar si ya tenemos Torre y Alfil?
    Porque simplemente REUTILIZAMOS su código.
    La Dama = unión de los movimientos de ambas piezas.

    Principio de programación: DRY (Don't Repeat Yourself).
    No copiamos el algoritmo de rayos — lo importamos y llamamos.
"""

from services.chess_engine.movimientos.torre import movimientos_validos as movimientos_torre
from services.chess_engine.movimientos.alfil import movimientos_validos as movimientos_alfil


def movimientos_validos(casilla: str, tablero: dict) -> list:
    """
    Calcula todas las casillas válidas a las que puede moverse la Dama.

    La Dama puede ir a cualquier casilla que pueda alcanzar una Torre
    O un Alfil desde esa misma posición.

    Args:
        casilla: Posición actual de la dama, ej: 'd1'
        tablero: Estado actual del tablero

    Returns:
        list: Lista de casillas destino válidas (unión de Torre + Alfil)
    """
    # La Dama hereda los movimientos de Torre y Alfil directamente
    return movimientos_torre(casilla, tablero) + movimientos_alfil(casilla, tablero)
