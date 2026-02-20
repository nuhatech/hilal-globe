/**
 * Apply a UTC offset (in hours) to a UTC ISO timestamp,
 * returning a Date shifted to approximate local time.
 */
export function applyUtcOffset(utcIso: string, offsetHours: number): Date {
  return new Date(new Date(utcIso).getTime() + offsetHours * 3_600_000)
}

/**
 * Format a UTC offset as a human-readable label.
 * Examples: "UTC+3", "UTC-5", "UTC+3:30", "UTC+0"
 */
export function formatUtcOffsetLabel(offsetHours: number): string {
  const sign = offsetHours >= 0 ? '+' : ''
  if (offsetHours % 1 === 0) return `UTC${sign}${offsetHours}`
  const whole = Math.trunc(offsetHours)
  return `UTC${sign}${whole}:30`
}
