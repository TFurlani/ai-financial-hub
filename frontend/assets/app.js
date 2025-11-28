// URL base da API backend com endpoint /transactions
const API_BASE_URL = "http://127.0.0.1:8000/transactions";

// Seleção de elementos do DOM para interação com o usuário
const form = document.getElementById("form-transactions");
const listTransactions = document.getElementById("list-transactions");
const btnClear = document.getElementById("btn-clear");

const alertsOverlay = document.getElementById("alerts-overlay");
const alertsModal = document.getElementById("alerts-modal");
// Corrigido aqui: deve apontar para o container dentro do modal (id="alerts-modal-container")
const alertsContainer = document.getElementById("alerts-modal-container");
const alertsToast = document.getElementById("alerts-toast");
const alertsToastText = document.getElementById("alerts-toast-text");

/**
 * Formata números para moeda em Real Brasileiro (BRL)
 * @param {number} value - valor numérico a formatar
 * @returns {string} valor formatado em moeda local
 */
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Cria um item <li> da lista de transações, com estrutura clara e classes para estilos
 * @param {Object} transaction - objeto da transação com type, amount, category e timestamp
 * @returns {HTMLElement} elemento <li> configurado para ser inserido na lista
 */
function createTransactionItem(transaction) {
  const li = document.createElement("li");
  li.className = "transaction-item";

  // Formata a data para exibir apenas dia/mês/ano em pt-BR
  const date = new Date(transaction.timestamp).toLocaleDateString("pt-BR");

  // Define a classe para valor positivo ou negativo
  const amountClass = transaction.amount < 0 ? "negative" : "positive";

  // Cria a estrutura interna com elementos para facilitar estilo
  li.innerHTML = `
    <div class="tx-type"><strong>${transaction.type}</strong></div>
    <div class="tx-amount ${amountClass}">${formatCurrency(transaction.amount)}</div>
    <div class="tx-category"><em>${transaction.category || "-"}</em></div>
    <div class="tx-date"><small>${date}</small></div>
  `;

  return li;
}

/**
 * Carrega as transações do backend e atualiza a lista no frontend
 * Utiliza fetch API para pegar JSON e montar os elementos da lista
 */
async function loadTransactions() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error("Erro ao carregar transações");

    const transactions = await response.json();

    // Limpa a lista antes de atualizar
    listTransactions.innerHTML = "";

    // Para cada transação, cria um item e adiciona na lista
    transactions.forEach(tx => {
      const li = createTransactionItem(tx);
      listTransactions.appendChild(li);
    });

    // Gera alertas heurísticos baseados nas transações
    const alerts = generateHeuristicAlerts(transactions);
    updateAlertsUI(alerts);

    // Exibe o modal de alertas com os alertas reais
    showAlertsModal(alerts);

  } catch (error) {
    console.error("Erro:", error);
    listTransactions.innerHTML = "<li>Erro ao carregar extrato.</li>";

    // Atualiza área de alertas com mensagem de erro
    updateAlertsUI([{ text: "Erro ao carregar alertas.", type: "warning", icon: "⚠️" }]);
  }
}

/**
 * Manipulador do envio do formulário para adicionar nova transação
 * Envia os dados via POST, atualiza a lista e limpa o formulário
 * @param {Event} event - evento submit do formulário
 */
async function addTransaction(event) {
  event.preventDefault();

  const type = form.type.value.trim();
  const amount = parseFloat(form.amount.value);

  // Validação simples dos campos
  if (!type || isNaN(amount)) {
    alert("Por favor, preencha os campos corretamente.");
    return;
  }

  const newTransaction = { type, amount };

  try {
    const response = await fetch(API_BASE_URL + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransaction)
    });

    if (!response.ok) throw new Error("Erro ao adicionar transação");

    // Limpa o formulário para novo cadastro
    form.reset();

    // Atualiza a lista para mostrar a nova transação
    await loadTransactions();

  } catch (error) {
    console.error("Erro:", error);
    alert("Falha ao adicionar transação. Tente novamente.");
  }
}

/**
 * Limpa a lista de transações exibida na tela (apenas frontend)
 */
function clearTransactions() {
  listTransactions.innerHTML = "";
  // Se quiser limpar alertas também:
  updateAlertsUI([{ text: "Extrato limpo localmente.", type: "tip", icon: "ℹ️" }]);
}

/**
 * Gera alertas e recomendações simples com base nas transações
 * @param {Array} transactions - lista de transações do backend
 * @returns {Array} lista de mensagens de alerta e recomendação
 */
function generateHeuristicAlerts(transactions) {
  if (!transactions.length) {
    return [{ text: "Nenhuma transação registrada ainda.", type: "tip", icon: "ℹ️" }];
  }

  let totalExpenses = 0;
  let totalIncome = 0;
  const categoryExpenses = {};

  transactions.forEach(tx => {
    if (tx.amount < 0) {
      totalExpenses += Math.abs(tx.amount);
      if (tx.category) {
        categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + Math.abs(tx.amount);
      }
    } else {
      totalIncome += tx.amount;
    }
  });

  const alerts = [];

  if (totalExpenses > totalIncome) {
    alerts.push({ text: "Atenção: seus gastos estão maiores que sua receita.", type: "warning", icon: "⚠️" });
  } else {
    alerts.push({ text: "Ótimo, sua receita está maior que seus gastos.", type: "success", icon: "✅" });
  }

  const maxCategory = Object.entries(categoryExpenses).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ["", 0]
  );

  if (maxCategory[0] && maxCategory[1] > totalExpenses * 0.3) {
    alerts.push({ text: `Você está gastando muito com ${maxCategory[0]}. Considere reduzir para economizar.`, type: "tip", icon: "💡" });
  }

  if (totalExpenses > 0) {
    alerts.push({ text: "Dica: acompanhe seus gastos regularmente para manter o controle financeiro.", type: "tip", icon: "📊" });
  }

  return alerts;
}

/**
 * Atualiza a área de alertas no frontend
 * @param {Array} alerts - lista de mensagens para exibir
 */
function updateAlertsUI(alerts) {
  const container = document.getElementById("alerts-container");
  container.innerHTML = "";
  alerts.forEach(msgObj => {
    const alertItem = document.createElement("div");
    alertItem.className = "alert-item";
    alertItem.setAttribute("data-icon", msgObj.icon);
    alertItem.setAttribute("data-type", msgObj.type);
    alertItem.textContent = msgObj.text;
    container.appendChild(alertItem);
  });
}

/**
 * Mostra o modal de alertas com uma lista de alertas
 * @param {Array} alerts - lista de objetos {text, type, icon}
 */
function showAlertsModal(alerts) {
  alertsContainer.innerHTML = ""; // limpa
  alerts.forEach(alert => {
    const p = document.createElement("p");
    p.className = "alert-item";
    p.setAttribute("data-type", alert.type);
    p.setAttribute("data-icon", alert.icon);
    p.textContent = alert.text;
    alertsContainer.appendChild(p);
  });
  alertsOverlay.style.display = "flex";
  alertsToast.style.display = "none";
}

/**
 * Esconde o modal e mostra o toast com resumo do primeiro alerta
 */
function hideAlertsModal() {
  alertsOverlay.style.display = "none";
  // Prepara texto resumido para toast
  const firstAlert = alertsContainer.querySelector(".alert-item");
  if (firstAlert) {
    alertsToastText.textContent = firstAlert.text.length > 50 ? firstAlert.text.slice(0, 50) + "..." : firstAlert.text;
  } else {
    alertsToastText.textContent = "";
  }
  alertsToast.style.display = "block";
}

// Eventos associados
form.addEventListener("submit", addTransaction);
btnClear.addEventListener("click", clearTransactions);
// Remove listener do botão fechar que não existe mais
// closeBtn.addEventListener("click", hideAlertsModal);
alertsToast.addEventListener("click", () => {
  alertsOverlay.style.display = "flex";
  alertsToast.style.display = "none";
});

// Fecha o modal ao clicar fora da caixa (no overlay)
alertsOverlay.addEventListener("click", (event) => {
  if (event.target === alertsOverlay) {
    hideAlertsModal();
  }
});

// Inicializa carregando as transações e mostrando alertas
loadTransactions();
