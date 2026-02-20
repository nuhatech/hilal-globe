import type { CrescentParams } from '../models/CrescentParams'
import type { VisibilityResult } from '../models/VisibilityResult'

export interface ICriterion {
  /** Unique identifier for this criterion */
  id: string
  /** Human-readable name */
  name: string
  /** Short one-line summary for compact UI (dropdowns, tooltips) */
  summary: string
  /** Description of the criterion's methodology */
  description: string
  /** Evaluate crescent parameters and return a visibility result */
  evaluate(params: CrescentParams): VisibilityResult
}
