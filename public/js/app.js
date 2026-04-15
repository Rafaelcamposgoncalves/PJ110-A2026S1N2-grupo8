// app.js

window.BASE_URL = window.location.origin + "/teste";

window.executarScripts = function (container) {
  const scripts = container.querySelectorAll("script");

  scripts.forEach((oldScript) => {
    const newScript = document.createElement("script");

    if (oldScript.src) newScript.src = oldScript.src;
    else newScript.textContent = oldScript.textContent;

    document.body.appendChild(newScript);
  });
};

window.logout = async function () {
  await fetch(`${BASE_URL}/api/logout`, { method: "POST" });
  window.location.href = `${BASE_URL}/login`;
};
