import type { CrescentParams } from '../models/CrescentParams'
import type { VisibilityResult } from '../models/VisibilityResult'
import { ZoneCode } from '../models/ZoneCode'
import { ZONE_LABELS } from '../models/ZoneConfig'
import type { ICriterion } from './ICriterion'
import { computeYallopQBase } from './yallopBase'

/**
 * Yallop (1997) q-value criterion.
 * Based on: "A Method for Predicting the First Sighting of the New Crescent Moon"
 * Royal Greenwich Observatory, NAO Technical Note No. 69.
 *
 * q = (ARCV - (11.8371 - 6.3226*W + 0.7319*W² - 0.1018*W³)) / 10
 */
export class YallopCriterion implements ICriterion {
  readonly id = 'yallop'
  readonly name = 'Yallop (1997)'
  readonly description =
    'q-value criterion from the Royal Greenwich Observatory. Classifies visibility into zones based on the relationship between arc of vision and crescent width.'

  evaluate(params: CrescentParams): VisibilityResult {
    const { ARCVGeo, W } = params

    // Yallop uses geocentric ARCV (no parallax, no refraction)
    const q = (ARCVGeo - computeYallopQBase(W)) / 10

    if (q >= 0.216) {
      return { zone: ZoneCode.A, label: ZONE_LABELS[ZoneCode.A] }
    }
    if (q >= -0.014) {
      return { zone: ZoneCode.B, label: ZONE_LABELS[ZoneCode.B] }
    }
    if (q >= -0.16) {
      return { zone: ZoneCode.C, label: ZONE_LABELS[ZoneCode.C] }
    }
    if (q >= -0.232) {
      return { zone: ZoneCode.D, label: ZONE_LABELS[ZoneCode.D] }
    }
    return { zone: ZoneCode.NOT_VISIBLE, label: ZONE_LABELS[ZoneCode.NOT_VISIBLE] }
  }
}
