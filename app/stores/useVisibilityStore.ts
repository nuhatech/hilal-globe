import type { FeatureCollection } from 'geojson'
import { findPreviousNewMoon, findNextNewMoon } from '@domain/astronomy/ConjunctionService'
import { listCriteria } from '@domain/criteria/CriteriaRegistry'
import { DEFAULT_RESOLUTION } from '@domain/visibility/VisibilityGridService'
import type { EZoneMode } from '@domain/visibility/VisibilityGridService'

export interface VisibilityStoreState {
  selectedDate: string
  selectedCriterionId: string
  geoJson: FeatureCollection | null
  isComputing: boolean
}

function defaultDate(): string {
  const today = new Date()
  const conj = findPreviousNewMoon(today) ?? findNextNewMoon(today)
  if (conj) {
    // Default to conj + 1 day (most interesting evening)
    const d = new Date(conj.date)
    d.setUTCDate(d.getUTCDate() + 1)
    return d.toISOString().slice(0, 10)
  }
  return today.toISOString().slice(0, 10)
}

export const useVisibilityStore = defineStore('visibility', () => {
  const selectedDate = ref(defaultDate())
  const selectedCriterionId = ref('shaukat')
  const eZoneMode = ref<EZoneMode>(0)
  const geoJson = shallowRef<FeatureCollection | null>(null)
  const isComputing = ref(false)

  const availableCriteria = listCriteria()

  // Cache: key = "date|criterionId|eZoneMode" → FeatureCollection
  const cache = new Map<string, FeatureCollection>()

  let worker: Worker | null = null

  function getWorker(): Worker {
    if (!worker) {
      worker = new Worker(
        new URL('../workers/visibility.worker.ts', import.meta.url),
        { type: 'module' },
      )
    }
    return worker
  }

  function computeGrid() {
    if (!import.meta.client) return

    const key = `${selectedDate.value}|${selectedCriterionId.value}|${eZoneMode.value}`

    // Check cache first
    const cached = cache.get(key)
    if (cached) {
      geoJson.value = cached
      return
    }

    isComputing.value = true

    const w = getWorker()

    w.onmessage = (e: MessageEvent) => {
      const result = e.data as FeatureCollection
      cache.set(key, result)
      geoJson.value = result
      isComputing.value = false
    }

    w.onerror = () => {
      isComputing.value = false
    }

    w.postMessage({
      dateStr: selectedDate.value,
      criterionId: selectedCriterionId.value,
      resolution: DEFAULT_RESOLUTION,
      eZoneMode: eZoneMode.value,
    })
  }

  // Trigger computation when date, criterion, or e-zone mode changes
  watch([selectedDate, selectedCriterionId, eZoneMode], () => computeGrid(), {
    immediate: true,
  })

  return {
    selectedDate,
    selectedCriterionId,
    eZoneMode,
    geoJson,
    isComputing,
    availableCriteria,
    computeGrid,
  }
})
