
import bcrypt
import uuid

def generar_id(id=None):
    return str(uuid.uuid4())
def password_to_hash(password:str):
    sal = bcrypt.gensalt()

    hash = bcrypt.hashpw(password.encode("utf-8"),sal)

    return hash.decode("utf-8")


def verificar_password(password:str,hash:str):
    return bcrypt.checkpw(password.encode("utf-8"),hash.encode("utf-8"))