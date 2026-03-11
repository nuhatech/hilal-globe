<template>
  <Transition name="banner">
    <div
      v-if="visible"
      class="absolute safe-top-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-50/80 px-4 py-2 text-sm backdrop-blur-md dark:border-amber-500/20 dark:bg-amber-900/20"
    >
      <span class="text-amber-800 dark:text-amber-200/90">
        {{ $t('crescent.notVisible') }}
      </span>
      <button
        v-if="nextDate"
        class="whitespace-nowrap rounded-lg bg-amber-200/60 px-2.5 py-0.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-300/60 dark:bg-amber-700/40 dark:text-amber-100 dark:hover:bg-amber-600/40"
        @click="goToNext"
      >
        {{ $t('crescent.nextObservation', { date: nextDateFormatted }) }}
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { getNextObservationDateStr } from '@domain/hijri/LunarMonthService'

const store = useVisibilityStore()
const { locale } = useI18n()

const visible = computed(() => {
  const geo = store.geoJson
  return !store.isComputing && geo !== null && geo.features.length === 0
})

const nextDate = computed(() =>
  getNextObservationDateStr(store.selectedDate),
)

const nextDateFormatted = computed(() => {
  if (!nextDate.value) return ''
  const d = new Date(nextDate.value + 'T12:00:00Z')
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short', timeZone: 'UTC' })
})

function goToNext() {
  if (nextDate.value) {
    store.selectedDate = nextDate.value
  }
}
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translate(-50%, -4px);
}
</style>
