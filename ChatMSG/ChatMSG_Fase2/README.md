# ChatMSG - Fase 2

Aplicacion de mensajeria en tiempo real con React, Express, WebSockets, cookies httpOnly y Redis pub/sub.

## Alcance de la segunda etapa

- Redis incorporado con pub/sub para sincronizar mensajes entre servidores.
- Cookies httpOnly para identificar la sesion del usuario.
- Sin persistencia: no se guarda en base de datos ni en archivos.
- Al menos dos servidores Express/WebSocket.
- Frontend React preparado para elegir servidor.

## Requisitos

- Node.js 20 o superior.
- npm.
- Redis accesible local o remoto.

## Redis local

Si tienes Docker:

```bash
docker run --name chatmsg-redis -p 6379:6379 redis:7
```

Si usas Redis remoto, configura `REDIS_URL` en los comandos o en variables de entorno.

## Instalacion

```bash
npm install
```

## Ejecutar dos servidores y frontend

```bash
npm run dev:multi
```

- Frontend: http://localhost:5173
- Servidor A: http://localhost:4000
- Servidor B: http://localhost:4001
- Redis: redis://localhost:6379

## Ejecutar por separado

Backend A:

```bash
npm run dev:a -w server
```

Backend B:

```bash
npm run dev:b -w server
```

Frontend:

```bash
npm run dev -w client
```

## Probar con un companero en la misma red

1. Arranca Redis.
2. Ejecuta `npm run dev:multi`.
3. Obtiene tu IP local con `ipconfig`.
4. Tu companero abre `http://TU_IP:5173`.
5. En el selector del frontend usa `http://TU_IP:4000` o `http://TU_IP:4001`.

Los dos servidores deben usar la misma `REDIS_URL` y el mismo `COOKIE_SECRET`.

## Redis remoto compartido

Tu companera puede conectarse al mismo Redis usando otro identificador de servidor:

```cmd
set SERVER_ID=companera
set REDIS_USERNAME=default
set REDIS_PASSWORD=dQ5887TeYJp2N30kuyk6OmGn1wocZuwI
set REDIS_HOST=redis-19023.c10.us-east-1-3.ec2.cloud.redislabs.com
set REDIS_PORT=19023
node server.js
```

En este proyecto el archivo `server/server.js` carga el backend real desde `server/src/index.js`.

## Endpoints

- `GET /health`: estado del servidor, Redis y conexiones.
- `POST /api/session`: crea sesion con cookies httpOnly.
- `GET /api/session`: lee la sesion desde cookies httpOnly.
- `POST /api/logout`: limpia cookies httpOnly.

## Eventos WebSocket

Cliente a servidor:

- `chat:message`: envia mensaje.
- `typing:start`: indica escritura.
- `typing:stop`: detiene escritura.

Servidor a cliente:

- `session:ready`: sesion validada desde cookie.
- `chat:message`: mensaje publicado por Redis.
- `presence:update`: usuarios conectados al servidor actual.
- `typing:update`: usuarios escribiendo.
- `system:message`: avisos.
- `error`: error de validacion.
