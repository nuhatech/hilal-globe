/**
 * Transform d3-contour MultiPolygon coordinates from grid-cell index space
 * to geographic (lon, lat) coordinates.
 *
 * Grid covers lon [-180+res/2 … 180-res/2] and lat [-90+res/2 … 90-res/2],
 * matching the layout in VisibilityGridService.
 */
export function gridToGeo(
  coordinates: number[][][][],
  gridWidth: number,
  gridHeight: number,
  resolution: number,
): number[][][][] {
  const lonMin = -180 + resolution / 2
  const latMin = -90 + resolution / 2
  const lonRange = gridWidth * resolution
  const latRange = gridHeight * resolution

  return coordinates.map(polygon =>
    polygon.map(ring =>
      ring.map(pt => {
        const lon = lonMin + (pt[0]! / gridWidth) * lonRange
        const lat = latMin + (pt[1]! / gridHeight) * latRange
        return [lon, lat]
      }),
    ),
  )
}
