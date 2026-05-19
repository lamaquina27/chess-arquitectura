"""
tablero.py — Reconstrucción del estado del tablero

¿Por qué existe este módulo?
    El backend NO guarda el estado actual del tablero en la base de datos.
    Solo guarda la lista de movimientos realizados (en la tabla `movimiento`).
    
    Para saber dónde está cada pieza en un momento dado, debemos:
    1. Partir del tablero inicial (posición estándar de ajedrez)
    2. Aplicar cada movimiento en orden cronológico
    
    Esto es exactamente lo que hacen las dos funciones de este archivo.

Convenciones del proyecto:
    - Piezas BLANCAS: letras mayúsculas  → P T C A D R
    - Piezas NEGRAS:  letras minúsculas  → p t c a d r
    - Casillas: notación algebraica       → 'a1', 'e4', 'h8'
    - Casilla vacía: cadena vacía         → ''
"""

# El tablero se representa como un diccionario:
#   clave = nombre de casilla (str)  → 'a1', 'b3', 'h8', etc.
#   valor = pieza en esa casilla (str) → 'P', 't', ''


# ─── Constantes de posición ────────────────────────────────────────────────────

COLUMNAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

# Orden de las piezas en la fila de inicio (filas 1 y 8)
ORDEN_PIEZAS = ['T', 'C', 'A', 'D', 'R', 'A', 'C', 'T']


# ─── Funciones públicas ────────────────────────────────────────────────────────

def crear_tablero_inicial() -> dict:
    """
    Retorna el tablero con la posición estándar de inicio de una partida.

    Filas 1-2: Piezas y peones BLANCOS (mayúsculas)
    Filas 7-8: Piezas y peones NEGROS (minúsculas)
    Filas 3-6: Casillas vacías
    """
    tablero = {}

    # Piezas negras (minúsculas) — fila 8
    for i, col in enumerate(COLUMNAS):
        tablero[col + '8'] = ORDEN_PIEZAS[i].lower()

    # Peones negros — fila 7
    for col in COLUMNAS:
        tablero[col + '7'] = 'p'

    # Casillas vacías — filas 6 a 3
    for fila in range(6, 2, -1):
        for col in COLUMNAS:
            tablero[col + str(fila)] = ''

    # Peones blancos — fila 2
    for col in COLUMNAS:
        tablero[col + '2'] = 'P'

    # Piezas blancas (mayúsculas) — fila 1
    for i, col in enumerate(COLUMNAS):
        tablero[col + '1'] = ORDEN_PIEZAS[i]

    return tablero


def reconstruir_tablero(movimientos: list) -> dict:
    """
    Reconstruye el estado actual del tablero aplicando la lista
    de movimientos sobre el tablero inicial, en orden cronológico.

    Args:
        movimientos: Lista de objetos MovimientoDB ordenados por numero_movimiento.
                     Cada objeto debe tener: casilla_inicio, casilla_llegada, pieza.

    Returns:
        dict: El tablero actual con la posición real de todas las piezas.
    """
    tablero = crear_tablero_inicial()

    for mov in movimientos:
        # Mover la pieza: sacar de origen, poner en destino
        tablero[mov.casilla_llegada] = mov.pieza
        tablero[mov.casilla_inicio] = ''

    return tablero


def casilla_a_coordenadas(casilla: str) -> tuple:
    """
    Convierte una casilla en notación algebraica a coordenadas (col, fila).

    Ejemplo: 'e4' → (4, 4)   (col=4 porque e es la 5ta letra, índice 4)
             'a1' → (0, 1)
             'h8' → (7, 8)

    Args:
        casilla: Cadena como 'e4', 'h8'

    Returns:
        tuple: (col_idx: int, fila: int) donde col_idx va de 0 (a) a 7 (h)
    """
    col = COLUMNAS.index(casilla[0])   # 'a'→0, 'b'→1, ..., 'h'→7
    fila = int(casilla[1])              # '1'→1, '2'→2, ..., '8'→8
    return col, fila


def coordenadas_a_casilla(col: int, fila: int) -> str | None:
    """
    Convierte coordenadas numéricas de vuelta a notación algebraica.
    Retorna None si las coordenadas están fuera del tablero.

    Ejemplo: (4, 4) → 'e4'
             (0, 1) → 'a1'
             (-1, 3) → None  (fuera del tablero)
    """
    if 0 <= col <= 7 and 1 <= fila <= 8:
        return COLUMNAS[col] + str(fila)
    return None


def es_pieza_blanca(pieza: str) -> bool:
    """Retorna True si la pieza pertenece al jugador blanco (mayúscula)."""
    return pieza.isupper()


def es_pieza_negra(pieza: str) -> bool:
    """Retorna True si la pieza pertenece al jugador negro (minúscula)."""
    return pieza.islower()


def mismo_color(pieza_a: str, pieza_b: str) -> bool:
    """
    Retorna True si ambas piezas son del mismo color.
    Útil para verificar que una pieza no capture a su propio compañero.
    """
    return es_pieza_blanca(pieza_a) == es_pieza_blanca(pieza_b)
