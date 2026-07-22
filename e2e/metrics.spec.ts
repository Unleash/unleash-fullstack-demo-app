import { test, expect } from '@playwright/test'

// /metrics lives on the backend, not behind the vite proxy
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:3000'

const CONTEXT_HEADERS = {
  'Content-Type': 'application/json',
  'Unleash-ContextParam-userId': '12345',
  'Unleash-ContextParam-sessionId': '67890',
  'Unleash-ContextParam-appName': 'unleash-fullstack-demo-app',
  'Unleash-ContextParam-environment': 'development',
  'Unleash-ContextParam-userRole': 'admin',
  'Unleash-ContextParam-deviceType': 'desktop'
}

const QUERIES = [
  'What are my total expenses?',
  'Show me my expense categories',
  'What is my highest expense?',
  'Analyze my spending patterns'
]

const CHAT_METRIC_FAMILIES = [
  'chat_execution_time_seconds',
  'chat_total_cost_dollars',
  'chat_cost_per_call_dollars',
  'chat_call_count_total'
]

// Sum a metric's value across all its labeled sample lines
const readMetric = (metrics: string, name: string): number =>
  [
    ...metrics.matchAll(
      new RegExp(`^${name}(?:\\{[^}]*\\})? ([0-9.eE+-]+)$`, 'gm')
    )
  ].reduce((sum, match) => sum + Number(match[1]), 0)

test('metrics', async ({ request }) => {
  const before = await (await request.get(`${BACKEND_URL}/metrics`)).text()

  // Generate chat traffic; ignored when the chatbot flag is off
  let served = 0
  for (const message of QUERIES) {
    const res = await request.post(`${BACKEND_URL}/api/chat`, {
      headers: CONTEXT_HEADERS,
      data: { message }
    })
    if (res.status() === 200) served++
  }

  const res = await request.get(`${BACKEND_URL}/metrics`)
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/plain')
  const after = await res.text()

  // Default process metrics are always exposed
  expect(after).toContain('process_cpu_user_seconds_total')

  // All chat metric families are registered
  for (const family of CHAT_METRIC_FAMILIES) {
    expect(after).toContain(family)
  }

  // The insights mirrors (Safeguards demo) are registered at startup
  expect(after).toContain('unleash_fullstack_demo_insights_requests_total')
  expect(after).toContain('unleash_fullstack_demo_insights_response_time_seconds')

  if (served > 0) {
    // The chat requests just made must be visible in the counters
    const callDelta =
      readMetric(after, 'chat_call_count_total') -
      readMetric(before, 'chat_call_count_total')
    expect(callDelta).toBeGreaterThanOrEqual(served)

    const observedDelta =
      readMetric(after, 'chat_execution_time_seconds_count') -
      readMetric(before, 'chat_execution_time_seconds_count')
    expect(observedDelta).toBeGreaterThanOrEqual(served)

    expect(readMetric(after, 'chat_total_cost_dollars')).toBeGreaterThan(
      readMetric(before, 'chat_total_cost_dollars')
    )
  }

  console.log({ metrics: 'ok', served })
})
