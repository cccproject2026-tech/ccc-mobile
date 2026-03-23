/** Expo Router search/segment params may be `string | string[]`. */
export function paramToString(
  value: string | string[] | undefined | null,
): string | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
}
