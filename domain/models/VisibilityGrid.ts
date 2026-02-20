import type { GeoCoordinate } from './GeoCoordinate'
import type { ZoneCode } from './ZoneCode'

export interface VisibilityGridCell {
  /** Center coordinate of the grid cell */
  coordinate: GeoCoordinate
  /** Visibility zone at this cell */
  zone: ZoneCode
}

export interface VisibilityGrid {
  /** Resolution in degrees */
  resolution: number
  /** All computed grid cells */
  cells: VisibilityGridCell[]
  /** Grid dimensions (columns = longitudes, rows = latitudes) */
  width: number
  height: number
  /**
   * Flat numeric grid (row-major, south→north, west→east).
   * Values: 0=NOT_VISIBLE, 1=D, 2=C, 3=B, 4=A.
   * Used for contour generation.
   */
  values: number[]
}
