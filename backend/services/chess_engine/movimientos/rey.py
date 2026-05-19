"""
rey.py — Movimientos del Rey (R/r)

El Rey se mueve UN paso en cualquier dirección (las 8 posibles).
Reglas especiales:
    1. No puede moverse a una casilla que esté bajo ataque enemigo (jaque).
    2. Puede realizar el ENROQUE (implementado en la Fase 2 del proyecto).

IMPLEMENTACIÓN ACTUAL (Fase 1 - Básica):
    Validamos los 8 movimientos posibles verificando:
    - Que la casilla exista en el tablero
    - Que no esté ocupada por pieza propia
    
    La restricción de "no moverse a jaque" se implementa en validador.py
    porque requiere conocer todos los movimientos del rival — es una
    validación de nivel superior que combina varias piezas.
"""

from services.chess_engine.tablero import (
    casilla_a_coordenadas,
    coordenadas_a_casilla,
    mismo_color,
)

# Los 8 pasos posibles del rey: (delta_col, delta_fila)
PASOS = [
    (0,  +1),   # Arriba
    (0,  -1),   # Abajo
    (-1,  0),   # Izquierda
    (+1,  0),   # Derecha
    (-1, +1),   # Diagonal arriba-izquierda
    (+1, +1),   # Diagonal arriba-derecha
    (-1, -1),   # Diagonal abajo-izquierda
    (+1, -1),   # Diagonal abajo-derecha
]


def movimientos_validos(casilla: str, tablero: dict) -> list:
    """
    Calcula las casillas básicas a las que puede moverse el Rey
    (sin verificar jaque — eso lo hace el validador global).

    Args:
        casilla: Posición actual del rey, ej: 'e1'
        tablero: Estado actual del tablero

    Returns:
        list: Lista de casillas destino candidatas (antes del filtro de jaque)
    """
    pieza = tablero[casilla]
    col, fila = casilla_a_coordenadas(casilla)
    validos = []

    for delta_col, delta_fila in PASOS:
        destino = coordenadas_a_casilla(col + delta_col, fila + delta_fila)

        if destino is None:
            continue

        pieza_destino = tablero[destino]

        # No puede capturar sus propias piezas
        if pieza_destino != '' and mismo_color(pieza, pieza_destino):
            continue

        validos.append(destino)

    return validos
