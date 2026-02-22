import { findNextNewMoon, findPreviousNewMoon } from '../astronomy/ConjunctionService'

export interface LunarDay {
  /** ISO date string YYYY-MM-DD */
  dateStr: string
  /** Label key: "conjunction" | "nextDay" | "dayAfter" */
  labelKey: string
}

/**
 * Compute the 3-day observation triplet anchored on the conjunction
 * closest to (and before or on) the given date.
 *
 * Returns [conjunction day, conj+1, conj+2], or null if no conjunction found.
 */
export function getLunarTriplet(dateStr: string): [LunarDay, LunarDay, LunarDay] | null {
  const endOfDay = new Date(`${dateStr}T23:59:59Z`)
  const conjunction = findPreviousNewMoon(endOfDay)
  if (!conjunction) return null

  const d0 = conjunctionDateStr(conjunction.date)
  const d1 = addDaysToDateStr(d0, 1)
  const d2 = addDaysToDateStr(d0, 2)

  return [
    { dateStr: d0, labelKey: 'conjunction' },
    { dateStr: d1, labelKey: 'nextDay' },
    { dateStr: d2, labelKey: 'dayAfter' },
  ]
}

/**
 * Navigate to the previous lunar month.
 * Returns the "next day" (conj+1) date string for the previous month,
 * which is typically the most interesting observation evening.
 */
export function getPreviousLunarMonth(dateStr: string): string | null {
  const endOfDay = new Date(`${dateStr}T23:59:59Z`)
  const conjunction = findPreviousNewMoon(endOfDay)
  if (!conjunction) return null

  // Go 1 day before this conjunction and search backwards
  const before = new Date(Date.UTC(
    conjunction.date.getUTCFullYear(),
    conjunction.date.getUTCMonth(),
    conjunction.date.getUTCDate(),
  ))
  before.setUTCDate(before.getUTCDate() - 1)

  const prev = findPreviousNewMoon(before)
  if (!prev) return null

  // Default to conj+1 (most interesting evening)
  return addDaysToDateStr(conjunctionDateStr(prev.date), 1)
}

/**
 * Navigate to the next lunar month.
 * Returns the "next day" (conj+1) date string for the next month.
 */
export function getNextLunarMonth(dateStr: string): string | null {
  const endOfDay = new Date(`${dateStr}T23:59:59Z`)
  const conjunction = findPreviousNewMoon(endOfDay)
  if (!conjunction) return null

  // Go 1 day after this conjunction and search forwards
  const after = new Date(Date.UTC(
    conjunction.date.getUTCFullYear(),
    conjunction.date.getUTCMonth(),
    conjunction.date.getUTCDate(),
  ))
  after.setUTCDate(after.getUTCDate() + 1)

  const next = findNextNewMoon(after)
  if (!next) return null

  return addDaysToDateStr(conjunctionDateStr(next.date), 1)
}

/**
 * Get today's date as ISO string YYYY-MM-DD.
 */
export function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// --- Internal helpers ---

/** Extract the UTC date portion of a Date as YYYY-MM-DD. */
function conjunctionDateStr(d: Date): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString().slice(0, 10)
}

/** Add N days to an ISO date string. */
function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
