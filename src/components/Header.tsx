import {
  getUnleashEnvironment,
  getUnleashProjectUrl
} from '../utils/unleashEnvironment'

export const Header = () => {
  const environment = getUnleashEnvironment()
  const envText =
    environment === '(not set)'
      ? 'environment not set'
      : `${environment} environment`

  return (
    <div className='hidden sm:flex sticky top-0 bg-web text-white h-12 items-center justify-center gap-4'>
      This demo is controlled by Unleash ({envText}).
      <a
        href={`${getUnleashProjectUrl()}/features/fsDemoApp.chatbot`}
        target='_blank'
        className='bg-unleash px-6 py-1.5 font-bold rounded text-sm'
      >
        Open Unleash
      </a>
    </div>
  )
}
