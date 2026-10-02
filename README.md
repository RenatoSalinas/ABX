# ABX Admin — Administrador de Negocios

Aplicación web genérica para administrar negocios: gestión de **clientes**, **oportunidades de negocio** (pipeline) y **usuarios con roles** (Administrador / Empleado).

## Stack

- **Frontend:** React + Vite (dev server en puerto 5173)
- **Backend:** Node.js + Express (API en puerto 4000)
- **Base de datos:** PostgreSQL 16

## Desarrollo local

```bash
docker compose -f docker-compose.base44.yml up -d
```

La app queda disponible en `http://localhost:3000` (el dev server de Vite proxya `/api` al backend).

## Cuentas demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@abx.com | admin123 |
| Empleado | empleado@abx.com | empleado123 |

## Estructura

- `server/` — API Express (rutas: auth, users, clients, opportunities, stats) + `init.js` (schema + seed)
- `web/` — Frontend React (Vite)
- `docker-compose.base44.yml` — entorno de desarrollo con PostgreSQL

## Variables de entorno

- `DATABASE_URL` — conexión a PostgreSQL
- `JWT_SECRET` — clave para firmar sesiones
