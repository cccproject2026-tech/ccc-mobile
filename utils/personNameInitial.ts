/** First letter of a display name for avatar fallbacks (default "P" for Pastor). */
export function getPersonNameInitial(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return "P";
  return trimmed.charAt(0).toUpperCase();
}
