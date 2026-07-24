// Optional per-deployment prefix, prepended to the full flag name with an
// underscore (e.g. "unique" -> unique_fsDemoApp.chatbot). Unset: default names.
const prefix = import.meta.env.VITE_UNLEASH_FLAG_PREFIX

const flagName = (name: string) => (prefix ? `${prefix}_${name}` : name)

export const FLAGS = {
  chatbot: flagName('fsDemoApp.chatbot'),
  problematicNewFeature: flagName('fsDemoApp.problematicNewFeature'),
  showContext: flagName('fsDemoApp.showContext'),
  spendingInsights: flagName('fsDemoApp.spendingInsights')
} as const
