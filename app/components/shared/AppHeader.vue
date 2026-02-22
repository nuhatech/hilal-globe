<template>
  <header class="absolute top-0 left-0 right-0 z-20 flex items-center px-3 py-4 pt-safe sm:px-5">
    <h1 class="shrink-0 text-lg font-semibold tracking-wide text-slate-800/90 dark:text-white/90">
      {{ $t('app.title') }}
    </h1>
    <span class="ml-3 hidden text-xs text-slate-500/60 dark:text-white/40 sm:inline">{{ $t('app.subtitle') }}</span>

    <div class="ml-auto flex items-center gap-1">
      <GlobeSettings />

      <!-- Article link -->
      <NuxtLink
        :to="localePath('/article')"
        class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
        :title="$t('nav.article')"
      >
        <FileText class="h-4 w-4" />
      </NuxtLink>

      <!-- Sighting records -->
      <button
        class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
        :title="$t('nav.records')"
        @click="showRecords = true"
      >
        <BookOpen class="h-4 w-4" />
      </button>

      <button
        class="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
        :title="$t('nav.copyLink')"
        @click="copyLink"
      >
        <Link class="h-4 w-4" />
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <span
            v-if="showCopied"
            class="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-0.5 text-[10px] text-white dark:bg-white dark:text-slate-900"
          >
            {{ $t('nav.copied') }}
          </span>
        </Transition>
      </button>

      <!-- Language switcher -->
      <NuxtLink
        :to="switchLocalePath(locale === 'en' ? 'fr' : 'en')"
        class="flex h-8 items-center justify-center rounded-full px-2 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
      >
        {{ $t('language.switchTo') }}
      </NuxtLink>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
        :title="isDark ? $t('theme.light') : $t('theme.dark')"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>
    </div>

    <RecordsModal :open="showRecords" @close="showRecords = false" />
  </header>
</template>

<script setup lang="ts">
import { FileText, BookOpen, Link, Sun, Moon } from 'lucide-vue-next'

const { locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const colorMode = useColorMode()

const isDark = ref(colorMode.value === 'dark')

// Keep in sync when colorMode resolves (e.g. on initial load, system changes)
watch(() => colorMode.value, (val) => {
  isDark.value = val === 'dark'
})

function toggleTheme() {
  isDark.value = !isDark.value
  colorMode.preference = isDark.value ? 'dark' : 'light'
}

const showRecords = ref(false)
const showCopied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href)
  showCopied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { showCopied.value = false }, 1500)
}
</script>
