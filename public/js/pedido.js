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
// BASE URL
// ===============================
window.BASE_URL = window.location.origin + "/teste";

// ===============================
// FUNÇÕES GLOBAIS (IMPORTANTE)
// ===============================

window.abrirModalGenerico = function (tipo) {
  contextoAtual = modalConfigs[tipo];
  editIdGenerico = null;

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

async function carregarListaModal() {
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
                    <button class="btn btn-sm btn-outline-secondary" onclick="editarItem(${id}, '${descricao}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="deletarItem(${id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
  });
}

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
  popularSelects();
};

window.editarItem = function (id, descricao) {
  editIdGenerico = id;

  document.getElementById("modalInput").value = descricao;

  const btnSalvar = document.getElementById("btnSalvarComposicao");
  const btnCancelar = document.getElementById("btnCancelarComposicao");

  btnSalvar.textContent = "Editar";
  btnSalvar.classList.replace("btn-primary", "btn-warning");

  btnCancelar.classList.remove("d-none");
};

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
  popularSelects();
};

window.cancelarEdicaoComposicao = function () {
  resetModalState();
};

window.resetModalState = function () {
  editIdGenerico = null;

  document.getElementById("modalInput").value = "";

  const btnSalvar = document.getElementById("btnSalvarComposicao");
  const btnCancelar = document.getElementById("btnCancelarComposicao");

  btnSalvar.innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar';
  btnSalvar.classList.replace("btn-warning", "btn-primary");

  btnCancelar.classList.add("d-none");
};

// ===============================
// PEDIDO
// ===============================

window.editIdPedido = null;
let tecidosChoice;
let coresChoice;

function apiUrlPedido(recurso, id = null) {
  return id ? `${BASE_URL}/api/${recurso}/${id}` : `${BASE_URL}/api/${recurso}`;
}

function mostrarAlertaPedido(msg, tipo = "success") {
  const alerta = document.getElementById("alertaPedido");

  alerta.className = `alert alert-${tipo}`;
  alerta.innerHTML = msg;

  alerta.classList.remove("d-none");

  setTimeout(() => alerta.classList.add("d-none"), 4000);
}

window.popularSelects = async function () {
  await carregarSelect("id_shaperPedido", "shapers", "id_shaper", "nome");
  await carregarSelect(
    "id_composicaoPedido",
    "composicoes",
    "id_composicao",
    "descricao",
  );
  await carregarSelect(
    "id_variacaoPedido",
    "variacoes",
    "id_variacao",
    "descricao",
  );
  await carregarSelect(
    "id_acabamentoPedido",
    "acabamentos",
    "id_acabamento",
    "descricao",
  );
  await carregarSelect("id_tecidoPedido", "tecidos", "id_tecido", "descricao");
  await carregarSelect(
    "id_configuracaoquilhaPedido",
    "configuracaoquilhas",
    "id_configuracaoquilha",
    "descricao",
  );
  await carregarSelect(
    "id_sistemaquilhaPedido",
    "sistemaquilhas",
    "id_sistemaquilha",
    "descricao",
  );
  await carregarSelect("id_cor", "cores", "id_cor", "descricao");

  if (tecidosChoice) tecidosChoice.destroy();
  tecidosChoice = new Choices("#id_tecidoPedido", {
    removeItemButton: true,
  });

  if (coresChoice) coresChoice.destroy();
  coresChoice = new Choices("#id_cor", {
    removeItemButton: true,
  });
};

async function carregarSelect(selectId, recurso, idCampo, textoCampo) {
  const response = await fetch(apiUrlPedido(recurso));
  const data = await response.json();

  const select = document.getElementById(selectId);
  select.innerHTML = "";

  const optionDefault = document.createElement("option");
  optionDefault.value = "";
  optionDefault.textContent = "Selecione...";
  optionDefault.disabled = true;
  optionDefault.selected = true;

  select.appendChild(optionDefault);

  data.forEach((item) => {
    const option = document.createElement("option");

    option.value = item[idCampo] ?? item.id;
    option.textContent = item[textoCampo] ?? item.nome ?? item.descricao;

    select.appendChild(option);
  });
}

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  popularSelects();
});
