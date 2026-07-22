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

const url = import.meta.env.VITE_UNLEASH_FRONTEND_API_URL
const clientKey = import.meta.env.VITE_UNLEASH_FRONTEND_API_KEY

// Placeholder values copied verbatim from .env.example count as unset
const isUnset = (value?: string) => !value || value.includes('<')

if (isUnset(url) || isUnset(clientKey)) {
  throw new Error(
    'Missing Unleash frontend configuration: set VITE_UNLEASH_FRONTEND_API_URL and VITE_UNLEASH_FRONTEND_API_KEY in the repo-root .env file (see .env.example).'
  )
}

// Unleash
const config: IConfig = {
  url,
  clientKey,
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
