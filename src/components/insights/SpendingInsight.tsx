import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useFlag } from '@unleash/proxy-client-react'
import {
  useInsightsApi,
  SpendingInsightData
} from '../../hooks/api/useInsightsApi'

// The poll doubles as the demo's traffic generator: one open tab produces
// ~6 requests/minute, enough to trip a low-threshold safeguard.
const POLL_INTERVAL_MS = 10_000

type InsightState = 'loading' | 'ready' | 'error' | 'hidden'

export const SpendingInsight = () => {
  const enabled = useFlag('fsDemoApp.spendingInsights')
  const { fetchInsight } = useInsightsApi()

  const [state, setState] = useState<InsightState>('loading')
  const [data, setData] = useState<SpendingInsightData | null>(null)

  useEffect(() => {
    if (!enabled) return

    let active = true

    const load = async () => {
      const result = await fetchInsight()
      if (!active) return

      if (result.status === 'success') {
        setData(result.data)
        setState('ready')
      } else {
        setState(result.status)
      }
    }

    load()
    const timer = setInterval(load, POLL_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [enabled, fetchInsight])

  if (!enabled || state === 'hidden' || state === 'loading') {
    return null
  }

  const isError = state === 'error'

  return (
    <div
      data-testid='spending-insight'
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? 'border-red-300 bg-red-50 text-red-700'
          : 'border-indigo-200 bg-indigo-50 text-slate-800'
      }`}
    >
      <Icon
        icon={isError ? 'ic:round-error-outline' : 'ic:round-auto-awesome'}
        className={`shrink-0 text-lg ${isError ? '' : 'text-unleash'}`}
      />
      {isError ? (
        <span>
          <strong>AI Spending Insight</strong> is unavailable right now.
          Retrying…
        </span>
      ) : (
        <span>
          <strong>AI Spending Insight:</strong> {data?.insight}
        </span>
      )}
    </div>
  )
}
