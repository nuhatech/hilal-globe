<template>
  <div ref="wrapper" class="relative">
    <!-- Gear trigger button -->
    <button
      class="flex items-center justify-center rounded-xl border p-2 backdrop-blur-md transition-all"
      :class="
        open
          ? 'border-slate-300/70 bg-white/95 text-slate-800 shadow-lg shadow-black/8 dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-black/20'
          : 'border-slate-200/50 bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
      "
      :title="$t('nav.settings')"
      @click="open = !open"
    >
      <Settings
        class="h-4 w-4 transition-transform duration-300"
        :class="open ? 'rotate-90 opacity-80' : 'opacity-50'"
      />
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
        class="absolute right-0 top-full mt-2 w-44 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200/60 bg-white/90 shadow-xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/40"
      >
        <div class="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
          {{ $t('overlays.title') }}
        </div>

        <div class="px-1.5 pb-1.5">
          <!-- Terminator toggle -->
          <button
            class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-white/5"
            @click="store.showTerminator = !store.showTerminator"
          >
            <!-- Day/night icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 transition-opacity"
              :class="store.showTerminator ? 'opacity-80' : 'opacity-30'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" opacity="0.3" />
            </svg>

            <span
              class="flex-1 text-xs font-medium"
              :class="store.showTerminator ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-white/40'"
            >
              {{ $t('overlays.terminator') }}
            </span>

            <!-- Toggle pill -->
            <div
              class="relative h-4 w-7 rounded-full transition-colors duration-200"
              :class="store.showTerminator ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/15'"
            >
              <div
                class="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="store.showTerminator ? 'translate-x-3.5' : 'translate-x-0.5'"
              />
            </div>
          </button>

          <!-- Elevation toggle -->
          <button
            class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-white/5"
            :disabled="visibilityStore.isLoadingElevation"
            @click="toggleElevation"
          >
            <!-- Mountain icon -->
            <Mountain
              class="h-4 w-4 shrink-0 transition-opacity"
              :class="visibilityStore.elevationEnabled ? 'opacity-80' : 'opacity-30'"
            />

            <span
              class="flex-1 text-xs font-medium"
              :class="visibilityStore.elevationEnabled ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-white/40'"
            >
              {{ $t('overlays.elevation') }}
            </span>

            <!-- Loading spinner -->
            <div
              v-if="visibilityStore.isLoadingElevation"
              class="h-3.5 w-3.5 animate-spin rounded-full border border-slate-300/30 border-t-slate-500/80 dark:border-white/20 dark:border-t-white/80"
            />
            <!-- Toggle pill -->
            <div
              v-else
              class="relative h-4 w-7 rounded-full transition-colors duration-200"
              :class="visibilityStore.elevationEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/15'"
            >
              <div
                class="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="visibilityStore.elevationEnabled ? 'translate-x-3.5' : 'translate-x-0.5'"
              />
            </div>
          </button>
        </div>

        <div class="border-t border-slate-200/40 dark:border-white/5 px-3 py-2 text-center text-[9px] text-slate-400/60 dark:text-white/20">
          Built by NuhaTech
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Settings, Mountain } from 'lucide-vue-next'

const store = useOverlayStore()
const visibilityStore = useVisibilityStore()
const open = ref(false)
const wrapper = ref<HTMLElement | null>(null)

async function toggleElevation() {
  if (!visibilityStore.elevationEnabled) {
    await visibilityStore.loadElevationData()
  }
  visibilityStore.elevationEnabled = !visibilityStore.elevationEnabled
}

function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>
