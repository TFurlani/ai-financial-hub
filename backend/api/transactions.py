from fastapi import APIRouter
from backend.models.transactions import Transaction
from backend.services.categorize import auto_category
from backend.database.db import get_connection
from datetime import datetime
from typing import List  # <-- importe List

router = APIRouter()

@router.post("/")
def add_transaction(transaction: Transaction):
    conn = get_connection()
    cur = conn.cursor()

    category = transaction.category or auto_category(transaction.type, transaction.amount)

    cur.execute(
        "INSERT INTO transactions (type, amount, category, timestamp) VALUES (?, ?, ?, ?)",
        (transaction.type, transaction.amount, category, datetime.utcnow().isoformat())
    )

    conn.commit()
    conn.close()

    return {"status": "success", "category_used": category}

@router.get("/")
def list_transactions():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM transactions ORDER BY id DESC")
    result = cur.fetchall()

    conn.close()
    return [dict(row) for row in result]

# NOVO ENDPOINT PARA INSERIR VÁRIAS TRANSAÇÕES DE UMA VEZ
@router.post("/batch")
def add_transactions_batch(transactions: List[Transaction]):
    conn = get_connection()
    cur = conn.cursor()

    inserted = 0

    for transaction in transactions:
        category = transaction.category or auto_category(transaction.type, transaction.amount)
        cur.execute(
            "INSERT INTO transactions (type, amount, category, timestamp) VALUES (?, ?, ?, ?)",
            (transaction.type, transaction.amount, category, datetime.utcnow().isoformat())
        )
        inserted += 1

    conn.commit()
    conn.close()

    return {"status": "success", "inserted": inserted}
