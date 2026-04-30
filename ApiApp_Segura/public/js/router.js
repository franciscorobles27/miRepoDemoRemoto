import { isAuthenticated } from "./auth.js";
import {
  renderAccessDenied,
  renderDetalles,
  renderFiltrar,
  renderHome,
  renderLogin
} from "./views.js";

const protectedRoutes = ["/home", "/filtrar", "/detalles"];
const loginScreen = document.querySelector("#loginScreen");
const privateShell = document.querySelector("#privateShell");

export function navigateTo(path) {
  window.history.pushState({}, "", path);
  renderRoute();
  window.dispatchEvent(new Event("routechange"));
}

function getCurrentRoute() {
  const path = window.location.pathname === "/" ? "/login" : window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  return { path, params };
}

function showLoginScreen() {
  loginScreen.hidden = false;
  privateShell.hidden = true;
}

function showPrivateShell() {
  loginScreen.hidden = true;
  privateShell.hidden = false;
}

// ProtectedRoute del frontend: decide si una vista privada se renderiza o se bloquea.
export function ProtectedRoute(routeRenderer) {
  if (!isAuthenticated()) {
    showLoginScreen();
    renderAccessDenied();
    return;
  }

  showPrivateShell();
  Promise.resolve(routeRenderer()).catch(() => {
    document.querySelector("#app").innerHTML = `
      <section class="center-view">
        <article class="card denied-card">
          <span class="badge badge--red">Error</span>
          <h2>No se pudo cargar la ruta</h2>
          <p>Revisa tu conexion o intenta iniciar sesion nuevamente.</p>
        </article>
      </section>
    `;
  });
}

export function renderRoute() {
  if (window.location.hash) {
    const cleanPath = window.location.hash.replace("#", "") || "/login";
    window.history.replaceState({}, "", cleanPath);
  }

  const { path, params } = getCurrentRoute();

  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.link === path);
  });

  if (path === "/login") {
    showLoginScreen();
    renderLogin();
    return;
  }

  if (path === "/home") {
    ProtectedRoute(renderHome);
    return;
  }

  if (path === "/filtrar") {
    ProtectedRoute(renderFiltrar);
    return;
  }

  if (path === "/detalles") {
    ProtectedRoute(() => renderDetalles(params.get("name") || "pikachu"));
    return;
  }

  navigateTo("/login");
}

export function isProtectedPath(path) {
  return protectedRoutes.includes(path);
}
