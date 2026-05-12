from pydantic import BaseModel


class AmistadCreate(BaseModel):
    id_usuario: str
    id_amistad: str
    estado: str
