from pydantic import BaseModel

class Transaction(BaseModel):
    type: str
    amount: float
    category: str | None = None
