from pydantic import BaseModel

class QRVerifyRequest(BaseModel):
    sala: str
    token: str
