import { test, expect } from '@playwright/test'
import { getBiasedNumber } from './util'

test('chatbot', async ({ page }) => {
  await page.goto(process.env.E2E_URL || 'http://localhost:5173')

  await page
    .getByRole('combobox')
    .selectOption(getBiasedNumber(13, 100, 35, 10).toString())
  await page.click('text=Continue')

  const chatBotButton = await page.getByTestId('chatbot-button')
  const isChatBotVisible = await chatBotButton.isVisible()

  if (!isChatBotVisible) {
    await page.click('text=Get support')
    await expect(page.getByText('Asked for support!')).toBeVisible()
    return
  }

  await chatBotButton.click()
  const isAdvancedChatBot = await page.getByText('(advanced)').isVisible()
  const input = await page.getByRole('textbox', {
    name: 'Type your message here'
  })
  await input.fill('Hello')
  await input.press('Enter')

  await page.getByTestId('chatbot-close').click()

  const rating = isAdvancedChatBot
    ? getBiasedNumber(1, 7, 2, 1)
    : getBiasedNumber(1, 7, 6, 1)

  await page.getByTestId(`chatbot-rating-${rating}`).click()
  await expect(
    page.getByText(`Thank you for your feedback! Score: ${rating}`)
  ).toBeVisible()

  if (rating === 1) {
    await page.click('text=Get support')
    await expect(page.getByText('Asked for support!')).toBeVisible()
  }
})
