
import bcrypt


def generar_id(id:int):
    id+=1
    return id
def password_to_hash(password:str):
    sal = bcrypt.gensalt()

    hash = bcrypt.hashpw(password.encode("utf-8"),sal)

    return hash.decode("utf-8")


def verificar_password(password:str,hash:str):
    return bcrypt.checkpw(password.encode("utf-8"),hash.encode("utf-8"))