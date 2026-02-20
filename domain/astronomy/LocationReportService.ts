import {
  AngleFromSun,
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  Illumination,
  KM_PER_AU,
  MakeTime,
  type AstroTime,
} from 'astronomy-engine'

import type { GeoCoordinate } from '../models/GeoCoordinate'
import type {
  CelestialPosition,
  DaySummary,
  LocationDetail,
  LocationReport,
} from '../models/LocationReport'
import type { VisibilityResult } from '../models/VisibilityResult'
import { ZoneCode } from '../models/ZoneCode'
import { ZONE_LABELS } from '../models/ZoneConfig'

import { getCriterion } from '../criteria/CriteriaRegistry'
import { computeYallopQBase } from '../criteria/yallopBase'

import { findPreviousNewMoon } from './ConjunctionService'
import { computeCrescentParams } from './CrescentParamsService'
import { getLunarPosition } from './LunarPositionService'
import { findMoonset } from './MoonsetService'
import { getSolarPosition } from './SolarPositionService'
import { findSunset } from './SunsetService'

/**
 * Find sunset for a given date string at the given coordinates.
 * Adjusts noon UTC by approximate timezone offset from longitude.
 */
function findSunsetForDate(
  lat: number,
  lon: number,
  dateStr: string,
): AstroTime | null {
  const tzOffsetHours = lon / 15
  const noonUtc = new Date(`${dateStr}T12:00:00Z`)
  noonUtc.setTime(noonUtc.getTime() - tzOffsetHours * 3_600_000)
  return findSunset(lat, lon, noonUtc)
}

/**
 * Add N days to an ISO date string "YYYY-MM-DD" → "YYYY-MM-DD".
 */
function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Format AstroTime as ISO UTC string.
 */
function astroTimeToUtcStr(t: AstroTime): string {
  return MakeTime(t).date.toISOString()
}

/**
 * Compute the criterion-specific raw score value and its display label.
 */
function computeCriterionValue(
  criterionId: string,
  params: import('../models/CrescentParams').CrescentParams,
): { value: number; label: string } {
  switch (criterionId) {
    case 'yallop': {
      const q = (params.ARCVGeo - computeYallopQBase(params.W)) / 10
      return { value: q, label: `q = ${q.toFixed(3)}` }
    }
    case 'odeh': {
      const V =
        params.ARCV -
        (7.1651 -
          6.3226 * params.W +
          0.7319 * params.W * params.W -
          0.1018 * params.W * params.W * params.W)
      return { value: V, label: `V = ${V.toFixed(3)}` }
    }
    case 'shaukat': {
      const M = Math.max(params.moonAltSunset, 3.4)
      const S = M / 12.7 + params.WSunset / 1.2
      return { value: S, label: `S = ${S.toFixed(2)}` }
    }
    case 'istanbul78': {
      const elongMargin = params.ARCLSunset - 8.0
      const altMargin = params.moonAltSunset - 5.0
      const margin = Math.min(elongMargin, altMargin)
      return { value: margin, label: `margin = ${margin.toFixed(1)}\u00B0` }
    }
    case 'saao': {
      const arcvLimit =
        12 -
        0.7 * params.DAZSunset +
        0.015 * params.DAZSunset * params.DAZSunset
      const margin = params.ARCVSunset - arcvLimit
      return { value: margin, label: `margin = ${margin.toFixed(1)}\u00B0` }
    }
    default:
      return { value: 0, label: 'N/A' }
  }
}

/**
 * Compute a DaySummary for one date at the given location.
 */
function computeDaySummary(
  lat: number,
  lon: number,
  dateStr: string,
  label: string,
  conjunction: AstroTime,
  criterionId: string,
): DaySummary {
  const sunset = findSunsetForDate(lat, lon, dateStr)

  if (!sunset) {
    return {
      dateStr,
      label,
      noSunset: true,
      moonAge: null,
      lagTimeMinutes: null,
      elongation: null,
      moonAltSunset: null,
      illuminationPct: null,
      visibility: null,
    }
  }

  // Moon age at sunset
  const moonAge = (sunset.ut - conjunction.ut) * 24

  // Moon at sunset
  const moonAtSunset = getLunarPosition(lat, lon, sunset)

  // Elongation at sunset
  const elongation = AngleFromSun(Body.Moon, sunset)

  // Illumination at sunset
  const illum = Illumination(Body.Moon, sunset)
  const illuminationPct = illum.phase_fraction * 100

  // Lag time (moonset - sunset)
  let lagTimeMinutes: number | null = null
  if (moonAtSunset.altitude > 0) {
    const moonset = findMoonset(lat, lon, sunset)
    if (moonset && moonset.ut > sunset.ut) {
      lagTimeMinutes = (moonset.ut - sunset.ut) * 24 * 60
    }
  }

  // Visibility
  let visibility: VisibilityResult | null = null
  if (moonAtSunset.altitude > 0) {
    const params = computeCrescentParams({ lat, lon }, dateStr, conjunction)
    if (params) {
      visibility = getCriterion(criterionId).evaluate(params)
    } else {
      visibility = {
        zone: ZoneCode.NOT_VISIBLE,
        label: ZONE_LABELS[ZoneCode.NOT_VISIBLE],
      }
    }
  } else {
    visibility = {
      zone: ZoneCode.NOT_VISIBLE,
      label: 'Moon below horizon',
    }
  }

  return {
    dateStr,
    label,
    noSunset: false,
    moonAge: moonAtSunset.altitude > 0 ? moonAge : null,
    lagTimeMinutes,
    elongation,
    moonAltSunset: moonAtSunset.altitude,
    illuminationPct,
    visibility,
  }
}

/**
 * Compute a full LocationReport for a given location, date, and criterion.
 *
 * @param coord Observer coordinates
 * @param dateStr ISO date string for the selected evening (e.g. "2026-02-18")
 * @param criterionId Criterion identifier (e.g. "odeh", "yallop")
 * @returns LocationReport, or null if conjunction cannot be found
 */
export function computeLocationReport(
  coord: GeoCoordinate,
  dateStr: string,
  criterionId: string,
): LocationReport | null {
  const { lat, lon } = coord

  // Find conjunction (new moon) before the selected date.
  // Use end-of-day to catch conjunctions occurring any time during the selected date.
  const endOfDay = new Date(`${dateStr}T23:59:59Z`)
  const conjunction = findPreviousNewMoon(endOfDay)
  if (!conjunction) return null

  const conjunctionUtc = astroTimeToUtcStr(conjunction)

  // 3-day summary anchored on conjunction date
  const conjDateStr = conjunction.date.toISOString().slice(0, 10)
  const daySummaries: [DaySummary, DaySummary, DaySummary] = [
    computeDaySummary(lat, lon, conjDateStr, 'Conjunction Day', conjunction, criterionId),
    computeDaySummary(lat, lon, addDaysToDateStr(conjDateStr, 1), 'Next Day', conjunction, criterionId),
    computeDaySummary(lat, lon, addDaysToDateStr(conjDateStr, 2), 'Day After', conjunction, criterionId),
  ]

  // Detailed report for the selected date
  const detail = computeDetail(lat, lon, dateStr, conjunction, criterionId)

  return {
    lat,
    lon,
    dateStr,
    conjunctionUtc,
    daySummaries,
    detail,
  }
}

/**
 * Compute the detailed LocationDetail for a single date.
 */
function computeDetail(
  lat: number,
  lon: number,
  dateStr: string,
  conjunction: AstroTime,
  criterionId: string,
): LocationDetail | null {
  const sunset = findSunsetForDate(lat, lon, dateStr)
  if (!sunset) return null // No sunset (polar)

  const sunsetUtc = astroTimeToUtcStr(sunset)

  // Moon and sun positions at sunset
  const moonAtSunset = getLunarPosition(lat, lon, sunset)
  const sunAtSunset = getSolarPosition(lat, lon, sunset)

  // Ecliptic coordinates for moon at sunset
  const moonEcl = EclipticGeoMoon(sunset)

  // Ecliptic coordinates for sun at sunset
  const sunVec = GeoVector(Body.Sun, sunset, true)
  const sunEcl = Ecliptic(sunVec)

  // Build CelestialPosition objects
  const moonSunset: CelestialPosition = {
    altitude: moonAtSunset.altitude,
    azimuth: moonAtSunset.azimuth,
    ra: moonAtSunset.ra,
    dec: moonAtSunset.dec,
    eclipticLon: moonEcl.lon,
    eclipticLat: moonEcl.lat,
  }

  const sunSunset: CelestialPosition = {
    altitude: sunAtSunset.altitude,
    azimuth: sunAtSunset.azimuth,
    ra: sunAtSunset.ra,
    dec: sunAtSunset.dec,
    eclipticLon: sunEcl.elon,
    eclipticLat: sunEcl.elat,
  }

  // Moon age at sunset (hours since conjunction)
  const moonAge = (sunset.ut - conjunction.ut) * 24

  // Relative position at sunset
  const ARCV = moonAtSunset.altitude - sunAtSunset.altitude
  const elongation = AngleFromSun(Body.Moon, sunset)

  // DAZ at sunset
  let DAZ = Math.abs(moonAtSunset.azimuth - sunAtSunset.azimuth)
  if (DAZ > 180) DAZ = 360 - DAZ

  // Phase angle and illumination
  const illum = Illumination(Body.Moon, sunset)
  const phaseAngle = illum.phase_angle
  const illuminationPct = illum.phase_fraction * 100
  const magnitude = illum.mag
  const distanceKm = illum.geo_dist * KM_PER_AU

  // Crescent width at sunset
  const SD = moonAtSunset.semiDiameter
  const WSunset = SD * (1 - Math.cos(elongation * (Math.PI / 180)))

  // Moonset
  let moonsetUtc: string | null = null
  let lagTimeMinutes: number | null = null
  let bestTimeUtc: string | null = null

  if (moonAtSunset.altitude > 0) {
    const moonset = findMoonset(lat, lon, sunset)
    if (moonset && moonset.ut > sunset.ut) {
      moonsetUtc = astroTimeToUtcStr(moonset)
      const lagDays = moonset.ut - sunset.ut
      lagTimeMinutes = lagDays * 24 * 60
      // Best time = sunset + (4/9) * lag
      const bestTime = sunset.AddDays((4 / 9) * lagDays)
      bestTimeUtc = astroTimeToUtcStr(bestTime)
    }
  }

  // Visibility prediction using CrescentParams
  let bestTimeARCV: number | null = null
  let bestTimeW: number | null = null
  let criterionValue: number | null = null
  let criterionLabel = 'N/A'
  let visibility: VisibilityResult

  const params = computeCrescentParams({ lat, lon }, dateStr, conjunction)
  if (params) {
    bestTimeARCV = params.ARCV
    bestTimeW = params.W

    const criterion = getCriterion(criterionId)
    visibility = criterion.evaluate(params)

    const cv = computeCriterionValue(criterionId, params)
    criterionValue = cv.value
    criterionLabel = cv.label
  } else {
    // Moon below horizon or no moonset — still show what we can
    visibility = {
      zone: ZoneCode.NOT_VISIBLE,
      label:
        moonAtSunset.altitude <= 0
          ? 'Moon below horizon'
          : ZONE_LABELS[ZoneCode.NOT_VISIBLE],
    }
  }

  return {
    sunsetUtc,
    moonsetUtc,
    bestTimeUtc,
    moonAge,
    lagTimeMinutes,
    moonSunset,
    sunSunset,
    ARCV,
    DAZ,
    elongation,
    phaseAngle,
    illuminationPct,
    crescentWidth: WSunset,
    distanceKm,
    magnitude,
    semiDiameter: SD,
    bestTimeARCV,
    bestTimeW,
    criterionValue,
    criterionLabel,
    visibility,
  }
}
