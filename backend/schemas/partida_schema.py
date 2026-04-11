from pydantic import BaseModel


class MovimientoRequest(BaseModel):
    casilla_inicio: str
    casilla_llegada: str
    pieza: str
    id_partida: str


class CredencialesRival(BaseModel):
    username: str
    password: str


class AbandonoData(BaseModel):
    id_partida: str
