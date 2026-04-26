async function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const btn = document.getElementById("btnLogin");
  const alerta = document.getElementById("alerta");

  alerta.classList.add("d-none");

  // Spinner no botão
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Entrando...';
  btn.disabled = true;

  try {
    const response = await fetch(`${BASE_URL}/index.php?url=api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = `${BASE_URL}/`;
    } else {
      alerta.textContent = data.mensagem;
      alerta.classList.remove("d-none");
    }
  } catch (error) {
    alerta.textContent = "Erro ao conectar com o servidor.";
    alerta.classList.remove("d-none");
  }

  btn.innerHTML = "Entrar";
  btn.disabled = false;
}

// Permitir ENTER para logar
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    login();
  }
});
