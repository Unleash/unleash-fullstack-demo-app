import { useCallback } from 'react'
import { useUnleashClient } from '@unleash/proxy-client-react'
import { createUnleashContextHeaders } from '../../utils/createUnleashContextHeaders.ts'

const ENDPOINT = 'api/insights'

export type SpendingInsightData = {
  insight: string
}

// 404 means the flag is off (or was disabled by a safeguard) — hide the
// widget; any other failure is a visible error state.
export type InsightsResult =
  | { status: 'success'; data: SpendingInsightData }
  | { status: 'hidden' }
  | { status: 'error' }

export const useInsightsApi = () => {
  const client = useUnleashClient()

  const fetchInsight = useCallback(async (): Promise<InsightsResult> => {
    const context = client.getContext()
    const headers = createUnleashContextHeaders(context)

    try {
      const res = await fetch(ENDPOINT, { headers })
      if (res.status === 404) return { status: 'hidden' }
      if (!res.ok) return { status: 'error' }
      return { status: 'success', data: await res.json() }
    } catch {
      return { status: 'error' }
    }
  }, [client])

  return {
    fetchInsight
  }
}
