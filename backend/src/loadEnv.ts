import path from 'path'
import { fileURLToPath } from 'url'

// Load the repo-root .env file (shared with Vite) using the native Node API.
// Resolved relative to this file so it works regardless of the cwd the
// backend is started from. Variables already present in the process
// environment take precedence over the file.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

try {
  process.loadEnvFile(path.resolve(__dirname, '../../.env'))
} catch {
  // No .env file — rely on the process environment (e.g. on Render).
}
