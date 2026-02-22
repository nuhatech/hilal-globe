import type { VisibilityResult } from './VisibilityResult'

export interface CelestialPosition {
  /** Altitude above horizon in degrees */
  altitude: number
  /** Azimuth in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuth: number
  /** Right ascension in hours */
  ra: number
  /** Declination in degrees */
  dec: number
  /** Ecliptic longitude in degrees */
  eclipticLon: number
  /** Ecliptic latitude in degrees */
  eclipticLat: number
}

/** Summary row for the 3-day table. Always anchored on conjunction date. */
export interface DaySummary {
  dateStr: string
  labelKey: string // "conjunction" | "nextDay" | "dayAfter"
  noSunset: boolean
  moonAge: number | null // hours since conjunction at sunset
  lagTimeMinutes: number | null
  elongation: number | null
  moonAltSunset: number | null
  illuminationPct: number | null
  visibility: VisibilityResult | null
}

export interface LocationDetail {
  // Key times
  sunsetUtc: string
  moonsetUtc: string | null
  bestTimeUtc: string | null
  moonAge: number // hours since conjunction at sunset
  lagTimeMinutes: number | null

  // Moon position at sunset
  moonSunset: CelestialPosition

  // Sun position at sunset
  sunSunset: CelestialPosition

  // Relative position (at sunset)
  ARCV: number
  DAZ: number
  elongation: number
  phaseAngle: number

  // Moon characteristics (at sunset)
  illuminationPct: number // 0-100
  crescentWidth: number // arcminutes
  distanceKm: number
  magnitude: number
  semiDiameter: number // arcminutes

  // Visibility prediction
  bestTimeARCV: number | null
  bestTimeW: number | null
  criterionValue: number | null
  criterionLabel: string // "q = 0.216" or "V = 8.665"
  visibility: VisibilityResult

  // Elevation context (only populated when elevation mode active)
  elevationMeters?: number
  horizonDipDeg?: number
}

export interface LocationReport {
  lat: number
  lon: number
  dateStr: string

  /** Approximate solar-time UTC offset in hours, derived from longitude.
   *  Rounded to nearest 0.5h. E.g. lon=46° → +3, lon=52.5° → +3.5 */
  utcOffsetHours: number

  // 3-day summary (always: conjunction day, conj+1, conj+2)
  conjunctionUtc: string
  daySummaries: [DaySummary, DaySummary, DaySummary]

  // Detailed data for the selected date - null when no sunset (polar)
  detail: LocationDetail | null
}
