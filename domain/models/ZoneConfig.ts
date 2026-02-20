import { ZoneCode } from './ZoneCode'

/** Canonical color for each visibility zone (moonsighting.com scheme) */
export const ZONE_COLORS: Record<ZoneCode, string> = {
  [ZoneCode.A]: '#9AF99B',
  [ZoneCode.B]: '#65A364',
  [ZoneCode.C]: '#EAC078',
  [ZoneCode.D]: '#E16665',
  [ZoneCode.E]: '#E8928E',
  [ZoneCode.NOT_VISIBLE]: 'transparent',
}

/** Human-readable labels for each visibility zone */
export const ZONE_LABELS: Record<ZoneCode, string> = {
  [ZoneCode.A]: 'Easily visible to naked eye',
  [ZoneCode.B]: 'Visible under perfect conditions',
  [ZoneCode.C]: 'May need optical aid to find',
  [ZoneCode.D]: 'Visible only with optical aid',
  [ZoneCode.E]: 'Crescent exists but not visible',
  [ZoneCode.NOT_VISIBLE]: 'Not visible',
}

/**
 * Numeric value for each zone, used by contour generation.
 * Values are ordered so nested contour thresholds work correctly:
 * NOT_VISIBLE(0) < E(1) < D(2) < C(3) < B(4) < A(5)
 */
export const ZONE_VALUES: Record<ZoneCode, number> = {
  [ZoneCode.NOT_VISIBLE]: 0,
  [ZoneCode.E]: 1,
  [ZoneCode.D]: 2,
  [ZoneCode.C]: 3,
  [ZoneCode.B]: 4,
  [ZoneCode.A]: 5,
}

/** Render order: worst zone first, best zone last (best paints on top) */
export const ZONE_ORDER: ZoneCode[] = [ZoneCode.E, ZoneCode.D, ZoneCode.C, ZoneCode.B, ZoneCode.A]

/** Below this elongation (degrees), the crescent is physically impossible to see */
export const DANJON_LIMIT = 7.0
