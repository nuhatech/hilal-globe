import { Body, Equator, Observer, SiderealTime, MakeTime } from 'astronomy-engine'

export interface SubsolarPoint {
  /** Latitude in degrees (-23.4 to +23.4 over the year) */
  lat: number
  /** Longitude in degrees (-180 to 180) */
  lon: number
}

/**
 * Compute the subsolar point — the lat/lon where the sun is directly overhead.
 * Used to derive the day/night terminator on the globe.
 */
export function getSubsolarPoint(date: Date): SubsolarPoint {
  const t = MakeTime(date)

  // Geocentric equatorial coordinates (RA in hours, Dec in degrees)
  const observer = new Observer(0, 0, 0)
  const eq = Equator(Body.Sun, t, observer, true, true)

  // Subsolar latitude = sun's declination
  const lat = eq.dec

  // Subsolar longitude = (GAST - RA) * 15, normalized to [-180, 180]
  const gast = SiderealTime(t) // Greenwich Apparent Sidereal Time in hours
  let lon = (gast - eq.ra) * 15
  if (lon > 180) lon -= 360
  if (lon < -180) lon += 360

  return { lat, lon }
}
