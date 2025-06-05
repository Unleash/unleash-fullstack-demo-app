import { Icon } from '@iconify/react'
import { toast } from 'react-hot-toast'
import { useFlag } from '@unleash/proxy-client-react'
import { useLocalContext } from '../providers/LocalContextProvider'

export const User = () => {
  const showContext = useFlag('fsDemoApp.showContext')

  const {
    context: { userId, ...properties }
  } = useLocalContext()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userId!)
    toast.success('userId copied to clipboard')
  }

  return (
    <div className='mt-4 sm:mt-0 flex flex-col items-center gap-2 w-full sm:max-w-xs min-w-[230px]'>
      <img
        src='/unleash.svg'
        alt='Unleash logo'
        className='hidden sm:block h-20 w-20'
      />
      <p className='hidden sm:block text-xl sm:text-3xl'>Welcome</p>
      <button
        className='flex flex-row items-center bg-unleash px-4 py-2 rounded'
        title='Click to copy the userId to your clipboard'
        onClick={copyToClipboard}
      >
        <strong className='mr-1'>userId:</strong>
        {userId}
        <Icon icon='ic:round-content-copy' className='ml-2' />
      </button>
      {showContext && (
        <pre className='text-xs p-2 mt-2 rounded-md bg-slate-800 border border-slate-600'>
          {JSON.stringify(properties, null, 2)}
        </pre>
      )}
    </div>
  )
}
