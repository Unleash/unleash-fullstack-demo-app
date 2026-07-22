import { Request, Response } from 'express'
import { Unleash, Context } from 'unleash-client'
import { userExpenses } from './chatService.js'
import { recordInsightsMetrics } from './metricsService.js'
import { FlagContext } from './extractUnleashContext.js'

const FLAG_NAME = 'fsDemoApp.spendingInsights'

// Defaults; a variant JSON payload {"errorRate": 0.3, "latencyMs": 250} on
// the flag overrides them live from the Unleash UI without a redeploy.
const DEFAULT_ERROR_RATE = 0.3
const DEFAULT_LATENCY_MS = 250
const LATENCY_JITTER = 0.4

// Impact metric names carry the app prefix so they are recognized properly.
const METRIC_REQUESTS = 'unleash_fullstack_demo_insights_requests_total'
const METRIC_ERRORS = 'unleash_fullstack_demo_insights_errors_total'
const METRIC_RESPONSE_TIME = 'unleash_fullstack_demo_insights_response_time_ms'

// Lift the flat, lowercased header map into a proper Unleash context so that
// gradual-rollout stickiness on userId/sessionId matches the frontend
// evaluation (a top-level userId sticks; one buried in properties does not).
export const toUnleashContext = (flagContext?: FlagContext): Context => {
  if (!flagContext) return {}

  const context: Context = { properties: { ...flagContext } }
  if (flagContext.userid) context.userId = flagContext.userid
  if (flagContext.sessionid) context.sessionId = flagContext.sessionid
  return context
}

// Called once after initialize(); registers the impact metrics with the SDK.
export const defineInsightsImpactMetrics = (unleash: Unleash) => {
  unleash.impactMetrics.defineCounter(
    METRIC_REQUESTS,
    'Total number of spending-insight requests'
  )
  unleash.impactMetrics.defineCounter(
    METRIC_ERRORS,
    'Total number of failed spending-insight requests'
  )
  unleash.impactMetrics.defineHistogram(
    METRIC_RESPONSE_TIME,
    'Response time of spending-insight requests in milliseconds'
  )
}

interface InsightsConfig {
  errorRate: number
  latencyMs: number
}

const resolveConfig = (unleash: Unleash, context: Context): InsightsConfig => {
  const config: InsightsConfig = {
    errorRate: DEFAULT_ERROR_RATE,
    latencyMs: DEFAULT_LATENCY_MS
  }

  const variant = unleash.getVariant(FLAG_NAME, context)
  if (variant.payload?.type === 'json') {
    try {
      const payload = JSON.parse(variant.payload.value)
      if (typeof payload.errorRate === 'number') {
        config.errorRate = payload.errorRate
      }
      if (typeof payload.latencyMs === 'number') {
        config.latencyMs = payload.latencyMs
      }
    } catch {
      // Malformed payload — keep the defaults
    }
  }

  return config
}

const computeInsight = () => {
  const total = userExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const byCategory = new Map<string, number>()
  for (const expense of userExpenses) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount
    )
  }

  const [topCategory, topAmount] = [...byCategory.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0]

  return {
    insight: `${topCategory} is ${Math.round(
      (topAmount / total) * 100
    )}% of your spending this month.`
  }
}

export const handleInsightsRequest =
  (unleash: Unleash) => async (req: Request, res: Response) => {
    const context = toUnleashContext(req.flagContext)

    // Flag off (or disabled by a safeguard) — signal the frontend to hide
    if (!unleash.isEnabled(FLAG_NAME, context)) {
      return res.sendStatus(404)
    }

    const { errorRate, latencyMs } = resolveConfig(unleash, context)

    // Simulated AI processing latency with jitter
    const delayMs = latencyMs * (1 + (Math.random() * 2 - 1) * LATENCY_JITTER)
    const startTime = Date.now()
    await new Promise(resolve => setTimeout(resolve, delayMs))
    const elapsedMs = Date.now() - startTime

    unleash.impactMetrics.incrementCounter(METRIC_REQUESTS)
    unleash.impactMetrics.observeHistogram(METRIC_RESPONSE_TIME, elapsedMs)

    if (Math.random() < errorRate) {
      unleash.impactMetrics.incrementCounter(METRIC_ERRORS)
      recordInsightsMetrics('error', elapsedMs)
      return res.status(500).json({ error: 'Failed to compute spending insight' })
    }

    recordInsightsMetrics('success', elapsedMs)
    res.json(computeInsight())
  }
