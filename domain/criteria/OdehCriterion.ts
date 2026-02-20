import type { CrescentParams } from '../models/CrescentParams'
import type { VisibilityResult } from '../models/VisibilityResult'
import { ZoneCode } from '../models/ZoneCode'
import { ZONE_LABELS } from '../models/ZoneConfig'
import type { ICriterion } from './ICriterion'

/**
 * Mohammad Odeh (2004/2006) V-value criterion.
 * Based on: "New Criterion for Lunar Crescent Visibility"
 * Experimental Astronomy, 18, 39-64.
 * Used by ICOP (Islamic Crescents Observation Project).
 *
 * V = ARCV - (-0.1018*W³ + 0.7319*W² - 6.3226*W + 7.1651)
 *
 * Uses topocentric airless ARCV at best time.
 */
export class OdehCriterion implements ICriterion {
  readonly id = 'odeh'
  readonly name = 'Odeh (2006)'
  readonly description =
    'V-value criterion by Mohammad Odeh, used by ICOP. A refinement of the Yallop criterion with updated threshold values from a larger dataset.'

  evaluate(params: CrescentParams): VisibilityResult {
    const { ARCV, W } = params

    // Odeh polynomial (different constant from Yallop: 7.1651 vs 11.8371)
    const V = ARCV - (7.1651 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W)

    if (V >= 5.65) {
      return { zone: ZoneCode.A, label: ZONE_LABELS[ZoneCode.A] }
    }
    if (V >= 2.0) {
      return { zone: ZoneCode.B, label: ZONE_LABELS[ZoneCode.B] }
    }
    if (V >= -0.96) {
      return { zone: ZoneCode.C, label: ZONE_LABELS[ZoneCode.C] }
    }
    return { zone: ZoneCode.NOT_VISIBLE, label: ZONE_LABELS[ZoneCode.NOT_VISIBLE] }
  }
}
