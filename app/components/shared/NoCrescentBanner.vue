<template>
  <Transition name="banner">
    <button
      v-if="visible"
      class="absolute safe-top-24 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-400/30 bg-amber-50/80 px-3 py-1 text-[11px] backdrop-blur-md dark:border-amber-500/20 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200/80 transition-colors hover:bg-amber-100/80 dark:hover:bg-amber-800/30"
      @click="goToNext"
    >
      {{ $t('crescent.notVisible') }}
      <template v-if="nextDate">
        <span class="opacity-30 mx-0.5">·</span>
        <span class="font-medium">{{ nextDateFormatted }}</span>
      </template>
    </button>
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
