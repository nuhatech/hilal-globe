import {
  Body,
  Equator,
  Horizon,
  Libration,
  Observer,
  type FlexibleDateTime,
} from 'astronomy-engine'

export interface LunarPosition {
  /** Altitude above horizon in degrees */
  altitude: number
  /** Azimuth in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuth: number
  /** Right ascension in hours */
  ra: number
  /** Declination in degrees */
  dec: number
  /** Moon semi-diameter in arcminutes */
  semiDiameter: number
}

export function getLunarPosition(
  lat: number,
  lon: number,
  date: FlexibleDateTime,
): LunarPosition {
  const observer = new Observer(lat, lon, 0)
  const eq = Equator(Body.Moon, date, observer, true, true)
  const hor = Horizon(date, observer, eq.ra, eq.dec)
  const lib = Libration(date)

  // Libration.diam_deg is the full apparent diameter in degrees
  // Semi-diameter = diameter / 2, converted to arcminutes (* 60)
  const semiDiameter = (lib.diam_deg / 2) * 60

  return {
    altitude: hor.altitude,
    azimuth: hor.azimuth,
    ra: eq.ra,
    dec: eq.dec,
    semiDiameter,
  }
}
