import {
  Body,
  MakeTime,
  Observer,
  SearchRiseSet,
  type AstroTime,
  type FlexibleDateTime,
} from 'astronomy-engine'

/**
 * Find the sunset time for a given location and date.
 * Returns null if the sun doesn't set (e.g. polar regions in summer).
 *
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param date The date to search for sunset (searches within 1 day)
 */
export function findSunset(
  lat: number,
  lon: number,
  date: FlexibleDateTime,
  elevation: number = 0,
): AstroTime | null {
  const observer = new Observer(lat, lon, elevation)
  const startTime = MakeTime(date)
  // direction = -1 means setting; search up to 1 day ahead
  return SearchRiseSet(Body.Sun, observer, -1, startTime, 1, elevation) ?? null
}
