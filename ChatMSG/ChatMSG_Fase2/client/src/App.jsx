import { useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  LogIn,
  LogOut,
  Network,
  Send,
  Server,
  UsersRound,
  Wifi,
  WifiOff
} from "lucide-react";

const COLORS = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#d97706", "#0891b2"];
const DEFAULT_SERVERS = [
  { label: "Servidor A", url: "http://localhost:4000" },
  { label: "Servidor B", url: "http://localhost:4001" },
  { label: "Mi servidor LAN A", url: "http://192.168.8.49:4000" },
  { label: "Mi servidor LAN B", url: "http://192.168.8.49:4001" },
  { label: "Servidor compañero", url: "http://10.200.17.154:3000" }
];

function getWebSocketUrl(apiUrl) {
  const url = new URL(apiUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  return url.toString();
}

function sendSocketEvent(socket, event, payload = {}) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, payload }));
  }
}

function formatTime(value) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function createDraftUser() {
  return {
    username: "",
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  };
}

export default function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_SERVERS[0].url);
  const [customApiUrl, setCustomApiUrl] = useState("");
  const [draftUser, setDraftUser] = useState(createDraftUser);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [serverInfo, setServerInfo] = useState(null);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeApiUrl = customApiUrl.trim() || apiUrl;
  const visibleTypingUsers = useMemo(
    () => typingUsers.filter((user) => user.id !== currentUser?.id),
    [currentUser?.id, typingUsers]
  );

  useEffect(() => {
    return () => {
      socketRef.current?.close();
      window.clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function createSession() {
    const username = draftUser.username.trim();

    if (!username) {
      setError("Escribe tu nombre para entrar al chat.");
      return;
    }

    setError("");
    setConnectionStatus("connecting");

    try {
      const response = await fetch(`${activeApiUrl}/api/session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, color: draftUser.color })
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la sesion.");
      }

      const data = await response.json();
      setCurrentUser(data.user);
      setServerInfo({ instanceId: data.instanceId, apiUrl: activeApiUrl });
      connectSocket();
    } catch (requestError) {
      setConnectionStatus("disconnected");
      setError(requestError.message);
    }
  }

  function connectSocket() {
    socketRef.current?.close();
    const socket = new WebSocket(getWebSocketUrl(activeApiUrl));
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnectionStatus("connected");
    });

    socket.addEventListener("close", () => {
      setConnectionStatus("disconnected");
    });

    socket.addEventListener("error", () => {
      setConnectionStatus("disconnected");
      setError("No se pudo conectar con el WebSocket.");
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "session:ready") {
        setCurrentUser(data.payload.user);
        setServerInfo({ instanceId: data.payload.instanceId, apiUrl: activeApiUrl });
        return;
      }

      if (data.event === "chat:message" || data.event === "system:message") {
        setMessages((current) => [...current, data.payload.message]);
        return;
      }

      if (data.event === "presence:update") {
        setOnlineUsers(data.payload.users);
        return;
      }

      if (data.event === "typing:update") {
        setTypingUsers(data.payload.users);
        return;
      }

      if (data.event === "error") {
        setError(data.payload.message);
      }
    });
  }

  async function handleLogout() {
    sendSocketEvent(socketRef.current, "typing:stop");
    socketRef.current?.close();

    try {
      await fetch(`${activeApiUrl}/api/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {
      // La sesion tambien se limpia localmente aunque el servidor ya no responda.
    }

    setCurrentUser(null);
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setConnectionStatus("idle");
  }

  function handleMessageChange(event) {
    setMessageText(event.target.value);
    sendSocketEvent(socketRef.current, "typing:start");
    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      sendSocketEvent(socketRef.current, "typing:stop");
    }, 800);
  }

  function handleSendMessage(event) {
    event.preventDefault();
    const text = messageText.trim();

    if (!text) {
      return;
    }

    sendSocketEvent(socketRef.current, "chat:message", { text });
    sendSocketEvent(socketRef.current, "typing:stop");
    setMessageText("");
  }

  const isConnected = connectionStatus === "connected";

  return (
    <main className="app-shell">
      <section className="chat-layout" aria-label="ChatMSG Fase 2">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">CM</span>
            <div>
              <h1>ChatMSG</h1>
              <p>Fase 2</p>
            </div>
          </div>

          <div className={`status-pill ${isConnected ? "is-online" : "is-offline"}`}>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isConnected ? "Conectado" : "Sin conexion"}
          </div>

          <div className="panel">
            <div className="panel-title">
              <Server size={18} />
              <span>Servidor</span>
            </div>
            <p className="server-line">{serverInfo?.instanceId ?? "Sin sesion"}</p>
            <p className="muted small">{serverInfo?.apiUrl ?? activeApiUrl}</p>
          </div>

          <div className="panel">
            <div className="panel-title">
              <UsersRound size={18} />
              <span>Usuarios en este servidor</span>
            </div>
            <ul className="user-list">
              {onlineUsers.map((user) => (
                <li key={`${user.id}-${user.instanceId}`}>
                  <Circle size={10} fill={user.color} color={user.color} />
                  <span>{user.username}</span>
                </li>
              ))}
              {onlineUsers.length === 0 && <li className="muted">Sin usuarios activos</li>}
            </ul>
          </div>
        </aside>

        <section className="chat-panel">
          {!currentUser ? (
            <form
              className="join-form"
              onSubmit={(event) => {
                event.preventDefault();
                createSession();
              }}
            >
              <div>
                <span className="eyebrow">Redis pub/sub + cookies httpOnly</span>
                <h2>Entra al chat distribuido</h2>
              </div>

              <label>
                Servidor
                <select value={apiUrl} onChange={(event) => setApiUrl(event.target.value)}>
                  {DEFAULT_SERVERS.map((server) => (
                    <option key={server.url} value={server.url}>
                      {server.label} - {server.url}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Servidor por IP
                <input
                  value={customApiUrl}
                  onChange={(event) => setCustomApiUrl(event.target.value)}
                  placeholder="Ej. http://192.168.1.25:4000"
                />
              </label>

              <label>
                Nombre
                <input
                  maxLength={24}
                  value={draftUser.username}
                  onChange={(event) =>
                    setDraftUser((current) => ({ ...current, username: event.target.value }))
                  }
                  placeholder="Ej. Ana"
                />
              </label>

              <div className="color-picker" aria-label="Selecciona un color">
                {COLORS.map((color) => (
                  <button
                    className={draftUser.color === color ? "is-selected" : ""}
                    key={color}
                    type="button"
                    onClick={() => setDraftUser((current) => ({ ...current, color }))}
                    style={{ "--swatch": color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>

              {error && <p className="error-message">{error}</p>}

              <button className="primary-button" type="submit">
                <LogIn size={18} />
                Entrar
              </button>
            </form>
          ) : (
            <>
              <header className="chat-header">
                <div>
                  <span className="eyebrow">Sala distribuida</span>
                  <h2>Mensajes por Redis</h2>
                </div>
                <div className="header-actions">
                  <span className="session-user" style={{ "--user-color": currentUser.color }}>
                    {currentUser.username}
                  </span>
                  <button className="icon-button" type="button" onClick={handleLogout} title="Salir">
                    <LogOut size={18} />
                  </button>
                </div>
              </header>

              <div className="message-list" aria-live="polite">
                {messages.map((message) =>
                  message.type === "system" ? (
                    <p className="system-message" key={message.id}>
                      {message.text}
                    </p>
                  ) : (
                    <article
                      className={`message ${message.user.id === currentUser.id ? "is-own" : ""}`}
                      key={message.id}
                    >
                      <div className="message-meta">
                        <span style={{ color: message.user.color }}>{message.user.username}</span>
                        <time>{formatTime(message.createdAt)}</time>
                        <span className="instance-tag">
                          <Network size={12} />
                          {message.instanceId}
                        </span>
                      </div>
                      <p>{message.text}</p>
                    </article>
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="typing-line">
                {visibleTypingUsers.length > 0
                  ? `${visibleTypingUsers.map((user) => user.username).join(", ")} escribiendo...`
                  : " "}
              </div>

              <form className="composer" onSubmit={handleSendMessage}>
                <input
                  maxLength={500}
                  value={messageText}
                  onChange={handleMessageChange}
                  placeholder="Escribe un mensaje"
                />
                <button className="send-button" type="submit" aria-label="Enviar mensaje">
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
