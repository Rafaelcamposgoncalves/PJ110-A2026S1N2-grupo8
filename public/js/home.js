// home.js
let dashboardCarregado = false;
let pedidoCarregado = false;
let shaperCarregado = false;

async function carregarUsuario() {
  try {
    const response = await fetch(`${BASE_URL}/api/usuario`);
    const data = await response.json();
    if (data.nome) {
      // 🔥 Guarda o ID globalmente para outros scripts usarem
      window.usuarioId = data.id_usuario;
      document.getElementById("usuario-logado").innerHTML =
        `<i class="fa-solid fa-user"></i> ${data.usuario} | ${data.nome}`;
    }
  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
  }
}

async function carregarDashboard() {
  if (dashboardCarregado) return;
  const response = await fetch(`${BASE_URL}/dashboard`);
  const html = await response.text();
  const container = document.getElementById("conteudo-dashboard");
  container.innerHTML = html;
  dashboardCarregado = true;
}

async function carregarPedido() {
  if (pedidoCarregado) {
    // 🔥 Recarrega dados para garantir que nomes editados apareçam
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

    // Inicializa pela primeira vez
    if (window.initPedidoStatus) window.initPedidoStatus();

    // 🔥 ATIVA OS OUVINTES DAS TABS (IMPORTANTE PARA ATUALIZAR AO CLICAR)
    if (window.vincularEventosTabs) {
      window.vincularEventosTabs();
    }

    pedidoCarregado = true;
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
    });
}

//Modal Detalhe do Pedido
window.abrirModalPedidoDetalhe = function (id) {
  //const btn = document.querySelector("#btnConfirmarExcluir");
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalPedidoDetalhe"),
  ).show();
};

function initTooltips() {
  // Destrói instâncias antigas para evitar duplicidade de memória
  const tooltips = document.querySelectorAll(".tooltip");
  tooltips.forEach((t) => t.remove());

  // Inicializa todos
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Chame initTooltips() sempre que terminar de carregar seus pedidos via AJAX/Fetch.

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
  carregarUsuario();
});
