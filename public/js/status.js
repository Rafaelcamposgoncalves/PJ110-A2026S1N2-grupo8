window.editIdStatus = null;

function apiStatus(id = null) {
  if (id) return `/teste/api/status/${id}`;
  return `/teste/api/status`;
}

// ======================
// CARREGAR TELA STATUS
// ======================
async function carregarStatus() {
  const container = document.getElementById("conteudo-status");

  const res = await fetch("/teste/views/status/index.html");
  const html = await res.text();

  container.innerHTML = html;

  listarStatus();
}

async function listarStatus() {
  const res = await fetch(apiStatus());
  const data = await res.json();

  const lista = document.getElementById("lista-status");
  lista.innerHTML = "";

  data.forEach((s) => {
    lista.innerHTML += `
      <tr>
        <td>${s.id}</td>
        <td>${s.descricao}</td>
        <td>${s.ordem}</td>
<td>
  <div class="btn-group btn-group-sm">

    <button class="btn btn-outline-secondary"
      onclick='editarStatus(${JSON.stringify(s)})'>
      <i class="fa-solid fa-pen"></i>
    </button>

    <button class="btn btn-outline-danger"
      onclick='deletarStatus(${s.id})'>
      <i class="fa-solid fa-trash"></i>
    </button>

  </div>
</td>
    `;
  });
}
window.salvarStatusBase = async function () {
  console.log("clicou salvar");
  const descricao = document.getElementById("descricao").value;
  const ordem = document.getElementById("ordem").value;

  console.log("descricao:", descricao);
  console.log("ordem:", ordem);

  let body = { descricao, ordem };
  let url = apiStatus();

  if (window.editIdStatus) {
    body._method = "PUT";
    url = apiStatus(window.editIdStatus);
  }

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  window.editIdStatus = null;

  document.getElementById("descricao").value = "";
  document.getElementById("ordem").value = "";

  listarStatus();
};
function editarStatus(s) {
  window.editIdStatus = s.id;

  document.getElementById("descricao").value = s.descricao;
  document.getElementById("ordem").value = s.ordem;
}
async function deletarStatus(id) {
  if (!confirm("Excluir status?")) return;

  await fetch(apiStatus(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _method: "DELETE" }),
  });

  listarStatus();
}
