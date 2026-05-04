if (window.PEDIDO_MODULE_LOADED) {
  console.warn("pedido.js já carregado");
} else {
  window.PEDIDO_MODULE_LOADED = true;

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

    // Procure onde você faz o loop (forEach) da listaComposicoesModal
    data.forEach((item) => {
      // 🔥 Criamos uma variável que pega o primeiro ID que encontrar no objeto
      const idReal =
        item.id ||
        item.id_composicao ||
        item.id_variacao ||
        item.id_acabamento ||
        item.id_configuracaoquilha ||
        item.id_acabamento ||
        item.id_sistemaquilha ||
        item.id_cor ||
        item.id_tecido;

      lista.innerHTML += `
    <tr>
        <td>${idReal}</td>
        <td>${item.descricao}</td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" onclick="window.editarItem(${idReal}, '${item.descricao}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <!-- 🔥 Agora passamos o idReal que acabamos de descobrir -->
                <button class="btn btn-outline-danger" onclick="window.abrirModalExcluirGerenciamento(${idReal})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>`;
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
  // 1. FUNÇÃO QUE ABRE O MODAL (CHAMADA PELO BOTÃO NA TABELA)
  window.abrirModalExcluirGerenciamento = function (id) {
    const modalEl = document.getElementById("modalExcluirGerenciamento");
    const btnSim = document.getElementById("btnConfirmarExcluirGerenciamento");

    if (!modalEl) return console.error("Modal de exclusão não encontrado!");

    // Configura o que o botão "Sim" vai fazer
    btnSim.onclick = async () => {
      await window.deletarItemReal(id); // Chama a função que deleta de verdade
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    };

    // Limpa erro de backdrop e abre
    let inst = bootstrap.Modal.getInstance(modalEl);
    if (inst) inst.dispose();
    new bootstrap.Modal(modalEl).show();
  };

  // 2. A FUNÇÃO QUE REALMENTE DELETA (AJUSTADA)
  window.deletarItemReal = async function (id) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/${contextoAtual.recurso}/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _method: "DELETE" }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        //Só entra aqui se o status for 200 (Sucesso real)
        showToast("Sucesso", data);
        carregarListaModal();
        if (typeof popularSelects === "function") popularSelects();
      } else {
        //Entra aqui se o status for 400 (O que configuramos no Controller)
        showToast("Impedimento", {
          erro: data.erro,
          mensagem: data.mensagem || "Este item está em uso.",
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
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
  /*
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
      const response = await fetch(
        `${BASE_URL}/api/${recursoMap[tipo]}/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _method: "DELETE" }),
        },
      );

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
  };*/

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

  //aqui
  window.PEDIDO_MODULE_LOADED = true;

  window.editIdPedido = null;

  let tecidosChoice;
  let coresChoice;

  window.apiUrlPedido = function (recurso, id = null) {
    if (id) return `${window.BASE_URL}/api/${recurso}/${id}`;
    return `${window.BASE_URL}/api/${recurso}`;
  };

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
    await carregarSelect(
      "id_tecidoPedido",
      "tecidos",
      "id_tecido",
      "descricao",
    );
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
      searchEnabled: true,
      placeholder: true,
      placeholderValue: "Selecione...",
      itemSelectText: "",
    });

    if (coresChoice) coresChoice.destroy();
    coresChoice = new Choices("#id_cor", {
      removeItemButton: true,
      searchEnabled: true,
      placeholder: true,
      placeholderValue: "Selecione...",
      itemSelectText: "",
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

  window.listarPedidos = async function () {
    const response = await fetch(apiUrlPedido("pedidos"));
    const data = await response.json();

    const lista = document.getElementById("listaPedidos");

    lista.innerHTML = "";

    data.forEach((pedido) => {
      lista.innerHTML += `
                    <tr>
                    <td>${pedido.id_pedido}</td>
                    <td>${pedido.data}</td>
                    <td>${pedido.shaper}</td>
                    <td>${pedido.observacao ?? ""}</td>

                    <td>
                      <div class="btn-group" role="group" aria-label="Basic example">
                        <button class="btn btn-outline-secondary" onclick="window.abrirModalPedidoDetalhe(${pedido.id_pedido})">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>


                        
                        <button class="btn btn-outline-secondary" onclick="preencherEdicaoPedido(${pedido.id_pedido})" data-bs-toggle="tooltip" 
                            data-bs-placement="top" 
                            title="Editar Pedido">
                        <i class="fa-solid fa-file-pen"></i>
                        </button>

                        <button class="btn btn-sm btn-outline-danger" onclick="window.abrirModalDeletarPedido(${pedido.id_pedido})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>

                    </tr>
                    `;
    });
    initTooltips();
  };

  window.cadastrarOuAtualizarPedido = async function () {
    const camposObrigatorios = [
      { id: "dataPedido", nome: "Data" },
      { id: "id_shaperPedido", nome: "Shaper" },
      { id: "id_composicaoPedido", nome: "Composição" },
      { id: "id_variacaoPedido", nome: "Variação" },
      { id: "id_acabamentoPedido", nome: "Acabamento" },
      { id: "id_configuracaoquilhaPedido", nome: "Config. Quilha" },
      { id: "id_sistemaquilhaPedido", nome: "Sistema Quilha" },
    ];

    let camposFaltando = [];

    camposObrigatorios.forEach((campo) => {
      const el = document.getElementById(campo.id);

      if (!el.value) {
        camposFaltando.push(" " + campo.nome);
      }
    });

    const cores = coresChoice.getValue(true);
    const tecidos = tecidosChoice.getValue(true);

    if (cores.length === 0) {
      camposFaltando.push(" Cores");
    }

    if (tecidos.length === 0) {
      camposFaltando.push(" Tecido");
    }

    if (camposFaltando.length > 0) {
      if (typeof showToast === "function")
        showToast("Pedido", {
          erro: `Preencha todos os campos: ${camposFaltando}`,
        });

      return;
    }

    const bodyData = {
      data: document.getElementById("dataPedido").value,
      id_shaper: document.getElementById("id_shaperPedido").value,
      id_composicao: document.getElementById("id_composicaoPedido").value,
      id_variacao: document.getElementById("id_variacaoPedido").value,
      id_acabamento: document.getElementById("id_acabamentoPedido").value,
      id_configuracaoquilha: document.getElementById(
        "id_configuracaoquilhaPedido",
      ).value,
      id_sistemaquilha: document.getElementById("id_sistemaquilhaPedido").value,
      observacao: document.getElementById("observacaoPedido").value,
      tecidos: tecidos,
      cores: cores,
    };

    let url = apiUrlPedido("pedidos");

    if (window.editIdPedido) {
      bodyData._method = "PUT";
      url = apiUrlPedido("pedidos", window.editIdPedido);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    if (typeof showToast === "function") showToast("Pedido", data);
    listarPedidos();
  };

  window.preencherEdicaoPedido = async function (id) {
    const response = await fetch(apiUrlPedido("pedidos", id));
    const pedido = await response.json();

    window.editIdPedido = pedido.id_pedido;

    document.getElementById("dataPedido").value = pedido.data;
    document.getElementById("id_shaperPedido").value = pedido.id_shaper;
    document.getElementById("id_composicaoPedido").value = pedido.id_composicao;
    document.getElementById("id_variacaoPedido").value = pedido.id_variacao;
    document.getElementById("id_acabamentoPedido").value = pedido.id_acabamento;
    document.getElementById("id_configuracaoquilhaPedido").value =
      pedido.id_configuracaoquilha;
    document.getElementById("id_sistemaquilhaPedido").value =
      pedido.id_sistemaquilha;
    document.getElementById("observacaoPedido").value = pedido.observacao;

    tecidosChoice.removeActiveItems();
    coresChoice.removeActiveItems();

    if (pedido.tecidos_ids) {
      const tecidos = pedido.tecidos_ids.split(",");
      tecidosChoice.setChoiceByValue(tecidos);
    }

    if (pedido.cores_ids) {
      const cores = pedido.cores_ids.split(",");
      coresChoice.setChoiceByValue(cores);
    }

    document.getElementById("btnSubmitPedido").textContent = "Atualizar";
    document.getElementById("btnCancelarPedido").classList.remove("d-none");

    document.getElementById("up").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  window.cancelarEdicaoPedido = function () {
    resetFormPedido();
  };

  window.abrirModalDeletarPedido = function (id) {
    const modalEl = document.getElementById("modalPedidoExcluir");
    const btnConfirmar = document.getElementById("btnConfirmarDeletarPedido");

    // Vincula o ID ao botão de confirmação
    btnConfirmar.onclick = async () => {
      await window.deletarPedido(id);
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    };

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  };

  window.deletarPedido = async function (id) {
    try {
      const response = await fetch(apiUrlPedido("pedidos", id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _method: "DELETE" }),
      });
      const data = await response.json();
      if (typeof showToast === "function") showToast("Pedido", data);
      listarPedidos();
    } catch (error) {
      console.error("Erro ao deletar pedido:", error);
    }
  };

  window.resetFormPedido = function () {
    window.editIdPedido = null;

    document.getElementById("dataPedido").value = "";
    document.getElementById("observacaoPedido").value = "";

    document.getElementById("id_shaperPedido").selectedIndex = 0;
    document.getElementById("id_composicaoPedido").selectedIndex = 0;
    document.getElementById("id_variacaoPedido").selectedIndex = 0;
    document.getElementById("id_acabamentoPedido").selectedIndex = 0;
    document.getElementById("id_configuracaoquilhaPedido").selectedIndex = 0;
    document.getElementById("id_sistemaquilhaPedido").selectedIndex = 0;

    tecidosChoice.removeActiveItems();
    coresChoice.removeActiveItems();

    document.getElementById("btnSubmitPedido").textContent = "Cadastrar";
    document.getElementById("btnCancelarPedido").classList.add("d-none");
  };

  window.initPedido = function () {
    if (!document.getElementById("listaPedidos")) return;

    listarPedidos();
    listarPedidosStatus();
    popularSelects();
  };

  let pedidoJaCarregado = false;

  document.addEventListener("shown.bs.tab", function (e) {
    const target = e.target.getAttribute("data-bs-target");

    if (target === "#tabGerenciamentoPedido" && !pedidoJaCarregado) {
      pedidoJaCarregado = true;
      initPedido();
    }
  });
}

window.carregarShapersPedido = async function () {
  const select = document.getElementById("id_shaperPedido");
  if (!select) return;

  try {
    // Adicionamos t=Date.now() para "matar" o cache do navegador
    const res = await fetch(
      `${window.BASE_URL}/api/shapers?ativos=true&t=${Date.now()}`,
    );
    const shapers = await res.json();

    select.innerHTML = '<option value="">Selecione...</option>';
    shapers.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.nome;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Erro ao carregar shapers:", e);
  }
};

window.abrirModalPedidoDetalhe = async function (id) {
  const modalEl = document.getElementById("modalPedidoDetalhe");
  const corpoModal = modalEl.querySelector(".modal-body");
  const tituloModal = modalEl.querySelector(".modal-title");
  const btnSim = document.getElementById("btnConfirmarExcluir");

  // 1. Ajusta o visual da modal para "Modo Visualização"
  tituloModal.innerHTML = `<i class="fa-solid fa-ellipsis"></i> Detalhes do Pedido #${id}`;
  corpoModal.innerHTML =
    '<div class="text-center"><div class="spinner-border spinner-border-sm"></div> Carregando...</div>';

  // Esconde o botão "Sim" (pois aqui é detalhe, não exclusão)
  if (btnSim) btnSim.classList.add("d-none");

  try {
    // 2. Busca os dados completos do pedido
    const response = await fetch(apiUrlPedido("pedidos", id));
    const p = await response.json();

    // 3. Monta o conteúdo detalhado (ajusta os campos conforme o teu banco)
    corpoModal.innerHTML = `
            <div class="row g-2">
                <div class="col-6"><strong>Data:</strong><br> ${p.data}</div>
                <div class="col-6"><strong>Shaper:</strong><br> ${p.shaper}</div>
                <hr>
                <div class="col-6"><strong>Composição:</strong><br> ${p.composicao || "-"}</div>
                <div class="col-6"><strong>Variação:</strong><br> ${p.variacao || "-"}</div>
                <div class="col-6"><strong>Acabamento:</strong><br> ${p.acabamento || "-"}</div>
                <div class="col-6"><strong>Config. Quilha:</strong><br> ${p.configuracaoquilha || "-"}</div>
                <div class="col-6"><strong>Sistema Quilha:</strong><br> ${p.sistemaquilha || "-"}</div>
                <hr>
                <div class="col-12"><strong>Cores:</strong><br> ${p.cores || "-"}</div>
                <div class="col-12"><strong>Tecidos:</strong><br> ${p.tecidos || "-"}</div>
                <div class="col-12 mt-2">
                    <strong>Observação:</strong><br>
                    <p class="text-muted">${p.observacao || "Sem observações."}</p>
                </div>
            </div>
        `;
  } catch (error) {
    corpoModal.innerHTML =
      '<div class="alert alert-danger">Erro ao carregar detalhes.</div>';
  }

  // 4. Exibe a modal
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
};
