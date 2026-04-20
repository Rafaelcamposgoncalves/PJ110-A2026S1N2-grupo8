console.log("pedido-status carregado");

// ===============================
// GARANTE API GLOBAL
// ===============================
if (typeof apiUrlPedido !== "function") {
  window.BASE_URL = window.location.origin + "/teste";

  window.apiUrlPedido = function (recurso, id = null) {
    if (id) return `${window.BASE_URL}/api/${recurso}/${id}`;
    return `${window.BASE_URL}/api/${recurso}`;
  };
}

// ===============================
// ABRIR MODAL (NOVO)
// ===============================
window.abrirModalStatus = function (pedidoId) {
  document.getElementById("statusPedidoId").value = pedidoId;
  document.getElementById("statusIndex").value = "";

  document.getElementById("statusDescricao").value = "";
  document.getElementById("statusData").value = "";
  document.getElementById("statusObs").value = "";

  new bootstrap.Modal(document.getElementById("modalStatus")).show();
};

// ===============================
// EDITAR STATUS
// ===============================
window.editarStatus = async function (pedidoId, statusId) {
  console.log("🔍 Editar:", pedidoId, statusId);

  if (!statusId || isNaN(statusId)) {
    console.error("❌ ID inválido:", statusId);
    return;
  }

  const response = await fetch(apiUrlPedido("pedidos-status", pedidoId));
  const lista = await response.json();

  console.table(lista);

  const status = lista.find(
    (s) => Number(s.id_pedido_status) === Number(statusId),
  );

  if (!status) {
    console.error("❌ Status não encontrado:", statusId);
    return;
  }

  // preencher modal
  document.getElementById("statusPedidoId").value = pedidoId;
  document.getElementById("statusIndex").value = status.id_pedido_status;

  document.getElementById("statusDescricao").value = status.descricao;
  document.getElementById("statusData").value =
    status.data?.split(" ")[0] || "";

  document.getElementById("statusObs").value = status.observacao || "";

  new bootstrap.Modal(document.getElementById("modalStatus")).show();
};

// ===============================
// SALVAR STATUS
// ===============================
window.salvarStatus = async function () {
  const pedidoId = document.getElementById("statusPedidoId").value;
  const statusId = document.getElementById("statusIndex").value;

  const body = {
    descricao: document.getElementById("statusDescricao").value,
    data: document.getElementById("statusData").value,
    observacao: document.getElementById("statusObs").value,
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
// EXCLUIR STATUS
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
// LISTAR STATUS (TIMELINE)
// ===============================
window.listarPedidosStatus = async function () {
  const container = document.getElementById("accordionPanelsStayOpenExample");

  if (!container) {
    console.error("❌ Container não encontrado");
    return;
  }

  container.innerHTML = "";

  const response = await fetch(apiUrlPedido("pedidos"));
  const pedidos = await response.json();

  for (const pedido of pedidos) {
    const res = await fetch(apiUrlPedido("pedidos-status", pedido.id_pedido));
    const statusList = await res.json();

    let timelineHTML = '<div class="timeline">';

    statusList.forEach((st, i) => {
      const isLast = i === 0; // mais recente primeiro

      timelineHTML += `
        <div class="rtimeline">
          <div class="row">

            <div class="col-auto d-none d-md-block">
              <span class="badge rounded-pill text-bg-light">
                ${st.data ?? ""}
              </span>
            </div>

            <div class="col-auto circle"><div></div></div>
            <div class="col-auto icon">
              <i class="fa-solid fa-ellipsis"></i>
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

                <button class="btn btn-outline-secondary btn-sm js-editar-status"
                  data-id="${pedido.id_pedido}"
                  data-status-id="${st.id_pedido_status}">
                  <i class="fa-solid fa-pen"></i>
                </button>

                ${
                  isLast
                    ? `
                    <button class="btn btn-outline-danger btn-sm"
                      onclick="excluirStatus(${pedido.id_pedido}, ${st.id_pedido_status})">
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

    container.innerHTML += `
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

// ===============================
// EVENTO CLICK GLOBAL
// ===============================
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".js-editar-status");
  if (!btn) return;

  //console.log("DATASET:", btn.dataset);

  const pedidoId = Number(btn.dataset.id);
  const statusId = Number(btn.dataset.statusId);
  console.log(statusId);

  if (isNaN(statusId)) {
    console.error("❌ statusId inválido:", btn.dataset);
    return;
  }

  editarStatus(pedidoId, statusId);
});

// ===============================
// INIT
// ===============================
window.initPedidoStatus = function () {
  listarPedidosStatus();
};
