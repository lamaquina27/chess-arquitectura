from fastapi import FastAPI
from routers.partida_router import router as partida_router

app = FastAPI()

app.include_router(partida_router, prefix="/partida")