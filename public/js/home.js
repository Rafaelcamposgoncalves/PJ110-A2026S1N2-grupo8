// home.js
let dashboardCarregado = false;
let pedidoCarregado = false;
let shaperCarregado = false;

// ===============================
// ATUALIZAR CONTADORES DASHBOARD
// ===============================
window.atualizarDashboard = async function () {
  const elPedidos = document.getElementById("cardTotalPedidos");
  const elStatus = document.getElementById("cardTotalStatus");
  const elShapers = document.getElementById("cardTotalShapers");
  const elFinalizados = document.getElementById("cardPedidosFinalizados");
  const elAbertos = document.getElementById("cardPedidosAbertos");

  try {
    const [resP, resS, resSt] = await Promise.all([
      fetch(`${BASE_URL}/api/pedidos?t=${Date.now()}`),
      fetch(`${BASE_URL}/api/shapers?t=${Date.now()}`),
      fetch(`${BASE_URL}/api/status?t=${Date.now()}`),
    ]);

    const pedidos = await resP.json();
    const shapers = await resS.json();
    const statusList = await resSt.json();

    if (elPedidos)
      elPedidos.innerText = Array.isArray(pedidos) ? pedidos.length : 0;
    if (elShapers)
      elShapers.innerText = Array.isArray(shapers) ? shapers.length : 0;
    if (elStatus)
      elStatus.innerText = Array.isArray(statusList) ? statusList.length : 0;

    if (
      Array.isArray(pedidos) &&
      Array.isArray(statusList) &&
      statusList.length > 0
    ) {
      // 1. Descobrir qual o ID que tem a MAIOR ordem na tabela de status
      const statusFinal = statusList.reduce((prev, current) =>
        prev.ordem > current.ordem ? prev : current,
      );
      const idStatusFinal = String(statusFinal.id);

      // 2. Filtrar os pedidos
      const totalFinalizados = pedidos.filter((p) => {
        if (!p.status_ids) return false;

        // Transforma a string "1,2,4,3,5" num array e pega o último valor
        const idsArray = p.status_ids.split(",");
        const idStatusAtual = idsArray[idsArray.length - 1].trim();

        // Compara se o último status do pedido é o status final do sistema
        return idStatusAtual === idStatusFinal;
      }).length;

      const totalAbertos = pedidos.length - totalFinalizados;

      if (elFinalizados) elFinalizados.innerText = totalFinalizados;
      if (elAbertos) elAbertos.innerText = totalAbertos;
    }
  } catch (erro) {
    console.error("Erro ao atualizar dashboard:", erro);
  }
};

// ===============================
// USUÁRIO
// ===============================
async function carregarUsuario() {
  try {
    const response = await fetch(`${BASE_URL}/api/usuario`);
    const data = await response.json();
    if (data.nome) {
      window.usuarioId = data.id_usuario;
      const infoUsuario = `<i class="fa-solid fa-user"></i> ${data.usuario} | ${data.nome}`;
      document.getElementById("usuario-logado").innerHTML = infoUsuario;

      const iconeMobile = document.getElementById("usuario-mobile-tooltip");
      if (iconeMobile) {
        iconeMobile.setAttribute(
          "data-bs-original-title",
          `${data.usuario} | ${data.nome}`,
        );
        iconeMobile.setAttribute("title", `${data.usuario} | ${data.nome}`);
      }
      initTooltips();
    }
  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
  }
}

// ===============================
// NAVEGAÇÃO / ABAS
// ===============================
async function carregarDashboard() {
  if (!dashboardCarregado) {
    const response = await fetch(`${BASE_URL}/dashboard`);
    const html = await response.text();
    const container = document.getElementById("conteudo-dashboard");
    container.innerHTML = html;
    dashboardCarregado = true;
  }

  initTooltips();

  // Pequeno delay para o navegador renderizar o HTML antes de preencher os números
  setTimeout(() => {
    window.atualizarDashboard();
  }, 50);
}

async function carregarPedido() {
  if (pedidoCarregado) {
    if (window.listarPedidosStatus) window.listarPedidosStatus();
    if (window.listarPedidos) window.listarPedidos();
    if (window.carregarSelectsPedido) window.carregarSelectsPedido();
    if (window.carregarShapersPedido) window.carregarShapersPedido();
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/pedido`);
    const html = await response.text();
    document.getElementById("conteudo-pedido").innerHTML = html;

    if (window.carregarShapersPedido) await window.carregarShapersPedido();
    if (window.initPedidoStatus) window.initPedidoStatus();
    if (window.vincularEventosTabs) window.vincularEventosTabs();

    pedidoCarregado = true;
    initTooltips();
  } catch (erro) {
    console.error("Erro ao carregar pedido:", erro);
  }
}

function carregarShaper() {
  if (shaperCarregado) {
    if (window.listarShapers) window.listarShapers();
    return;
  }
  fetch(`${BASE_URL}/views/shaper/index.html`)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("conteudo-shaper").innerHTML = html;
      if (window.listarShapers) window.listarShapers();
      shaperCarregado = true;
      initTooltips();
    });
}

// ===============================
// UTILITÁRIOS
// ===============================
window.abrirModalPedidoDetalhe = function (id) {
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalPedidoDetalhe"),
  ).show();
};

function initTooltips() {
  const tooltipsExistentes = document.querySelectorAll(".tooltip");
  tooltipsExistentes.forEach((t) => t.remove());
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  initTooltips();
  carregarDashboard();
  carregarUsuario();
});
