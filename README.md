# unleash-fullstack-demo-app

A fullstack demo app that is runtime-controlled (feature toggled) by [Unleash](https://www.getunleash.io/).

## Development

Get started with the following [pnpm](https://pnpm.io/) commands:

```bash
# Install dependencies (root + backend workspace)
pnpm install

# Configure your Unleash instance (edit .env afterwards)
cp .env.example .env

# Start development servers (frontend + backend)
pnpm dev
```

Alternatively, use `npm` — both lockfiles are committed:

```bash
npm ci
npm run dev
```

## Configuration

One `.env` file at the repo root serves both sides: the backend loads it on startup, Vite reads the `VITE_*` values at dev/build time. Variables set in the process environment take precedence.

| Variable | Consumer | Required | Description |
|---|---|---|---|
| `UNLEASH_URL` | backend | yes | Unleash server API base URL, ends with `/api/` |
| `UNLEASH_API_KEY` | backend | yes | Backend (client) token, per project/environment |
| `VITE_UNLEASH_FRONTEND_API_URL` | frontend (build) | yes | Frontend API base URL, ends with `/api/frontend` |
| `VITE_UNLEASH_FRONTEND_API_KEY` | frontend (build) | yes | Frontend token; also encodes the environment name (`project:env.hash`) |
| `VITE_ENVIRONMENT_LABEL` | frontend (build) | no | Display-only override for the ribbon/header text; default: parsed from the frontend token, else `(not set)` |
| `VITE_UNLEASH_PROJECT_URL` | frontend (build) | no | "Open Unleash" link target in the header |
| `NODE_ENV` | backend + build | yes | `development` or `production` |
| `PORT` | backend | no | Backend HTTP port (default: 3000) |

## Uses

- [Vite](https://vitejs.dev/guide/) - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [SWC](https://swc.rs/)
- [Tailwind CSS](https://tailwindcss.com/docs/guides/vite)
- [Unleash Proxy Client (React)](https://github.com/Unleash/proxy-client-react)
- [Express](https://expressjs.com/) backend — see [backend/README.md](backend/README.md)
