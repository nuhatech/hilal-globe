export interface GeoCoordinate {
  /** Latitude in degrees (-90 to 90) */
  lat: number
  /** Longitude in degrees (-180 to 180) */
  lon: number
}

/** Round a coordinate to 2 decimal places (~1.1 km precision). */
export function roundCoordinate(lat: number, lon: number): GeoCoordinate {
  return {
    lat: Math.round(lat * 100) / 100,
    lon: Math.round(lon * 100) / 100,
  }
}
