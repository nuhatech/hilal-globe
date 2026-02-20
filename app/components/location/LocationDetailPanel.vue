<template>
  <Transition name="panel">
    <div
      v-if="store.isPanelOpen"
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
        <div class="sticky top-0 z-10 border-b border-slate-200/40 dark:border-white/10 bg-slate-50/95 dark:bg-[#0a101f]/95 backdrop-blur-md px-4 py-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-800 dark:text-white/90">Location Detail</h2>
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

          <!-- Coordinate display / edit -->
          <form
            v-if="editingCoord || !store.selectedCoord"
            class="mt-2 flex items-center gap-1.5"
            @submit.prevent="submitCoord"
          >
            <div class="relative flex-1 min-w-0">
              <label class="absolute -top-1.5 left-2 px-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-400 dark:text-white/25 bg-slate-50 dark:bg-[#0a101f]">Lat</label>
              <input
                ref="latInput"
                v-model="editLat"
                type="text"
                inputmode="decimal"
                placeholder="21.42"
                class="w-full rounded-lg border border-slate-300/60 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] px-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-white/80 outline-none focus:border-emerald-400/60 dark:focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-slate-300 dark:placeholder:text-white/15"
              />
            </div>
            <div class="relative flex-1 min-w-0">
              <label class="absolute -top-1.5 left-2 px-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-400 dark:text-white/25 bg-slate-50 dark:bg-[#0a101f]">Lon</label>
              <input
                v-model="editLon"
                type="text"
                inputmode="decimal"
                placeholder="39.83"
                class="w-full rounded-lg border border-slate-300/60 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] px-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-white/80 outline-none focus:border-emerald-400/60 dark:focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-slate-300 dark:placeholder:text-white/15"
                @keydown.enter="submitCoord"
              />
            </div>
            <button
              type="submit"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/50 dark:border-white/12 bg-slate-100/80 dark:bg-white/[0.06] text-slate-500 dark:text-white/50 hover:bg-slate-200/60 dark:hover:bg-white/10 dark:hover:border-white/18 active:scale-95 transition-all"
              title="Go"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
            </button>
            <button
              v-if="store.selectedCoord"
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/40 dark:border-white/8 bg-slate-100/60 dark:bg-white/[0.03] text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/50 hover:bg-slate-200/40 dark:hover:bg-white/[0.06] dark:hover:border-white/12 active:scale-95 transition-all"
              title="Cancel"
              @click="editingCoord = false"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
            </button>
          </form>
          <button
            v-else
            class="mt-1 flex items-center gap-1.5 group rounded-md px-1 -mx-1 py-0.5 hover:bg-white/[0.03] transition-colors"
            title="Click to edit coordinates"
            @click="startEditing"
          >
            <svg class="h-3 w-3 shrink-0 text-emerald-500/40 dark:text-emerald-400/30" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            <p class="text-xs font-mono text-slate-500 dark:text-white/40 group-hover:text-slate-700 dark:group-hover:text-white/60 transition-colors">
              {{ formatCoord(store.selectedCoord.lat, 'NS') }}, {{ formatCoord(store.selectedCoord.lon, 'EW') }}
            </p>
            <svg class="h-2.5 w-2.5 text-slate-400 dark:text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>
        </div>

        <!-- No coordinate yet — prompt -->
        <div v-if="!store.selectedCoord" class="flex flex-col items-center gap-3 px-6 py-10">
          <div class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/40 dark:border-white/8 bg-slate-100/50 dark:bg-white/[0.03]">
            <svg class="h-5 w-5 text-slate-300 dark:text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <div class="text-center">
            <p class="text-xs font-medium text-slate-500 dark:text-white/40">No location selected</p>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-white/25 leading-relaxed">Enter coordinates above or<br/>click a point on the globe.</p>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else-if="store.isComputing" class="flex items-center justify-center py-12">
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
            <!-- Elevation info banner (when active) -->
            <div
              v-if="store.report.detail.elevationMeters != null"
              class="flex items-center gap-3 border-b border-slate-200/40 dark:border-white/10 px-4 py-2.5 bg-amber-50/50 dark:bg-amber-900/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              <div class="flex gap-4 text-xs">
                <span class="text-slate-600 dark:text-white/60">
                  Elevation <span class="font-mono font-medium text-slate-800 dark:text-white/80">{{ store.report.detail.elevationMeters.toLocaleString() }}m</span>
                </span>
                <span v-if="store.report.detail.horizonDipDeg" class="text-slate-600 dark:text-white/60">
                  Horizon dip <span class="font-mono font-medium text-slate-800 dark:text-white/80">{{ store.report.detail.horizonDipDeg.toFixed(2) }}&deg;</span>
                </span>
              </div>
            </div>

            <!-- Conjunction banner -->
            <div class="border-b border-slate-200/40 dark:border-white/10 px-4 py-3">
              <p class="text-xs text-slate-500 dark:text-white/40">New Moon (Conjunction)</p>
              <p class="mt-0.5 text-sm font-medium text-slate-700 dark:text-white/80">
                {{ formatLocalDateTime(store.report.conjunctionUtc) }}
                <span class="text-[10px] font-normal text-slate-400 dark:text-white/30 ml-1">{{ offsetLabel }}</span>
              </p>
              <p class="text-[10px] font-mono text-slate-400 dark:text-white/25">
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
              <TimeRow label="Sunset" :utc="store.report.detail.sunsetUtc" />
              <TimeRow label="Moonset" :utc="store.report.detail.moonsetUtc" />
              <DataRow label="Moon Age" :value="formatAgeDetailed(store.report.detail.moonAge)" />
              <DataRow label="Lag Time" :value="store.report.detail.lagTimeMinutes != null ? store.report.detail.lagTimeMinutes.toFixed(1) + ' min' : 'N/A'" />
              <TimeRow v-if="store.report.detail.bestTimeUtc" label="Best Time" :utc="store.report.detail.bestTimeUtc" />
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
import { applyUtcOffset, formatUtcOffsetLabel } from '@domain/time/LocalTimeService'

const store = useLocationStore()
const visibilityStore = useVisibilityStore()

// --- Coordinate editing ---
const editingCoord = ref(false)
const editLat = ref('')
const editLon = ref('')
const latInput = ref<HTMLInputElement | null>(null)

function startEditing() {
  editLat.value = store.selectedCoord?.lat.toString() ?? ''
  editLon.value = store.selectedCoord?.lon.toString() ?? ''
  editingCoord.value = true
  nextTick(() => latInput.value?.select())
}

// Auto-focus input when panel opens without a coordinate
watch(() => store.isPanelOpen, (open) => {
  if (open && !store.selectedCoord) {
    editLat.value = ''
    editLon.value = ''
    nextTick(() => latInput.value?.focus())
  }
})

function submitCoord() {
  const lat = parseFloat(editLat.value)
  const lon = parseFloat(editLon.value)
  if (isNaN(lat) || isNaN(lon)) return
  // Clamp to valid ranges
  const clampedLat = Math.max(-90, Math.min(90, lat))
  const clampedLon = Math.max(-180, Math.min(180, lon))
  editingCoord.value = false
  store.selectLocation(clampedLat, clampedLon)
}

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

function formatLocalTime(iso: string): string {
  return applyUtcOffset(iso, store.report?.utcOffsetHours ?? 0).toISOString().slice(11, 19)
}

function formatLocalDateTime(iso: string): string {
  return applyUtcOffset(iso, store.report?.utcOffsetHours ?? 0).toISOString().replace('T', ' ').slice(0, 19)
}

const offsetLabel = computed(() =>
  formatUtcOffsetLabel(store.report?.utcOffsetHours ?? 0),
)

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

// TimeRow: shows local time (primary) + UTC (secondary)
const TimeRow = defineComponent({
  props: {
    label: { type: String, required: true },
    utc: { type: String as () => string | null, default: null },
  },
  setup(props) {
    return () => {
      if (!props.utc) {
        return h('div', { class: 'flex items-baseline justify-between py-0.5' }, [
          h('span', { class: 'text-xs text-slate-500 dark:text-white/40' }, props.label),
          h('span', { class: 'text-xs font-mono text-slate-700 dark:text-white/70' }, 'N/A'),
        ])
      }
      return h('div', { class: 'flex items-baseline justify-between py-0.5' }, [
        h('span', { class: 'text-xs text-slate-500 dark:text-white/40' }, props.label),
        h('span', { class: 'text-right' }, [
          h('span', { class: 'text-xs font-mono text-slate-700 dark:text-white/70' }, formatLocalTime(props.utc)),
          h('span', { class: 'text-[10px] text-slate-400 dark:text-white/25 ml-1.5' }, formatUtcTime(props.utc)),
        ]),
      ])
    }
  },
})

// ZoneBadge: colored badge for zone — glass style with colored dot + tinted text
const ZONE_BADGE_STYLES: Record<string, { dot: string; text: string; textDark: string; bg: string; bgDark: string; border: string; borderDark: string }> = {
  [ZoneCode.A]: { dot: '#6BD86D', text: 'text-green-700', textDark: 'dark:text-green-400', bg: 'bg-green-500/10', bgDark: 'dark:bg-green-500/10', border: 'border-green-500/20', borderDark: 'dark:border-green-400/15' },
  [ZoneCode.B]: { dot: '#65A364', text: 'text-green-800', textDark: 'dark:text-green-300', bg: 'bg-green-600/10', bgDark: 'dark:bg-green-500/8', border: 'border-green-600/20', borderDark: 'dark:border-green-400/12' },
  [ZoneCode.C]: { dot: '#D4A24E', text: 'text-amber-700', textDark: 'dark:text-amber-400', bg: 'bg-amber-500/10', bgDark: 'dark:bg-amber-500/8', border: 'border-amber-500/20', borderDark: 'dark:border-amber-400/15' },
  [ZoneCode.D]: { dot: '#E16665', text: 'text-red-700', textDark: 'dark:text-red-400', bg: 'bg-red-500/10', bgDark: 'dark:bg-red-500/8', border: 'border-red-500/20', borderDark: 'dark:border-red-400/15' },
  [ZoneCode.E]: { dot: '#E8928E', text: 'text-red-600', textDark: 'dark:text-red-300', bg: 'bg-red-500/8', bgDark: 'dark:bg-red-500/5', border: 'border-red-400/15', borderDark: 'dark:border-red-400/10' },
}

const ZoneBadge = defineComponent({
  props: {
    zone: { type: String as () => ZoneCode, required: true },
    showLabel: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const label = props.zone === ZoneCode.NOT_VISIBLE ? 'Not Visible' : `Zone ${props.zone}`
      const fullLabel = props.showLabel ? ZONE_LABELS[props.zone] : label

      if (props.zone === ZoneCode.NOT_VISIBLE) {
        return h('span', {
          class: 'inline-flex items-center gap-1.5 rounded-md border border-slate-200/40 dark:border-white/8 bg-slate-100/60 dark:bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-slate-400 dark:text-white/30',
        }, fullLabel)
      }

      const s = ZONE_BADGE_STYLES[props.zone]
      if (!s) {
        return h('span', { class: 'text-[10px]' }, fullLabel)
      }

      return h('span', {
        class: `inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold ${s.bg} ${s.bgDark} ${s.border} ${s.borderDark} ${s.text} ${s.textDark}`,
      }, [
        h('span', {
          class: 'h-1.5 w-1.5 rounded-full shrink-0',
          style: { backgroundColor: s.dot },
        }),
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
