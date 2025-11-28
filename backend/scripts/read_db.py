import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "database" / "database.sqlite"

def read_all():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM transactions ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    read_all()
