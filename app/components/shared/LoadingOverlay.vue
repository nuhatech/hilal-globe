<template>
  <Transition name="fade">
    <div
      v-if="visibilityStore.isComputing"
      class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-ocean-light/60 dark:bg-ocean/60 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-400/20 border-t-slate-600/80 dark:border-white/20 dark:border-t-white/80" />
        <span class="text-sm text-slate-600/70 dark:text-white/70">Computing visibility...</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const visibilityStore = useVisibilityStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
