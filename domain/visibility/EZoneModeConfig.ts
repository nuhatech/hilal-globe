import type { EZoneMode } from './VisibilityGridService'

export interface EZoneModeOption {
  mode: EZoneMode
  /** Short label for the trigger button */
  shortLabel: string
  /** Descriptive label for the dropdown option */
  label: string
  /** Explanation of what this mode does */
  description: string
}

/** Zone E mode options, ordered from most conservative to most expansive. */
export const E_ZONE_MODE_OPTIONS: readonly EZoneModeOption[] = [
  {
    mode: 0,
    shortLabel: 'Zone E',
    label: 'Moon above horizon',
    description: 'Crescent not visible where moon is geometrically above the horizon at sunset',
  },
  {
    mode: 1,
    shortLabel: 'Zone E + Refraction',
    label: 'Include refraction',
    description: 'Atmosphere bends light ~0.57° at horizon, lifting the moon slightly above',
  },
  {
    mode: 2,
    shortLabel: 'Born Crescent',
    label: 'Born crescent (Umm al-Qura)',
    description: 'Conjunction occurred before sunset — crescent is born even if moon has set',
  },
]

/** Look up the short label for a given EZoneMode. */
export function getEZoneModeShortLabel(mode: EZoneMode): string {
  return E_ZONE_MODE_OPTIONS[mode]?.shortLabel ?? 'Zone E'
}
