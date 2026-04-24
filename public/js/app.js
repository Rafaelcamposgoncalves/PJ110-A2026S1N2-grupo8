// app.js
window.BASE_URL = window.location.origin + "/teste";

// ===============================
// GESTÃO DE ATUALIZAÇÃO DE TABS (NOVO)
// ===============================
window.vincularEventosTabs = function () {
  const tabs = document.querySelectorAll('button[data-bs-toggle="tab"]');
  tabs.forEach((tab) => {
    // Remove para não duplicar se carregar a página várias vezes
    tab.removeEventListener("shown.bs.tab", gerirTrocaDeAba);
    tab.addEventListener("shown.bs.tab", gerirTrocaDeAba);
  });
};

function gerirTrocaDeAba(event) {
  const targetId = event.target.getAttribute("data-bs-target");
  //console.log("Aba ativada:", targetId);

  // Se clicar em Status, atualiza a lista (puxa nomes novos do banco)
  if (targetId === "#tabPedidoStatus") {
    if (typeof window.listarPedidosStatus === "function") {
      window.listarPedidosStatus();
    }
  }
  // Se clicar em Gerenciamento, atualiza a tabela e selects
  if (targetId === "#tabGerenciamentoPedido") {
    if (typeof window.listarPedidos === "function") {
      window.listarPedidos();
    }
    if (typeof window.carregarSelectsPedido === "function") {
      window.carregarSelectsPedido();
    }
  }
}

window.executarScripts = async function (container) {
  const scripts = container.querySelectorAll("script");
  for (const oldScript of scripts) {
    const newScript = document.createElement("script");
    if (oldScript.src) {
      newScript.src = oldScript.src;
      await new Promise((resolve, reject) => {
        newScript.onload = resolve;
        newScript.onerror = reject;
        document.body.appendChild(newScript);
      });
    } else {
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
    }
  }
};

// ===============================
// SHOW TOAST GLOBAL
// ===============================
window.showToast = function (result) {
  const toastEl = document.getElementById("alertToast");
  if (!toastEl) return;

  const textToast = toastEl.querySelector("#toast-text");
  toastEl.classList.remove(
    "bg-danger",
    "text-danger",
    "bg-success",
    "text-success",
  );

  const isErro = !!result.erro;
  const msg = result.erro || result.mensagem || "Sem resposta";

  toastEl.classList.add(
    isErro ? "bg-danger" : "bg-success",
    isErro ? "text-light" : "text-light",
  );

  textToast.textContent = msg;
  bootstrap.Toast.getOrCreateInstance(toastEl).show();
};

// ===============================
// LOGOUT (CORRIGIDO)
// ===============================
window.logout = async function () {
  try {
    await fetch(`${BASE_URL}/api/logout`, { method: "POST" });
  } catch (err) {
    console.error("Erro ao deslogar no servidor:", err);
  }
  // Redireciona sempre, mesmo que o fetch falhe
  window.location.href = `${BASE_URL}/login`;
};
