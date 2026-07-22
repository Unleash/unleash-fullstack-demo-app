import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

import {
  FlagProvider,
  IConfig,
  UnleashClient
} from '@unleash/proxy-client-react'
import {
  LocalContextProvider,
  getInitialContext
} from './providers/LocalContextProvider.tsx'
import { trackImpression } from './utils/analyticsService.ts'

const { userId, ...properties } = getInitialContext()

// Unleash
const config: IConfig = {
  url:
    import.meta.env.VITE_UNLEASH_FRONTEND_API_URL ||
    'https://app.unleash-hosted.com/demo/api/frontend',
  clientKey:
    import.meta.env.VITE_UNLEASH_FRONTEND_API_KEY ||
    'unleash-fullstack-demo-app:production.3416d5c4fad0c6eccd5093b19b1c94ade9c9c0cd81c2034704ef9165',
  refreshInterval: 2,
  appName: 'unleash-fullstack-demo-app',
  // Emit impression events for every flag evaluation, regardless of the
  // per-flag "impression data" setting in Unleash.
  impressionDataAll: true,
  context: { userId, properties }
}

const client = new UnleashClient(config)
client.on('impression', trackImpression)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FlagProvider unleashClient={client}>
      <LocalContextProvider>
        <App />
      </LocalContextProvider>
    </FlagProvider>
  </React.StrictMode>
)
