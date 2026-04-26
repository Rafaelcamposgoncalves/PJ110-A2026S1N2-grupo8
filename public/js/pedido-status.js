window.excluirStatusSelecionado = null;
window.statusMap = {}; // Cache global dos status

// ===============================
// LISTAR STATUS (TIMELINE)
// ===============================
window.listarPedidosStatus = async function () {
  window.statusMap = {}; // 🔥 LIMPA O CACHE para garantir dados novos após edição/exclusão

  const container = document.getElementById("accordionPanelsStayOpenExample");
  const aberto = container.querySelector(".accordion-collapse.show");
  let idAberto = aberto ? aberto.id : null;

  container.innerHTML = "";

  try {
    const resPedidos = await fetch(
      `${apiUrlPedido("pedidos")}?t=${Date.now()}`,
    );
    const pedidos = await resPedidos.json();

    for (const pedido of pedidos) {
      // Adicionamos um timestamp (t=...) para evitar cache do navegador na busca
      const resStatus = await fetch(
        `${apiUrlPedido("pedidos-status", pedido.id_pedido)}?t=${Date.now()}`,
      );
      const statusList = await resStatus.json();

      // LOGICA PARA DESABILITAR BOTÃO SE FOR O ÚLTIMO STATUS
      const ultimoStatusNoHisto = statusList[0];
      let btnDisabled = "";
      let btnTexto = "Atualizar Status";

      if (ultimoStatusNoHisto) {
        try {
          // Também evitamos cache aqui para o botão atualizar na hora
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
        window.statusMap[st.id_pedido_status] = st;
        timelineHTML += `
                <div class="rtimeline">
                    <div class="row">
                        <div class="col-auto d-none d-md-block">
                            <span class="badge rounded-pill text-bg-light">
                                ${st.data ? new Date(st.data).toLocaleString("pt-BR") : ""}
                            </span>
                        </div>
                        <div class="col col-lg-6">
                            <div class="card text-bg-light shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">${st.descricao}</h5>
                                    <p class="card-text">${st.observacao ?? ""}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-auto">
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-secondary js-editar-status" data-id="${pedido.id_pedido}" data-status-id="${st.id_pedido_status}">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                ${
                                  isMaisRecente
                                    ? `
                                    <button class="btn btn-outline-danger" onclick="abrirModalStatusExcluir(${st.id_pedido_status})">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                `
                                    : `
                                    <button class="btn btn-outline-danger" disabled>
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                `
                                }
                            </div>
                        </div>
                    </div>
                </div>`;
      });

      timelineHTML += "</div>";

      container.innerHTML += `
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
                            <button class="btn btn-primary btn-sm" ${btnDisabled} onclick="abrirModalStatus(${pedido.id_pedido})">
                                <i class="fa-solid fa-add"></i> ${btnTexto}
                            </button>
                        </div>
                        ${timelineHTML}
                    </div>
                </div>
            </div>`;
    }

    if (idAberto) {
      const el = document.getElementById(idAberto);
      if (el) {
        // Busca o botão ou o cabeçalho do acordeão para rolar para ele, não para o corpo
        const header = el.closest(".accordion-item");

        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(el, {
          toggle: false,
        });
        bsCollapse.show();

        setTimeout(() => {
          // Rola para o item respeitando o scroll-margin-top do CSS
          header.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  } catch (err) {
    console.error("Erro ao listar status:", err);
  }
};

// ===============================
// SALVAR STATUS (AJUSTADO)
// ===============================
window.salvarStatusPedido = async function () {
  const idPedido = document.getElementById("statusPedidoId").value;
  const idStatusItem = document.getElementById("statusIndex")?.value;
  const data = document.getElementById("statusData").value;
  const obs = document.getElementById("statusObs").value;
  const idStatus = document.getElementById("statusIdReal")?.value || 1;
  const idUsuario = window.usuarioId || 1;

  try {
    let body = {
      id_pedido: idPedido,
      id_status: idStatus,
      id_usuario: idUsuario,
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

    const modalEl = document.getElementById("modalStatus");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    // 🔥 Aumentamos o tempo e usamos await para garantir que a lista reflita o banco
    setTimeout(async () => {
      await listarPedidosStatus();
    }, 500);
  } catch (err) {
    console.error("Erro ao salvar:", err);
  }
};

// ===============================
// EXCLUIR STATUS (AJUSTADO)
// ===============================
window.excluirStatusPedido = async function (id) {
  try {
    const url = apiUrlPedido("pedidos-status") + "?id_pedido_status=" + id;
    const res = await fetch(url, { method: "DELETE" });
    const result = await res.json();
    if (typeof showToast === "function") showToast("Status do Pedido", result);

    const modalEl = document.getElementById("modalStatusExcluir");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

    // 🔥 Recarrega a lista após excluir
    setTimeout(async () => {
      await listarPedidosStatus();
    }, 500);
  } catch (err) {
    console.error("Erro ao excluir:", err);
  }
};

// ... (abrirModalStatus e eventos permanecem iguais) ...
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
    inputData.value = new Date().toISOString().slice(0, 16);
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

window.abrirModalStatusExcluir = function (id) {
  const btn = document.querySelector("#btnConfirmarExcluir");
  btn.onclick = () => excluirStatusPedido(id);
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalStatusExcluir"),
  ).show();
};

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".js-editar-status");
  if (btn) abrirModalStatus(btn.dataset.id, btn.dataset.statusId);
});

window.initPedidoStatus = () => {
  listarPedidosStatus();
};
