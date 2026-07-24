console.log('Starting server...')

import './loadEnv.js'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import { initialize } from 'unleash-client'
import { handleChatRequest } from './chatService.js'
import {
  defineInsightsImpactMetrics,
  handleInsightsRequest
} from './insightsService.js'
import { metricsRegistry } from './metricsService.js'
import { unleashContextMiddleware } from './contextMiddleware.js'
import { toUnleashContext } from './extractUnleashContext.js'
import { FLAGS } from './flags.js'

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const unleashUrl = process.env.UNLEASH_URL
const unleashApiKey = process.env.UNLEASH_API_KEY

// Placeholder values copied verbatim from .env.example count as unset
const isUnset = (value?: string) => !value || value.includes('<')

if (isUnset(unleashUrl) || isUnset(unleashApiKey)) {
  console.error(
    'Missing Unleash configuration: set UNLEASH_URL and UNLEASH_API_KEY in the repo-root .env file (see .env.example) or in the environment.'
  )
  process.exit(1)
}

// Initialize Unleash client
const unleash = initialize({
  url: unleashUrl!,
  appName: 'unleash-fullstack-demo-app',
  customHeaders: {
    Authorization: unleashApiKey!
  }
})

// Register the impact metrics for the Safeguards demo scenario
defineInsightsImpactMetrics(unleash)

const app = express()
const PORT = process.env.PORT || 3000

// Enable CORS for all routes
app.use(cors())

// Parse JSON request bodies
app.use(express.json())

// Add Unleash context middleware
app.use(unleashContextMiddleware)

// Serve static files from the frontend build directory
const distPath = path.join(__dirname, '../../dist')
app.use(express.static(distPath))

// Dynamic endpoint for the frontend
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Unleash Demo App Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// AI Chat endpoint
app.post('/api/chat', handleChatRequest(unleash))

// AI Spending Insight endpoint (Safeguards demo scenario)
app.get('/api/insights', handleInsightsRequest(unleash))

// Debug endpoint: shows which variant the backend SDK evaluates after polling
app.get('/api/flag/variant', (req, res) => {
  // Log the context for debugging outside production
  if (process.env.NODE_ENV !== 'production' && req.flagContext && Object.keys(req.flagContext).length > 0) {
    console.log('Using context for feature flag evaluation in /api/flag/variant:', req.flagContext)
  }

  // Evaluate exactly like the chat handler does
  const variant = unleash.getVariant(
    FLAGS.chatbot,
    toUnleashContext(req.flagContext)
  )
  res.json(variant)
})

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metricsRegistry.contentType)
    res.end(await metricsRegistry.metrics())
  } catch (err) {
    res.status(500).end(err)
  }
})

// For any other GET request, send the index.html file
// This enables client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Serving static files from: ${distPath}`)
})
