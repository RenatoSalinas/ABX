# AGENTS.md

## App

"ABX Admin" — administrador de negocios genérico: clientes, oportunidades de negocio (pipeline) y usuarios con roles (admin/empleado). UI en español.

## Stack

- Frontend: React + Vite (`web/`), dev server en 5173 con proxy `/api` → `API_PROXY_TARGET`
- Backend: Express (`server/`), escucha en 4000, ESM (`"type": "module"`)
- DB: PostgreSQL 16, credenciales inline en compose (`abx/abx_dev`)
- El schema y los seed de demo se aplican con el servicio one-shot `init` (`server/init.js`) — solo inserta seed si la tabla users está vacía

## Desarrollo

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Entrada web: host port 3000 → vite 5173 (único origen; la API NO tiene puerto en host, se accede vía `/api`)
- Cambios en `server/` y `web/` se recargan en vivo (nodemon / vite)
- `server/package.json` y `web/package.json` no comparten node_modules; ambos hacen `npm install` en el arranque del contenedor

## Cuentas demo (seed)

- admin@abx.com / admin123 (rol admin — único que ve "Usuarios")
- empleado@abx.com / empleado123 (rol empleado)

## Convenciones / notas

- Auth: JWT en cookie httpOnly `token` (7 días), middleware `requireAuth`/`requireAdmin` en `server/auth.js`
- Etapas de oportunidad: `nuevo`, `en_progreso`, `ganado`, `perdido` (labels en `web/src/api.js`)
- `DELETE` de un cliente deja sus oportunidades (FK `ON DELETE SET NULL`)
- Fechas `expected_close` se devuelven como texto `YYYY-MM-DD` (TO_CHAR) para evitar problemas de zona horaria con date inputs

## Verificación rápida

```bash
curl -s http://localhost:3000/api/health                       # {"ok":true}
curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@abx.com","password":"admin123"}'         # usuario admin
```
