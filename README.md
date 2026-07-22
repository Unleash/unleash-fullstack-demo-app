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

## Safeguards demo

The `fsDemoApp.spendingInsights` flag drives an "AI Spending Insight" banner that fails at a controlled rate. The widget polls every 10 seconds, so one open tab generates enough error traffic to trip a low-threshold Unleash Safeguard. The backend records the impact metrics `unleash_fullstack_demo_insights_requests_total`, `unleash_fullstack_demo_insights_errors_total`, and `unleash_fullstack_demo_insights_response_time_ms`; Prometheus mirrors are exposed on `/metrics`.

Unleash-side setup — two recipes, same app code:

1. **Flag + safeguard:** create the release flag `fsDemoApp.spendingInsights`, optionally with a `default` variant carrying the JSON payload `{"errorRate": 0.3, "latencyMs": 250}` (tune it live, no redeploy). Enable with a gradual rollout (e.g. 25%). Add a Safeguard on `unleash_fullstack_demo_insights_errors_total` (e.g. "more than 10 over 15 minutes") with the action **Disable flag environment**. Demo arc: raise `errorRate` to 0.8 → red banners → the safeguard fires → the widget vanishes and errors flatline.
2. **Release template (Enterprise ≥ 7.2):** apply a release plan with milestones 25% → 50% → 100% and timed progression; add the same Safeguard with the action **Pause release plan automation**. Demo arc: the rollout pauses at the current milestone; lower `errorRate` and resume.

Prerequisite: impact metrics and safeguards must be enabled on the target Unleash instance.

## Uses

- [Vite](https://vitejs.dev/guide/) - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [SWC](https://swc.rs/)
- [Tailwind CSS](https://tailwindcss.com/docs/guides/vite)
- [Unleash Proxy Client (React)](https://github.com/Unleash/proxy-client-react)
- [Express](https://expressjs.com/) backend — see [backend/README.md](backend/README.md)
