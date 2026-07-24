// Optional per-deployment prefix, prepended to full flag and impact-metric
// names with an underscore (e.g. "unique" -> unique_fsDemoApp.chatbot). The same
// variable configures the frontend at build time; the backend reads it from
// the shared root .env (loaded by loadEnv.ts) or the process environment.
const prefix = process.env.VITE_UNLEASH_FLAG_PREFIX;

export const prefixedName = (name: string): string =>
  prefix ? `${prefix}_${name}` : name;

export const FLAGS = {
  chatbot: prefixedName('fsDemoApp.chatbot'),
  spendingInsights: prefixedName('fsDemoApp.spendingInsights')
} as const;
