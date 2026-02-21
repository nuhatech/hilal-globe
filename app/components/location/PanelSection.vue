<template>
  <div class="border-b border-white/5 dark:border-white/5 border-slate-200/60">
    <button
      class="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
      @click="open = !open"
    >
      <span>{{ title }}</span>
      <ChevronDown
        class="h-3.5 w-3.5 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <div v-show="open" class="px-4 pb-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  defaultOpen?: boolean
}>()

const open = ref(props.defaultOpen ?? true)
</script>
