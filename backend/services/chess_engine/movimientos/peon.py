"""
peon.py — Movimientos del Peón (P/p)

El Peón es la pieza MÁS COMPLEJA a pesar de moverse poco.
Tiene reglas asimétricas únicas:

1. AVANCE NORMAL:
   - Solo avanza hacia adelante (blancas suben ↑, negras bajan ↓)
   - Se mueve 1 casilla, PERO solo si está VACÍA (no captura hacia adelante)

2. AVANCE DOBLE (primer movimiento):
   - En su primer movimiento puede avanzar 2 casillas
   - Solo si AMBAS casillas delante están vacías
   - Solo desde la fila inicial (2 para blancas, 7 para negras)

3. CAPTURA EN DIAGONAL:
   - Captura en diagonal hacia adelante (1 paso)
   - Solo puede capturar si HAY una pieza enemiga en esa diagonal
   - Es la ÚNICA pieza que ataca diferente a como se mueve

4. CAPTURA AL PASO (En Passant) — Fase 2:
   - Regla especial cuando un peón rival avanza 2 casillas
   - Implementada como mejora futura

5. PROMOCIÓN — Fase 2:
   - Al llegar a la última fila, el peón se convierte en otra pieza
   - Implementada como mejora futura
"""

from services.chess_engine.tablero import (
    casilla_a_coordenadas,
    coordenadas_a_casilla,
    es_pieza_blanca,
    mismo_color,
)


def movimientos_validos(casilla: str, tablero: dict) -> list:
    """
    Calcula todas las casillas válidas a las que puede moverse el Peón.

    Args:
        casilla: Posición actual del peón, ej: 'e2'
        tablero: Estado actual del tablero

    Returns:
        list: Lista de casillas destino válidas
    """
    pieza = tablero[casilla]
    col, fila = casilla_a_coordenadas(casilla)
    validos = []

    # ─── Determinar dirección de movimiento y fila inicial ─────────────────────
    # Los peones blancos suben (fila aumenta), negros bajan (fila disminuye)
    if es_pieza_blanca(pieza):
        direccion = +1          # Blancas avanzan hacia filas mayores
        fila_inicial = 2        # Los peones blancos empiezan en fila 2
    else:
        direccion = -1          # Negras avanzan hacia filas menores
        fila_inicial = 7        # Los peones negros empiezan en fila 7

    # ─── 1. Avance normal (1 casilla hacia adelante) ───────────────────────────
    casilla_adelante = coordenadas_a_casilla(col, fila + direccion)
    if casilla_adelante and tablero[casilla_adelante] == '':
        validos.append(casilla_adelante)

        # ─── 2. Avance doble (solo desde fila inicial y si la vía está libre) ─
        if fila == fila_inicial:
            casilla_doble = coordenadas_a_casilla(col, fila + 2 * direccion)
            if casilla_doble and tablero[casilla_doble] == '':
                validos.append(casilla_doble)

    # ─── 3. Capturas diagonales ────────────────────────────────────────────────
    for delta_col in [-1, +1]:  # Diagonal izquierda y diagonal derecha
        casilla_diagonal = coordenadas_a_casilla(col + delta_col, fila + direccion)

        if casilla_diagonal is None:
            continue

        pieza_en_diagonal = tablero[casilla_diagonal]

        # Solo puede capturar si hay una pieza ENEMIGA en la diagonal
        if pieza_en_diagonal != '' and not mismo_color(pieza, pieza_en_diagonal):
            validos.append(casilla_diagonal)

    return validos
