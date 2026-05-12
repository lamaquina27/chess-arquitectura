from routers.web_sockets_router import router as web_router
from routers.amistad_router import router as amistad_router
from routers.mensaje_router import router as mensaje_router

from fastapi import FastAPI
from routers.partida_router import router as partida_router
from routers.registro_router import router as registro_router
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import entities.mensaje_entity  # Ensure the entity is registered

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI()
origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(partida_router, prefix="/partida")
app.include_router(registro_router, prefix="/api")
app.include_router(web_router)
app.include_router(amistad_router)
app.include_router(mensaje_router)