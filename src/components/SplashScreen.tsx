import { useState } from 'react'
import { useLocalContext } from '../providers/LocalContextProvider'

export const SplashScreen = () => {
  const { updateContext } = useLocalContext()
  const [selectedAge, setSelectedAge] = useState<number | null>(null)

  const onConfirm = () => {
    if (selectedAge) {
      updateContext({ userAge: selectedAge.toString() })
    }
  }

  return (
    <div className='h-screen w-screen flex items-center justify-center sm:px-4'>
      <div className='sm:border border-slate-900 sm:bg-white text-slate-900 rounded-3xl sm:shadow-xl p-8 w-full max-w-sm text-center animate-fadeInUp'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold mb-2'>Welcome 👋</h1>
          <p className='text-gray-600'>Before we begin, how old are you?</p>
        </div>

        <select
          value={selectedAge ?? ''}
          onChange={e => {
            const value = Number(e.target.value)
            setSelectedAge(isNaN(value) ? null : value)
          }}
          className='w-full p-3 rounded-xl text-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-unleash mb-4'
        >
          <option value=''>Select your age</option>
          {Array.from({ length: 88 }, (_, i) => i + 13).map(age => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>

        <button
          onClick={onConfirm}
          disabled={!selectedAge}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            selectedAge
              ? 'bg-unleash text-white hover:bg-unleash/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
