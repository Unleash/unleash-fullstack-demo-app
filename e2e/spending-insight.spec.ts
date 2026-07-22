import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_URL || 'http://localhost:5173'

// The same userId is seeded into the browser and sent with the API probes, so
// frontend and backend evaluate the flag for the same user — under a gradual
// rollout both land in the same bucket (stickiness on userId).
const USER_ID = '12345'

const CONTEXT_HEADERS = {
  'Unleash-ContextParam-userId': USER_ID,
  'Unleash-ContextParam-sessionId': '67890'
}

test('spending insight', async ({ page, request }) => {
  // Establish the backend's view of the flag first
  const probe = await request.get(`${BASE_URL}/api/insights`, {
    headers: CONTEXT_HEADERS
  })
  const flagOn = probe.status() !== 404

  // Seed the local context so the splash is skipped and the widget evaluates
  // with the same userId as the API probes
  await page.addInitScript(userId => {
    localStorage.setItem('userId', userId)
    localStorage.setItem('userAge', '35')
  }, USER_ID)
  await page.goto(BASE_URL)

  const widget = page.getByTestId('spending-insight')

  if (!flagOn) {
    // Flag off (or disabled by a safeguard): the endpoint 404s and the
    // widget never renders
    await page.waitForTimeout(3000)
    await expect(widget).toHaveCount(0)
    console.log({ spendingInsight: 'off' })
    return
  }

  // Flag on: the widget appears with either the insight or the error state
  await expect(widget).toBeVisible({ timeout: 10000 })
  await expect(widget).toContainText('AI Spending Insight')

  // The endpoint answers 200 with an insight or a simulated 500 — never
  // anything else while the flag is on
  const statuses = new Set<number>()
  for (let i = 0; i < 8; i++) {
    const res = await request.get(`${BASE_URL}/api/insights`, {
      headers: CONTEXT_HEADERS
    })
    statuses.add(res.status())

    if (res.status() === 200) {
      const body = await res.json()
      expect(body.insight).toMatch(/% of your spending/)
    } else {
      expect(res.status()).toBe(500)
    }
  }
  console.log({ spendingInsight: 'on', statuses: [...statuses] })
})
