import React, { createContext, useContext, useState } from 'react'
import Bowser from 'bowser'
import { useUnleashContext } from '@unleash/proxy-client-react'
import { random } from '../util/random'
import { filterOutFalsyFromObject } from '../util/filter'
import * as Sentry from '@sentry/react'

type LocalContextData = {
  userId: string
  userAge?: string
  platformType?: string
  platformVendor?: string
  browserName?: string
}

type LocalContextType = {
  context: LocalContextData
  updateContext: (updates: Partial<LocalContextData>) => void
  resetContext: () => void
}

const LocalContext = createContext<LocalContextType | undefined>(undefined)

export const getInitialContext = (): LocalContextData => {
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = random(100000000).toString()
    localStorage.setItem('userId', userId)
  }

  const userAge = localStorage.getItem('userAge') || ''
  const userAgent = Bowser.parse(window.navigator.userAgent)

  const properties = filterOutFalsyFromObject({
    browserName: userAgent.browser.name,
    platformType: userAgent.platform.type,
    platformVendor: userAgent.platform.vendor,
    userAge
  })

  return {
    userId,
    ...properties
  }
}

export const LocalContextProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const replaceContext = useUnleashContext()

  const [context, setContext] = useState<LocalContextData>(getInitialContext)

  const updateContext = (updates: Partial<LocalContextData>) => {
    const updated = { ...context, ...updates }
    setContext(updated)

    const { userId, ...properties } = updated
    replaceContext({
      userId,
      properties
    })

    if (userId) localStorage.setItem('userId', userId)
    if (properties.userAge) localStorage.setItem('userAge', properties.userAge)

    return updated
  }

  const resetContext = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userAge')
    localStorage.removeItem('providedFeedback')
    Sentry.setUser(null)
    Sentry.setContext('localContext', null)
    Sentry.setTag('flag.chatbotVariant', 'none')

    const initialContext = getInitialContext()
    setContext(initialContext)
    const { userId, ...properties } = initialContext
    replaceContext({ userId, properties })
  }

  return (
    <LocalContext.Provider value={{ context, updateContext, resetContext }}>
      {children}
    </LocalContext.Provider>
  )
}

export const useLocalContext = () => {
  const ctx = useContext(LocalContext)
  if (!ctx)
    throw new Error('useLocalContext must be used within LocalContextProvider')
  return ctx
}
