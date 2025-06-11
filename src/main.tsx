import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'
import * as Sentry from '@sentry/react'

import { FlagProvider, IConfig } from '@unleash/proxy-client-react'
import './utils/plausibleService.ts'
import {
  LocalContextProvider,
  getInitialContext
} from './providers/LocalContextProvider.tsx'

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
  context: { userId, properties }
}

// Sentry
Sentry.init({
  dsn:
    import.meta.env.VITE_SENTRY_URL ||
    'https://97c24b2de5bbdc29f464601c2cd9e925@o4509480213807104.ingest.de.sentry.io/4509480234319952',
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false
    })
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/fullstack-demo\.getunleash\.io\/api/
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FlagProvider config={config}>
      <LocalContextProvider>
        <App />
      </LocalContextProvider>
    </FlagProvider>
  </React.StrictMode>
)
