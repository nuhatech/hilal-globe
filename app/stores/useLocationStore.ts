import type { LocationReport } from '@domain/models/LocationReport'
import { computeLocationReport } from '@domain/astronomy/LocationReportService'
import { ElevationGrid } from '@domain/elevation/ElevationGrid'
import { DEFAULT_RESOLUTION } from '@domain/visibility/VisibilityGridService'

export const useLocationStore = defineStore('location', () => {
  const visibilityStore = useVisibilityStore()

  const selectedCoord = ref<{ lat: number; lon: number } | null>(null)
  const report = shallowRef<LocationReport | null>(null)
  const isComputing = ref(false)
  const isPanelOpen = ref(false)

  function compute() {
    if (!selectedCoord.value) return
    if (!import.meta.client) return

    isComputing.value = true

    // Use setTimeout(0) so the browser renders the loading state before the synchronous computation
    setTimeout(() => {
      try {
        let elevation = 0
        if (visibilityStore.elevationEnabled && visibilityStore.elevationData) {
          const grid = new ElevationGrid(visibilityStore.elevationData, DEFAULT_RESOLUTION)
          elevation = grid.lookup(selectedCoord.value!.lat, selectedCoord.value!.lon)
        }
        const result = computeLocationReport(
          selectedCoord.value!,
          visibilityStore.selectedDate,
          visibilityStore.selectedCriterionId,
          elevation,
        )
        report.value = result
      } catch (e) {
        console.error('Failed to compute location report:', e)
        report.value = null
      } finally {
        isComputing.value = false
      }
    }, 0)
  }

  function selectLocation(lat: number, lon: number) {
    // Round to 2 decimal places for display
    selectedCoord.value = {
      lat: Math.round(lat * 100) / 100,
      lon: Math.round(lon * 100) / 100,
    }
    isPanelOpen.value = true
    compute()
  }

  function closePanel() {
    isPanelOpen.value = false
  }

  function clearSelection() {
    selectedCoord.value = null
    report.value = null
    isPanelOpen.value = false
  }

  // Recompute when date, criterion, or elevation changes while a location is selected
  watch(
    [() => visibilityStore.selectedDate, () => visibilityStore.selectedCriterionId, () => visibilityStore.elevationEnabled],
    () => {
      if (selectedCoord.value && isPanelOpen.value) {
        compute()
      }
    },
  )

  return {
    selectedCoord,
    report,
    isComputing,
    isPanelOpen,
    selectLocation,
    closePanel,
    clearSelection,
  }
})
