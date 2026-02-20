<template>
  <div class="absolute bottom-5 left-5 z-10" ref="wrapper">
    <!-- Trigger button -->
    <button
      class="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs backdrop-blur-md transition-all"
      :class="
        open
          ? 'border-slate-300/70 bg-white/95 text-slate-800 shadow-lg shadow-black/8 dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-black/20'
          : 'border-slate-200/50 bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
      "
      @click="open = !open"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0 opacity-50" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
      </svg>
      <span class="font-medium">{{ activeCriterion?.name ?? 'Method' }}</span>
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

    <!-- Dropdown -->
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
        class="absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-xl border border-slate-200/60 bg-white/90 shadow-xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/40"
      >
        <div class="px-3 pb-1.5 pt-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
          Visibility Criterion
        </div>

        <div class="px-1.5 pb-1.5">
          <button
            v-for="criterion in store.availableCriteria"
            :key="criterion.id"
            class="group flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
            :class="
              criterion.id === store.selectedCriterionId
                ? 'bg-slate-900/5 dark:bg-white/10'
                : 'hover:bg-slate-100/80 dark:hover:bg-white/5'
            "
            @click="selectCriterion(criterion.id)"
          >
            <!-- Radio indicator -->
            <div
              class="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors"
              :class="
                criterion.id === store.selectedCriterionId
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-slate-300 dark:border-white/20'
              "
            >
              <div
                v-if="criterion.id === store.selectedCriterionId"
                class="h-1.5 w-1.5 rounded-full bg-white"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div
                class="text-xs font-medium"
                :class="
                  criterion.id === store.selectedCriterionId
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-white/70'
                "
              >
                {{ criterion.name }}
              </div>
              <div class="mt-0.5 text-[10px] leading-tight text-slate-400 dark:text-white/30">
                {{ shortDescription(criterion.id) }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const store = useVisibilityStore()
const open = ref(false)
const wrapper = ref<HTMLElement | null>(null)

const activeCriterion = computed(() =>
  store.availableCriteria.find(c => c.id === store.selectedCriterionId),
)

function selectCriterion(id: string) {
  store.selectedCriterionId = id
  open.value = false
}

const descriptions: Record<string, string> = {
  shaukat: 'Used by moonsighting.com — altitude + width at sunset',
  yallop: 'Royal Greenwich Observatory 1997 — q-value at best time',
  odeh: 'ICOP 2006 — V-value with 737 observations',
  saao: 'South African Observatory — ARCV vs DAZ curve',
  istanbul78: 'Istanbul 1978 — elongation > 8° and altitude > 5°',
}

function shortDescription(id: string): string {
  return descriptions[id] ?? ''
}

function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>
