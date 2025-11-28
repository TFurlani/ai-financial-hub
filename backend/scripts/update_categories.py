from backend.database.db import get_connection
from backend.services.categorize import auto_category

def update_all_categories():
    conn = get_connection()
    cur = conn.cursor()

    # Busca todas as transações (sem filtro)
    cur.execute("SELECT id, type FROM transactions")
    transactions = cur.fetchall()

    print(f"Encontradas {len(transactions)} transações para atualizar.")

    for transaction in transactions:
        tx_id = transaction["id"]
        tx_type = transaction["type"]
        tx_amount = transaction["amount"]
        new_category = auto_category(tx_type, tx_amount)

        cur.execute("UPDATE transactions SET category = ? WHERE id = ?", (new_category, tx_id))
        print(f"Atualizada transação {tx_id} com categoria '{new_category}'.")

    conn.commit()
    conn.close()
    print("Atualização finalizada.")

if __name__ == "__main__":
    update_all_categories()
