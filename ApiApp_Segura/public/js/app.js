import { loadSession, logout, authState } from "./auth.js";
import { navigateTo, renderRoute } from "./router.js";

const sessionDot = document.querySelector("#sessionDot");
const sessionTitle = document.querySelector("#sessionTitle");
const sessionText = document.querySelector("#sessionText");
const logoutButton = document.querySelector("#logoutButton");

function updateSessionUi() {
  sessionDot.classList.toggle("session-dot--active", authState.authenticated);
  sessionTitle.textContent = authState.authenticated ? "Sesion activa" : "Sesion cerrada";
  sessionText.textContent = authState.authenticated
    ? `${authState.user.name} conectado con cookie HttpOnly.`
    : "Inicia sesion para entrar a las rutas protegidas.";
  logoutButton.disabled = !authState.authenticated;
}

window.addEventListener("popstate", renderRoute);

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-route]");
  if (!link) return;

  event.preventDefault();
  navigateTo(new URL(link.href).pathname);
});

logoutButton.addEventListener("click", async () => {
  await logout();
  updateSessionUi();
  navigateTo("/login");
});

await loadSession();
updateSessionUi();
renderRoute();

window.addEventListener("popstate", updateSessionUi);
window.addEventListener("routechange", updateSessionUi);
