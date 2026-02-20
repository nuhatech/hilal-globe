export interface CrescentParams {
  // --- At BEST TIME (for Yallop/Odeh) ---

  /** Arc of vision: topocentric airless moon alt minus sun alt (degrees) */
  ARCV: number
  /** Arc of vision: geocentric (no parallax, no refraction) — for Yallop (degrees) */
  ARCVGeo: number
  /** Crescent width at best time (arcminutes) */
  W: number
  /** Arc of light: topocentric elongation from horizontal coords (degrees) */
  ARCL: number
  /** Arc of light: geocentric elongation via AngleFromSun (degrees) */
  ARCLGeo: number
  /** Delta azimuth at best time (degrees) */
  DAZ: number
  /** Topocentric moon altitude at best time (degrees) */
  moonAlt: number
  /** Sun altitude at best time (degrees) */
  sunAlt: number

  // --- At SUNSET (for Shaukat/Istanbul/SAAO) ---

  /** Moon altitude at sunset (degrees) */
  moonAltSunset: number
  /** ARCV at sunset (degrees) */
  ARCVSunset: number
  /** DAZ at sunset (degrees) */
  DAZSunset: number
  /** Geocentric elongation at sunset (degrees) */
  ARCLSunset: number
  /** Crescent width at sunset (arcminutes) */
  WSunset: number

  // --- Time-independent ---

  /** Hours elapsed since conjunction */
  moonAge: number
  /** Whether conjunction occurred before sunset */
  conjunctionBeforeSunset: boolean
}
