import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 100;

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: false }));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const messages = [];
const clients = new Map();
const typingUsers = new Set();

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    storage: "memory",
    redis: false,
    cookies: false,
    websocketClients: clients.size
  });
});

app.get("/api/messages", (_req, res) => {
  res.json({ messages });
});

function send(ws, event, payload = {}) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ event, payload }));
  }
}

function broadcast(event, payload = {}, excludeClientId = null) {
  for (const [clientId, client] of clients.entries()) {
    if (clientId !== excludeClientId) {
      send(client.ws, event, payload);
    }
  }
}

function getOnlineUsers() {
  return [...clients.values()].map(({ id, username, color }) => ({
    id,
    username,
    color
  }));
}

function broadcastPresence() {
  broadcast("presence:update", { users: getOnlineUsers() });
}

function broadcastTyping() {
  const users = [...typingUsers]
    .map((clientId) => clients.get(clientId))
    .filter(Boolean)
    .map(({ id, username }) => ({ id, username }));

  broadcast("typing:update", { users });
}

function parseMessage(rawMessage) {
  try {
    return JSON.parse(rawMessage.toString());
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

function createSystemMessage(text) {
  return {
    id: randomUUID(),
    type: "system",
    text,
    createdAt: new Date().toISOString()
  };
}

function rememberMessage(message) {
  messages.push(message);
  if (messages.length > MAX_HISTORY) {
    messages.shift();
  }
}

wss.on("connection", (ws) => {
  const provisionalId = randomUUID();

  send(ws, "chat:history", { messages });

  ws.on("message", (rawMessage) => {
    const message = parseMessage(rawMessage);

    if (!message?.event) {
      send(ws, "error", { message: "Formato de evento invalido." });
      return;
    }

    if (message.event === "join") {
      const username = normalizeUsername(message.payload?.username);
      const color = String(message.payload?.color ?? "#2563eb");
      const existingClient = clients.get(provisionalId);

      clients.set(provisionalId, {
        id: provisionalId,
        username,
        color,
        ws
      });

      send(ws, "session:ready", { user: { id: provisionalId, username, color } });
      send(ws, "chat:history", { messages });

      if (!existingClient) {
        const systemMessage = createSystemMessage(`${username} se unio al chat.`);
        rememberMessage(systemMessage);
        broadcast("system:message", { message: systemMessage });
      }

      broadcastPresence();
      return;
    }

    const client = clients.get(provisionalId);
    if (!client) {
      send(ws, "error", { message: "Debes ingresar al chat antes de enviar eventos." });
      return;
    }

    if (message.event === "chat:message") {
      const text = normalizeText(message.payload?.text);

      if (!text) {
        send(ws, "error", { message: "El mensaje no puede estar vacio." });
        return;
      }

      const chatMessage = {
        id: randomUUID(),
        type: "chat",
        text,
        user: {
          id: client.id,
          username: client.username,
          color: client.color
        },
        createdAt: new Date().toISOString()
      };

      rememberMessage(chatMessage);
      typingUsers.delete(client.id);
      broadcast("chat:message", { message: chatMessage });
      broadcastTyping();
      return;
    }

    if (message.event === "typing:start") {
      typingUsers.add(client.id);
      broadcastTyping();
      return;
    }

    if (message.event === "typing:stop") {
      typingUsers.delete(client.id);
      broadcastTyping();
      return;
    }

    send(ws, "error", { message: `Evento no soportado: ${message.event}` });
  });

  ws.on("close", () => {
    const client = clients.get(provisionalId);

    if (!client) {
      return;
    }

    clients.delete(provisionalId);
    typingUsers.delete(provisionalId);

    const systemMessage = createSystemMessage(`${client.username} salio del chat.`);
    rememberMessage(systemMessage);
    broadcast("system:message", { message: systemMessage });
    broadcastPresence();
    broadcastTyping();
  });
});

server.listen(PORT, () => {
  console.log(`ChatMSG Fase 1 backend escuchando en http://localhost:${PORT}`);
});
