//const BASE_URL = window.location.origin + "/teste";

function apiUrl(recurso, id = null) {
  if (id) {
    return `${BASE_URL}/index.php?recurso=${recurso}&id=${id}`;
  }
  return `${BASE_URL}/index.php?recurso=${recurso}`;
}

/* LISTAR */
async function listarClientes() {
  const response = await fetch(apiUrl("clientes"));
  const data = await response.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum cliente encontrado.</p>";
    return;
  }

  data.forEach((cliente) => {
    lista.innerHTML += `
            <div class="card">
                <strong>ID:</strong> ${cliente.id}<br>
                <strong>Nome:</strong> ${cliente.nome}<br>
                <strong>Telefone:</strong> ${cliente.telefone}<br>
                <strong>Email:</strong> ${cliente.email}<br>
                <button class="delete-btn" onclick="deletarCliente(${cliente.id})">
                    Deletar
                </button>
            </div>
        `;
  });
}

/* CADASTRAR */
async function cadastrarCliente() {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const email = document.getElementById("email").value;

  if (!nome || !telefone || !email) {
    alert("Preencha todos os campos!");
    return;
  }

  const response = await fetch(apiUrl("clientes"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, telefone, email }),
  });

  const data = await response.json();

  alert(data.mensagem);

  listarClientes();
}

/* BUSCAR */
async function buscarCliente() {
  const id = document.getElementById("buscarId").value;

  if (!id) {
    alert("Digite um ID!");
    return;
  }

  const response = await fetch(apiUrl("clientes", id));
  const data = await response.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  if (!data || data.erro) {
    lista.innerHTML = "<p>Cliente não encontrado.</p>";
    return;
  }

  lista.innerHTML = `
        <div class="card">
            <strong>ID:</strong> ${data.id}<br>
            <strong>Nome:</strong> ${data.nome}<br>
            <strong>Telefone:</strong> ${data.telefone}<br>
            <strong>Email:</strong> ${data.email}<br>
            <button class="delete-btn" onclick="deletarCliente(${data.id})">
                Deletar
            </button>
        </div>
    `;
}

/* DELETAR */
async function deletarCliente(id) {
  if (!confirm("Tem certeza que deseja deletar este cliente?")) {
    return;
  }

  const response = await fetch(apiUrl("clientes", id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _method: "DELETE" }),
  });

  const data = await response.json();

  alert(data.mensagem);

  listarClientes();
}

listarClientes();
