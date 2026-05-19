"""
Módulo de movimientos por pieza.
Exporta cada módulo de pieza para que validador.py pueda importarlos.
"""
from services.chess_engine.movimientos import peon, torre, caballo, alfil, dama, rey

__all__ = ['peon', 'torre', 'caballo', 'alfil', 'dama', 'rey']
