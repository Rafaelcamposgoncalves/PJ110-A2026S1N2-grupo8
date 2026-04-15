if (!window.SHAPER_MODULE_LOADED) {
  window.SHAPER_MODULE_LOADED = true;

  window.BASE_URL = window.location.origin + "/teste";
  window.editId = null;

  function apiUrl(recurso, id = null) {
    if (id) return `${window.BASE_URL}/api/${recurso}/${id}`;
    return `${window.BASE_URL}/api/${recurso}`;
  }

  function mostrarAlerta(msg, tipo = "success") {
    const alerta = document.getElementById("alerta");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = msg;
    alerta.classList.remove("d-none");
    setTimeout(() => alerta.classList.add("d-none"), 3000);
  }

  window.listarShapers = async function () {
    const response = await fetch(apiUrl("shapers"));

    if (!response.ok) {
      console.error("Erro na API");
      return;
    }

    const data = await response.json();
    const lista = document.getElementById("lista");
    const buscarTexto = document.getElementById("buscarTexto");
    lista.innerHTML = "";

    if (!data || data.length === 0) {
      lista.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum registro</td></tr>`;
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
                    <button class="btn btn-sm btn-warning"
                        onclick='preencherEdicao(${JSON.stringify(shaper)})'>
                        <i class="fa-solid fa-file-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-danger"
                        onclick="deletarShaper(${shaper.id})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    buscarTexto.value = "";
  };

  window.cadastrarOuAtualizar = async function () {
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;

    if (!nome || !telefone || !email) {
      mostrarAlerta("Preencha todos os campos", "danger");
      return;
    }

    let bodyData = { nome, telefone, email };
    let url = apiUrl("shapers");

    if (window.editId) {
      bodyData._method = "PUT";
      url = apiUrl("shapers", window.editId);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    mostrarAlerta(data.mensagem, response.ok ? "success" : "danger");

    resetForm();
    listarShapers();
  };

  window.buscarShaper = async function () {
    const texto = document.getElementById("buscarTexto").value.trim();
    if (!texto) return listarShapers();

    const response = await fetch(apiUrl("shapers", texto));
    const data = await response.json();

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    const results = Array.isArray(data) ? data : [data];

    if (!data || results.length === 0) {
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
                    <button class="btn btn-sm btn-warning"
                        onclick='preencherEdicao(${JSON.stringify(shaper)})'>
                        <i class="fa-solid fa-file-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-danger"
                        onclick="deletarShaper(${shaper.id})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    });
  };

  window.preencherEdicao = function (shaper) {
    window.editId = shaper.id;
    document.getElementById("nome").value = shaper.nome;
    document.getElementById("telefone").value = shaper.telefone;
    document.getElementById("email").value = shaper.email;
    document.getElementById("btnSubmit").textContent = "Atualizar";
    document.getElementById("up").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  window.resetForm = function () {
    window.editId = null;
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("btnSubmit").textContent = "Cadastrar";
  };

  window.deletarShaper = async function (id) {
    if (!confirm("Deseja realmente excluir?")) return;

    const response = await fetch(apiUrl("shapers", id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "DELETE" }),
    });

    const data = await response.json();
    mostrarAlerta(data.mensagem, response.ok ? "success" : "danger");

    listarShapers();
  };
}
