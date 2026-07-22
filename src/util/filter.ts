export const filterOutFalsyFromObject = <T extends Record<string, unknown>>(
  obj: T
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => Boolean(value))
  ) as Partial<T>
}
