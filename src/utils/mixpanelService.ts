import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with the provided token
mixpanel.init(import.meta.env.VITE_MIXPANEL_KEY || 'db4e08ee658348e7871fcd28f69bb785', {
  debug: process.env.NODE_ENV !== 'production',
  track_pageview: true,
  persistence: 'localStorage',
  ip: true,
});

// Track support button clicks with chatbot variant information
export const trackSupportClick = (chatbotVariant: string) => {
  mixpanel.track('support_click', {
    chatbotVariant,
  });
};

// Track session start with chatbot variant
export const trackSessionStart = (chatbotVariant: string) => {
  mixpanel.track('session_start', {
    chatbotVariant,
  });
};

// Track chat open with chatbot variant
export const trackChatOpen = (chatbotVariant: string) => {
  mixpanel.track('chat_open', {
    chatbotVariant,
  });
};

// Export the mixpanel instance for custom tracking needs
export default mixpanel;
