"""
validador.py — Motor central de validación de movimientos

Este es el módulo más importante del motor de ajedrez.
Integra todo lo que hemos construido:
    tablero.py  → reconstruir el estado real del tablero
    movimientos/ → saber a dónde puede ir cada pieza

¿Qué hace este módulo?

    1. Recibe un movimiento propuesto (origen → destino)
    2. Reconstruye el tablero desde la DB
    3. Identifica la pieza que se quiere mover
    4. Calcula todos sus movimientos válidos
    5. Verifica que el destino esté en esa lista
    6. (Avanzado) Verifica que el movimiento no deje al propio rey en jaque

Conceptos clave que aprenderás aquí:
    - Dispatch table: un diccionario que mapea tipo de pieza → función
    - Simulación de movimiento: mover virtualmente para probar consecuencias
    - Detección de jaque: buscar si el rey está bajo ataque
"""

from services.chess_engine.tablero import (
    reconstruir_tablero,
    casilla_a_coordenadas,
    coordenadas_a_casilla,
    es_pieza_blanca,
    mismo_color,
)
from services.chess_engine.movimientos import (
    peon, torre, caballo, alfil, dama, rey
)


# ─── Dispatch table ────────────────────────────────────────────────────────────
# Mapea la letra de la pieza (en minúscula) a su función de movimientos.
# Esto evita un bloque if/elif/elif largo y hace el código extensible.
# Ejemplo: 'c' → caballo.movimientos_validos
MOVIMIENTOS_POR_PIEZA = {
    'p': peon.movimientos_validos,
    't': torre.movimientos_validos,
    'c': caballo.movimientos_validos,
    'a': alfil.movimientos_validos,
    'd': dama.movimientos_validos,
    'r': rey.movimientos_validos,
}

def esta_en_jaque(tablero: dict, es_blanco: bool) -> bool:
    """
    Verifica si el rey del color indicado está actualmente en jaque.

    Args:
        tablero:   Estado actual del tablero
        es_blanco: True si queremos verificar el rey blanco

    Returns:
        True si el rey está bajo ataque por alguna pieza enemiga.
    """
    pieza_rey = 'R' if es_blanco else 'r'
    casilla_rey = _encontrar_rey(tablero, pieza_rey)

    if casilla_rey is None:
        return False  # No debería pasar en una partida real

    return _esta_bajo_ataque(tablero, casilla_rey, es_blanco)


# ─── Función pública principal ─────────────────────────────────────────────────

def validar_movimiento(
    movimientos_db: list,
    casilla_inicio: str,
    casilla_llegada: str,
    pieza: str
) -> tuple[bool, str]:
    """
    Valida si un movimiento propuesto es legalmente correcto.

    Args:
        movimientos_db: Lista de MovimientoDB (todos los movimientos de la partida)
                        ordenados por numero_movimiento.
        casilla_inicio:  Casilla de origen, ej: 'e2'
        casilla_llegada: Casilla de destino, ej: 'e4'
        pieza:           La pieza que se mueve, ej: 'P' (peón blanco)

    Returns:
        tuple (bool, str):
            - (True,  "")         → Movimiento válido
            - (False, "mensaje")  → Movimiento inválido con explicación
    """
    # ── Paso 1: Reconstruir el tablero actual ───────────────────────────────────
    tablero = reconstruir_tablero(movimientos_db)

    # ── Paso 2: Verificar que la pieza declarada coincide con el tablero ────────
    pieza_real = tablero.get(casilla_inicio, '')
    if pieza_real == '':
        return False, f"No hay ninguna pieza en {casilla_inicio}."
    if pieza_real != pieza:
        return False, (
            f"La pieza declarada ({pieza!r}) no coincide con la pieza "
            f"real en {casilla_inicio} ({pieza_real!r})."
        )

    # ── Paso 3: Obtener función de movimientos para esta pieza ──────────────────
    tipo_pieza = pieza.lower()   # 'P'→'p', 'T'→'t', etc.
    fn_movimientos = MOVIMIENTOS_POR_PIEZA.get(tipo_pieza)

    if fn_movimientos is None:
        return False, f"Tipo de pieza desconocido: {pieza!r}."

    # ── Paso 4: Calcular movimientos candidatos ──────────────────────────────────
    movimientos_candidatos = fn_movimientos(casilla_inicio, tablero)

    if casilla_llegada not in movimientos_candidatos:
        return False, (
            f"Movimiento ilegal: {pieza!r} no puede ir de "
            f"{casilla_inicio} a {casilla_llegada}."
        )

    # ── Paso 5: Verificar que el movimiento no deje el propio rey en jaque ──────
    if _deja_rey_en_jaque(tablero, casilla_inicio, casilla_llegada, pieza):
        return False, "Movimiento ilegal: dejarías a tu propio Rey en jaque."

    # ── Todo OK ──────────────────────────────────────────────────────────────────
    return True, ""


# ─── Funciones auxiliares (privadas — prefijo _) ───────────────────────────────

def _deja_rey_en_jaque(tablero: dict, casilla_inicio: str, casilla_llegada: str, pieza: str) -> bool:
    """
    Simula el movimiento propuesto y verifica si deja al propio rey en jaque.

    ¿Por qué es necesario?
        Una jugada puede ser "válida" para una pieza pero ilegal porque
        expone al propio rey. Ej: mover un alfil que está "protegiéndo" al rey.

    Estrategia:
        1. Hacer una copia del tablero (NO modificar el original)
        2. Aplicar el movimiento en la copia
        3. Encontrar la posición del rey propio
        4. Ver si alguna pieza enemiga puede atacar al rey en esa posición
    """
    # Copia del tablero para no afectar el real
    tablero_simulado = dict(tablero)
    tablero_simulado[casilla_llegada] = pieza
    tablero_simulado[casilla_inicio] = ''

    # Determinar color del jugador que mueve
    es_blanco = es_pieza_blanca(pieza)

    # Encontrar la posición del rey propio
    pieza_rey = 'R' if es_blanco else 'r'
    casilla_rey = _encontrar_rey(tablero_simulado, pieza_rey)

    if casilla_rey is None:
        # No debería pasar en una partida normal
        return False

    # ¿Alguna pieza enemiga puede atacar la casilla del rey?
    return _esta_bajo_ataque(tablero_simulado, casilla_rey, es_blanco)


def _encontrar_rey(tablero: dict, pieza_rey: str) -> str | None:
    """Busca y retorna la casilla donde se encuentra el rey indicado."""
    for casilla, pieza in tablero.items():
        if pieza == pieza_rey:
            return casilla
    return None


def _esta_bajo_ataque(tablero: dict, casilla: str, es_blanco_defensor: bool) -> bool:
    """
    Verifica si la casilla indicada está bajo ataque por alguna pieza enemiga.

    Args:
        tablero:              Estado actual del tablero
        casilla:              Casilla a verificar (donde está el rey)
        es_blanco_defensor:   True si el rey que defendemos es blanco

    Returns:
        True si la casilla está atacada por al menos una pieza enemiga.
    """
    for casilla_origen, pieza in tablero.items():
        if pieza == '':
            continue

        # Solo nos interesan las piezas ENEMIGAS
        if es_pieza_blanca(pieza) == es_blanco_defensor:
            continue

        # ¿Puede esta pieza enemiga atacar la casilla del rey?
        tipo = pieza.lower()
        fn = MOVIMIENTOS_POR_PIEZA.get(tipo)
        if fn is None:
            continue

        movimientos_enemigo = fn(casilla_origen, tablero)
        if casilla in movimientos_enemigo:
            return True

    return False


def obtener_movimientos_validos(movimientos_db: list, casilla: str) -> list:
    """
    Retorna la lista de movimientos válidos (legales) para la pieza
    en una casilla dada, incluyendo el filtro de jaque.

    Útil para el frontend cuando quiera mostrar los movimientos posibles.

    Args:
        movimientos_db: Lista de MovimientoDB de la partida
        casilla:        Casilla de la pieza a consultar

    Returns:
        list: Casillas de destino legales
    """
    tablero = reconstruir_tablero(movimientos_db)
    pieza = tablero.get(casilla, '')

    if pieza == '':
        return []

    tipo = pieza.lower()
    fn = MOVIMIENTOS_POR_PIEZA.get(tipo)
    if fn is None:
        return []

    candidatos = fn(casilla, tablero)

    # Filtrar los que dejan al rey en jaque
    return [
        dest for dest in candidatos
        if not _deja_rey_en_jaque(tablero, casilla, dest, pieza)
    ]


def detectar_estado_final(movimientos_db: list, color_turno: str) -> dict:
    """
    Evalúa el estado del juego después de un movimiento y retorna
    un diccionario con tres flags independientes.

    Args:
        movimientos_db: Lista de MovimientoDB de la partida (ya actualizada)
        color_turno:    El color del jugador que debe mover AHORA ('blanco'/'negro')

    Returns:
        dict con:
            'jaque'      → bool: el rey está bajo ataque
            'jaque_mate' → bool: está en jaque Y sin movimientos (pierde)
            'ahogado'    → bool: NO está en jaque pero sin movimientos (empate)
    """
    tablero  = reconstruir_tablero(movimientos_db)
    es_blanco = (color_turno == 'blanco')

    # Pregunta 1: ¿El rey está en jaque?
    en_jaque = esta_en_jaque(tablero, es_blanco)

    # Pregunta 2: ¿Existe al menos un movimiento legal?
    hay_movimiento = _tiene_movimientos_legales(tablero, es_blanco)

    return {
        'jaque':      en_jaque and hay_movimiento,
        'jaque_mate': en_jaque and not hay_movimiento,
        'ahogado':    not en_jaque and not hay_movimiento,
    }


def _tiene_movimientos_legales(tablero: dict, es_blanco: bool) -> bool:
    """
    Verifica si el jugador tiene al menos UN movimiento legal disponible.
    Trabaja directamente con el tablero ya reconstruido (sin ir a la DB).

    ¿Por qué 'al menos uno'?
        En cuanto encontramos un movimiento legal, retornamos True inmediatamente.
        No necesitamos calcular TODOS los movimientos — solo saber si existe alguno.
        Esto hace la función mucho más eficiente (early return).

    Args:
        tablero:   Estado actual del tablero
        es_blanco: True si verificamos al jugador blanco

    Returns:
        True si existe al menos un movimiento legal para ese jugador.
    """
    for casilla, pieza in tablero.items():
        if pieza == '' or es_pieza_blanca(pieza) != es_blanco:
            continue

        fn = MOVIMIENTOS_POR_PIEZA.get(pieza.lower())
        if fn is None:
            continue

        for destino in fn(casilla, tablero):
            if not _deja_rey_en_jaque(tablero, casilla, destino, pieza):
                return True  # Early return: encontramos uno, alcanza

    return False
