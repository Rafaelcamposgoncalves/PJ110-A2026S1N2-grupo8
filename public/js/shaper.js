if (!window.SHAPER_MODULE_LOADED) {
  window.SHAPER_MODULE_LOADED = true;
  window.editId = null;

  function apiUrl(recurso, id = null) {
    if (id) return `${window.BASE_URL}/api/${recurso}/${id}`;
    return `${window.BASE_URL}/api/${recurso}`;
  }

  // LISTAR
  window.listarShapers = async function () {
    try {
      const response = await fetch(apiUrl("shapers"));
      if (!response.ok) return;
      const data = await response.json();
      const lista = document.getElementById("lista");
      if (!lista) return;

      lista.innerHTML = "";
      if (!data || data.length === 0) {
        lista.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>`;
        return;
      }

      data.forEach((shaper) => {
        // Dentro do data.forEach no window.listarShapers:
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
            <button class="btn btn-outline-secondary" onclick='window.preencherEdicao(${JSON.stringify(shaper)})'>
                <i class="fa-solid fa-file-pen"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="window.deletarShaper(${shaper.id})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    </td>
</tr>`;

        // Nova função para salvar a alteração do switch
        window.alternarAtivoShaper = async function (id, isChecked) {
          const ativo = isChecked ? 1 : 0;
          try {
            await fetch(apiUrl("shapers", id), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                _method: "PUT",
                id: id,
                ativo: ativo,
                somenteAtivo: true,
              }),
            });
          } catch (error) {
            console.error("Erro ao alternar shaper:", error);
          }
        };
      });
    } catch (error) {
      console.error("Erro ao listar shapers:", error);
    }
  };

  // BUSCAR
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
      if (
        !data ||
        results.length === 0 ||
        (results.length === 1 && !results[0].id)
      ) {
        lista.innerHTML = `<tr><td colspan="5" class="text-center">Não encontrado</td></tr>`;
        return;
      }
      results.forEach((shaper) => {
        lista.innerHTML += `
                <tr>
                    <td>${shaper.id}</td>
                    <td>${shaper.nome}</td>
                    <td>${shaper.telefone}</td>
                    <td>${shaper.email}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" onclick='window.preencherEdicao(${JSON.stringify(shaper)})'>
                                <i class="fa-solid fa-file-pen"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="window.deletarShaper(${shaper.id})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
      });
    } catch (error) {
      console.error("Erro na busca:", error);
    }
  };

  // CADASTRAR / ATUALIZAR
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
      if (typeof showToast === "function") showToast("Shaper", result);
      if (response.ok) {
        window.resetForm();
        window.listarShapers();
      }
    } catch (error) {
      if (typeof showToast === "function")
        showToast("Erro", { erro: "Falha na conexão com o servidor" });
    }
  };

  // DELETAR
  window.deletarShaper = async function (id) {
    if (!confirm("Deseja realmente excluir este Shaper?")) return;
    try {
      const response = await fetch(apiUrl("shapers", id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _method: "DELETE" }),
      });
      const result = await response.json();

      if (response.ok) {
        if (typeof showToast === "function")
          showToast("Shaper", { mensagem: "Excluído com sucesso" });
        window.listarShapers();
      } else {
        if (typeof showToast === "function") showToast("Atenção", result);
      }
    } catch (error) {
      if (typeof showToast === "function")
        showToast("Erro", { erro: "Erro ao excluir registro" });
    }
  };

  // AUXILIARES
  window.preencherEdicao = function (shaper) {
    window.editId = shaper.id;
    document.getElementById("nome").value = shaper.nome;
    document.getElementById("telefone").value = shaper.telefone;
    document.getElementById("email").value = shaper.email;

    // Visual do botão Atualizar
    const btnSubmit = document.getElementById("btnSubmit");
    if (btnSubmit) {
      btnSubmit.innerHTML = '<i class="fa-solid fa-save"></i> Atualizar';
      btnSubmit.classList.replace("btn-primary", "btn-success");
    }

    // Mostrar botão cancelar
    const btnCancel = document.getElementById("btnCancelarShaper");
    if (btnCancel) {
      btnCancel.classList.remove("d-none");
    }

    document.getElementById("nome").focus();
    const upEl = document.getElementById("up");
    if (upEl) upEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.resetForm = function () {
    window.editId = null;
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("email").value = "";

    // Visual do botão Cadastrar
    const btnSubmit = document.getElementById("btnSubmit");
    if (btnSubmit) {
      btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar';
      btnSubmit.classList.replace("btn-success", "btn-primary");
    }

    // Esconder botão cancelar
    const btnCancel = document.getElementById("btnCancelarShaper");
    if (btnCancel) {
      btnCancel.classList.add("d-none");
    }
  };

  window.listarShapers();
}
