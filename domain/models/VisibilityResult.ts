import type { ZoneCode } from './ZoneCode'

export interface VisibilityResult {
  /** Visibility zone classification */
  zone: ZoneCode
  /** Human-readable label for the zone */
  label: string
}
