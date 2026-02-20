import { ElevationGrid } from './ElevationGrid'

/** Default grid resolution in degrees, matching the generated elevation data. */
const ELEVATION_GRID_RESOLUTION = 3

/**
 * Look up terrain elevation at a geographic coordinate.
 *
 * @param lat  Latitude in degrees
 * @param lon  Longitude in degrees
 * @param gridBuffer  Raw Int16 elevation grid data
 * @param resolution  Grid resolution in degrees (default: 3°)
 * @returns Elevation in meters above sea level (clamped >= 0)
 */
export function lookupElevation(
  lat: number,
  lon: number,
  gridBuffer: ArrayBuffer,
  resolution: number = ELEVATION_GRID_RESOLUTION,
): number {
  const grid = new ElevationGrid(gridBuffer, resolution)
  return grid.lookup(lat, lon)
}
