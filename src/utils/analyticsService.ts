import type { IContext } from 'unleash-proxy-client'

// Generic analytics service. Events are logged to the console instead of
// being sent over HTTP — swap the `track` implementation to plug in a real
// analytics provider.
type AnalyticsProps = Record<string, string | number | boolean>

// Shape emitted by the Unleash client for `impression` events; the SDK does
// not export this type.
type ImpressionEvent = {
  eventType: string
  eventId: string
  context: IContext
  enabled: boolean
  featureName: string
  impressionData?: boolean
  variant?: string
}

const track = (event: string, props?: AnalyticsProps) => {
  console.info('[analytics]', event, props ?? {})
}

// Track Unleash impression events (every flag evaluation) with full detail
export const trackImpression = (event: ImpressionEvent) => {
  console.info('[analytics]', 'impression', event)
}

// Track support button clicks with chatbot variant information
export const trackSupportClick = (chatbotVariant: string) => {
  track('support_click', { chatbotVariant })
}

// Track session start with chatbot variant
export const trackSessionStart = (chatbotVariant: string) => {
  track('session_start', { chatbotVariant })
}

// Track chat open with chatbot variant
export const trackChatOpen = (chatbotVariant: string) => {
  track('chat_open', { chatbotVariant })
}
