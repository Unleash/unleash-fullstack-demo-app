// Unleash frontend tokens encode the environment name: project:environment.hash
const ENV_FROM_KEY = /^[^:]+:([^.]+)\./

// Resolve the displayed Unleash environment: an explicit label override wins,
// else the environment encoded in the frontend token, else '(not set)'.
export const getUnleashEnvironment = (): string => {
  const label = import.meta.env.VITE_ENVIRONMENT_LABEL
  if (label) return label

  const key = import.meta.env.VITE_UNLEASH_FRONTEND_API_KEY
  const match = key?.match(ENV_FROM_KEY)
  return match?.[1] ?? '(not set)'
}

export const getUnleashProjectUrl = (): string =>
  import.meta.env.VITE_UNLEASH_PROJECT_URL ||
  'https://app.unleash-hosted.com/demo/projects/unleash-fullstack-demo-app'
