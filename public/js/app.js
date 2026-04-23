// app.js

window.BASE_URL = window.location.origin + "/teste";

window.executarScripts = async function (container) {
  const scripts = container.querySelectorAll("script");

  for (const oldScript of scripts) {
    const newScript = document.createElement("script");

    if (oldScript.src) {
      newScript.src = oldScript.src;

      await new Promise((resolve, reject) => {
        newScript.onload = resolve;
        newScript.onerror = reject;
        document.body.appendChild(newScript);
      });
    } else {
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
    }
  }
};

// ===============================
// SHOW TOAST GLOBAL
// ===============================
window.showToast = function (result) {
  const toastEl = document.getElementById("alertToast");
  if (!toastEl) {
    console.error("Toast não encontrado no DOM");
    return;
  }

  const textToast = toastEl.querySelector("#toast-text");

  toastEl.classList.remove(
    "bg-danger-subtle",
    "text-danger-emphasis",
    "bg-success-subtle",
    "text-success-emphasis",
  );

  const isErro = !!result.erro;
  const msg = result.erro || result.mensagem || "Sem resposta";

  toastEl.classList.add(
    isErro ? "bg-danger-subtle" : "bg-success-subtle",
    isErro ? "text-danger-emphasis" : "text-success-emphasis",
  );

  textToast.textContent = msg;

  bootstrap.Toast.getOrCreateInstance(toastEl).show();
};

window.logout = async function () {
  await fetch(`${BASE_URL}/api/logout`, { method: "POST" });
  window.location.href = `${BASE_URL}/login`;
};
