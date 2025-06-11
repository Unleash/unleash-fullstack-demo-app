import { useFlagsStatus, useVariant } from '@unleash/proxy-client-react'
import toast, { Toaster } from 'react-hot-toast'
import { User } from '../components/User'
import { ChatBotA } from '../components/chat/A/ChatBotA'
import { ChatBotB } from '../components/chat/B/ChatBotB'
import {
  trackSupportClick,
  trackSessionStart,
  trackChatOpen
} from '../utils/plausibleService.ts'
import {
  trackSupportClick as trackMixpanelSupportClick,
  trackSessionStart as trackMixpanelSessionStart,
  trackChatOpen as trackMixpanelChatOpen
} from '../utils/mixpanelService'
import React, { useEffect, useState } from 'react'
import { SplashScreen } from '../components/SplashScreen'
import { useLocalContext } from '../providers/LocalContextProvider'
import { Feedback } from '../components/feedback/Feedback'
import { useFeedbackApi } from '../hooks/api/useFeedbackApi'
import * as Sentry from '@sentry/react'

const MENU = ['Dashboard', 'Summary', 'Expenses', 'Wallet', 'Settings']

interface IAppLayoutProps {
  children: React.ReactNode
}

export const AppLayout = ({ children }: IAppLayoutProps) => {
  const { flagsReady, flagsError } = useFlagsStatus()
  const chatbotVariant = useVariant('fsDemoApp.chatbot')

  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const { sendFeedback } = useFeedbackApi()

  const onScore = async (score: number) => {
    setFeedbackOpen(false)
    localStorage.setItem('providedFeedback', '1')
    await sendFeedback(`chatbot-${chatbotVariant.name}`, score)
    Sentry.captureFeedback({
      message: `Chatbot: ${chatbotVariant.name}. Score: ${score}`
    })
    toast.success(`Thank you for your feedback! Score: ${score}`)
  }

  const { context, resetContext } = useLocalContext()

  useEffect(() => {
    if (flagsReady) {
      // Plausible
      trackSessionStart(chatbotVariant.name || 'none')
      // Mixpanel
      trackMixpanelSessionStart(chatbotVariant.name || 'none')
      // Sentry
      Sentry.setUser({ id: context.userId })
      Sentry.setContext('localContext', context)
      Sentry.setTag('flag.chatbotVariant', chatbotVariant.name || 'none')
    }
  }, [flagsReady, chatbotVariant.name])

  const onGetSupport = () => {
    // Track support button click with chatbot variant
    trackSupportClick(chatbotVariant.name || 'none')
    trackMixpanelSupportClick(chatbotVariant.name || 'none')
    toast.success('Asked for support!')
  }

  const onChatOpen = () => {
    // Track chat open with chatbot variant
    trackChatOpen(chatbotVariant.name || 'none')
    trackMixpanelChatOpen(chatbotVariant.name || 'none')
  }

  const onChatClose = () => {
    if (!localStorage.getItem('providedFeedback')) {
      setFeedbackOpen(true)
    }
  }

  if (!context.userAge) {
    return <SplashScreen />
  }

  if (!flagsReady) {
    return null
  }

  if (flagsError) {
    console.error(flagsError)
    return (
      <div className='bg-slate-900 text-white w-full flex flex-col items-center sm:w-auto sm:rounded-3xl sm:flex-row sm:p-5'>
        Something went wrong. Check the console for more information.
      </div>
    )
  }

  return (
    <>
      <img
        src='/unleash.svg'
        alt='Unleash logo'
        className='absolute top-2 left-2 h-6 w-6 z-10 sm:hidden'
      />
      <button
        className='absolute top-2 right-2 underline text-white sm:text-black z-10 text-xs'
        onClick={() => {
          setFeedbackOpen(false)
          resetContext()
        }}
      >
        Reset demo
      </button>
      <Toaster
        position='bottom-center'
        toastOptions={{
          style: {
            backgroundColor: '#0f172a',
            color: '#ffffff'
          }
        }}
      />
      <div className='bg-slate-900 text-white w-full flex flex-col items-center sm:w-auto sm:rounded-3xl sm:flex-row sm:p-5 sm:items-start transition-colors animate-fadeIn relative'>
        <div className='p-4 sm:p-0 mt-2 sm:mt-6 sm:mr-6'>
          <User />
          <div className='hidden sm:block'>
            <hr className='my-6 border-gray-600' />
            <ul className='flex flex-col gap-4'>
              {MENU.map((item, index) => {
                if (item === 'Expenses') {
                  return (
                    <li
                      key={index}
                      className='text-white text-2xl font-semibold tracking-wider cursor-pointer pl-4 border-l-4'
                    >
                      {item}
                    </li>
                  )
                }

                return (
                  <li
                    key={index}
                    className='text-white text-2xl font-semibold tracking-wider cursor-pointer pl-4 opacity-50 hover:opacity-100'
                  >
                    {item}
                  </li>
                )
              })}
            </ul>
          </div>
          <div className='text-center mt-4 sm:absolute sm:bottom-6 sm:mt-auto sm:px-4 bg-slate-900'>
            <button className='text-white underline' onClick={onGetSupport}>
              Get support
            </button>
          </div>
        </div>
        <div className='bg-white text-slate-950 w-full p-6 rounded-t-3xl overflow-hidden flex flex-col gap-4 sm:rounded-3xl sm:gap-6'>
          {children}
        </div>
        {feedbackOpen && chatbotVariant.enabled && (
          <Feedback onScore={onScore} />
        )}
        {chatbotVariant.name === 'basic' ? (
          <ChatBotA onOpen={onChatOpen} onClose={onChatClose} />
        ) : chatbotVariant.name === 'advanced' ? (
          <ChatBotB onOpen={onChatOpen} onClose={onChatClose} />
        ) : null}
      </div>
    </>
  )
}
