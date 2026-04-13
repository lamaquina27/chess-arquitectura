from pydantic import BaseModel


class UsuarioRegistro(BaseModel):
    username: str
    email: str
    password: str


class UsuarioResponse(BaseModel):
    id: int
    username: str
    email: str
    hashed_password: str
    elo: int
