const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const COOKIE_NAME = "apiapp_session";

const demoUser = {
  username: "admin",
  password: "1234",
  name: "Administrador"
};

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

function createToken(username) {
  return Buffer.from(`${username}:${Date.now()}`).toString("base64url");
}

function hasSession(req) {
  return Boolean(req.cookies[COOKIE_NAME]);
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== demoUser.username || password !== demoUser.password) {
    return res.status(401).json({
      ok: false,
      message: "Usuario o contrasena incorrectos."
    });
  }

  res.cookie(COOKIE_NAME, createToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 30
  });

  res.json({
    ok: true,
    message: "Sesion iniciada con cookie HttpOnly.",
    user: {
      username: demoUser.username,
      name: demoUser.name
    }
  });
});

app.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true, message: "Sesion cerrada." });
});

app.get("/session", (req, res) => {
  res.json({
    ok: true,
    authenticated: hasSession(req),
    user: hasSession(req)
      ? { username: demoUser.username, name: demoUser.name }
      : null
  });
});

app.get("/api/home", (_req, res) => {
  res.json({
    ok: true,
    title: "Home privado",
    message: "Esta pantalla se muestra solo cuando el ProtectedRoute del frontend permite entrar.",
    cookieMode: "HttpOnly",
    protectedBy: "Frontend ProtectedRoute"
  });
});

app.get("/api/filtrar", async (_req, res) => {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=12");
    const data = await response.json();

    res.json({
      ok: true,
      count: data.results.length,
      pokemons: data.results
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      message: "No se pudo consultar PokeApi.",
      detail: error.message
    });
  }
});

app.get("/api/detalles/:name", async (req, res) => {
  try {
    const pokemonName = req.params.name.toLowerCase();
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

    if (!response.ok) {
      return res.status(404).json({
        ok: false,
        message: "Pokemon no encontrado."
      });
    }

    const data = await response.json();

    res.json({
      ok: true,
      pokemon: {
        id: data.id,
        name: data.name,
        height: data.height,
        weight: data.weight,
        image: data.sprites.other["official-artwork"].front_default,
        types: data.types.map((item) => item.type.name),
        abilities: data.abilities.map((item) => item.ability.name),
        stats: data.stats.map((item) => ({
          name: item.stat.name,
          value: item.base_stat
        }))
      }
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      message: "No se pudo obtener el detalle del Pokemon.",
      detail: error.message
    });
  }
});

app.get(["/login", "/home", "/filtrar", "/detalles"], (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`ApiApp Segura lista en http://localhost:${PORT}`);
});
