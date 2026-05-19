"""
torre.py — Movimientos de la Torre (T/t)

La Torre se mueve en LÍNEAS RECTAS: horizontal y vertical.
Puede moverse cualquier cantidad de casillas en esas direcciones, PERO:
    - NO puede saltar sobre otras piezas
    - Se detiene al encontrar una pieza aliada (no puede ir ahí)
    - Se detiene al capturar una pieza enemiga (puede ir ahí, pero no más allá)

¿Cómo implementamos "moverse hasta que choque"?
    Usamos 4 "rayos" (rays): arriba, abajo, izquierda, derecha.
    Cada rayo avanza casilla por casilla hasta encontrar un obstáculo o el borde.
"""

from services.chess_engine.tablero import (
    casilla_a_coordenadas,
    coordenadas_a_casilla,
    mismo_color,
)

# Los 4 rayos de la torre: (delta_col, delta_fila)
DIRECCIONES = [
    (0,  +1),   # Arriba
    (0,  -1),   # Abajo
    (-1,  0),   # Izquierda
    (+1,  0),   # Derecha
]


def movimientos_validos(casilla: str, tablero: dict) -> list:
    """
    Calcula todas las casillas válidas a las que puede moverse la Torre.

    Algoritmo "de rayo" (ray casting):
        Para cada dirección, avanza casilla por casilla:
        - Si la casilla está vacía → agregar y continuar
        - Si hay pieza propia      → detenerse (no agregar)
        - Si hay pieza enemiga     → agregar (captura) y detenerse

    Args:
        casilla: Posición actual de la torre, ej: 'a1'
        tablero: Estado actual del tablero

    Returns:
        list: Lista de casillas destino válidas
    """
    pieza = tablero[casilla]
    col, fila = casilla_a_coordenadas(casilla)
    validos = []

    for delta_col, delta_fila in DIRECCIONES:
        # Recorremos el rayo paso a paso
        paso_col = col + delta_col
        paso_fila = fila + delta_fila

        while True:
            destino = coordenadas_a_casilla(paso_col, paso_fila)

            # Fuera del tablero → fin del rayo
            if destino is None:
                break

            pieza_destino = tablero[destino]

            if pieza_destino == '':
                # Casilla vacía → seguimos avanzando
                validos.append(destino)
            elif mismo_color(pieza, pieza_destino):
                # Pieza propia → bloqueamos, no añadimos
                break
            else:
                # Pieza enemiga → captura, añadimos y paramos
                validos.append(destino)
                break

            paso_col += delta_col
            paso_fila += delta_fila

    return validos
