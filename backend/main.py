from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Importa o middleware CORS
from backend.database.db import init_db
from backend.api.transactions import router as transactions_router

app = FastAPI(title="AI Financial Hub API")

# Define as origens permitidas para requisições CORS (ajuste conforme a porta do seu front)
origins = [
    "http://localhost",
    "http://localhost:5500",   # exemplo de porta para front-end, ajuste se necessário
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000",
]

# Adiciona o middleware para tratar CORS e permitir requisições do front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Permite as origens listadas
    allow_credentials=True,         # Permite enviar cookies, autenticações etc.
    allow_methods=["*"],            # Permite todos os métodos HTTP (GET, POST, OPTIONS, etc)
    allow_headers=["*"],            # Permite todos os headers
)

@app.on_event("startup")
def startup_event():
    init_db()

# Inclui as rotas das transações com prefixo /transactions
app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])

@app.get("/")
def root():
    return {"message": "AI Financial Hub Backend is running!"}
