# SupabaseAuthNodeJS

Actividad de autenticación con Node.js, Express y Supabase.

## Estructura

```text
SupabaseAuthNodeJS/
├── public/
│   ├── index.html
│   ├── signup_success.html
│   ├── error.html
│   └── style.css
├── private.html
├── server.js
├── package.json
├── .env.example
└── .gitignore
```

## Pasos para ejecutar

1. Instalar dependencias:

```bash
npm install
```

2. Copiar `.env.example` como `.env`.

3. Poner tus datos de Supabase:

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_KEY=TU_SUPABASE_ANON_KEY
PORT=3000
```

4. Ejecutar el proyecto:

```bash
npm start
```

5. Abrir en el navegador:

```text
http://localhost:3000
```

## Funcionamiento

- `/signup`: registra usuarios con Supabase.
- `/login`: inicia sesión con email y contraseña.
- `/private`: muestra una página privada si el usuario tiene sesión activa.
- `/logout`: cierra sesión.
