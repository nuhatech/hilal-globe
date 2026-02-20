import type { CrescentParams } from '../models/CrescentParams'
import type { VisibilityResult } from '../models/VisibilityResult'
import { ZoneCode } from '../models/ZoneCode'
import { DANJON_LIMIT, ZONE_LABELS } from '../models/ZoneConfig'
import type { ICriterion } from './ICriterion'

/**
 * South African Astronomical Observatory (SAAO) criterion.
 * Based on work by Caldwell and Laney (2001).
 *
 * Uses ARCV vs. DAZ relationship at SUNSET:
 * - The crescent is visible if ARCV > some function of DAZ
 * - Simplified model: ARCV must exceed a threshold that depends on DAZ
 */
export class SaaoCriterion implements ICriterion {
  readonly id = 'saao'
  readonly name = 'SAAO (South Africa)'
  readonly summary = 'South African Observatory — ARCV vs DAZ curve'
  readonly description =
    'South African Astronomical Observatory criterion by Caldwell & Laney. Based on the relationship between arc of vision and azimuth difference at sunset.'

  evaluate(params: CrescentParams): VisibilityResult {
    const { ARCVSunset, DAZSunset, ARCLSunset } = params

    // Danjon limit
    if (ARCLSunset < DANJON_LIMIT) {
      return { zone: ZoneCode.NOT_VISIBLE, label: 'Below Danjon limit' }
    }

    // SAAO visibility curve at sunset: ARCV_min depends on DAZ
    // Approximation of Caldwell & Laney limit curve:
    // ARCV_limit = 12 - 0.7 * DAZ + 0.015 * DAZ²  (for DAZ ≤ 25°)
    const arcvLimit = 12 - 0.7 * DAZSunset + 0.015 * DAZSunset * DAZSunset

    const margin = ARCVSunset - arcvLimit

    if (margin >= 3.0) {
      return { zone: ZoneCode.A, label: ZONE_LABELS[ZoneCode.A] }
    }
    if (margin >= 1.0) {
      return { zone: ZoneCode.B, label: ZONE_LABELS[ZoneCode.B] }
    }
    if (margin >= -1.0) {
      return { zone: ZoneCode.C, label: ZONE_LABELS[ZoneCode.C] }
    }
    if (margin >= -3.0) {
      return { zone: ZoneCode.D, label: ZONE_LABELS[ZoneCode.D] }
    }
    return { zone: ZoneCode.NOT_VISIBLE, label: ZONE_LABELS[ZoneCode.NOT_VISIBLE] }
  }
}
