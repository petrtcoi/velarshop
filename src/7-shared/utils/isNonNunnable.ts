export function isNonNunnable<T> ( value: T ): value is NonNullable<T> {
  return value !== undefined && value !== null
}