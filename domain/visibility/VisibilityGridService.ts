import { computeCrescentParams } from '../astronomy/CrescentParamsService'
import { findPreviousNewMoon } from '../astronomy/ConjunctionService'
import { findSunset } from '../astronomy/SunsetService'
import { getCriterion } from '../criteria/CriteriaRegistry'
import type { ElevationGrid } from '../elevation/ElevationGrid'
import type { VisibilityGrid, VisibilityGridCell } from '../models/VisibilityGrid'
import { ZoneCode } from '../models/ZoneCode'
import { ZONE_VALUES } from '../models/ZoneConfig'

/** Default grid resolution in degrees */
export const DEFAULT_RESOLUTION = 3

/**
 * Zone E extent modes, from most conservative to most expansive:
 * 0 = Moon geometrically above horizon (raw altitude > 0)
 * 1 = Include atmospheric refraction lift (~0.57° at horizon)
 * 2 = Include born crescent — conjunction before sunset (Umm al-Qura)
 */
export type EZoneMode = 0 | 1 | 2

/**
 * Check whether the conjunction occurred before sunset at a given location.
 */
function isConjunctionBeforeSunset(
  lat: number,
  lon: number,
  dateStr: string,
  conjunctionUt: number,
  elevation: number = 0,
): boolean {
  const tzOffsetHours = lon / 15
  const noonUtc = new Date(`${dateStr}T12:00:00Z`)
  noonUtc.setTime(noonUtc.getTime() - tzOffsetHours * 3_600_000)
  const sunset = findSunset(lat, lon, noonUtc, elevation)
  if (!sunset) return false // No sunset (polar)
  return conjunctionUt < sunset.ut
}

/**
 * Compute a visibility grid for the entire globe.
 *
 * @param dateStr ISO date string (e.g. "2026-02-18")
 * @param criterionId Criterion ID (e.g. "shaukat", "yallop")
 * @param resolution Grid spacing in degrees (default 3)
 * @param eZoneMode Zone E extent mode:
 *   0 = moon geometrically above horizon (default, most conservative)
 *   1 = include atmospheric refraction lift (~15° more coverage)
 *   2 = include born crescent / conjunction before sunset (Umm al-Qura, most expansive)
 */
export function computeVisibilityGrid(
  dateStr: string,
  criterionId: string,
  resolution: number = DEFAULT_RESOLUTION,
  eZoneMode: EZoneMode = 0,
  elevationGrid?: ElevationGrid | null,
): VisibilityGrid {
  const criterion = getCriterion(criterionId)
  const cells: VisibilityGridCell[] = []

  // Compute the conjunction ONCE — it's a global event, same for all grid points.
  // Use end-of-day to catch conjunctions occurring any time during the selected date.
  const conjunction = findPreviousNewMoon(new Date(`${dateStr}T23:59:59Z`))
  const conjUt = conjunction?.ut ?? -Infinity

  // Mode 1+ uses refraction for the horizon reject in computeCrescentParams
  const refractionReject = eZoneMode >= 1

  // Grid dimensions
  const width = Math.ceil(360 / resolution)
  const height = Math.ceil(180 / resolution)
  const values: number[] = new Array(width * height)

  // Row-major order: row 0 = southernmost latitude, column 0 = westernmost longitude
  for (let row = 0; row < height; row++) {
    const lat = -90 + resolution / 2 + row * resolution
    for (let col = 0; col < width; col++) {
      const lon = -180 + resolution / 2 + col * resolution

      const elevation = elevationGrid ? elevationGrid.lookup(lat, lon) : 0
      const params = computeCrescentParams({ lat, lon }, dateStr, conjunction, refractionReject, elevation)

      let zone: ZoneCode
      if (params) {
        zone = criterion.evaluate(params).zone
        // If criterion says NOT_VISIBLE but params exist, the crescent exists
        // (moon above horizon) — mark as E
        if (zone === ZoneCode.NOT_VISIBLE) {
          zone = ZoneCode.E
        }
      } else {
        // Params null: no sunset, moon below horizon, or moonset issue.
        // In "born crescent" mode (2), check if the conjunction occurred before
        // sunset — if so, the crescent was born but the moon has set (Zone E).
        if (eZoneMode >= 2 && conjunction && isConjunctionBeforeSunset(lat, lon, dateStr, conjUt, elevation)) {
          zone = ZoneCode.E
        } else {
          zone = ZoneCode.NOT_VISIBLE
        }
      }

      values[row * width + col] = ZONE_VALUES[zone]

      // Only store cells that have some visibility or crescent existence
      if (zone !== ZoneCode.NOT_VISIBLE) {
        cells.push({
          coordinate: { lat, lon },
          zone,
        })
      }
    }
  }

  return { resolution, cells, width, height, values }
}
