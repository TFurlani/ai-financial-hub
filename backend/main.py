from fastapi import FastAPI
from backend.database.db import init_db
from backend.api.transactions import router as transactions_router

app = FastAPI(title="AI Financial Hub API")

@app.on_event("startup")
def startup_event():
    init_db()

app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])

@app.get("/")
def root():
    return {"message": "AI Financial Hub Backend is running!"}
