import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
import random

DB_PATH = Path(__file__).resolve().parent.parent / "database" / "database.sqlite"

sample = [
    ("iFood - pedido", 45.90),
    ("Uber corrida", 12.50),
    ("Pagamento boleto - Luz", 120.00),
    ("Recarga Vivo 15", 15.00),
    ("Supermercado", 200.50),
    ("Netflix assinatura", 32.90),
    ("Farmácia remédio", 78.00),
]

def seed(n=10):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for i in range(n):
        desc, amt = random.choice(sample)
        ts = (datetime.utcnow() - timedelta(days=random.randint(0,20))).isoformat()
        cur.execute("INSERT INTO transactions (type, amount, category, timestamp) VALUES (?, ?, ?, ?)",
                    (desc + f" #{i}", -abs(amt) if "iFood" in desc or "Uber" in desc or "Supermercado" in desc else amt, None, ts))
    conn.commit()
    conn.close()
    print("Seed completed")

if __name__ == "__main__":
    seed(15)
