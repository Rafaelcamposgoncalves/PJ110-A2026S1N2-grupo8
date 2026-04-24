if (!window.SHAPER_MODULE_LOADED) {
  window.SHAPER_MODULE_LOADED = true;
  window.BASE_URL = window.location.origin + "/teste";
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
        lista.innerHTML += `
                    <tr>
                        <td>${shaper.id}</td>
                        <td>${shaper.nome}</td>
                        <td>${shaper.telefone}</td>
                        <td>${shaper.email}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick='preencherEdicao(${JSON.stringify(shaper)})'>
                                <i class="fa-solid fa-file-pen"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deletarShaper(${shaper.id})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>`;
      });
    } catch (error) {
      console.error("Erro ao listar shapers:", error);
    }
  };

  // BUSCAR
  window.buscarShaper = async function () {
    const texto = document.getElementById("buscarTexto").value.trim();
    if (!texto) return listarShapers();

    try {
      const response = await fetch(apiUrl("shapers", texto));
      const data = await response.json();
      const lista = document.getElementById("lista");
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
                            <button class="btn btn-sm btn-warning" onclick='preencherEdicao(${JSON.stringify(shaper)})'>
                                <i class="fa-solid fa-file-pen"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deletarShaper(${shaper.id})">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
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

    if (!nome || !telefone || !email) {
      if (typeof showToast === "function")
        showToast({ erro: "Preencha todos os campos corretamente" });
      return;
    }

    let bodyData = { nome, telefone, email };
    let url = apiUrl("shapers");
    let method = "POST";

    if (window.editId) {
      bodyData._method = "PUT";
      url = apiUrl("shapers", window.editId);
    }

    try {
      const response = await fetch(url, {
        method: "POST", // Mantemos POST por causa do _method do Laravel/PHP
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (typeof showToast === "function") showToast(result);

      if (response.ok) {
        resetForm();
        listarShapers();
      }
    } catch (error) {
      if (typeof showToast === "function")
        showToast({ erro: "Erro ao conectar com o servidor" });
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
      if (typeof showToast === "function") showToast(result);

      if (response.ok) listarShapers();
    } catch (error) {
      if (typeof showToast === "function")
        showToast({ erro: "Erro ao excluir registro" });
    }
  };

  // AUXILIARES
  window.preencherEdicao = function (shaper) {
    window.editId = shaper.id;
    document.getElementById("nome").value = shaper.nome;
    document.getElementById("telefone").value = shaper.telefone;
    document.getElementById("email").value = shaper.email;
    document.getElementById("btnSubmit").textContent = "Atualizar";
    document
      .getElementById("up")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.resetForm = function () {
    window.editId = null;
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("btnSubmit").textContent = "Cadastrar";
  };

  // INICIALIZAÇÃO
  window.listarShapers();
}
