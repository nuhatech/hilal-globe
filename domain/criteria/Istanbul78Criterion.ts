import type { CrescentParams } from '../models/CrescentParams'
import type { VisibilityResult } from '../models/VisibilityResult'
import { ZoneCode } from '../models/ZoneCode'
import { ZONE_LABELS } from '../models/ZoneConfig'
import type { ICriterion } from './ICriterion'

/**
 * Istanbul 1978 Conference criterion.
 * A simplified criterion established at the 1978 Istanbul conference:
 * - Conjunction must occur before sunset
 * - Sun-moon elongation > 8° at sunset
 * - Moon altitude > 5° at sunset
 *
 * This is a binary criterion (visible or not), but we extend it with
 * graduated zones based on how far above the thresholds the values are.
 */
export class Istanbul78Criterion implements ICriterion {
  readonly id = 'istanbul78'
  readonly name = 'Istanbul 1978'
  readonly description =
    'Simplified criterion from the 1978 Istanbul conference: conjunction before sunset, elongation > 8° and moon altitude > 5° at sunset.'

  evaluate(params: CrescentParams): VisibilityResult {
    const { ARCLSunset, moonAltSunset, conjunctionBeforeSunset } = params

    // Conjunction must occur before sunset
    if (!conjunctionBeforeSunset) {
      return { zone: ZoneCode.NOT_VISIBLE, label: 'Conjunction after sunset' }
    }

    // Must meet both basic thresholds at sunset
    if (ARCLSunset < 8.0 || moonAltSunset < 5.0) {
      return { zone: ZoneCode.NOT_VISIBLE, label: ZONE_LABELS[ZoneCode.NOT_VISIBLE] }
    }

    // Graduate zones based on how much the thresholds are exceeded
    const elongMargin = ARCLSunset - 8.0
    const altMargin = moonAltSunset - 5.0
    const combinedMargin = Math.min(elongMargin, altMargin)

    if (combinedMargin >= 6.0) {
      return { zone: ZoneCode.A, label: ZONE_LABELS[ZoneCode.A] }
    }
    if (combinedMargin >= 3.0) {
      return { zone: ZoneCode.B, label: ZONE_LABELS[ZoneCode.B] }
    }
    if (combinedMargin >= 1.0) {
      return { zone: ZoneCode.C, label: ZONE_LABELS[ZoneCode.C] }
    }
    return { zone: ZoneCode.D, label: ZONE_LABELS[ZoneCode.D] }
  }
}
