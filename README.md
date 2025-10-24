# Nodify

Editor de workflows en Next.js 15 + React 19. Incluye Firebase, Genkit y React Flow.

## Requisitos

- Node.js 18+ (recomendado 20.x)
- npm 9+

## Desarrollo

- Instalar dependencias: `npm ci`
- Variables de entorno: copia `.env.example` a `.env.local` y completa los valores
- Arrancar en dev: `npm run dev` (puerto `9003`)

## Producción

- Build: `npm run build`
- Start: `npm run start` (usa `.next/standalone/server.js`)

## Scripts

- `npm run dev` — Next dev server (Turbopack) en `9003`
- `npm run build` — Compila la app
- `npm run start` — Arranca el servidor compilado
- `npm run lint` — ESLint vía Next
- `npm run typecheck` — TypeScript sin emitir
- `npm run genkit:dev` — Dev de Genkit
- `npm run genkit:watch` — Watch de Genkit

## Estructura del Proyecto

- `src/app` — Next.js App Router, APIs en `src/app/api`, estilos globales
- `src/components` — UI y componentes de dominio (`src/components/ui`)
- `src/ai` — Flows de Genkit y dev harness
- `src/lib`, `src/hooks`, `src/schemas`, `src/firebase` — utilidades, hooks, schemas y helpers Firebase
- `public/` — estáticos
- `docs/` — documentación del proyecto
- `scripts/` — scripts de mantenimiento (TS/JS)

## CI (GitHub Actions)

El workflow `CI` ejecuta lint y typecheck en PRs y pushes a `main/master`.
- Archivo: `.github/workflows/ci.yml`
- Node: `20.x`
- Pasos: `npm ci`, `npm run lint`, `npm run typecheck`
- Nota: descomenta el paso de build cuando configures los secrets necesarios.

## Entorno

Crea un `.env.local` (no se commitea). De ejemplo:

```
# Webhooks / seguridad
WEBHOOK_SECRET_TOKEN=
CRON_SECRET=

# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (admin, servidor)
FIREBASE_STORAGE_BUCKET=
# Alternativa: credenciales via archivo en raíz (ignorado): firebasesdk.json
# o FIREBASE_SERVICE_ACCOUNT_BASE64 (JSON base64)
FIREBASE_SERVICE_ACCOUNT_BASE64=
```

## Convenciones

- TypeScript + React, Tailwind CSS
- Formato: Prettier (2 espacios)
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`…)

## Seguridad

- Nunca commitees secretos (usa `.env.local`, `firebasesdk.json` está en `.gitignore`).
- Revisa `src/firebase/admin.ts` para el método de carga de credenciales en producción.

## Licencia

Sin licencia especificada. Añade una si deseas hacer el repo público.

# Nodify
# Nodify
