from jose.exceptions import JWTError
from datetime import datetime,timedelta,timezone

LLAVE_SECRETA="clave_secreta"
ALGORITMO = "HS256"





def crear_token(data:dict,expiracion:timedelta = None):
    to_encoded = data.copy()
    expira=datetime.now(timezone.utc) + (expiracion or timedelta(minutes=15))
    to_encoded.update({"exp":expira})
    return jwt.encode(to_encoded,LLAVE_SECRETA,algorithm= ALGORITMO)

def decodificar_token(toke : str):
    try:
        payload = jwt.decode(token,LLAVE_SECRETA,algorithms=[ALGORITMO])
        return payload
    except JWTError as e:
        raise Exception(f"token invlaido: {e}")