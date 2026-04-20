// ===============================
// CONTROLE GLOBAL
// ===============================
let contextoAtual = null;
let editIdGenerico = null;

// ===============================
// CONFIG DOS CAMPOS
// ===============================
const modalConfigs = {
  composicao: {
    icon: '<i class="fa-solid fa-flask"></i>',
    titulo: "Gerenciar Composição",
    label: "Composição",
    selectId: "id_composicaoPedido",
    recurso: "composicoes",
  },
  variacao: {
    icon: '<i class="fa-solid fa-sliders"></i>',
    titulo: "Gerenciar Variação",
    label: "Variação",
    selectId: "id_variacaoPedido",
    recurso: "variacoes",
  },
  acabamento: {
    icon: '<i class="fa-solid fa-brush"></i>',
    titulo: "Gerenciar Acabamento",
    label: "Acabamento",
    selectId: "id_acabamentoPedido",
    recurso: "acabamentos",
  },
  configQuilha: {
    icon: '<i class="fa-solid fa-sliders"></i>',
    titulo: "Gerenciar Config. Quilha",
    label: "Configuração de Quilha",
    selectId: "id_configuracaoquilhaPedido",
    recurso: "configuracaoquilhas",
  },
  sistemaQuilha: {
    icon: '<i class="fa-solid fa-sitemap"></i>',
    titulo: "Gerenciar Sistema Quilha",
    label: "Sistema de Quilha",
    selectId: "id_sistemaquilhaPedido",
    recurso: "sistemaquilhas",
  },
  cores: {
    icon: '<i class="fa-solid fa-fill-drip"></i>',
    titulo: "Gerenciar Cores",
    label: "Cor",
    selectId: "id_cor",
    recurso: "cores",
  },
  tecido: {
    icon: '<i class="fa-solid fa-layer-group"></i>',
    titulo: "Gerenciar Tecidos",
    label: "Tecido",
    selectId: "id_tecidoPedido",
    recurso: "tecidos",
  },
};

// ===============================
// ABRIR MODAL
// ===============================
window.abrirModalGenerico = function (tipo) {
  contextoAtual = modalConfigs[tipo];
  editIdGenerico = null;

  if (!contextoAtual) return;

  document.querySelector("#modalGenerico .modal-title").innerHTML =
    contextoAtual.icon + " " + contextoAtual.titulo;

  const input = document.getElementById("modalInput");
  input.value = "";
  input.placeholder = contextoAtual.label;

  resetModalState();
  carregarListaModal();

  const modal = new bootstrap.Modal(document.getElementById("modalGenerico"));
  modal.show();
};

// ===============================
// LISTAR
// ===============================
async function carregarListaModal() {
  if (!contextoAtual) return;

  const response = await fetch(`${BASE_URL}/api/${contextoAtual.recurso}`);
  const data = await response.json();

  const lista = document.getElementById("listaComposicoesModal");
  lista.innerHTML = "";

  data.forEach((item) => {
    const id = item.id || Object.values(item)[0];
    const descricao = item.descricao || item.nome;

    lista.innerHTML += `
        <tr>
          <td>${id}</td>
          <td>${descricao}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary"
                onclick='editarItem(${id}, ${JSON.stringify(descricao)})'>
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary"
                onclick="deletarItem(${id})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
  });
}

// ===============================
// SALVAR / EDITAR
// ===============================
window.salvarComposicao = async function () {
  const valor = document.getElementById("modalInput").value.trim();

  if (!valor) {
    alert("Digite algo");
    return;
  }

  let url = `${BASE_URL}/api/${contextoAtual.recurso}`;
  let body = { descricao: valor };

  if (editIdGenerico) {
    body._method = "PUT";
    url = `${BASE_URL}/api/${contextoAtual.recurso}/${editIdGenerico}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.erro);
    return;
  }

  resetModalState();
  carregarListaModal();
  if (typeof popularSelects === "function") popularSelects();
};

// ===============================
// EDITAR
// ===============================
window.editarItem = function (id, descricao) {
  editIdGenerico = id;

  document.getElementById("modalInput").value = descricao;

  const btnSalvar = document.getElementById("btnSalvarComposicao");
  const btnCancelar = document.getElementById("btnCancelarComposicao");

  btnSalvar.textContent = "Editar";
  btnSalvar.classList.remove("btn-primary");
  btnSalvar.classList.add("btn-warning");

  btnCancelar.classList.remove("d-none");
};

// ===============================
// EXCLUIR
// ===============================
window.deletarItem = async function (id) {
  if (!confirm("Excluir este item?")) return;

  const response = await fetch(
    `${BASE_URL}/api/${contextoAtual.recurso}/${id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "DELETE" }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.erro);
    return;
  }

  carregarListaModal();
  if (typeof popularSelects === "function") popularSelects();
};

// ===============================
// RESET
// ===============================
function resetModalState() {
  editIdGenerico = null;

  document.getElementById("modalInput").value = "";

  const btnSalvar = document.getElementById("btnSalvarComposicao");
  const btnCancelar = document.getElementById("btnCancelarComposicao");

  btnSalvar.innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar';
  btnSalvar.classList.remove("btn-warning");
  btnSalvar.classList.add("btn-primary");

  btnCancelar.classList.add("d-none");
}

window.cancelarEdicaoComposicao = function () {
  resetModalState();
};

// ===============================
// EXCLUIR DIRETO DO SELECT
// ===============================
window.excluirSelecionado = async function (tipo) {
  const map = {
    composicao: "id_composicaoPedido",
    variacao: "id_variacaoPedido",
    acabamento: "id_acabamentoPedido",
    configQuilha: "id_configuracaoquilhaPedido",
    sistemaQuilha: "id_sistemaquilhaPedido",
    cores: "id_cor",
    tecido: "id_tecidoPedido",
  };

  const recursoMap = {
    composicao: "composicoes",
    variacao: "variacoes",
    acabamento: "acabamentos",
    configQuilha: "configuracaoquilhas",
    sistemaQuilha: "sistemaquilhas",
    cores: "cores",
    tecido: "tecidos",
  };

  const select = document.getElementById(map[tipo]);
  const id = select.value;

  if (!id) {
    alert("Selecione um item para excluir");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este item?")) return;

  try {
    const response = await fetch(`${BASE_URL}/api/${recursoMap[tipo]}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "DELETE" }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.erro || "Erro ao excluir");
      return;
    }

    alert("Excluído com sucesso");

    if (typeof popularSelects === "function") popularSelects();
  } catch (err) {
    console.error(err);
    alert("Erro de conexão");
  }
};

// ===============================
// ABRIR PEDIDO
// ===============================
window.abrirPedido = async function () {
  if (typeof carregarPedido === "function") {
    window.pedidoCarregado = false;

    await carregarPedido();

    if (typeof listarPedidos === "function") {
      listarPedidos();
    }
  }
};

// ===============================
// ABRIR SHAPER
// ===============================
window.abrirShaper = async function () {
  if (typeof carregarShaper === "function") {
    window.shaperCarregado = false;

    await carregarShaper();

    if (typeof listarShapers === "function") {
      listarShapers();
    }
  }

  const triggerEl = document.querySelector('[data-bs-target="#shaper"]');

  if (triggerEl) {
    const tab = new bootstrap.Tab(triggerEl);
    tab.show();
  }
};
document.addEventListener("input", function (e) {
  if (e.target.classList.contains("is-invalid")) {
    e.target.classList.remove("is-invalid");
  }
});
document.addEventListener("change", function (e) {
  if (e.target.classList.contains("is-invalid")) {
    e.target.classList.remove("is-invalid");
  }
});

window.initPedido = function () {
  if (!document.getElementById("listaPedidos")) return;

  listarPedidos();
  listarPedidosStatus();
  popularSelects();
};
