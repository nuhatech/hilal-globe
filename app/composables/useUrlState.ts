/**
 * Syncs shareable app state to/from the URL hash.
 *
 * Format: #d=2026-02-18&c=yallop&lat=21.42&lon=39.83
 * Only non-default values are written (except `d` which is always included).
 *
 * Call once from the root page component.
 */
export function useUrlState() {
  if (!import.meta.client) return

  const visibilityStore = useVisibilityStore()
  const locationStore = useLocationStore()
  const overlayStore = useOverlayStore()

  // ── Defaults (static, used to decide what to omit from URL) ──
  const DEFAULTS = {
    c: 'odeh',
    ez: 0,
    el: 0,
    t: 0,
  } as const

  // ── READ: parse hash → apply to stores ──
  function readHash() {
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const params = new URLSearchParams(hash)

    const d = params.get('d')
    if (d) visibilityStore.selectedDate = d

    const c = params.get('c')
    if (c) visibilityStore.selectedCriterionId = c

    const ez = params.get('ez')
    if (ez != null) visibilityStore.eZoneMode = Number(ez) as 0 | 1

    const t = params.get('t')
    if (t === '1') overlayStore.showTerminator = true

    // Elevation: load data first, then enable
    const el = params.get('el')
    if (el === '1') {
      visibilityStore.loadElevationData().then(() => {
        visibilityStore.elevationEnabled = true
      })
    }

    // Location: both lat and lon must be present
    const lat = params.get('lat')
    const lon = params.get('lon')
    if (lat != null && lon != null) {
      locationStore.selectLocation(Number(lat), Number(lon))
    }
  }

  // ── WRITE: watch stores → update hash (debounced) ──
  let writeTimer: ReturnType<typeof setTimeout> | null = null

  function writeHash() {
    const parts: string[] = []

    // Always include date
    parts.push(`d=${visibilityStore.selectedDate}`)

    if (visibilityStore.selectedCriterionId !== DEFAULTS.c)
      parts.push(`c=${visibilityStore.selectedCriterionId}`)

    if (visibilityStore.eZoneMode !== DEFAULTS.ez)
      parts.push(`ez=${visibilityStore.eZoneMode}`)

    if (visibilityStore.elevationEnabled)
      parts.push(`el=1`)

    if (overlayStore.showTerminator)
      parts.push(`t=1`)

    if (locationStore.selectedCoord) {
      parts.push(`lat=${locationStore.selectedCoord.lat.toFixed(2)}`)
      parts.push(`lon=${locationStore.selectedCoord.lon.toFixed(2)}`)
    }

    const newHash = parts.length ? `#${parts.join('&')}` : ''
    history.replaceState(null, '', newHash || window.location.pathname)
  }

  function debouncedWrite() {
    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(writeHash, 300)
  }

  // Defer everything to onMounted so we run after Nuxt hydration completes.
  // Then wait one tick for the read's reactive changes to flush before
  // enabling the write watcher — this prevents the watcher from immediately
  // overwriting the hash with stale/default values.
  onMounted(() => {
    readHash()

    nextTick(() => {
      watch(
        [
          () => visibilityStore.selectedDate,
          () => visibilityStore.selectedCriterionId,
          () => visibilityStore.eZoneMode,
          () => visibilityStore.elevationEnabled,
          () => overlayStore.showTerminator,
          () => locationStore.selectedCoord,
        ],
        debouncedWrite,
      )
    })
  })
}
