// Garantir que o ID de edição seja global
window.editIdStatus = null;

// Função auxiliar de URL
function apiStatus(id = null) {
  if (id) return `${window.BASE_URL}/api/status/${id}`;
  return `${window.BASE_URL}/api/status`;
}

// 🔥 EXPOSTA PARA O BOTÃO DA SIDEBAR
window.carregarStatus = async function () {
  const container = document.getElementById("conteudo-status");
  try {
    const res = await fetch(`${window.BASE_URL}/views/status/index.html`);
    const html = await res.text();
    container.innerHTML = html;
    window.listarStatus(); // Chama a listagem após carregar o HTML
  } catch (error) {
    console.error("Erro ao carregar view status:", error);
  }
};

// 🔥 EXPOSTA PARA ATUALIZAR A TABELA
window.listarStatus = async function () {
  try {
    const res = await fetch(apiStatus());
    const data = await res.json();
    const lista = document.getElementById("lista-status");
    if (!lista) return;

    lista.innerHTML = "";
    data.forEach((s) => {
      // Adicionado draggable="true" para ativar o suporte ao arrastar
      lista.innerHTML += `
                <tr data-id="${s.id}" draggable="true"> 
                    <td class="reorder-handle" style="cursor: grab;">
                        <i class="fa-solid fa-grip-vertical text-muted"></i> ${s.id}
                    </td>
                    <td>${s.descricao}</td>
                    <td class="col-ordem">${s.ordem}</td>
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
                </tr>`;
    });

    // Só inicializa se o Sortable foi carregado corretamente no index.php
    if (typeof Sortable !== "undefined") {
      new Sortable(lista, {
        animation: 150,
        handle: ".reorder-handle",

        // --- AJUSTES PARA MOBILE ---
        delay: 100, // Tempo pressionando para começar a arrastar (evita o scroll acidental)
        delayOnTouchOnly: true, // O delay só aplica no telemóvel
        touchStartThreshold: 5, // Pixels que o dedo move antes de cancelar o clique
        // ---------------------------

        onEnd: async function () {
          await window.salvarNovaOrdemStatus();
        },
      });
    }
  } catch (error) {
    console.error("Erro na listagem:", error);
  }
};

// FUNÇÃO PARA SALVAR A NOVA ORDEM NO BANCO
window.salvarNovaOrdemStatus = async function () {
  const linhas = document.querySelectorAll("#lista-status tr");
  const novaOrdem = [];

  linhas.forEach((linha, index) => {
    const id = linha.getAttribute("data-id");
    const ordem = index + 1; // Nova ordem baseada na posição visual
    novaOrdem.push({ id, ordem });

    // Atualiza visualmente o número na coluna ordem
    linha.querySelector(".col-ordem").innerText = ordem;
  });

  // Envia para o servidor (precisamos ajustar o Controller para receber lote)
  await fetch(`${window.BASE_URL}/api/status/reordenar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ordens: novaOrdem }),
  });
};

// 🔥 EXPOSTA PARA O BOTÃO DO FORMULÁRIO
window.salvarCadastroStatus = async function () {
  const descricao = document.getElementById("descricao").value;
  const ordem = document.getElementById("ordem").value;

  if (!descricao) return alert("Preencha a descrição");

  let body = { descricao, ordem };
  let url = apiStatus();

  if (window.editIdStatus) {
    body._method = "PUT";
    body.id = window.editIdStatus;
    url = apiStatus(window.editIdStatus);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    window.editIdStatus = null;
    document.getElementById("descricao").value = "";
    document.getElementById("ordem").value = "";
    document.getElementById("btnSubmitStatus").innerHTML =
      '<i class="fa-solid fa-plus"></i> Cadastrar';
    window.listarStatus();
  }
};

// 🔥 EXPOSTA PARA O BOTÃO DE EDITAR NA TABELA
window.editarStatus = function (s) {
  window.editIdStatus = s.id;
  document.getElementById("descricao").value = s.descricao;
  document.getElementById("ordem").value = s.ordem;
  document.getElementById("btnSubmitStatus").innerHTML =
    '<i class="fa-solid fa-save"></i> Atualizar';
  // Faz scroll para o topo do formulário se necessário
  document.getElementById("descricao").focus();
};

// 🔥 EXPOSTA PARA O BOTÃO DE ELIMINAR NA TABELA
window.deletarStatus = async function (id) {
  if (!confirm("Tem certeza que deseja excluir este status?")) return;
  try {
    await fetch(apiStatus(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "DELETE", id: id }),
    });
    window.listarStatus();
  } catch (error) {
    console.error("Erro ao deletar:", error);
  }
};

// 🔥 EXPOSTA PARA O BOTÃO DE BUSCA (LUPA)
window.buscarStatus = function () {
  const termo = document.getElementById("buscarStatus").value.toLowerCase();
  const linhas = document.querySelectorAll("#lista-status tr");

  linhas.forEach((linha) => {
    const textoLinha = linha.textContent.toLowerCase();
    // Se o termo estiver vazio ou contido no texto da linha, exibe; senão, esconde.
    if (textoLinha.includes(termo)) {
      linha.style.display = "";
    } else {
      linha.style.display = "none";
    }
  });
};

// Opcional: Permitir buscar ao apertar ENTER no campo de busca
document.addEventListener("keypress", function (e) {
  if (e.target.id === "buscarStatus" && e.key === "Enter") {
    window.buscarStatus();
  }
});
