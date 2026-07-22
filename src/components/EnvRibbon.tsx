import { getUnleashEnvironment } from '../utils/unleashEnvironment'

const COLORS: Record<string, string> = {
  development: 'bg-amber-500',
  production: 'bg-emerald-600'
}

// Fixed 45°-rotated ribbon in the top-right corner showing which Unleash
// environment the app is connected to. Purely decorative: it ignores pointer
// events and is hidden from assistive technology.
export const EnvRibbon = () => {
  const environment = getUnleashEnvironment()
  const color = COLORS[environment] ?? 'bg-sky-600'

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed top-0 right-0 z-50 h-32 w-32 overflow-hidden'
    >
      <div
        className={`${color} absolute top-[32px] right-[-42px] w-[170px] rotate-45 py-1 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md`}
      >
        {environment}
      </div>
    </div>
  )
}
