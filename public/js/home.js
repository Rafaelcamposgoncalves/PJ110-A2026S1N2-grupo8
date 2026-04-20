// home.js

let dashboardCarregado = false;
let pedidoCarregado = false;
let shaperCarregado = false;

async function carregarUsuario() {
  try {
    const response = await fetch(`${BASE_URL}/api/usuario`);
    const data = await response.json();

    if (data.nome) {
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

  executarScripts(container);

  dashboardCarregado = true;
}

async function carregarPedido() {
  if (pedidoCarregado) return;

  const response = await fetch(`${BASE_URL}/pedido`);
  const html = await response.text();

  const container = document.getElementById("conteudo-pedido");
  container.innerHTML = html;

  executarScripts(container);

  // 🔥 AGORA INICIALIZA DEPOIS DO HTML EXISTIR
  if (typeof initPedidoStatus === "function") {
    initPedidoStatus();
  }

  pedidoCarregado = true;
}

function carregarShaper() {
  fetch("/teste/views/shaper/index.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("conteudo-shaper").innerHTML = html;

      // IMPORTANTE: chamar depois que o HTML existir
      if (window.listarShapers) {
        listarShapers();
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
  carregarUsuario();
});
