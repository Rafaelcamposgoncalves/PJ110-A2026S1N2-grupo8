window.editIdStatus = null;

function apiStatus(id = null) {
  if (id) return `${window.BASE_URL}/api/status/${id}`;
  return `${window.BASE_URL}/api/status`;
}

window.carregarStatus = async function () {
  const container = document.getElementById("conteudo-status");
  const res = await fetch(`${window.BASE_URL}/views/status/index.html`);
  container.innerHTML = await res.text();
  window.listarStatus();
};

window.listarStatus = async function () {
  try {
    const res = await fetch(apiStatus());
    const data = await res.json();
    const lista = document.getElementById("lista-status");
    if (!lista) return;

    lista.innerHTML = "";
    data.forEach((s) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-id", s.id);
      tr.setAttribute("draggable", "true");
      tr.innerHTML = `
                <td class="reorder-handle text-center" style="cursor: grab;">
                    <i class="fa-solid fa-grip-vertical text-muted me-2"></i>
                </td>
                <td>${s.descricao}</td>
                <td class="text-center">
                    <div class="form-check form-switch d-inline-block">
                        <input class="form-check-input" type="checkbox" role="switch" ${s.ativo == 1 ? "checked" : ""} onchange="window.alternarAtivoStatus(${s.id}, this.checked)">
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" onclick='window.editarStatus(${JSON.stringify(s)})'>
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <!-- 🔥 AJUSTE: Agora chama abrirModalStatusExcluir em vez de deletarStatus direto -->
                        <button class="btn btn-outline-danger" onclick='window.abrirModalStatusExcluir(${s.id})'>
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
                <td class="col-ordem d-none">${s.ordem}</td>
            `;
      lista.appendChild(tr);
    });

    if (typeof Sortable !== "undefined") {
      let oldSortable = Sortable.get(lista);
      if (oldSortable) oldSortable.destroy();
      new Sortable(lista, {
        animation: 150,
        handle: ".reorder-handle",
        draggable: "tr",
        delay: 100,
        delayOnTouchOnly: true,
        touchStartThreshold: 5,
        direction: "vertical",
        onEnd: async function () {
          await window.salvarNovaOrdemStatus();
        },
      });
    }
  } catch (error) {
    console.error("Erro ao listar:", error);
  }
};

// ===============================
// 🔥 NOVO: GESTÃO DO MODAL DE EXCLUSÃO (IGUAL AO SHAPER)
// ===============================
window.abrirModalStatusExcluir = function (id) {
  const modalElement = document.getElementById("modalStatusExcluirBase");
  const btnConfirmar = document.getElementById("btnConfirmarExcluirStatus");

  if (btnConfirmar) {
    btnConfirmar.onclick = async () => {
      await window.deletarStatus(id);
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalInstance.hide();
    };
  }
  bootstrap.Modal.getOrCreateInstance(modalElement).show();
};

window.deletarStatus = async (id) => {
  try {
    const res = await fetch(apiStatus(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "DELETE" }),
    });

    // Tenta ler o JSON vindo do PHP
    const result = await res.json();

    if (res.ok) {
      // Caso de Sucesso (Status 200)
      if (typeof showToast === "function") showToast("Sucesso", result);
      window.listarStatus();
    } else {
      // Caso de Erro de Negócio (Status 400 - ex: Status em uso)
      // Mostra a mensagem exata que veio do PHP
      if (typeof showToast === "function") {
        showToast("Atenção", {
          erro: result.erro || "Impedimento",
          mensagem: result.mensagem || "Não foi possível excluir.",
        });
      }
    }
  } catch (error) {
    // Erro de rede ou crash do servidor
    console.error("Erro na comunicação:", error);
  }
};

// --- Restante das suas funções (Mantidas como no seu código funcional) ---

window.alternarAtivoStatus = async function (id, isChecked) {
  await fetch(apiStatus(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _method: "PUT",
      id: id,
      ativo: isChecked ? 1 : 0,
      somenteAtivo: true,
    }),
  });
};

window.salvarNovaOrdemStatus = async function () {
  const ordens = Array.from(document.querySelectorAll("#lista-status tr")).map(
    (linha, i) => {
      const id = linha.getAttribute("data-id");
      const colOrdem = linha.querySelector(".col-ordem");
      if (colOrdem) colOrdem.innerText = i + 1;
      return { id, ordem: i + 1 };
    },
  );
  await fetch(apiStatus(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ordens }),
  });
};

window.salvarCadastroStatus = async function () {
  const descricao = document.getElementById("descricao").value;

  if (!descricao) {
    if (typeof showToast === "function")
      showToast("Atenção", { erro: "Preencha a descrição" });
    return;
  }

  let body = { descricao, id: window.editIdStatus };
  if (window.editIdStatus) {
    body._method = "PUT";
    body.ordem = document.getElementById("ordem").value;
  } else {
    const linhas = document.querySelectorAll("#lista-status tr");
    body.ordem = linhas.length + 1;
  }
  const res = await fetch(apiStatus(window.editIdStatus), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    window.cancelarEdicaoStatus();
    window.listarStatus();
  }
};

window.editarStatus = function (s) {
  window.editIdStatus = s.id;
  document.getElementById("descricao").value = s.descricao;
  document.getElementById("ordem").value = s.ordem;
  document.getElementById("btnSubmitStatus").innerHTML =
    '<i class="fa-solid fa-save"></i> Atualizar';
  document
    .getElementById("btnSubmitStatus")
    .classList.replace("btn-primary", "btn-success");
  document.getElementById("btnCancelarEdicao").classList.remove("d-none");
  document.getElementById("descricao").focus();
};

window.cancelarEdicaoStatus = function () {
  window.editIdStatus = null;
  document.getElementById("descricao").value = "";
  document.getElementById("ordem").value = "";
  document.getElementById("btnSubmitStatus").innerHTML =
    '<i class="fa-solid fa-plus"></i> Cadastrar';
  document
    .getElementById("btnSubmitStatus")
    .classList.replace("btn-success", "btn-primary");
  document.getElementById("btnCancelarEdicao").classList.add("d-none");
};

window.buscarStatus = function () {
  const termo = document.getElementById("buscarStatus").value.toLowerCase();
  const linhas = document.querySelectorAll("#lista-status tr");
  linhas.forEach((linha) => {
    const textoLinha = linha.textContent.toLowerCase();
    linha.style.display = textoLinha.includes(termo) ? "" : "none";
  });
};
