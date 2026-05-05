window.excluirStatusSelecionado = null;
window.statusMap = {};

// ===============================
// LISTAR STATUS (TIMELINE)
// ===============================
window.listarPedidosStatus = async function () {
  window.statusMap = {};
  const container = document.getElementById("accordionPanelsStayOpenExample");
  if (!container) return;

  const aberto = container.querySelector(".accordion-collapse.show");
  let idAberto = aberto ? aberto.id : null;

  // 🔥 Skeleton Screen (Efeito de carregamento)
  const skeletonHTML = `
        <div class="accordion-item placeholder-glow" aria-hidden="true">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed disabled" type="button">
                    <div class="container-fluid">
                        <div class="row align-items-center">
                            <div class="col-8"><span class="placeholder col-6"></span></div>
                            <div class="col-auto ms-auto"><span class="placeholder col-3"></span></div>
                        </div>
                    </div>
                </button>
            </h2>
        </div>`.repeat(4);

  container.innerHTML = skeletonHTML;

  try {
    const resPedidos = await fetch(
      `${apiUrlPedido("pedidos")}?t=${Date.now()}`,
    );
    const pedidos = await resPedidos.json();

    let htmlFinal = ""; // Acumula o HTML para injetar de uma vez só (melhora performance e evita bugs de DOM)

    for (const pedido of pedidos) {
      const resStatus = await fetch(
        `${apiUrlPedido("pedidos-status", pedido.id_pedido)}?t=${Date.now()}`,
      );
      const statusList = await resStatus.json();

      const ultimoStatusNoHisto = statusList[0];
      let btnDisabled = "";
      let btnTexto = "Atualizar Status";

      if (ultimoStatusNoHisto) {
        try {
          const resProx = await fetch(
            `${apiUrlPedido("status")}/proximo?id_atual=${ultimoStatusNoHisto.id_status}&t=${Date.now()}`,
          );
          const proximo = await resProx.json();
          if (!proximo || !proximo.id_status) {
            btnDisabled = "disabled";
            btnTexto = "Pedido Finalizado";
          }
        } catch (e) {
          console.error("Erro ao checar fluxo", e);
        }
      }

      let timelineHTML = '<div class="timeline">';
      statusList.forEach((st, i) => {
        const isMaisRecente = i === 0;
        const isPrimeiroStatusCriado = i === statusList.length - 1; // O primeiro registro (está no fundo)
        window.statusMap[st.id_pedido_status] = st;

        // Lógica dos Ícones
        let iconeHTML = "";

        if (isPrimeiroStatusCriado) {
          // O Primeirão lá de baixo: Bandeira de linha (Início)
          iconeHTML = '<i class="fa-regular fa-flag"></i>';
        } else if (isMaisRecente) {
          // O atual (Topo)
          if (btnDisabled === "disabled") {
            // Se não tem próximo status: Bandeira Finalizada (Chegada)
            iconeHTML = '<i class="fa-solid fa-flag-checkered"></i>';
          } else {
            // Se ainda tem próximos status: Pontinhos (Em andamento)
            iconeHTML = '<i class="fa-solid fa-ellipsis"></i>';
          }
        } else {
          // Todos os do meio: Bolinha
          iconeHTML = '<i class="fa-solid fa-ellipsis"></i>';
        }

        timelineHTML += `
<div class="rtimeline mb-3">
    <div class="row">
        <div class="col-auto d-none d-md-block">
            <span class="badge rounded-pill text-bg-light">
                ${st.data ? new Date(st.data).toLocaleString("pt-BR") : ""}
            </span>
        </div>
        <div class="col-auto circle"><div></div></div>
        <div class="col-auto icon">
            ${iconeHTML}
        </div>
        <div class="col col-lg-6">
            <div class="card text-bg-light shadow-sm">
                <div class="card-body">
                    <div class="row">
                        <div class="col-sm-6 col-md-12">
                            <h5 class="card-title">${st.descricao}</h5>
                        </div>
                        <div class="col-sm-6 col-md-12">
                            <h6 class="card-subtitle mb-2 text-body-secondary float-start float-md-end d-md-none">
                                ${st.data ? new Date(st.data).toLocaleString("pt-BR") : ""}
                            </h6>
                        </div>
                    </div>
                    <p class="card-text">${st.observacao ?? ""}</p>
                </div>
                
                <!-- FOOTER AJUSTADO: Alinhado à direita e fundo transparente -->
                <div class="card-footer bg-transparent border-top-0 d-flex justify-content-end pb-3">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary js-editar-status" 
                            data-id="${pedido.id_pedido}" 
                            data-status-id="${st.id_pedido_status}">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        ${
                          isMaisRecente
                            ? `<button class="btn btn-outline-danger" onclick="window.abrirModalPedidoStatusExcluir(${st.id_pedido_status})">
                                <i class="fa-solid fa-trash"></i>
                            </button>`
                            : `<button class="btn btn-outline-danger" disabled><i class="fa-solid fa-trash"></i></button>`
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
      });

      timelineHTML += "</div>";

      htmlFinal += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#p${pedido.id_pedido}">
                            <div class="container-fluid">
                                <div class="row align-items-center">
                                    <div class="col">${pedido.id_pedido} - ${pedido.shaper}</div>
                                    <div class="col-auto"><span class="badge rounded-pill text-bg-info">${pedido.data}</span></div>
                                </div>
                            </div>
                        </button>
                    </h2>
                    <div id="p${pedido.id_pedido}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <div class="text-end mb-2">
                                <button class="btn btn-primary btn-sm" ${btnDisabled} onclick="window.abrirModalStatus(${pedido.id_pedido})">
                                    <i class="fa-solid fa-add"></i> ${btnTexto}
                                </button>
                            </div>
                            ${timelineHTML}
                        </div>
                    </div>
                </div>`;
    }

    container.innerHTML = htmlFinal;

    if (idAberto) {
      const el = document.getElementById(idAberto);
      if (el) {
        bootstrap.Collapse.getOrCreateInstance(el, { toggle: false }).show();
      }
    }
  } catch (err) {
    console.error("Erro ao listar status:", err);
    container.innerHTML =
      '<div class="alert alert-danger">Falha ao carregar timeline de pedidos.</div>';
  }
};

// ===============================
// EXCLUIR STATUS (MODAL FIX)
// ===============================
window.abrirModalPedidoStatusExcluir = function (id) {
  const modalEl = document.getElementById("modalStatusExcluir");
  const btnSim = document.getElementById("btnConfirmarExcluir");

  if (!modalEl) return console.error("Modal não encontrado");

  // 1. Configura o clique do botão Sim
  btnSim.onclick = async () => {
    await window.excluirStatusPedido(id);
    const inst = bootstrap.Modal.getInstance(modalEl);
    if (inst) inst.hide();
  };

  // 2. LIMPEZA TOTAL (Vacinando contra o erro de backdrop e z-index)
  let modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) {
    modalInstance.dispose(); // Remove vestígios da memória
  }

  // 3. REMOVE CLASSES QUE PODEM ESTAR A ESCONDER O MODAL MANUALMENTE
  modalEl.classList.remove("show");
  modalEl.style.display = "none";

  // 4. FORÇA A CRIAÇÃO E ABERTURA
  const novoModal = new bootstrap.Modal(modalEl, {
    backdrop: true,
    keyboard: true,
    focus: true,
  });

  novoModal.show();

  // 5. TESTE DE EMERGÊNCIA: Se após 500ms não houver a classe 'show', forçamos via CSS
  setTimeout(() => {
    if (!modalEl.classList.contains("show")) {
      console.warn("Bootstrap falhou ao mostrar, forçando via CSS...");
      modalEl.style.display = "block";
      modalEl.classList.add("show");
      document.body.classList.add("modal-open");
      // Cria o fundo escuro manualmente se necessário
      if (!document.querySelector(".modal-backdrop")) {
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);
      }
    }
  }, 500);
};

window.excluirStatusPedido = async function (id) {
  try {
    const res = await fetch(
      apiUrlPedido("pedidos-status") + "?id_pedido_status=" + id,
      { method: "DELETE" },
    );
    const result = await res.json();
    if (typeof showToast === "function") showToast("Status do Pedido", result);

    const modalInstance = bootstrap.Modal.getInstance(
      document.getElementById("modalStatusExcluir"),
    );
    if (modalInstance) modalInstance.hide();

    setTimeout(() => window.listarPedidosStatus(), 500);
  } catch (err) {
    console.error("Erro ao excluir:", err);
  }
};

// ===============================
// SALVAR STATUS
// ===============================
window.salvarStatusPedido = async function () {
  const idPedido = document.getElementById("statusPedidoId").value;
  const idStatusItem = document.getElementById("statusIndex")?.value;
  const data = document.getElementById("statusData").value;
  const obs = document.getElementById("statusObs").value;
  const idStatus = document.getElementById("statusIdReal")?.value || 1;

  try {
    let body = {
      id_pedido: idPedido,
      id_status: idStatus,
      id_usuario: window.usuarioId || 1,
      data: data,
      observacao: obs,
    };
    let url = apiUrlPedido("pedidos-status");
    let method = idStatusItem ? "PUT" : "POST";
    if (idStatusItem) url = apiUrlPedido("pedidos-status", idStatusItem);

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await res.json();

    if (typeof showToast === "function") showToast("Status do Pedido", result);

    const modalInstance = bootstrap.Modal.getInstance(
      document.getElementById("modalStatus"),
    );
    if (modalInstance) modalInstance.hide();

    setTimeout(() => window.listarPedidosStatus(), 500);
  } catch (err) {
    console.error("Erro ao salvar:", err);
  }
};

// ===============================
// ABRIR MODAL STATUS (EDITAR/ADICIONAR)
// ===============================
window.abrirModalStatus = async function (idPedido, idStatus = null) {
  const inputPedidoId = document.getElementById("statusPedidoId");
  const inputDescricao = document.getElementById("statusDescricao");
  const inputData = document.getElementById("statusData");
  const inputObs = document.getElementById("statusObs");
  const inputStatusIndex = document.getElementById("statusIndex");
  const inputIdStatusReal = document.getElementById("statusIdReal");

  inputPedidoId.value = idPedido;
  inputStatusIndex.value = idStatus || "";

  if (!idStatus) {
    const statusDestePedido = Object.values(window.statusMap)
      .filter((st) => st.id_pedido == idPedido)
      .sort((a, b) => Number(b.id_pedido_status) - Number(a.id_pedido_status));
    const ultimo = statusDestePedido[0];
    let idCategoriaAtual = ultimo ? ultimo.id_status : 0;

    try {
      const res = await fetch(
        `${apiUrlPedido("status")}/proximo?id_atual=${idCategoriaAtual}&t=${Date.now()}`,
      );
      const proximo = await res.json();
      if (proximo && proximo.id_status) {
        inputDescricao.value = proximo.descricao;
        if (inputIdStatusReal) inputIdStatusReal.value = proximo.id_status;
      } else {
        inputDescricao.value = ultimo ? "Finalizado" : "Novo Status";
        if (inputIdStatusReal) inputIdStatusReal.value = idCategoriaAtual;
      }
    } catch (err) {
      inputDescricao.value = "Novo Status";
    }

    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    inputData.value = agora.toISOString().slice(0, 16);
    inputObs.value = "";
  } else {
    const st = window.statusMap[idStatus];
    if (!st) return;
    inputDescricao.value = st.descricao || "";
    if (inputIdStatusReal) inputIdStatusReal.value = st.id_status;
    inputData.value = st.data ? st.data.replace(" ", "T").slice(0, 16) : "";
    inputObs.value = st.observacao || "";
  }

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalStatus"),
  ).show();
};

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".js-editar-status");
  if (btn) window.abrirModalStatus(btn.dataset.id, btn.dataset.statusId);
});

window.initPedidoStatus = () => {
  window.listarPedidosStatus();
};

window.solicitarExclusaoGerenciamento = function (id, acaoDeletar) {
  const modalEl = document.getElementById("modalExcluirGerenciamento");
  const btnSim = document.getElementById("btnConfirmarExcluirGerenciamento");

  // Define o que o botão Sim vai fazer nesta abertura específica
  btnSim.onclick = async () => {
    await acaoDeletar(id);
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  };

  // Limpa erro de backdrop e abre
  let inst = bootstrap.Modal.getInstance(modalEl);
  if (inst) inst.dispose();
  new bootstrap.Modal(modalEl).show();
};
