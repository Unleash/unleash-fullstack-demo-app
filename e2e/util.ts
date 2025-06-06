export const getBiasedNumber = (min, max, mean, stdDev) => {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num * stdDev + mean
  num = Math.round(num)

  return Math.min(max, Math.max(min, num))
}

export function pickRandom<T>(array: T[]): T {
  if (!array.length) {
    throw new Error('Cannot pick from an empty array')
  }
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}
