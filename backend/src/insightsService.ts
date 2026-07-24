import { Request, Response } from 'express'
import { Unleash, Context } from 'unleash-client'
import { userExpenses } from './chatService.js'
import { recordInsightsMetrics } from './metricsService.js'
import { toUnleashContext } from './extractUnleashContext.js'
import { FLAGS } from './flags.js'
import { METRICS } from './metrics.js'

// Defaults; a variant JSON payload {"errorRate": 0.3, "latencyMs": 250} on
// the flag overrides them live from the Unleash UI without a redeploy.
const DEFAULT_ERROR_RATE = 0.3
const DEFAULT_LATENCY_MS = 250
const LATENCY_JITTER = 0.4

// Called once after initialize(); registers the impact metrics with the SDK.
export const defineInsightsImpactMetrics = (unleash: Unleash) => {
  unleash.impactMetrics.defineCounter(
    METRICS.insightsRequests,
    'Total number of spending-insight requests'
  )
  unleash.impactMetrics.defineCounter(
    METRICS.insightsErrors,
    'Total number of failed spending-insight requests'
  )
  unleash.impactMetrics.defineHistogram(
    METRICS.insightsResponseTimeMs,
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

  const variant = unleash.getVariant(FLAGS.spendingInsights, context)
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
    if (!unleash.isEnabled(FLAGS.spendingInsights, context)) {
      return res.sendStatus(404)
    }

    const { errorRate, latencyMs } = resolveConfig(unleash, context)

    // Simulated AI processing latency with jitter
    const delayMs = latencyMs * (1 + (Math.random() * 2 - 1) * LATENCY_JITTER)
    const startTime = Date.now()
    await new Promise(resolve => setTimeout(resolve, delayMs))
    const elapsedMs = Date.now() - startTime

    unleash.impactMetrics.incrementCounter(METRICS.insightsRequests)
    unleash.impactMetrics.observeHistogram(
      METRICS.insightsResponseTimeMs,
      elapsedMs
    )

    if (Math.random() < errorRate) {
      unleash.impactMetrics.incrementCounter(METRICS.insightsErrors)
      recordInsightsMetrics('error', elapsedMs)
      return res.status(500).json({ error: 'Failed to compute spending insight' })
    }

    recordInsightsMetrics('success', elapsedMs)
    res.json(computeInsight())
  }
