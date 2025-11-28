def auto_category(tx_type: str, amount: float | None = None) -> str:
    tx_type = tx_type.lower()

    # Categorias por palavras-chave
    categorias = {
        "transferencia": ["pix", "transferencia", "ted", "doc", "pagamento banco"],
        "servicos": ["recarga", "vivo", "claro", "net", "oi", "telefonia", "internet", "serviço"],
        "alimentacao": ["ifood", "restaurante", "lanche", "supermercado", "mercado", "padaria", "delivery", "pizza"],
        "contas": ["boleto", "luz", "agua", "energia", "gas", "condominio", "taxa", "iptu", "imposto"],
        "saude": ["farmacia", "remedio", "hospital", "consulta", "medico", "clinica"],
        "transporte": ["uber", "99", "taxi", "onibus", "metro", "corrida", "combustivel", "gasolina", "transporte"],
        "assinaturas": ["netflix", "spotify", "prime", "assinatura", "app", "google play", "apple store"],
        "salario": ["salario", "contracheque", "pagamento", "deposito"],
        "lazer": ["cinema", "teatro", "show", "jogo", "viagem", "hotel", "festa"],
    }

    for categoria, keywords in categorias.items():
        for kw in keywords:
            if kw in tx_type:
                return categoria

    # Se não encontrou por palavra-chave, tentar usar amount
    if amount is not None:
        if amount > 0:
            # Recebimento (ex: salário, devolução)
            return "receita"
        else:
            # Despesa genérica
            return "outros"

    # Se não passou amount, retorna "outros"
    return "outros"
