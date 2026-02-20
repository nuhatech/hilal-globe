<template>
  <div
    class="rounded-xl border border-slate-200/50 bg-white/80 px-3 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
  >
    <div class="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
      Visibility
    </div>

    <div class="flex flex-col gap-1">
      <div
        v-for="zone in zones"
        :key="zone.code"
        class="flex items-center gap-2"
      >
        <div
          class="h-2.5 w-5 shrink-0 rounded-[3px]"
          :style="{ background: zone.color + alpha }"
        />
        <span class="text-[10px] leading-none text-slate-600 dark:text-white/60">
          {{ zone.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ZONE_COLORS } from '@domain/models/ZoneConfig'
import { ZoneCode } from '@domain/models/ZoneCode'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Match the same alpha the globe canvas uses (GlobeCanvas.vue drawVisibilityZones)
const alpha = computed(() => isDark.value ? 'B3' : '70')

const zones = [
  { code: 'A', color: ZONE_COLORS[ZoneCode.A], label: 'Easily visible' },
  { code: 'B', color: ZONE_COLORS[ZoneCode.B], label: 'Perfect conditions' },
  { code: 'C', color: ZONE_COLORS[ZoneCode.C], label: 'Optical aid to find' },
  { code: 'D', color: ZONE_COLORS[ZoneCode.D], label: 'Optical aid only' },
  { code: 'E', color: ZONE_COLORS[ZoneCode.E], label: 'Not visible' },
]
</script>
