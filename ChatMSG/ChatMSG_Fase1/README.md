# ChatMSG - Fase 1

Aplicacion de mensajeria en tiempo real construida con React, Express y WebSockets.

## Alcance de la primera etapa

- Sin Redis.
- Sin persistencia: usuarios y mensajes viven solo en memoria.
- Sin cookies ni sesiones HTTP.
- Comunicacion en tiempo real con WebSockets.
- Frontend en React.
- Backend en Express.

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalacion

```bash
npm install
```

## Ejecucion en desarrollo

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend HTTP: http://localhost:4000
- WebSocket: ws://localhost:4000/ws

## Scripts utiles

```bash
npm run build
npm run start
```

## Endpoints

- `GET /health`: estado del backend.
- `GET /api/messages`: mensajes actuales en memoria.

## Eventos WebSocket

Cliente a servidor:

- `join`: registra al usuario en el chat.
- `chat:message`: envia un mensaje.
- `typing:start`: indica que el usuario esta escribiendo.
- `typing:stop`: indica que dejo de escribir.

Servidor a cliente:

- `chat:history`: historial actual en memoria.
- `chat:message`: nuevo mensaje.
- `presence:update`: usuarios conectados.
- `typing:update`: usuarios escribiendo.
- `system:message`: avisos de entrada y salida.
- `error`: errores de validacion.
