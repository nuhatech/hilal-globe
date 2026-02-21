<template>
  <div class="relative h-full w-full">
    <AppHeader />
    <DateSelector />

    <!-- Bottom controls bar -->
    <div class="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between pointer-events-none pb-safe">
      <!-- Left: dropdowns — stack vertically on mobile, horizontal on sm+ -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end pointer-events-auto">
        <CriterionSelector />
        <BornCrescentToggle />
        <button
          class="flex items-center gap-2 rounded-xl border border-slate-200/50 bg-slate-100/80 px-3 py-2 text-xs backdrop-blur-md transition-all hover:bg-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-white/70"
          title="Enter coordinates"
          @click="openCoordInput"
        >
          <Crosshair class="h-3.5 w-3.5 opacity-40" />
          <span class="font-medium">Lat/Lon</span>
        </button>
      </div>

      <!-- Right: legend -->
      <div class="pointer-events-auto">
        <ZoneLegend />
      </div>
    </div>

    <GlobeCanvas />
    <LocationDetailPanel />
    <LoadingOverlay />
  </div>
</template>

<script setup lang="ts">
import { Crosshair } from 'lucide-vue-next'

const locationStore = useLocationStore()

useUrlState()

function openCoordInput() {
  locationStore.isPanelOpen = true
}
</script>
