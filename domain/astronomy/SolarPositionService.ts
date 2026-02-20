import {
  Body,
  Equator,
  Horizon,
  Observer,
  type FlexibleDateTime,
} from 'astronomy-engine'

export interface SolarPosition {
  /** Altitude above horizon in degrees */
  altitude: number
  /** Azimuth in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuth: number
  /** Right ascension in hours */
  ra: number
  /** Declination in degrees */
  dec: number
}

export function getSolarPosition(
  lat: number,
  lon: number,
  date: FlexibleDateTime,
  elevation: number = 0,
): SolarPosition {
  const observer = new Observer(lat, lon, elevation)
  const eq = Equator(Body.Sun, date, observer, true, true)
  const hor = Horizon(date, observer, eq.ra, eq.dec)

  return {
    altitude: hor.altitude,
    azimuth: hor.azimuth,
    ra: eq.ra,
    dec: eq.dec,
  }
}
