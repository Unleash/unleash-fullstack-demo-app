import { test, expect } from '@playwright/test'
import { getBiasedNumber, pickRandom } from './util'

const BASIC_INPUTS = [
  'What can you do?',
  'What are my total expenses?',
  'What are my spending categories?',
  'What is my highest expense?'
]

const ADVANCED_INPUTS = [
  ...BASIC_INPUTS,
  'Can you tell me more about my spending pattern?',
  'Can you run an analysis on my expenses?'
]

test('chatbot', async ({ page }) => {
  await page.goto(process.env.E2E_URL || 'http://localhost:5173')

  const getSupport = async () => {
    await page.click('text=Get support')
    await expect(page.getByText('Asked for support!')).toBeVisible()
  }

  await page
    .getByRole('combobox')
    .selectOption(getBiasedNumber(13, 100, 35, 10).toString())
  await page.click('text=Continue')

  const chatBotButton = await page.getByTestId('chatbot-button')
  try {
    await expect(chatBotButton).toBeVisible({ timeout: 2000 })
  } catch {
    await getSupport()
    console.log({
      chatbot: 'None',
      inputMessage: 'N/A',
      score: 'N/A',
      supportRequested: true
    })
    return
  }

  await chatBotButton.click()
  const isAdvancedChatBot = await page.getByText('(advanced)').isVisible()

  const inputMessage = pickRandom(
    isAdvancedChatBot ? ADVANCED_INPUTS : BASIC_INPUTS
  )
  const input = await page.getByRole('textbox', {
    name: 'Type your message here'
  })
  await input.fill(inputMessage)
  await input.press('Enter')

  await page.getByTestId('chatbot-close').click()

  const rating = isAdvancedChatBot
    ? getBiasedNumber(1, 7, 2, 2)
    : getBiasedNumber(1, 7, 6, 1)

  await page.getByTestId(`chatbot-rating-${rating}`).click()
  await expect(
    page.getByText(`Thank you for your feedback! Score: ${rating}`)
  ).toBeVisible()

  if (rating === 1) {
    await getSupport()
    console.log({
      chatbot: isAdvancedChatBot ? 'advanced' : 'basic',
      inputMessage,
      score: rating,
      supportRequested: true
    })
    return
  }
  console.log({
    chatbot: isAdvancedChatBot ? 'advanced' : 'basic',
    inputMessage,
    score: rating,
    supportRequested: false
  })
})
