def auto_category(tx_type: str) -> str:
    tx_type = tx_type.lower()

    if "pix" in tx_type:
        return "transferencia"
    if "recarga" in tx_type:
        return "servicos"
    if "compra" in tx_type:
        return "alimentacao"
    if "boleto" in tx_type:
        return "contas"

    return "outros"
