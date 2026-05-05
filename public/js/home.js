// home.js
let dashboardCarregado = false;
let pedidoCarregado = false;
let shaperCarregado = false;

async function carregarUsuario() {
  try {
    const response = await fetch(`${BASE_URL}/api/usuario`);
    const data = await response.json();

    if (data.nome) {
      window.usuarioId = data.id_usuario;
      const infoUsuario = `<i class="fa-solid fa-user"></i> ${data.usuario} | ${data.nome}`;

      // 1. Atualiza o texto do Desktop
      document.getElementById("usuario-logado").innerHTML = infoUsuario;

      // 2. Atualiza o Tooltip do Mobile (precisa setar o atributo e reinicializar)
      const iconeMobile = document.getElementById("usuario-mobile-tooltip");
      iconeMobile.setAttribute(
        "data-bs-original-title",
        `${data.usuario} | ${data.nome}`,
      );
      iconeMobile.setAttribute("title", `${data.usuario} | ${data.nome}`);

      // Inicializa/Atualiza os tooltips para reconhecer o novo nome
      initTooltips();
    }
  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
  }
}

async function carregarDashboard() {
  if (!dashboardCarregado) {
    const response = await fetch(`${BASE_URL}/dashboard`);
    const html = await response.text();
    const container = document.getElementById("conteudo-dashboard");
    container.innerHTML = html;
    dashboardCarregado = true;
    initTooltips();
  }

  // 🔥 Chama a função de contagem (está fora do IF para atualizar sempre que clicar na aba)
  if (window.atualizarDashboard) {
    window.atualizarDashboard();
  }
}

async function carregarPedido() {
  // 1. Limpeza visual (opcional, se estiveres a usar a resetVisualAbas)
  if (typeof resetVisualAbas === "function") resetVisualAbas("pedido");

  if (pedidoCarregado) {
    if (window.listarPedidosStatus) window.listarPedidosStatus();
    if (window.listarPedidos) window.listarPedidos();

    // 🔥 MUDANÇA: Usa popularSelects para garantir que inativos sumam ao retornar
    if (window.popularSelects) await window.popularSelects();
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/pedido`);
    const html = await response.text();
    document.getElementById("conteudo-pedido").innerHTML = html;

    // 🔥 MUDANÇA: Chama popularSelects em vez de carregarShapersPedido
    // Isso força o Shaper a usar o filtro ?somenteAtivos=1 da função genérica
    if (window.popularSelects) {
      await window.popularSelects();
    }

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
      initTooltips(); // Inicializa tooltips na view de shaper
    });
}

// Modal Detalhe do Pedido
window.abrirModalPedidoDetalhe = function (id) {
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalPedidoDetalhe"),
  ).show();
};

function initTooltips() {
  // Destrói instâncias antigas para evitar bugs de sobreposição
  const tooltipsExistentes = document.querySelectorAll(".tooltip");
  tooltipsExistentes.forEach((t) => t.remove());

  // Inicializa todos os elementos com data-bs-toggle="tooltip"
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initTooltips(); // Garante que o ícone do usuário comece funcionando
  carregarDashboard();
  carregarUsuario();
});

window.irParaShaper = function () {
  // 1. Localiza o botão oficial do menu lateral
  const btnMenu = document.querySelector('.sidebar [data-bs-target="#shaper"]');

  if (btnMenu) {
    // 2. FORÇA A TROCA VISUAL (API do Bootstrap)
    // Isso remove o 'active' do Dashboard/Pedido e coloca no Shaper corretamente
    const tab = bootstrap.Tab.getOrCreateInstance(btnMenu);
    tab.show();

    // 3. EXECUTA A CARGA DOS DADOS
    // Chamamos a tua função original para preencher a tabela
    if (typeof carregarShaper === "function") {
      carregarShaper();
    }

    // 4. SINCRONIZA O MENU MOBILE (Pinta o ícone de baixo)
    document
      .querySelectorAll(".nav-bottom .nav-link")
      .forEach((l) => l.classList.remove("active"));
    const btnMobile = document.querySelector(
      '.nav-bottom [data-bs-target="#shaper"]',
    );
    if (btnMobile) btnMobile.classList.add("active");

    window.scrollTo(0, 0);
  }
};

// Adicione isto no final do seu home.js
window.atualizarDashboard = async function () {
  const elPedidos = document.getElementById("cardTotalPedidos");
  const elStatus = document.getElementById("cardTotalStatus");
  const elShapers = document.getElementById("cardTotalShapers");
  const elFinalizados = document.getElementById("cardPedidosFinalizados");
  const elAbertos = document.getElementById("cardPedidosAbertos");

  try {
    // Busca todos os dados necessários
    const [resP, resS, resSt] = await Promise.all([
      fetch(`${BASE_URL}/api/pedidos?t=${Date.now()}`),
      fetch(`${BASE_URL}/api/shapers?t=${Date.now()}`),
      fetch(`${BASE_URL}/api/status?t=${Date.now()}`),
    ]);

    const pedidos = await resP.json();
    const shapers = await resS.json();
    const statusList = await resSt.json();

    // 1. Totais Simples
    if (elPedidos)
      elPedidos.innerText = Array.isArray(pedidos) ? pedidos.length : 0;
    if (elShapers)
      elShapers.innerText = Array.isArray(shapers) ? shapers.length : 0;
    if (elStatus)
      elStatus.innerText = Array.isArray(statusList) ? statusList.length : 0;

    // 2. Lógica de Finalizados vs Abertos (Baseado na maior ordem)
    if (
      Array.isArray(pedidos) &&
      Array.isArray(statusList) &&
      statusList.length > 0
    ) {
      // Descobre qual o ID que tem a MAIOR ordem na tabela de status
      const statusFinal = statusList.reduce((prev, current) =>
        prev.ordem > current.ordem ? prev : current,
      );
      const idStatusFinal = String(statusFinal.id);

      const totalFinalizados = pedidos.filter((p) => {
        if (!p.status_ids) return false;
        const idsArray = p.status_ids.split(",");
        const idStatusAtual = idsArray[idsArray.length - 1].trim();
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

window.executarBuscaPedido = function () {
  const input = document.getElementById("inputBuscaPedido");
  if (!input) return;

  // Função interna para remover acentos e converter para minúsculas
  const normalizar = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const termo = normalizar(input.value);
  const itens = document.querySelectorAll(".accordion-item");

  itens.forEach((item) => {
    // Normalizamos o texto do card para a comparação ignorar acentos
    const textoCard = normalizar(item.innerText);

    if (textoCard.includes(termo)) {
      item.style.setProperty("display", "block", "important");
    } else {
      item.style.setProperty("display", "none", "important");
    }
  });
};

// Mantém a busca em tempo real
document.addEventListener("input", function (e) {
  if (e.target.id === "inputBuscaPedido") {
    window.executarBuscaPedido();
  }
});

window.imprimirDetalhePedido = function () {
  // 1. Captura os elementos necessários da modal
  const modalBody = document.querySelector("#modalPedidoDetalhe .modal-body");
  const tituloModal =
    document.querySelector("#modalPedidoDetalhe .modal-title")?.innerText ||
    "Detalhe do Pedido";

  if (!modalBody) {
    alert("Erro: Conteúdo do pedido não encontrado.");
    return;
  }

  // 2. Cria ou recupera o iframe invisível
  let iframe = document.getElementById("printFrame");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "printFrame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  const htmlConteudo = modalBody.innerHTML;

  // 3. Escreve o documento para impressão
  doc.open();
  doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${tituloModal}</title>
            <link rel="stylesheet" href="${window.BASE_URL}/public/css/Bootstrap.css">
            <style>
                body { 
                    padding: 20px; 
                    background: white !important; 
                    font-family: Arial, sans-serif; 
                    font-size: 12pt;
                }
                .print-header { 
                    border-bottom: 2px solid #000; 
                    margin-bottom: 20px; 
                    padding-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .print-title { 
                    font-size: 20pt; 
                    font-weight: bold; 
                    text-transform: uppercase; 
                    margin: 0;
                }
                .print-date { font-size: 10pt; color: #555; }
                
                /* Garante que o Grid do Bootstrap funcione no papel */
                .row { display: flex !important; flex-wrap: wrap !important; width: 100%; }
                .col-6 { width: 50% !important; flex: 0 0 50% !important; }
                
                /* Estilização de Tabelas */
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                .table-light { background-color: #f8f9fa !important; }
                
                /* Força as cores e badges no PDF */
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 10pt; }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1 class="print-title">${tituloModal}</h1>
                <span class="print-date">Emissão: ${new Date().toLocaleDateString("pt-BR")}</span>
            </div>

            <div class="print-content">
                ${htmlConteudo}
            </div>

            <div style="margin-top: 50px; text-align: center; font-size: 9pt; color: #999; border-top: 1px solid #eee; pt-2">
                Sistema de Controle de Laminação - Ficha Técnica de Produção
            </div>
        </body>
        </html>
    `);
  doc.close();

  // 4. Aguarda o carregamento dos estilos e dispara a impressão
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 600); // Tempo extra para garantir o carregamento do Bootstrap.css no iframe
};
