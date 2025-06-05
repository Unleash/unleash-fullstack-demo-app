import { useFlagsStatus, useVariant } from '@unleash/proxy-client-react'
import toast, { Toaster } from 'react-hot-toast'
import { User } from '../components/User'
import { ChatBotA } from '../components/chat/A/ChatBotA'
import { ChatBotB } from '../components/chat/B/ChatBotB'
import { trackSupportClick, trackSessionStart } from '../utils/trackingService'
import React, { useState } from 'react'
import { SplashScreen } from '../components/SplashScreen'
import { useLocalContext } from '../providers/LocalContextProvider'
import { Feedback } from '../components/feedback/Feedback'
import { useFeedbackApi } from '../hooks/api/useFeedbackApi'

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
    await sendFeedback(`chatbot-${chatbotVariant.name}`, score)
    toast.success(`Thank you for your feedback! Score: ${score}`)
  }

  const {
    context: { userAge },
    resetContext
  } = useLocalContext()

  React.useEffect(() => {
    if (flagsReady) {
      trackSessionStart(chatbotVariant.name || 'none')
    }
  }, [flagsReady, chatbotVariant.name])

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

  const onGetSupport = () => {
    // Track support button click with chatbot variant
    trackSupportClick(chatbotVariant.name || 'none')
    toast.success('Asked for support!')
  }

  if (!userAge) {
    return <SplashScreen />
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
          className: 'bg-slate-900 text-white'
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
          <div className='text-center mt-4 sm:absolute sm:bottom-6 sm:mt-auto sm:ml-4'>
            <button className='text-white underline' onClick={onGetSupport}>
              Get support
            </button>
          </div>
        </div>
        <div className='bg-white text-slate-950 w-full p-6 rounded-t-3xl overflow-hidden flex flex-col gap-4 sm:rounded-3xl sm:gap-6'>
          {children}
        </div>
        {feedbackOpen && <Feedback onScore={onScore} />}
        {chatbotVariant.name === 'basic' ? (
          <ChatBotA onClose={() => setFeedbackOpen(true)} />
        ) : chatbotVariant.name === 'advanced' ? (
          <ChatBotB onClose={() => setFeedbackOpen(true)} />
        ) : null}
      </div>
    </>
  )
}
