# unleash-fullstack-demo-app

A fullstack demo app that is runtime-controlled (feature toggled) by [Unleash](https://www.getunleash.io/).

## Development

Get started with the following [pnpm](https://pnpm.io/) commands:

```bash
# Install dependencies (root + backend workspace)
pnpm install

# Start development servers (frontend + backend)
pnpm dev
```

Alternatively, use `npm` — both lockfiles are committed:

```bash
npm ci
npm run dev
```

## Uses

- [Vite](https://vitejs.dev/guide/) - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [SWC](https://swc.rs/)
- [Tailwind CSS](https://tailwindcss.com/docs/guides/vite)
- [Unleash Proxy Client (React)](https://github.com/Unleash/proxy-client-react)
- [Express](https://expressjs.com/) backend — see [backend/README.md](backend/README.md)
