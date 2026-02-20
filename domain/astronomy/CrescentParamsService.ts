import { AngleFromSun, Body, MakeTime, type AstroTime } from 'astronomy-engine'
import type { CrescentParams } from '../models/CrescentParams'
import type { GeoCoordinate } from '../models/GeoCoordinate'
import { getLunarPosition, type LunarPosition } from './LunarPositionService'
import { getSolarPosition, type SolarPosition } from './SolarPositionService'
import { findSunset } from './SunsetService'
import { findMoonset } from './MoonsetService'

const DEG2RAD = Math.PI / 180

/**
 * Atmospheric refraction correction (Sæmundsson's formula).
 * Returns the refraction in degrees for a body at the given airless altitude.
 * At the horizon (~0°): ~0.57°. At 5°: ~0.17°. At 10°: ~0.09°.
 */
function atmosphericRefraction(altDeg: number): number {
  if (altDeg < -1.5) return 0
  const tanArg = altDeg + 10.3 / (altDeg + 5.11)
  return 1.02 / Math.tan(tanArg * DEG2RAD) / 60
}

/**
 * Compute topocentric ARCL from horizontal coordinates.
 * cos(ARCL) = sin(alt_s)·sin(alt_m) + cos(alt_s)·cos(alt_m)·cos(DAZ)
 */
function topocentricARCL(
  sunAlt: number,
  moonAlt: number,
  daz: number,
): number {
  const sAlt = sunAlt * DEG2RAD
  const mAlt = moonAlt * DEG2RAD
  const dAz = daz * DEG2RAD
  const cosARCL =
    Math.sin(sAlt) * Math.sin(mAlt) +
    Math.cos(sAlt) * Math.cos(mAlt) * Math.cos(dAz)
  // Clamp to [-1, 1] to avoid NaN from floating-point errors
  return Math.acos(Math.max(-1, Math.min(1, cosARCL))) / DEG2RAD
}

/**
 * Compute delta-azimuth, normalized to [0, 180].
 */
function deltaAzimuth(az1: number, az2: number): number {
  let d = Math.abs(az1 - az2)
  if (d > 180) d = 360 - d
  return d
}

/**
 * Compute crescent width W in arcminutes.
 * W = SD × (1 - cos(ARCL)), where SD is semi-diameter in arcminutes.
 */
function crescentWidth(semiDiameter: number, arclDeg: number): number {
  return semiDiameter * (1 - Math.cos(arclDeg * DEG2RAD))
}

/**
 * Derive geocentric altitude from topocentric airless altitude.
 * alt_geo ≈ alt_topo + HP × cos(alt_topo)
 * where HP (horizontal parallax) = (SD_arcmin / 60) / 0.2725  (in degrees)
 */
function geocentricAltitude(
  topoAlt: number,
  semiDiameterArcmin: number,
): number {
  const HP = semiDiameterArcmin / 60 / 0.2725 // degrees
  return topoAlt + HP * Math.cos(topoAlt * DEG2RAD)
}

/**
 * Compute all crescent visibility parameters for a given location and date.
 * Returns null if sunset doesn't occur, moon is below horizon at sunset,
 * or moonset doesn't occur after sunset.
 *
 * Pipeline:
 * 1. Find sunset
 * 2. Moon position at sunset → fast reject if altitude < 0
 * 3. Find moonset after sunset → null = moon doesn't set
 * 4. Best time = sunset + (4/9) × (moonset − sunset)
 * 5. Compute sun + moon positions at best time
 * 6. Derive all parameters at both sunset and best time
 *
 * @param coord Observer location
 * @param dateStr ISO date string (e.g. "2026-02-18") — the evening to observe
 * @param conjunction Pre-computed conjunction (new moon) AstroTime
 */
export function computeCrescentParams(
  coord: GeoCoordinate,
  dateStr: string,
  conjunction?: AstroTime | null,
  refractionReject: boolean = false,
  elevation: number = 0,
): CrescentParams | null {
  // --- 1. Find sunset ---
  const tzOffsetHours = coord.lon / 15
  const noonUtc = new Date(`${dateStr}T12:00:00Z`)
  noonUtc.setTime(noonUtc.getTime() - tzOffsetHours * 3_600_000)
  const sunset = findSunset(coord.lat, coord.lon, noonUtc, elevation)
  if (!sunset) return null // No sunset (polar region)

  // --- 2. Moon position at sunset → fast reject ---
  const moonAtSunset = getLunarPosition(coord.lat, coord.lon, sunset, elevation)
  const moonAltApparent = moonAtSunset.altitude + atmosphericRefraction(moonAtSunset.altitude)
  // Use apparent altitude (with refraction) when refractionReject is true,
  // otherwise use raw geometric altitude for a more conservative horizon check.
  const rejectAlt = refractionReject ? moonAltApparent : moonAtSunset.altitude
  // When elevated, the visible horizon dips below the geometric horizon.
  // The moon is visible if its geometric altitude is above -dip.
  // Refracted dip ≈ 0.0293 × √(elevation in meters) degrees.
  const horizonDip = elevation > 0 ? 0.0293 * Math.sqrt(elevation) : 0
  if (rejectAlt + horizonDip <= 0) return null

  // --- 3. Find moonset after sunset ---
  const moonset = findMoonset(coord.lat, coord.lon, sunset, elevation)
  if (!moonset) return null // Moon doesn't set (shouldn't happen normally)

  // Moonset must be after sunset
  if (moonset.ut <= sunset.ut) return null

  // --- 4. Best time = sunset + (4/9) × (moonset − sunset) ---
  const lagDays = moonset.ut - sunset.ut
  const bestTime = sunset.AddDays((4 / 9) * lagDays)

  // --- 5. Positions at best time ---
  const sunBest = getSolarPosition(coord.lat, coord.lon, bestTime, elevation)
  const moonBest = getLunarPosition(coord.lat, coord.lon, bestTime, elevation)

  // Sun position at sunset (moon already computed in step 2)
  const sunAtSunset = getSolarPosition(coord.lat, coord.lon, sunset, elevation)

  // --- 6. Derive parameters ---

  // === AT BEST TIME (for Yallop / Odeh) ===
  const DAZ = deltaAzimuth(moonBest.azimuth, sunBest.azimuth)
  const ARCL = topocentricARCL(sunBest.altitude, moonBest.altitude, DAZ)
  const ARCLGeo = AngleFromSun(Body.Moon, bestTime)
  const ARCV = moonBest.altitude - sunBest.altitude
  const ARCVGeo =
    geocentricAltitude(moonBest.altitude, moonBest.semiDiameter) -
    sunBest.altitude // sun parallax negligible
  const W = crescentWidth(moonBest.semiDiameter, ARCL)

  // === AT SUNSET (for Shaukat / Istanbul / SAAO) ===
  // Use apparent (refraction-corrected) altitude for sunset-based criteria,
  // since these are empirical and based on what observers actually see.
  const sunAltApparent = sunAtSunset.altitude + atmosphericRefraction(sunAtSunset.altitude)
  const DAZSunset = deltaAzimuth(moonAtSunset.azimuth, sunAtSunset.azimuth)
  const ARCLSunset = AngleFromSun(Body.Moon, sunset)
  const ARCVSunset = moonAltApparent - sunAltApparent
  const WSunset = crescentWidth(moonAtSunset.semiDiameter, ARCLSunset)

  // === Time-independent ===
  let moonAge = 0
  if (conjunction) {
    const bestTimeAstro = MakeTime(bestTime)
    moonAge = (bestTimeAstro.ut - conjunction.ut) * 24
  }
  const conjunctionBeforeSunset = conjunction ? conjunction.ut < sunset.ut : true

  return {
    // Best time
    ARCV,
    ARCVGeo,
    W,
    ARCL,
    ARCLGeo,
    DAZ,
    moonAlt: moonBest.altitude,
    sunAlt: sunBest.altitude,
    // Sunset
    moonAltSunset: moonAltApparent,
    ARCVSunset,
    DAZSunset,
    ARCLSunset,
    WSunset,
    // Time-independent
    moonAge,
    conjunctionBeforeSunset,
  }
}
