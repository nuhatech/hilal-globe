import {
  Body,
  MakeTime,
  Observer,
  SearchRiseSet,
  type AstroTime,
  type FlexibleDateTime,
} from 'astronomy-engine'

/**
 * Find the moonset time for a given location, searching forward from `date`.
 * Returns null if the moon doesn't set within 1 day (e.g. polar regions).
 *
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param date The start time to search from (typically sunset)
 */
export function findMoonset(
  lat: number,
  lon: number,
  date: FlexibleDateTime,
): AstroTime | null {
  const observer = new Observer(lat, lon, 0)
  const startTime = MakeTime(date)
  // direction = -1 means setting; search up to 1 day ahead
  return SearchRiseSet(Body.Moon, observer, -1, startTime, 1) ?? null
}
