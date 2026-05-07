import "dotenv/config";
import cookie from "cookie";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { createClient } from "redis";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT ?? 4000);
const INSTANCE_ID = process.env.SERVER_ID ?? process.env.INSTANCE_ID ?? `server-${PORT}`;
const REDIS_URL = getRedisUrl();
const COOKIE_SECRET = process.env.COOKIE_SECRET ?? "chatmsg-fase2-dev-secret";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? true;
const CHANNEL = process.env.REDIS_CHANNEL ?? "chatmsg:fase2:events";
const MAX_MESSAGE_LENGTH = 500;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const clients = new Map();
const typingUsers = new Set();
let redisStatus = "connecting";
let publisher = null;
let subscriber = null;

function getRedisUrl() {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST;
  if (!host) {
    return "redis://localhost:6379";
  }

  const protocol = process.env.REDIS_TLS === "true" ? "rediss" : "redis";
  const port = process.env.REDIS_PORT ?? 6379;
  const username = encodeURIComponent(process.env.REDIS_USERNAME ?? "default");
  const password = process.env.REDIS_PASSWORD
    ? `:${encodeURIComponent(process.env.REDIS_PASSWORD)}`
    : "";

  return `${protocol}://${username}${password}@${host}:${port}`;
}

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    instanceId: INSTANCE_ID,
    port: PORT,
    redis: redisStatus,
    websocketClients: clients.size,
    persistence: false,
    cookies: "httpOnly"
  });
});

app.get("/api/session", (req, res) => {
  const session = readHttpSession(req);

  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({ authenticated: true, user: session.user, instanceId: INSTANCE_ID });
});

app.post("/api/session", (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const color = normalizeColor(req.body?.color);
  const sessionId = randomUUID();
  const profile = encodeProfile({ username, color });

  setSessionCookies(res, sessionId, profile);
  res.status(201).json({
    authenticated: true,
    user: { id: sessionId, username, color },
    instanceId: INSTANCE_ID
  });
});

app.post("/api/logout", (_req, res) => {
  clearSessionCookies(res);
  res.status(204).send();
});

function setSessionCookies(res, sessionId, profile) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    signed: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 8
  };

  res.cookie("chat_session", sessionId, cookieOptions);
  res.cookie("chat_profile", profile, cookieOptions);
}

function clearSessionCookies(res) {
  res.clearCookie("chat_session", { path: "/" });
  res.clearCookie("chat_profile", { path: "/" });
}

function readHttpSession(req) {
  return buildSession(req.signedCookies?.chat_session, req.signedCookies?.chat_profile);
}

function readWsSession(req) {
  const rawCookies = cookie.parse(req.headers.cookie ?? "");
  const sessionId = cookieParser.signedCookie(rawCookies.chat_session, COOKIE_SECRET);
  const profile = cookieParser.signedCookie(rawCookies.chat_profile, COOKIE_SECRET);

  return buildSession(sessionId, profile);
}

function buildSession(sessionId, encodedProfile) {
  if (!sessionId || sessionId === false || !encodedProfile || encodedProfile === false) {
    return null;
  }

  const profile = decodeProfile(encodedProfile);
  if (!profile) {
    return null;
  }

  return {
    user: {
      id: String(sessionId),
      username: profile.username,
      color: profile.color
    }
  };
}

function encodeProfile(profile) {
  return Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
}

function decodeProfile(value) {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return {
      username: normalizeUsername(parsed.username),
      color: normalizeColor(parsed.color)
    };
  } catch {
    return null;
  }
}

function normalizeUsername(username) {
  const value = String(username ?? "").trim();
  return value.slice(0, 24) || "Invitado";
}

function normalizeText(text) {
  return String(text ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
}

function normalizeColor(color) {
  const value = String(color ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#2563eb";
}

function send(ws, event, payload = {}) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ event, payload }));
  }
}

function broadcastLocal(event, payload = {}) {
  for (const client of clients.values()) {
    send(client.ws, event, payload);
  }
}

function getOnlineUsers() {
  return [...clients.values()].map(({ user, connectedAt }) => ({
    ...user,
    connectedAt,
    instanceId: INSTANCE_ID
  }));
}

function broadcastPresence() {
  broadcastLocal("presence:update", {
    instanceId: INSTANCE_ID,
    users: getOnlineUsers()
  });
}

function broadcastTyping() {
  const users = [...typingUsers]
    .map((clientId) => clients.get(clientId))
    .filter(Boolean)
    .map(({ user }) => ({ id: user.id, username: user.username }));

  broadcastLocal("typing:update", { users });
}

function parseMessage(rawMessage) {
  try {
    return JSON.parse(rawMessage.toString());
  } catch {
    return null;
  }
}

function createSystemMessage(text) {
  return {
    id: randomUUID(),
    type: "system",
    text,
    instanceId: INSTANCE_ID,
    createdAt: new Date().toISOString()
  };
}

async function publishRedisEvent(event, payload) {
  const envelope = {
    event,
    payload,
    sourceInstanceId: INSTANCE_ID,
    publishedAt: new Date().toISOString()
  };

  if (redisStatus !== "connected" || !publisher) {
    broadcastLocal(event, payload);
    return;
  }

  await publisher.publish(CHANNEL, JSON.stringify(envelope));
}

async function setupRedis() {
  publisher = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false
    }
  });
  subscriber = publisher.duplicate();

  const onError = (error) => {
    redisStatus = "error";
    console.error(`[${INSTANCE_ID}] Redis error: ${error.message}`);
  };

  publisher.on("error", onError);
  subscriber.on("error", onError);

  await publisher.connect();
  await subscriber.connect();
  redisStatus = "connected";

  await subscriber.subscribe(CHANNEL, (message) => {
    try {
      const envelope = JSON.parse(message);
      if (!envelope?.event) {
        return;
      }

      broadcastLocal(envelope.event, {
        ...envelope.payload,
        sourceInstanceId: envelope.sourceInstanceId
      });
    } catch (error) {
      console.error(`[${INSTANCE_ID}] Evento Redis invalido: ${error.message}`);
    }
  });

  console.log(`[${INSTANCE_ID}] Redis pub/sub conectado a ${REDIS_URL}`);
}

wss.on("connection", (ws, req) => {
  const session = readWsSession(req);

  if (!session) {
    send(ws, "error", { message: "Sesion invalida. Entra al chat de nuevo." });
    ws.close(1008, "Sesion requerida");
    return;
  }

  const clientId = randomUUID();
  const client = {
    id: clientId,
    user: session.user,
    ws,
    connectedAt: new Date().toISOString()
  };

  clients.set(clientId, client);
  send(ws, "session:ready", { user: session.user, instanceId: INSTANCE_ID });
  publishRedisEvent("system:message", {
    message: createSystemMessage(`${session.user.username} se conecto a ${INSTANCE_ID}.`)
  }).catch(console.error);
  broadcastPresence();

  ws.on("message", (rawMessage) => {
    const message = parseMessage(rawMessage);

    if (!message?.event) {
      send(ws, "error", { message: "Formato de evento invalido." });
      return;
    }

    if (message.event === "chat:message") {
      const text = normalizeText(message.payload?.text);

      if (!text) {
        send(ws, "error", { message: "El mensaje no puede estar vacio." });
        return;
      }

      publishRedisEvent("chat:message", {
        message: {
          id: randomUUID(),
          type: "chat",
          text,
          user: session.user,
          instanceId: INSTANCE_ID,
          createdAt: new Date().toISOString()
        }
      }).catch((error) => {
        send(ws, "error", { message: `No se pudo publicar el mensaje: ${error.message}` });
      });

      typingUsers.delete(clientId);
      broadcastTyping();
      return;
    }

    if (message.event === "typing:start") {
      typingUsers.add(clientId);
      broadcastTyping();
      return;
    }

    if (message.event === "typing:stop") {
      typingUsers.delete(clientId);
      broadcastTyping();
      return;
    }

    send(ws, "error", { message: `Evento no soportado: ${message.event}` });
  });

  ws.on("close", () => {
    clients.delete(clientId);
    typingUsers.delete(clientId);
    publishRedisEvent("system:message", {
      message: createSystemMessage(`${session.user.username} salio de ${INSTANCE_ID}.`)
    }).catch(console.error);
    broadcastPresence();
    broadcastTyping();
  });
});

try {
  await setupRedis();
} catch (error) {
  redisStatus = "offline";
  console.warn(`[${INSTANCE_ID}] Redis no disponible (${error.message}). El servidor queda en modo local.`);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[${INSTANCE_ID}] Backend escuchando en http://localhost:${PORT}`);
});
