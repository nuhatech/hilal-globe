<template>
  <div ref="wrapper" class="relative">
    <!-- Trigger pill -->
    <button
      class="group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs backdrop-blur-md transition-all"
      :class="
        open
          ? 'border-slate-300/70 bg-white/95 text-slate-800 shadow-lg shadow-black/8 dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-black/20'
          : store.eZoneMode > 0
            ? 'border-slate-200/50 bg-white/90 text-slate-700 shadow-sm shadow-black/5 hover:bg-white/95 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/14 dark:shadow-black/20'
            : 'border-slate-200/50 bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
      "
      @click="open = !open"
    >
      <!-- Crescent moon icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 shrink-0 transition-opacity"
        :class="store.eZoneMode > 0 ? 'opacity-80' : 'opacity-40'"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
      <span class="font-medium">{{ getEZoneModeShortLabel(store.eZoneMode) }}</span>
      <!-- Active dot -->
      <div
        v-if="store.eZoneMode > 0"
        class="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3 w-3 opacity-40 transition-transform"
        :class="open ? 'rotate-180' : ''"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-2 scale-95 opacity-0"
      enter-to-class="translate-y-0 scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 scale-100 opacity-100"
      leave-to-class="translate-y-2 scale-95 opacity-0"
    >
      <div
        v-if="open"
        class="absolute bottom-full left-0 mb-2 w-72 overflow-hidden rounded-xl border border-slate-200/60 bg-white/90 shadow-xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/40"
      >
        <div class="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
          <span class="inline-block h-2 w-2 translate-y-px rounded-sm mr-1" style="background: #E8928E" />
          Zone E Extent
        </div>

        <div class="px-1.5 pb-1.5">
          <button
            v-for="option in E_ZONE_MODE_OPTIONS"
            :key="option.mode"
            class="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
            :class="
              store.eZoneMode === option.mode
                ? 'bg-slate-900/5 dark:bg-white/10'
                : 'hover:bg-slate-100/80 dark:hover:bg-white/5'
            "
            @click="selectMode(option.mode)"
          >
            <!-- Radio indicator -->
            <div
              class="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors"
              :class="
                store.eZoneMode === option.mode
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-slate-300 dark:border-white/20'
              "
            >
              <div
                v-if="store.eZoneMode === option.mode"
                class="h-1.5 w-1.5 rounded-full bg-white"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div
                class="text-xs font-medium"
                :class="
                  store.eZoneMode === option.mode
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-white/70'
                "
              >
                {{ option.label }}
              </div>
              <div class="mt-0.5 text-[10px] leading-tight text-slate-400 dark:text-white/30">
                {{ option.description }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { EZoneMode } from '@domain/visibility/VisibilityGridService'
import { E_ZONE_MODE_OPTIONS, getEZoneModeShortLabel } from '@domain/visibility/EZoneModeConfig'

const store = useVisibilityStore()
const open = ref(false)
const wrapper = ref<HTMLElement | null>(null)

function selectMode(mode: EZoneMode) {
  store.eZoneMode = mode
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>
