import type { ICriterion } from './ICriterion'
import { Istanbul78Criterion } from './Istanbul78Criterion'
import { OdehCriterion } from './OdehCriterion'
import { SaaoCriterion } from './SaaoCriterion'
import { ShaukatCriterion } from './ShaukatCriterion'
import { YallopCriterion } from './YallopCriterion'

const ALL_CRITERIA: ICriterion[] = [
  new ShaukatCriterion(),
  new YallopCriterion(),
  new OdehCriterion(),
  new SaaoCriterion(),
  new Istanbul78Criterion(),
]

const BY_ID = new Map<string, ICriterion>(ALL_CRITERIA.map((c) => [c.id, c]))

/** Get a criterion by its ID. Throws if not found. */
export function getCriterion(id: string): ICriterion {
  const criterion = BY_ID.get(id)
  if (!criterion) {
    throw new Error(`Unknown criterion: "${id}"`)
  }
  return criterion
}

/** List all available criteria. */
export function listCriteria(): readonly ICriterion[] {
  return ALL_CRITERIA
}
