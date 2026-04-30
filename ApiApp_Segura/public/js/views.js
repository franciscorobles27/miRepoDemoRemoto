import { api } from "./api.js";
import { login } from "./auth.js";
import { navigateTo } from "./router.js";

const app = document.querySelector("#app");
const loginApp = document.querySelector("#loginApp");
const pageTitle = document.querySelector("#pageTitle");

function setTitle(title) {
  if (pageTitle) pageTitle.textContent = title;
}

function setHtml(html) {
  app.innerHTML = html;
}

function setLoginHtml(html) {
  loginApp.innerHTML = html;
}

function message(text, type = "neutral") {
  return `<p class="message message--${type}">${text}</p>`;
}

export function renderLogin() {
  setTitle("Iniciar sesion");
  setLoginHtml(`
    <section class="login-layout">
      <article class="hero-panel">
        <span class="badge">Ruta publica: /login</span>
        <h2>Acceso seguro con cookie HttpOnly</h2>
        <p>
          Al iniciar sesion, el servidor crea una cookie HttpOnly. El frontend
          no puede leerla directamente, pero consulta /session para saber si
          debe permitir las rutas privadas.
        </p>
        <div class="hero-grid">
          <span>Frontend ProtectedRoute</span>
          <span>PokeApi</span>
          <span>Express</span>
        </div>
      </article>

      <form class="card login-card" id="loginForm">
        <h2>Credenciales</h2>
        <p class="muted">Usuario demo: admin / 1234</p>

        <label for="username">Usuario</label>
        <input id="username" name="username" value="admin" autocomplete="username">

        <label for="password">Contrasena</label>
        <input id="password" name="password" type="password" value="1234" autocomplete="current-password">

        <button class="primary-button" type="submit">Iniciar sesion</button>
        <div id="loginMessage"></div>
      </form>
    </section>
  `);

  document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const loginMessage = document.querySelector("#loginMessage");
    loginMessage.innerHTML = message("Validando credenciales...");

    try {
      await login(form.username.value.trim(), form.password.value);
      loginMessage.innerHTML = message("Sesion iniciada correctamente.", "success");
      navigateTo("/home");
    } catch (error) {
      loginMessage.innerHTML = message(error.message, "error");
    }
  });
}

export function renderAccessDenied() {
  setTitle("Acceso protegido");
  setLoginHtml(`
    <section class="center-view center-view--login">
      <article class="card denied-card">
        <span class="badge badge--red">ProtectedRoute</span>
        <h2>Ruta bloqueada desde el frontend</h2>
        <p>
          Esta pantalla pertenece a una ruta privada. Inicia sesion para que
          el ProtectedRoute permita navegar a Home, Filtrar o Detalles.
        </p>
        <button class="primary-button" id="goLoginButton" type="button">Ir al login</button>
      </article>
    </section>
  `);

  document.querySelector("#goLoginButton").addEventListener("click", () => {
    navigateTo("/login");
  });
}

export async function renderHome() {
  setTitle("Home privado");
  setHtml(`<section class="loading-card">Cargando /home...</section>`);

  const data = await api.home();
  setHtml(`
    <section class="dashboard-grid">
      <article class="panel panel--wide">
        <span class="badge">/home</span>
        <h2>${data.title}</h2>
        <p>${data.message}</p>
      </article>

      <article class="metric-card">
        <span>Cookie</span>
        <strong>${data.cookieMode}</strong>
      </article>

      <article class="metric-card">
        <span>Proteccion</span>
        <strong>${data.protectedBy}</strong>
      </article>

      <article class="panel panel--wide">
        <h3>Rutas de la actividad</h3>
        <div class="route-list">
          <span>/login</span>
          <span>/home</span>
          <span>/filtrar</span>
          <span>/detalles/:name</span>
        </div>
      </article>
    </section>
  `);
}

export async function renderFiltrar() {
  setTitle("Filtrar Pokemon");
  setHtml(`
    <section class="split-view">
      <article class="panel">
        <span class="badge">/filtrar</span>
        <h2>Pokemon desde PokeApi</h2>
        <p class="muted">Cargando lista segura...</p>
      </article>
    </section>
  `);

  const data = await api.filtrar();
  setHtml(`
    <section class="split-view">
      <article class="panel">
        <span class="badge">/filtrar</span>
        <h2>Pokemon disponibles</h2>
        <p class="muted">Se cargaron ${data.count} Pokemon. Elige uno para abrir /detalles/:name.</p>
        <div class="pokemon-list">
          ${data.pokemons.map((pokemon) => `
            <button class="pokemon-row" type="button" data-name="${pokemon.name}">
              <span>${pokemon.name}</span>
              <strong>Ver detalles</strong>
            </button>
          `).join("")}
        </div>
      </article>
      <article class="panel preview-panel">
        <h2>Detalle</h2>
        <p class="muted">Selecciona un Pokemon para consultar su informacion.</p>
      </article>
    </section>
  `);

  document.querySelector(".pokemon-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-name]");
    if (button) navigateTo(`/detalles?name=${button.dataset.name}`);
  });
}

export async function renderDetalles(name = "pikachu") {
  setTitle("Detalles Pokemon");
  setHtml(`<section class="loading-card">Cargando /detalles/${name}...</section>`);

  const data = await api.detalles(name);
  const pokemon = data.pokemon;
  const stats = pokemon.stats.slice(0, 6);

  setHtml(`
    <section class="detail-layout">
      <article class="detail-card">
        <div class="detail-art">
          <img src="${pokemon.image}" alt="${pokemon.name}">
        </div>
        <div class="detail-info">
          <span class="badge">/detalles/${pokemon.name}</span>
          <h2>${pokemon.name}</h2>
          <div class="tags">
            <span>#${pokemon.id}</span>
            ${pokemon.types.map((type) => `<span>${type}</span>`).join("")}
          </div>
          <p class="muted">Altura: ${pokemon.height} | Peso: ${pokemon.weight}</p>
          <div class="stats">
            ${stats.map((stat) => `
              <div class="stat">
                <span>${stat.name}</span>
                <div><i style="width: ${Math.min(stat.value, 160) / 160 * 100}%"></i></div>
                <strong>${stat.value}</strong>
              </div>
            `).join("")}
          </div>
        </div>
      </article>
    </section>
  `);
}
