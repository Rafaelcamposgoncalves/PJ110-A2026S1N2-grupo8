// shaper.js
if (!window.SHAPER_MODULE_LOADED) {
  window.SHAPER_MODULE_LOADED = true;
  window.editId = null;

  function apiUrl(recurso, id = null) {
    if (id) return `${window.BASE_URL}/api/${recurso}/${id}`;
    return `${window.BASE_URL}/api/${recurso}`;
  }

  // ===============================
  // LISTAR SHAPERS
  // ===============================
  window.listarShapers = async function () {
    try {
      const response = await fetch(`${apiUrl("shapers")}?t=${Date.now()}`);
      if (!response.ok) return;
      const data = await response.json();
      const lista = document.getElementById("lista");
      if (!lista) return;

      lista.innerHTML = "";
      if (!data || data.length === 0) {
        lista.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum registro encontrado</td></tr>`;
        return;
      }

      data.forEach((shaper) => {
        lista.innerHTML += `
                <tr>
                    <td>${shaper.id}</td>
                    <td>${shaper.nome}</td>
                    <td>${shaper.telefone}</td>
                    <td>${shaper.email}</td>
                    <td class="text-center align-middle">
                        <div class="form-check form-switch d-inline-block">
                            <input class="form-check-input" type="checkbox" role="switch" 
                                ${shaper.ativo == 1 ? "checked" : ""} 
                                onchange="window.alternarAtivoShaper(${shaper.id}, this.checked)">
                        </div>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" onclick='window.preencherEdicao(${JSON.stringify(shaper)})' title="Editar">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="window.abrirModalShaperExcluir(${shaper.id})" title="Excluir">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
      });
    } catch (error) {
      console.error("Erro ao listar shapers:", error);
    }
  };

  // ===============================
  // GESTÃO DO MODAL DE EXCLUSÃO
  // ===============================
  window.abrirModalShaperExcluir = function (id) {
    const modalElement = document.getElementById("modalShaperExcluir");
    if (!modalElement) {
      console.error("Modal #modalShaperExcluir não encontrado!");
      return;
    }

    const btnConfirmar = document.getElementById("btnConfirmarExcluirShaper");
    if (btnConfirmar) {
      btnConfirmar.onclick = async () => {
        await window.deletarShaper(id);
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
      };
    }

    const instance = bootstrap.Modal.getOrCreateInstance(modalElement);
    instance.show();
  };

  // ===============================
  // AÇÃO DE DELETAR
  // ===============================
  window.deletarShaper = async function (id) {
    try {
      const response = await fetch(apiUrl("shapers", id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _method: "DELETE" }),
      });

      const result = await response.json();

      if (response.ok) {
        if (typeof showToast === "function")
          showToast("Sucesso", {
            mensagem: result.mensagem || "Excluído com sucesso",
          });
        window.listarShapers();
      } else {
        // Captura erro 400 do PHP (Vínculo com pedidos)
        if (typeof showToast === "function") {
          showToast("Atenção", {
            erro: result.erro || "Ação Impedida",
            mensagem:
              result.mensagem ||
              "Não é possível excluir um Shaper em uso. Utilize a opção de desativar.",
          });
        }
      }
    } catch (error) {
      // Caso o servidor caia ou o PHP gere erro fatal de banco
      if (typeof showToast === "function") {
        showToast("Atenção", {
          erro: "Erro técnico",
          mensagem:
            "Não é possível excluir um Shaper em uso. Este Shaper possui vínculos com pedidos existentes. Para ocultá-lo, utilize a opção de desativar.",
        });
      }
    }
  };

  // ===============================
  // ALTERNAR ATIVO (SWITCH)
  // ===============================
  window.alternarAtivoShaper = async function (id, isChecked) {
    try {
      await fetch(apiUrl("shapers", id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _method: "PUT",
          id: id,
          ativo: isChecked ? 1 : 0,
          somenteAtivo: true,
        }),
      });
    } catch (error) {
      console.error("Erro ao alternar status:", error);
    }
  };

  // ===============================
  // CADASTRAR / ATUALIZAR
  // ===============================
  window.cadastrarOuAtualizar = async function () {
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;

    if (!nome) {
      if (typeof showToast === "function")
        showToast("Atenção", { erro: "O nome é obrigatório" });
      return;
    }

    let bodyData = { nome, telefone, email };
    let url = apiUrl("shapers");

    if (window.editId) {
      bodyData._method = "PUT";
      url = apiUrl("shapers", window.editId);
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const result = await response.json();

      if (response.ok) {
        if (typeof showToast === "function") showToast("Shaper", result);
        window.resetForm();
        window.listarShapers();
      } else {
        if (typeof showToast === "function") showToast("Erro", result);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // ===============================
  // BUSCAR
  // ===============================
  window.buscarShaper = async function () {
    const texto = document.getElementById("buscarTexto").value.trim();
    if (!texto) return window.listarShapers();
    try {
      const response = await fetch(apiUrl("shapers", texto));
      const data = await response.json();
      const lista = document.getElementById("lista");
      if (!lista) return;
      lista.innerHTML = "";
      const results = Array.isArray(data) ? data : [data];
      results.forEach((shaper) => {
        lista.innerHTML += `
                <tr>
                    <td>${shaper.id}</td><td>${shaper.nome}</td><td>${shaper.telefone}</td><td>${shaper.email}</td>
                    <td class="text-center align-middle">
                        <div class="form-check form-switch d-inline-block">
                            <input class="form-check-input" type="checkbox" ${shaper.ativo == 1 ? "checked" : ""} onchange="window.alternarAtivoShaper(${shaper.id}, this.checked)">
                        </div>
                    </td>
                    <td><div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" onclick='window.preencherEdicao(${JSON.stringify(shaper)})'><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-outline-danger" onclick="window.abrirModalShaperExcluir(${shaper.id})"><i class="fa-solid fa-trash"></i></button>
                    </div></td>
                </tr>`;
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ===============================
  // AUXILIARES (EDIÇÃO E RESET)
  // ===============================
  window.preencherEdicao = function (shaper) {
    window.editId = shaper.id;
    document.getElementById("nome").value = shaper.nome;
    document.getElementById("telefone").value = shaper.telefone;
    document.getElementById("email").value = shaper.email;

    const btnSubmit = document.getElementById("btnSubmit");
    if (btnSubmit) {
      btnSubmit.innerHTML = '<i class="fa-solid fa-save"></i> Atualizar';
      btnSubmit.classList.replace("btn-primary", "btn-success");
    }

    const btnCancel = document.getElementById("btnCancelarShaper");
    if (btnCancel) btnCancel.classList.remove("d-none");

    document.getElementById("nome").focus();
    document
      .getElementById("up")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.resetForm = function () {
    window.editId = null;
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("email").value = "";

    const btnSubmit = document.getElementById("btnSubmit");
    if (btnSubmit) {
      btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar';
      btnSubmit.classList.replace("btn-success", "btn-primary");
    }

    const btnCancel = document.getElementById("btnCancelarShaper");
    if (btnCancel) btnCancel.classList.add("d-none");
  };

  window.listarShapers();
}
