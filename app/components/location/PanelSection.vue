<template>
  <div class="border-b border-white/5 dark:border-white/5 border-slate-200/60">
    <button
      class="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
      @click="open = !open"
    >
      <span>{{ title }}</span>
      <svg
        class="h-3.5 w-3.5 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>
    <div v-show="open" class="px-4 pb-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  defaultOpen?: boolean
}>()

const open = ref(props.defaultOpen ?? true)
</script>
