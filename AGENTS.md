# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router (groups like `(admin)`, `(auth)`, API routes in `src/app/api`, global styles in `src/app/globals.css`).
- `src/components`: UI and domain components (shared UI in `src/components/ui`).
- `src/ai`: Genkit flows and dev harness (`src/ai/flows`, `src/ai/dev.ts`).
- `src/lib`, `src/hooks`, `src/schemas`, `src/firebase`: utilities, hooks, schemas, Firebase helpers.
- `public/`: static assets. `docs/`: project docs. `scripts/`: maintenance scripts (TS/JS). `instrumentation.ts`: Next.js instrumentation.

## Build, Test, and Development Commands
- `npm run dev`: Start Next dev server (port 9003).
- `npm run build`: Build the app (standalone output for Docker/self-hosted).
- `npm run start`: Run the built server (`.next/standalone/server.js`).
- `npm run lint`: ESLint via Next.
- `npm run typecheck`: TypeScript type checking.
- Genkit: `npm run genkit:dev` (or `npm run genkit:watch`) to run flows locally.
- Scripts: `node scripts/check-db.js`, `npx tsx scripts/add-admin-user.ts` (TS scripts via `tsx`).

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js 15). Tailwind CSS for styling; prefer utility classes with `clsx`/`tailwind-merge`.
- Formatting: Prettier (`.prettierrc`: 2 spaces, no tabs). Run before committing.
- Files: kebab-case for filenames (`node-network.tsx`); Components/classes in PascalCase; hooks `useSomething.ts`.
- Avoid inline styles; colocate component-specific styles and tests next to the component.

## Testing Guidelines
- Example spec: `src/components/variable-validation.spec.tsx` using React Testing Library.
- Runner is not configured by default; if adding tests, prefer Vitest or Jest + RTL.
- Naming: `*.spec.ts`/`*.spec.tsx` near the code under `src/**`.
- Aim to cover critical logic (hooks, lib) and interactive components; include at least one test per new component/hook.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`. Example: `feat(workflow): add slot grid selector`.
- PRs: clear description, linked issue, screenshots for UI changes, updated docs (`docs/`) when relevant. Ensure `npm run lint` and `npm run typecheck` pass.

## Security & Configuration Tips
- Env: store secrets in `.env` (never commit). Firebase config lives in `firebase.json`, rules in `firestore.rules`/`storage.rules`.
- Node 18+ recommended. When using service accounts/credentials, keep them out of VCS and load via env.

## Agent-Specific Notes
- Scope: this AGENTS.md applies repo-wide. Prefer minimal diffs, keep structure intact, and update docs/tests when touching behavior.
