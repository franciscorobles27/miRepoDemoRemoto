import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, LogIn, Send, UsersRound, Wifi, WifiOff } from "lucide-react";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000/ws";
const COLORS = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#d97706", "#0891b2"];

function createDraftUser() {
  return {
    username: "",
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  };
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

export default function App() {
  const [draftUser, setDraftUser] = useState(createDraftUser);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const visibleTypingUsers = useMemo(
    () => typingUsers.filter((user) => user.id !== currentUser?.id),
    [currentUser?.id, typingUsers]
  );

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnectionStatus("connected");
    });

    socket.addEventListener("close", () => {
      setConnectionStatus("disconnected");
    });

    socket.addEventListener("error", () => {
      setConnectionStatus("disconnected");
      setError("No se pudo conectar con el servidor.");
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "session:ready") {
        setCurrentUser(data.payload.user);
        return;
      }

      if (data.event === "chat:history") {
        setMessages(data.payload.messages);
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

    return () => {
      socket.close();
      window.clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleJoin(event) {
    event.preventDefault();
    const username = draftUser.username.trim();

    if (!username) {
      setError("Escribe tu nombre para entrar al chat.");
      return;
    }

    setError("");
    sendSocketEvent(socketRef.current, "join", {
      username,
      color: draftUser.color
    });
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
      <section className="chat-layout" aria-label="ChatMSG Fase 1">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">CM</span>
            <div>
              <h1>ChatMSG</h1>
              <p>Fase 1</p>
            </div>
          </div>

          <div className={`status-pill ${isConnected ? "is-online" : "is-offline"}`}>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isConnected ? "Conectado" : "Sin conexion"}
          </div>

          <div className="panel">
            <div className="panel-title">
              <UsersRound size={18} />
              <span>Usuarios</span>
            </div>
            <ul className="user-list">
              {onlineUsers.map((user) => (
                <li key={user.id}>
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
            <form className="join-form" onSubmit={handleJoin}>
              <div>
                <span className="eyebrow">Chat en tiempo real</span>
                <h2>Ingresa para comenzar</h2>
              </div>

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

              <button className="primary-button" type="submit" disabled={!isConnected}>
                <LogIn size={18} />
                Entrar al chat
              </button>
            </form>
          ) : (
            <>
              <header className="chat-header">
                <div>
                  <span className="eyebrow">Sala general</span>
                  <h2>Mensajes en memoria</h2>
                </div>
                <span className="session-user" style={{ "--user-color": currentUser.color }}>
                  {currentUser.username}
                </span>
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
