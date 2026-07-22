import { test, expect, APIRequestContext } from '@playwright/test'

// The chat API lives on the backend, not behind the vite proxy
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:3000'

// Rich context, like client.getContext() would produce, plus custom properties
const CONTEXT_HEADERS = {
  'Content-Type': 'application/json',
  'Unleash-ContextParam-userId': '12345',
  'Unleash-ContextParam-sessionId': '67890',
  'Unleash-ContextParam-appName': 'unleash-fullstack-demo-app',
  'Unleash-ContextParam-environment': 'development',
  'Unleash-ContextParam-userRole': 'admin',
  'Unleash-ContextParam-deviceType': 'desktop'
}

const ask = (request: APIRequestContext, message: string) =>
  request.post(`${BACKEND_URL}/api/chat`, {
    headers: CONTEXT_HEADERS,
    data: { message }
  })

test('chat api', async ({ request }) => {
  const probe = await ask(request, 'What are my total expenses?')

  if (probe.status() === 404) {
    // fsDemoApp.chatbot is off in this environment — nothing more to assert
    console.log({ chatApi: 'flag off' })
    return
  }

  expect(probe.status()).toBe(200)
  const total = await probe.json()

  // The expense data is fixed, so the answers are deterministic in both variants
  expect(total.response).toContain('$606.55')

  const categories = await (
    await ask(request, 'Show me my expense categories')
  ).json()
  for (const category of [
    'Food',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Shopping'
  ]) {
    expect(categories.response).toContain(category)
  }

  const highest = await (await ask(request, 'What is my highest expense?')).json()
  expect(highest.response).toContain('$250.30')
  expect(highest.response).toContain('Shopping')

  // Spending-pattern analysis exists only in the advanced variant; the basic
  // variant answers with its capability description instead
  const patterns = await (await ask(request, 'Analyze my spending patterns')).json()

  // Outside production the responses carry debug fields (variant, timing, cost)
  if ('variant' in total) {
    const responses = [total, categories, highest, patterns]

    // Same userId on every request → the variant must be sticky
    const variants = new Set(responses.map(r => r.variant))
    expect(variants.size).toBe(1)
    const [variant] = variants
    expect(['basic', 'advanced']).toContain(variant)

    if (variant === 'advanced') {
      expect(patterns.response).toContain('Based on your spending pattern')
    } else {
      expect(patterns.response).toContain('I can answer questions about')
    }

    // Simulated latency and cost differ per variant:
    // basic ~500ms ±200 / ~$0.10, advanced ~2s ±500 / ~$0.20
    for (const r of responses) {
      expect(r.costInDollars).toBeGreaterThan(0)
      if (variant === 'basic') {
        expect(r.executionTimeMs).toBeGreaterThan(200)
        expect(r.executionTimeMs).toBeLessThan(1100)
      } else {
        expect(r.executionTimeMs).toBeGreaterThan(1100)
        expect(r.executionTimeMs).toBeLessThan(3000)
      }
    }

    console.log({
      chatApi: 'ok',
      variant,
      timingsMs: responses.map(r => Math.round(r.executionTimeMs))
    })
  } else {
    console.log({ chatApi: 'ok (production shape)' })
  }

  // A request without a message is rejected
  const bad = await request.post(`${BACKEND_URL}/api/chat`, {
    headers: CONTEXT_HEADERS,
    data: {}
  })
  expect(bad.status()).toBe(400)
})
