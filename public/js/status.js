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

    // 1. Limpa a lista
    lista.innerHTML = "";

    // 2. Alimenta a tabela
    data.forEach((s) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-id", s.id);
      tr.setAttribute("draggable", "true"); // Força o atributo nativo

      tr.innerHTML = `
                <td class="reorder-handle" style="cursor: grab;">
                    <i class="fa-solid fa-grip-vertical text-muted me-2"></i>${s.id}
                </td>
                <td>${s.descricao}</td>
                <td class="col-ordem">${s.ordem}</td>
                <td class="text-center">
                    <div class="form-check form-switch d-inline-block">
                        <input class="form-check-input" type="checkbox" role="switch" 
                            ${s.ativo == 1 ? "checked" : ""} 
                            onchange="window.alternarAtivoStatus(${s.id}, this.checked)">
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" onclick='window.editarStatus(${JSON.stringify(s)})'>
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick='window.deletarStatus(${s.id})'>
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
      lista.appendChild(tr);
    });

    // 3. Reinicializa o Sortable (Garante que a instância antiga não bloqueie a nova)
    if (typeof Sortable !== "undefined") {
      let oldSortable = Sortable.get(lista);
      if (oldSortable) oldSortable.destroy();

      new Sortable(lista, {
        animation: 150,
        handle: ".reorder-handle",
        draggable: "tr",

        // --- CONFIGURAÇÕES CRÍTICAS PARA MOBILE ---
        delay: 200, // Precisa segurar o dedo por 200ms para começar a arrastar
        delayOnTouchOnly: true, // No PC (mouse) o arrasto continua instantâneo
        touchStartThreshold: 5, // Se o dedo mover mais de 5px, ele cancela o drag (entende como scroll)
        direction: "vertical",
        // ------------------------------------------

        onEnd: async function () {
          await window.salvarNovaOrdemStatus();
        },
      });
    }
  } catch (error) {
    console.error("Erro ao listar:", error);
  }
};

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
      linha.querySelector(".col-ordem").innerText = i + 1;
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
  const ordem = document.getElementById("ordem").value;
  if (!descricao) return alert("Preencha a descrição");

  let body = { descricao, ordem, id: window.editIdStatus };
  if (window.editIdStatus) body._method = "PUT";

  const res = await fetch(apiStatus(window.editIdStatus), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    window.editIdStatus = null;
    document.getElementById("descricao").value = "";
    document.getElementById("btnSubmitStatus").innerHTML =
      '<i class="fa-solid fa-plus"></i> Cadastrar';
    window.listarStatus();
  }
};

// Altere a sua função editarStatus existente
window.editarStatus = function (s) {
  window.editIdStatus = s.id;
  document.getElementById("descricao").value = s.descricao;
  document.getElementById("ordem").value = s.ordem;

  // Altera o botão principal
  document.getElementById("btnSubmitStatus").innerHTML =
    '<i class="fa-solid fa-save"></i> Atualizar';
  document
    .getElementById("btnSubmitStatus")
    .classList.replace("btn-primary", "btn-success");

  // 🔥 MOSTRA o botão cancelar
  document.getElementById("btnCancelarEdicao").classList.remove("d-none");

  document.getElementById("descricao").focus();
};

// 🔥 NOVA FUNÇÃO: Reseta o formulário para o estado de "Cadastrar"
window.cancelarEdicaoStatus = function () {
  window.editIdStatus = null;

  // Limpa os campos
  document.getElementById("descricao").value = "";
  document.getElementById("ordem").value = "";

  // Volta o botão principal ao normal
  document.getElementById("btnSubmitStatus").innerHTML =
    '<i class="fa-solid fa-plus"></i> Cadastrar';
  document
    .getElementById("btnSubmitStatus")
    .classList.replace("btn-success", "btn-primary");

  // 🔥 ESCONDE o botão cancelar
  document.getElementById("btnCancelarEdicao").classList.add("d-none");
};

// DICA: Adicione a chamada do cancelar dentro do salvarCadastroStatus após o sucesso:
// No final do seu 'if (res.ok) { ... }' adicione:
// window.cancelarEdicaoStatus();

window.deletarStatus = async (id) => {
  if (!confirm("Tem certeza que deseja excluir este status?")) return;

  try {
    const res = await fetch(apiStatus(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "DELETE" }),
    });

    const result = await res.json();

    if (res.ok) {
      if (typeof showToast === "function")
        showToast("Status", { mensagem: result.mensagem });
      window.listarStatus();
    } else {
      // Aqui ele captura a mensagem de "Não é possível excluir..." enviada pelo PHP
      if (typeof showToast === "function") {
        showToast("Status", {
          erro: result.erro,
          mensagem: result.mensagem,
        });
      }
    }
  } catch (error) {
    console.error("Erro ao deletar:", error);
    if (typeof showToast === "function")
      showToast("Erro", { erro: "Falha na comunicação com o servidor." });
  }
};
