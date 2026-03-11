import type { FeatureCollection } from 'geojson'
import { listCriteria } from '@domain/criteria/CriteriaRegistry'
import { findRelevantObservationDate } from '@domain/hijri/LunarMonthService'
import { DEFAULT_RESOLUTION } from '@domain/visibility/VisibilityGridService'
import type { EZoneMode } from '@domain/visibility/VisibilityGridService'

export interface VisibilityStoreState {
  selectedDate: string
  selectedCriterionId: string
  geoJson: FeatureCollection | null
  isComputing: boolean
}

export const useVisibilityStore = defineStore('visibility', () => {
  const selectedDate = ref(findRelevantObservationDate())
  const selectedCriterionId = ref('odeh')
  const eZoneMode = ref<EZoneMode>(0)
  const geoJson = shallowRef<FeatureCollection | null>(null)
  const isComputing = ref(false)

  // Elevation mode
  const elevationEnabled = ref(false)
  const elevationData = shallowRef<ArrayBuffer | null>(null)
  const isLoadingElevation = ref(false)

  async function loadElevationData() {
    if (elevationData.value) return
    isLoadingElevation.value = true
    try {
      const resp = await fetch('/data/elevation-3deg.bin')
      elevationData.value = await resp.arrayBuffer()
    } finally {
      isLoadingElevation.value = false
    }
  }

  const availableCriteria = listCriteria()

  // Cache: key = "date|criterionId|eZoneMode|elevation" → FeatureCollection
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

    const key = `${selectedDate.value}|${selectedCriterionId.value}|${eZoneMode.value}|${elevationEnabled.value}`

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
      elevationData: elevationEnabled.value ? elevationData.value : null,
    })
  }

  // Trigger computation when date, criterion, e-zone mode, or elevation changes
  watch([selectedDate, selectedCriterionId, eZoneMode, elevationEnabled], () => computeGrid(), {
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
    elevationEnabled,
    elevationData,
    isLoadingElevation,
    loadElevationData,
  }
})
