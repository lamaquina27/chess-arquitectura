from pydantic import BaseModel
from typing import Optional


class MovimientoRequest(BaseModel):
    casilla_inicio: str
    casilla_llegada: str
    pieza: str
    id_partida: str
    pieza_coronacion: Optional[str] = None


class CredencialesRival(BaseModel):
    username: str
    password: str


class AbandonoData(BaseModel):
    id_partida: str
