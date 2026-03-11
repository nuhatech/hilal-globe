import {
  MakeTime,
  SearchMoonPhase,
  type AstroTime,
  type FlexibleDateTime,
} from 'astronomy-engine'

/**
 * Find the most recent new moon (conjunction) before or on the given date.
 * Searches backwards up to 35 days.
 *
 * @param date Reference date
 * @returns The AstroTime of the new moon, or null if not found
 */
export function findPreviousNewMoon(date: FlexibleDateTime): AstroTime | null {
  const time = MakeTime(date)
  // Iterate to find the LAST new moon before the target date, not the first.
  // Starting 35 days back may land before an earlier new moon cycle,
  // so we loop through all matches and keep the latest one before `date`.
  let searchFrom = time.AddDays(-35)
  let result: AstroTime | null = null
  while (true) {
    const found = SearchMoonPhase(0, searchFrom, 36)
    if (!found || found.ut > time.ut) break
    result = found
    searchFrom = found.AddDays(1)
  }
  return result
}

/**
 * Find the next new moon (conjunction) on or after the given date.
 *
 * @param date Reference date
 * @returns The AstroTime of the new moon, or null if not found
 */
export function findNextNewMoon(date: FlexibleDateTime): AstroTime | null {
  const time = MakeTime(date)
  return SearchMoonPhase(0, time, 35) ?? null
}

/**
 * Find whichever conjunction (previous or next) is closer to the given date.
 *
 * @param date Reference date
 * @returns The AstroTime of the nearest new moon, or null if neither found
 */
export function findNearestNewMoon(date: FlexibleDateTime): AstroTime | null {
  const prev = findPreviousNewMoon(date)
  const next = findNextNewMoon(date)
  if (!prev) return next
  if (!next) return prev
  const time = MakeTime(date)
  return (time.ut - prev.ut) <= (next.ut - time.ut) ? prev : next
}
