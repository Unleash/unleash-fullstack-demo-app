import { useUnleashClient } from '@unleash/proxy-client-react'

const ENDPOINT = 'https://us.app.unleash-hosted.com/ushosted/feedback'

export const useFeedbackApi = () => {
  const client = useUnleashClient()

  const sendFeedback = async (
    feature: string,
    score: number
  ): Promise<void> => {
    const context = client.getContext()

    await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: feature,
        difficultyScore: score,
        userType: `Age: ${context.properties?.userAge || 'unknown'}`
      })
    })
  }

  return {
    sendFeedback
  }
}
