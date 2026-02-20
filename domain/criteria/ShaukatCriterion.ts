import type { CrescentParams } from '../models/CrescentParams'
import type { VisibilityResult } from '../models/VisibilityResult'
import { ZoneCode } from '../models/ZoneCode'
import { DANJON_LIMIT, ZONE_LABELS } from '../models/ZoneConfig'
import type { ICriterion } from './ICriterion'

/**
 * Syed Khalid Shaukat criterion.
 * Used by moonsighting.com.
 *
 * Formula evaluated at SUNSET:
 *   M = max(moonAltSunset, 3.4)  (minimum 3.4° per guide)
 *   S = (M / 12.7) + (W / 1.2)
 *
 * Visibility threshold: S >= 1.0
 * Zones graduated by score margin.
 */
export class ShaukatCriterion implements ICriterion {
  readonly id = 'shaukat'
  readonly name = 'Khalid Shaukat'
  readonly description =
    'Criterion used by moonsighting.com, based on moon altitude and crescent width at sunset.'

  evaluate(params: CrescentParams): VisibilityResult {
    const { ARCLSunset, moonAltSunset, WSunset, moonAge } = params

    // Danjon limit: below ~7° elongation, crescent is physically impossible to see
    if (ARCLSunset < DANJON_LIMIT) {
      return { zone: ZoneCode.NOT_VISIBLE, label: 'Below Danjon limit' }
    }

    // Moon age must be positive (after conjunction)
    if (moonAge < 0) {
      return { zone: ZoneCode.NOT_VISIBLE, label: 'Before conjunction' }
    }

    // Shaukat formula at sunset
    const M = Math.max(moonAltSunset, 3.4)
    const S = M / 12.7 + WSunset / 1.2

    if (S >= 1.5) {
      return { zone: ZoneCode.A, label: ZONE_LABELS[ZoneCode.A] }
    }
    if (S >= 1.2) {
      return { zone: ZoneCode.B, label: ZONE_LABELS[ZoneCode.B] }
    }
    if (S >= 1.0) {
      return { zone: ZoneCode.C, label: ZONE_LABELS[ZoneCode.C] }
    }
    if (S >= 0.8) {
      return { zone: ZoneCode.D, label: ZONE_LABELS[ZoneCode.D] }
    }
    return { zone: ZoneCode.NOT_VISIBLE, label: ZONE_LABELS[ZoneCode.NOT_VISIBLE] }
  }
}
