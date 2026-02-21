<template>
  <button
    class="group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs backdrop-blur-md transition-all"
    :class="
      store.elevationEnabled
        ? 'border-slate-200/50 bg-white/90 text-slate-700 shadow-sm shadow-black/5 hover:bg-white/95 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/14 dark:shadow-black/20'
        : 'border-slate-200/50 bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
    "
    :disabled="store.isLoadingElevation"
    @click="toggle"
  >
    <!-- Mountain icon -->
    <Mountain
      class="h-3.5 w-3.5 shrink-0 transition-opacity"
      :class="store.elevationEnabled ? 'opacity-80' : 'opacity-40'"
    />

    <!-- Loading spinner -->
    <div
      v-if="store.isLoadingElevation"
      class="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white/80"
    />
    <template v-else>
      <span class="font-medium">{{ store.elevationEnabled ? $t('elevation.enabled') : $t('elevation.disabled') }}</span>
      <div
        v-if="store.elevationEnabled"
        class="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"
      />
    </template>
  </button>
</template>

<script setup lang="ts">
import { Mountain } from 'lucide-vue-next'

const store = useVisibilityStore()

async function toggle() {
  if (!store.elevationEnabled) {
    await store.loadElevationData()
  }
  store.elevationEnabled = !store.elevationEnabled
}
</script>
