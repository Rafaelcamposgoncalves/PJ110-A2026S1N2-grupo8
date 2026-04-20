console.log("apiUrlPedido existe?", typeof apiUrlPedido);

console.log("pedido-status carregado");

// ===============================
// ABRIR MODAL (NOVO)
// ===============================
window.abrirModalStatus = function (pedidoId) {
  document.getElementById("statusPedidoId").value = pedidoId;
  document.getElementById("statusIndex").value = "";

  document.getElementById("statusStatusId").value = "";
  document.getElementById("statusData").value = "";
  document.getElementById("statusObs").value = "";

  new bootstrap.Modal(document.getElementById("modalStatus")).show();
};

// ===============================
// EDITAR STATUS
// ===============================
window.editarStatus = async function (pedidoId, statusId) {
  const response = await fetch(apiUrlPedido("pedidos-status", pedidoId));
  const lista = await response.json();

  // 🔥 NÃO PRECISA SORT AQUI PRA BUSCAR
  const status = lista.find((s) => Number(s.id) === Number(statusId));

  if (!status) {
    console.log("Status não encontrado:", statusId, lista);
    return;
  }

  document.getElementById("statusPedidoId").value = pedidoId;
  document.getElementById("statusIndex").value = status.id; // agora é ID real

  document.getElementById("statusDescricao").value = status.descricao;
  document.getElementById("statusData").value = status.data?.split(" ")[0];
  document.getElementById("statusObs").value = status.observacao;

  new bootstrap.Modal(document.getElementById("modalStatus")).show();
};
// ===============================
// SALVAR
// ===============================
window.salvarStatus = async function () {
  const pedidoId = document.getElementById("statusPedidoId").value;
  const statusId = document.getElementById("statusIndex").value;

  const body = {
    descricao: document.getElementById("statusDescricao").value,
    data: document.getElementById("statusData").value,
    observacao: document.getElementById("statusObs").value,
    ordem: 0, // backend define ou você controla
  };

  if (statusId) {
    body.id = Number(statusId);
    body._method = "PUT";
  }

  const response = await fetch(apiUrlPedido("pedidos-status", pedidoId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.erro || "Erro ao salvar");
    return;
  }

  bootstrap.Modal.getInstance(document.getElementById("modalStatus")).hide();

  listarPedidosStatus();
};

// ===============================
// EXCLUIR
// ===============================
window.excluirStatus = async function (pedidoId, statusId) {
  if (!confirm("Excluir status?")) return;

  const response = await fetch(apiUrlPedido("pedidos-status", pedidoId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _method: "DELETE",
      id: Number(statusId),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.erro || "Erro ao excluir");
    return;
  }

  listarPedidosStatus();
};

// ===============================
// LISTAGEM
// ===============================
window.listarPedidosStatus = async function () {
  console.log("ENTREI NA FUNÇÃO listarPedidosStatus 🚀");
  const response = await fetch(apiUrlPedido("pedidos"));
  const data = await response.json();

  const lista = document.getElementById("accordionPanelsStayOpenExample");
  lista.innerHTML = "";

  for (const pedido of data) {
    const res = await fetch(apiUrlPedido("pedidos-status", pedido.id_pedido));
    const statusList = await res.json();

    console.log("STATUS RAW:", statusList);
    console.table(statusList);

    // 🔥 ORDEM CORRETA
    statusList.sort((a, b) => b.ordem - a.ordem);

    let timelineHTML = '<div class="timeline">';

    statusList.forEach((st, i) => {
      const isLast = i === statusList.length - 1;

      timelineHTML += `
                <div class="rtimeline">
                    <div class="row">

                        <!-- DATA -->
                        <div class="col-auto d-none d-md-block">
                            <span class="badge rounded-pill text-bg-light">
                                ${st.data ?? ""}
                            </span>
                        </div>

                        <!-- VISUAL -->
                        <div class="col-auto circle">
                            <div></div>
                        </div>

                        <div class="col-auto icon">
                            <i class="fa-solid fa-ellipsis"></i>
                        </div>

                        <!-- CONTEÚDO -->
                        <div class="col col-lg-6">
                            <div class="card text-bg-light shadow-sm">
                                <div class="card-body">

                                    <!-- STATUS (SOMENTE VISUAL) -->
                                    <h5 class="card-title">${st.descricao}</h5>

                                    <!-- OBSERVAÇÃO -->
                                    <p class="card-text">
                                        ${st.observacao ?? ""}
                                    </p>

                                </div>
                            </div>
                        </div>

                        <!-- BOTÕES -->
                        <div class="col-auto">
                            <div class="btn-group btn-group-sm">

                                <!-- EDITAR (SEMPRE) -->
                                <button class="btn btn-outline-secondary btn-sm js-editar-status"
                                    data-id="${pedido.id_pedido}"
                                    data-status-id="${st.id}">
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <!-- EXCLUIR (SÓ O ÚLTIMO) -->
                                ${
                                  isLast
                                    ? `
                                    <button class="btn btn-outline-danger btn-sm"
                                        onclick="excluirStatus(${pedido.id_pedido}, ${st.id})">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                `
                                    : `
                                    <button class="btn btn-outline-danger btn-sm" disabled>
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                `
                                }

                            </div>
                        </div>

                    </div>
                </div>
            `;
    });

    timelineHTML += "</div>";

    lista.innerHTML += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#p${pedido.id_pedido}">
                        Pedido ${pedido.id_pedido}
                    </button>
                </h2>

                <div id="p${pedido.id_pedido}" class="accordion-collapse collapse">
                    <div class="accordion-body">

                        <button class="btn btn-primary btn-sm mb-2"
                            onclick="abrirModalStatus(${pedido.id_pedido})">
                            + Status
                        </button>

                        ${timelineHTML}

                    </div>
                </div>
            </div>
        `;
  }
};

// eventos
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".js-editar-status");
  if (!btn) return;

  window.editarStatus(Number(btn.dataset.id), Number(btn.dataset.statusId));
});

listarPedidosStatus();
