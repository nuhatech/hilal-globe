<template>
  <Transition name="panel">
    <div
      v-if="store.isPanelOpen && store.selectedCoord"
      class="panel-container"
    >
      <!-- Panel -->
      <div
        class="fixed z-40 overflow-y-auto bg-slate-50/95 dark:bg-[#0a101f]/95 backdrop-blur-md
               border-slate-200/40 dark:border-white/10
               bottom-0 left-0 right-0 max-h-[55vh] rounded-t-2xl border-t shadow-xl shadow-black/20 pb-safe
               sm:top-0 sm:right-0 sm:bottom-0 sm:left-auto sm:max-h-none sm:w-[360px] sm:rounded-none sm:border-l sm:border-t-0"
      >
        <!-- Header -->
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/40 dark:border-white/10 bg-slate-50/95 dark:bg-[#0a101f]/95 backdrop-blur-md px-4 py-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 dark:text-white/90">Location Detail</h2>
            <p class="mt-0.5 text-xs font-mono text-slate-500 dark:text-white/40">
              {{ formatCoord(store.selectedCoord.lat, 'NS') }}, {{ formatCoord(store.selectedCoord.lon, 'EW') }}
            </p>
          </div>
          <button
            class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10 transition-colors"
            title="Close panel"
            @click="store.closePanel()"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="store.isComputing" class="flex items-center justify-center py-12">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>

        <!-- No report -->
        <div v-else-if="!store.report" class="px-4 py-8 text-center text-sm text-slate-500 dark:text-white/40">
          Could not compute data for this location.
        </div>

        <!-- Report content -->
        <div v-else>
          <!-- No sunset (polar) -->
          <div v-if="!store.report.detail" class="px-4 py-8 text-center">
            <p class="text-sm text-amber-500">No sunset at this location on this date.</p>
            <p class="mt-1 text-xs text-slate-500 dark:text-white/40">Polar region — the sun does not set.</p>
          </div>

          <template v-else>
            <!-- Conjunction banner -->
            <div class="border-b border-slate-200/40 dark:border-white/10 px-4 py-3">
              <p class="text-xs text-slate-500 dark:text-white/40">New Moon (Conjunction)</p>
              <p class="mt-0.5 text-sm font-medium text-slate-700 dark:text-white/80">
                {{ formatUtcDateTime(store.report.conjunctionUtc) }}
              </p>
            </div>

            <!-- 3-Day Summary Table -->
            <PanelSection title="3-Day Summary" :default-open="true">
              <div class="overflow-x-auto -mx-1">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-left text-slate-400 dark:text-white/30">
                      <th class="px-1 py-1 font-medium">Day</th>
                      <th class="px-1 py-1 font-medium">Age</th>
                      <th class="px-1 py-1 font-medium">Lag</th>
                      <th class="px-1 py-1 font-medium">Elong.</th>
                      <th class="px-1 py-1 font-medium">Alt</th>
                      <th class="px-1 py-1 font-medium">Illum.</th>
                      <th class="px-1 py-1 font-medium">Vis.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(day, i) in store.report.daySummaries"
                      :key="i"
                      class="border-t border-slate-200/30 dark:border-white/5"
                      :class="{ 'bg-slate-200/30 dark:bg-white/5': day.dateStr === store.report!.dateStr }"
                    >
                      <td class="px-1 py-1.5">
                        <div class="font-medium text-slate-700 dark:text-white/70">{{ day.dateStr.slice(5) }}</div>
                        <div class="text-[10px] text-slate-400 dark:text-white/30">{{ day.label }}</div>
                      </td>
                      <td class="px-1 py-1.5 font-mono text-slate-600 dark:text-white/60">
                        {{ day.noSunset ? '-' : day.moonAge != null ? formatAge(day.moonAge) : '-' }}
                      </td>
                      <td class="px-1 py-1.5 font-mono text-slate-600 dark:text-white/60">
                        {{ day.lagTimeMinutes != null ? Math.round(day.lagTimeMinutes) + 'm' : '-' }}
                      </td>
                      <td class="px-1 py-1.5 font-mono text-slate-600 dark:text-white/60">
                        {{ day.elongation != null ? day.elongation.toFixed(1) + '\u00B0' : '-' }}
                      </td>
                      <td class="px-1 py-1.5 font-mono text-slate-600 dark:text-white/60">
                        {{ day.moonAltSunset != null ? day.moonAltSunset.toFixed(1) + '\u00B0' : '-' }}
                      </td>
                      <td class="px-1 py-1.5 font-mono text-slate-600 dark:text-white/60">
                        {{ day.illuminationPct != null ? day.illuminationPct.toFixed(1) + '%' : '-' }}
                      </td>
                      <td class="px-1 py-1.5">
                        <ZoneBadge v-if="day.visibility" :zone="day.visibility.zone" />
                        <span v-else class="text-slate-400 dark:text-white/30">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </PanelSection>

            <!-- Detail sections -->
            <PanelSection title="Key Data" :default-open="true">
              <DataRow label="Date" :value="store.report.detail.sunsetUtc.slice(0, 10)" />
              <DataRow label="Sunset (UTC)" :value="formatUtcTime(store.report.detail.sunsetUtc)" />
              <DataRow label="Moonset (UTC)" :value="store.report.detail.moonsetUtc ? formatUtcTime(store.report.detail.moonsetUtc) : 'N/A'" />
              <DataRow label="Moon Age" :value="formatAgeDetailed(store.report.detail.moonAge)" />
              <DataRow label="Lag Time" :value="store.report.detail.lagTimeMinutes != null ? store.report.detail.lagTimeMinutes.toFixed(1) + ' min' : 'N/A'" />
              <DataRow v-if="store.report.detail.bestTimeUtc" label="Best Time (UTC)" :value="formatUtcTime(store.report.detail.bestTimeUtc)" />
            </PanelSection>

            <PanelSection title="Moon Position (Sunset)" :default-open="false">
              <DataRow label="Altitude" :value="formatDMS(store.report.detail.moonSunset.altitude)" />
              <DataRow label="Azimuth" :value="formatDMS(store.report.detail.moonSunset.azimuth)" />
              <DataRow label="RA" :value="formatRA(store.report.detail.moonSunset.ra)" />
              <DataRow label="Declination" :value="formatDMS(store.report.detail.moonSunset.dec)" />
              <DataRow label="Ecl. Longitude" :value="formatDMS(store.report.detail.moonSunset.eclipticLon)" />
              <DataRow label="Ecl. Latitude" :value="formatDMS(store.report.detail.moonSunset.eclipticLat)" />
            </PanelSection>

            <PanelSection title="Sun Position (Sunset)" :default-open="false">
              <DataRow label="Altitude" :value="formatDMS(store.report.detail.sunSunset.altitude)" />
              <DataRow label="Azimuth" :value="formatDMS(store.report.detail.sunSunset.azimuth)" />
              <DataRow label="RA" :value="formatRA(store.report.detail.sunSunset.ra)" />
              <DataRow label="Declination" :value="formatDMS(store.report.detail.sunSunset.dec)" />
              <DataRow label="Ecl. Longitude" :value="formatDMS(store.report.detail.sunSunset.eclipticLon)" />
              <DataRow label="Ecl. Latitude" :value="formatDMS(store.report.detail.sunSunset.eclipticLat)" />
            </PanelSection>

            <PanelSection title="Relative Position" :default-open="false">
              <DataRow label="ARCV" :value="formatDMS(store.report.detail.ARCV)" />
              <DataRow label="DAZ" :value="formatDMS(store.report.detail.DAZ)" />
              <DataRow label="Elongation" :value="formatDMS(store.report.detail.elongation)" />
              <DataRow label="Phase Angle" :value="store.report.detail.phaseAngle.toFixed(2) + '\u00B0'" />
            </PanelSection>

            <PanelSection title="Moon Characteristics" :default-open="false">
              <DataRow label="Illumination" :value="store.report.detail.illuminationPct.toFixed(2) + '%'" />
              <DataRow label="Crescent Width" :value="store.report.detail.crescentWidth.toFixed(2) + '\u2032'" />
              <DataRow label="Distance" :value="Math.round(store.report.detail.distanceKm).toLocaleString() + ' km'" />
              <DataRow label="Magnitude" :value="store.report.detail.magnitude.toFixed(2)" />
              <DataRow label="Semi-Diameter" :value="store.report.detail.semiDiameter.toFixed(2) + '\u2032'" />
            </PanelSection>

            <PanelSection title="Visibility Prediction" :default-open="true">
              <div class="mb-2 flex items-center gap-2">
                <ZoneBadge :zone="store.report.detail.visibility.zone" :show-label="true" />
              </div>
              <DataRow label="Criterion" :value="criterionName" />
              <DataRow label="Score" :value="store.report.detail.criterionLabel" />
              <DataRow v-if="store.report.detail.bestTimeARCV != null" label="ARCV (best time)" :value="store.report.detail.bestTimeARCV.toFixed(3) + '\u00B0'" />
              <DataRow v-if="store.report.detail.bestTimeW != null" label="W (best time)" :value="store.report.detail.bestTimeW.toFixed(3) + '\u2032'" />
            </PanelSection>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ZoneCode } from '@domain/models/ZoneCode'
import { ZONE_COLORS, ZONE_LABELS } from '@domain/models/ZoneConfig'
import { getCriterion } from '@domain/criteria/CriteriaRegistry'

const store = useLocationStore()
const visibilityStore = useVisibilityStore()

const criterionName = computed(() => {
  try {
    return getCriterion(visibilityStore.selectedCriterionId).name
  } catch {
    return visibilityStore.selectedCriterionId
  }
})

// --- Formatting helpers ---

function formatCoord(val: number, dirs: 'NS' | 'EW'): string {
  const abs = Math.abs(val)
  const dir = dirs === 'NS'
    ? (val >= 0 ? 'N' : 'S')
    : (val >= 0 ? 'E' : 'W')
  return `${abs.toFixed(2)}\u00B0${dir}`
}

function formatUtcDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}

function formatUtcTime(iso: string): string {
  return new Date(iso).toISOString().slice(11, 19) + ' UTC'
}

function formatAge(hours: number): string {
  if (hours < 0) return '-' + formatAge(-hours)
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h${m.toString().padStart(2, '0')}m`
}

function formatAgeDetailed(hours: number): string {
  const h = Math.floor(Math.abs(hours))
  const m = Math.round((Math.abs(hours) - h) * 60)
  const sign = hours < 0 ? '-' : ''
  return `${sign}${h}h ${m}m`
}

function formatDMS(deg: number): string {
  const sign = deg < 0 ? '-' : '+'
  const abs = Math.abs(deg)
  const d = Math.floor(abs)
  const mFull = (abs - d) * 60
  const m = Math.floor(mFull)
  const s = Math.round((mFull - m) * 60)
  return `${sign}${d}\u00B0${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`
}

function formatRA(hours: number): string {
  const h = Math.floor(hours)
  const mFull = (hours - h) * 60
  const m = Math.floor(mFull)
  const s = Math.round((mFull - m) * 60)
  return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

// --- Sub-components defined inline ---

// DataRow: label + value in two-column flex
const DataRow = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(props) {
    return () => h('div', { class: 'flex items-baseline justify-between py-0.5' }, [
      h('span', { class: 'text-xs text-slate-500 dark:text-white/40' }, props.label),
      h('span', { class: 'text-xs font-mono text-slate-700 dark:text-white/70' }, props.value),
    ])
  },
})

// ZoneBadge: colored badge for zone
const ZoneBadge = defineComponent({
  props: {
    zone: { type: String as () => ZoneCode, required: true },
    showLabel: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const color = ZONE_COLORS[props.zone] || 'transparent'
      const label = props.zone === ZoneCode.NOT_VISIBLE ? 'Not Visible' : `Zone ${props.zone}`
      const fullLabel = props.showLabel ? ZONE_LABELS[props.zone] : label

      if (props.zone === ZoneCode.NOT_VISIBLE) {
        return h('span', {
          class: 'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-white/40',
        }, fullLabel)
      }

      return h('span', {
        class: 'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white',
        style: { backgroundColor: color },
      }, [
        props.showLabel ? fullLabel : label,
      ])
    }
  },
})
</script>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Mobile: slide up from bottom */
@media (max-width: 639px) {
  .panel-enter-from .fixed.z-40,
  .panel-leave-to .fixed.z-40 {
    transform: translateY(100%);
  }
}

/* Desktop: slide in from right */
@media (min-width: 640px) {
  .panel-enter-from,
  .panel-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
