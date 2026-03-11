import { findNextNewMoon, findPreviousNewMoon } from '../astronomy/ConjunctionService'

export interface LunarDay {
  /** ISO date string YYYY-MM-DD */
  dateStr: string
  /** Label key: "conjunction" | "nextDay" | "dayAfter" */
  labelKey: string
}

/**
 * Find the most relevant observation date (conj+1) for app default.
 * If today is within the previous conjunction's observation window (0–2 days after),
 * use that conjunction. Otherwise use the next conjunction.
 */
export function findRelevantObservationDate(): string {
  const today = new Date()
  const prev = findPreviousNewMoon(today)
  const next = findNextNewMoon(today)

  if (prev) {
    const daysSinceConj = (today.getTime() - prev.date.getTime()) / 86_400_000
    if (daysSinceConj <= 2) {
      return addDaysToDateStr(conjunctionDateStr(prev.date), 1)
    }
  }

  if (next) {
    return addDaysToDateStr(conjunctionDateStr(next.date), 1)
  }

  if (prev) {
    return addDaysToDateStr(conjunctionDateStr(prev.date), 1)
  }

  return today.toISOString().slice(0, 10)
}

/**
 * Given a date, return the next conjunction date as YYYY-MM-DD.
 * Used by the NoCrescentBanner to navigate to the start of the observation window.
 */
export function getNextObservationDateStr(dateStr: string): string | null {
  const date = new Date(`${dateStr}T12:00:00Z`)
  const next = findNextNewMoon(date)
  if (!next) return null
  const conjDate = conjunctionDateStr(next.date)
  // If the next conjunction is on or before the input date, search further
  if (conjDate <= dateStr) {
    const afterConj = new Date(next.date)
    afterConj.setUTCDate(afterConj.getUTCDate() + 1)
    const nextNext = findNextNewMoon(afterConj)
    if (!nextNext) return null
    return conjunctionDateStr(nextNext.date)
  }
  return conjDate
}

/**
 * Compute the 3-day observation triplet anchored on the conjunction
 * closest to (and before or on) the given date.
 * If the date is >15 days past the previous conjunction, uses the next conjunction instead.
 *
 * Returns [conjunction day, conj+1, conj+2], or null if no conjunction found.
 */
export function getLunarTriplet(dateStr: string): [LunarDay, LunarDay, LunarDay] | null {
  const endOfDay = new Date(`${dateStr}T23:59:59Z`)
  let conjunction = findPreviousNewMoon(endOfDay)

  // If we're more than 15 days past the previous conjunction, use the next one
  if (conjunction) {
    const daysSince = (endOfDay.getTime() - conjunction.date.getTime()) / 86_400_000
    if (daysSince > 15) {
      const next = findNextNewMoon(endOfDay)
      if (next) conjunction = next
    }
  } else {
    conjunction = findNextNewMoon(endOfDay)
  }

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
