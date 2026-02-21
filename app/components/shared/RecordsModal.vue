<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <!-- Modal card -->
        <div
          class="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/40 dark:border-white/10 bg-slate-50/95 dark:bg-[#0a101f]/95 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <!-- Header -->
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/40 dark:border-white/10 bg-slate-50/95 dark:bg-[#0a101f]/95 backdrop-blur-xl px-5 py-4">
            <div>
              <h2 class="text-sm font-semibold text-slate-800 dark:text-white/90">{{ $t('records.title') }}</h2>
              <p class="mt-0.5 text-[11px] text-slate-400 dark:text-white/30">{{ $t('records.subtitle') }}</p>
            </div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10 transition-colors"
              :title="$t('location.close')"
              @click="$emit('close')"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Content -->
          <div class="px-5 py-4 space-y-5">
            <!-- Summary table -->
            <section>
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-2">{{ $t('records.recordHolders') }}</h3>
              <div class="overflow-x-auto -mx-1">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-left text-slate-400 dark:text-white/30 border-b border-slate-200/40 dark:border-white/8">
                      <th class="px-1.5 py-1.5 font-medium">{{ $t('records.method') }}</th>
                      <th class="px-1.5 py-1.5 font-medium">{{ $t('records.observer') }}</th>
                      <th class="px-1.5 py-1.5 font-medium text-right">{{ $t('records.age') }}</th>
                      <th class="px-1.5 py-1.5 font-medium text-right">{{ $t('records.elongation') }}</th>
                      <th class="px-1.5 py-1.5 font-medium text-right">{{ $t('records.year') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="r in records"
                      :key="r.methodKey"
                      class="border-t border-slate-200/20 dark:border-white/5"
                    >
                      <td class="px-1.5 py-1.5">
                        <span
                          class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                          :class="r.badgeClass"
                        >
                          {{ $t('records.' + r.methodKey) }}
                        </span>
                      </td>
                      <td class="px-1.5 py-1.5 text-slate-700 dark:text-white/70">{{ r.observer }}</td>
                      <td class="px-1.5 py-1.5 font-mono text-slate-600 dark:text-white/60 text-right">{{ r.age }}</td>
                      <td class="px-1.5 py-1.5 font-mono text-slate-600 dark:text-white/60 text-right">{{ r.elongation }}</td>
                      <td class="px-1.5 py-1.5 font-mono text-slate-500 dark:text-white/40 text-right">{{ r.year }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Highlight cards -->
            <section class="space-y-2.5">
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">{{ $t('records.notable') }}</h3>

              <!-- O'Meara naked eye -->
              <div class="rounded-xl border border-slate-200/40 dark:border-white/8 bg-white/50 dark:bg-white/[0.02] px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-slate-800 dark:text-white/85">{{ $t('records.omeara.name') }}</p>
                    <p class="text-[10px] text-slate-400 dark:text-white/30">{{ $t('records.omeara.location') }}</p>
                  </div>
                  <span class="shrink-0 rounded-md bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{{ $t('records.nakedEye') }}</span>
                </div>
                <div class="mt-2 flex gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 dark:text-white/30">{{ $t('records.age') }}</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">{{ $t('records.omeara.age') }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 dark:text-white/30">{{ $t('records.elongation') }}</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">{{ $t('records.omeara.elongation') }}</span>
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/40">
                  {{ $t('records.omeara.description') }}
                </p>
              </div>

              <!-- Legault CCD -->
              <div class="rounded-xl border border-slate-200/40 dark:border-white/8 bg-white/50 dark:bg-white/[0.02] px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-slate-800 dark:text-white/85">{{ $t('records.legault.name') }}</p>
                    <p class="text-[10px] text-slate-400 dark:text-white/30">{{ $t('records.legault.location') }}</p>
                  </div>
                  <span class="shrink-0 rounded-md bg-violet-500/10 dark:bg-violet-500/10 border border-violet-500/20 dark:border-violet-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-400">{{ $t('records.ccd') }}</span>
                </div>
                <div class="mt-2 flex gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 dark:text-white/30">{{ $t('records.age') }}</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">{{ $t('records.legault.age') }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 dark:text-white/30">{{ $t('records.elongation') }}</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">{{ $t('records.legault.elongation') }}</span>
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/40">
                  {{ $t('records.legault.description') }}
                </p>
              </div>

              <!-- Stamm telescope -->
              <div class="rounded-xl border border-slate-200/40 dark:border-white/8 bg-white/50 dark:bg-white/[0.02] px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-slate-800 dark:text-white/85">{{ $t('records.stamm.name') }}</p>
                    <p class="text-[10px] text-slate-400 dark:text-white/30">{{ $t('records.stamm.location') }}</p>
                  </div>
                  <span class="shrink-0 rounded-md bg-sky-500/10 dark:bg-sky-500/10 border border-sky-500/20 dark:border-sky-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-400">{{ $t('records.telescope') }}</span>
                </div>
                <div class="mt-2 flex gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 dark:text-white/30">{{ $t('records.age') }}</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">{{ $t('records.stamm.age') }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 dark:text-white/30">{{ $t('records.elongation') }}</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">{{ $t('records.stamm.elongation') }}</span>
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/40">
                  {{ $t('records.stamm.description') }}
                </p>
              </div>
            </section>

            <!-- Danjon limit -->
            <section>
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-2">{{ $t('records.danjonLimit') }}</h3>
              <p class="text-[11px] leading-relaxed text-slate-500 dark:text-white/40 mb-3">
                {{ $t('records.danjonDescription') }}
              </p>
              <div class="overflow-x-auto -mx-1">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-left text-slate-400 dark:text-white/30 border-b border-slate-200/40 dark:border-white/8">
                      <th class="px-1.5 py-1 font-medium">{{ $t('records.method') }}</th>
                      <th class="px-1.5 py-1 font-medium text-right">{{ $t('records.danjonLimitLabel') }}</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-white/60">
                    <tr class="border-t border-slate-200/20 dark:border-white/5">
                      <td class="px-1.5 py-1">{{ $t('records.danjonNakedEye') }}</td>
                      <td class="px-1.5 py-1 font-mono text-right">{{ $t('records.danjonNakedEyeLimit') }}</td>
                    </tr>
                    <tr class="border-t border-slate-200/20 dark:border-white/5">
                      <td class="px-1.5 py-1">{{ $t('records.danjonOptical') }}</td>
                      <td class="px-1.5 py-1 font-mono text-right">{{ $t('records.danjonOpticalLimit') }}</td>
                    </tr>
                    <tr class="border-t border-slate-200/20 dark:border-white/5">
                      <td class="px-1.5 py-1">{{ $t('records.danjonCCD') }}</td>
                      <td class="px-1.5 py-1 font-mono text-right">{{ $t('records.danjonCCDLimit') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Why age is misleading -->
            <section class="rounded-xl border border-emerald-800/10 dark:border-emerald-400/10 bg-emerald-900/[0.04] dark:bg-emerald-950/20 px-4 py-3">
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-emerald-800/40 dark:text-emerald-400/50 mb-1">{{ $t('records.whyAgeMisleading') }}</h3>
              <p class="text-[11px] leading-relaxed text-slate-600 dark:text-white/50">
                {{ whyAgeMisleadingText }}
              </p>
            </section>

            <!-- Sources -->
            <p class="text-[10px] text-slate-400 dark:text-white/20 leading-relaxed">
              {{ $t('records.sources') }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const { t } = useI18n()

const whyAgeMisleadingText = computed(() => {
  return t('records.whyAgeMisleadingText', {
    elongation: t('data.elongation').replace('.', ''),
    arcv: t('data.ARCV'),
    crescentWidth: t('data.crescentWidth').toLowerCase(),
  })
})

const records = [
  {
    methodKey: 'nakedEye',
    observer: 'S.J. O\'Meara',
    age: '15h 33m',
    elongation: '7.7\u00B0',
    year: '1990',
    badgeClass: 'bg-emerald-500/10 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-400/12',
  },
  {
    methodKey: 'binoculars',
    observer: 'M.G. Mirsaeed',
    age: '11h 40m',
    elongation: '7.5\u00B0',
    year: '2002',
    badgeClass: 'bg-teal-500/10 dark:bg-teal-500/8 text-teal-700 dark:text-teal-400 border border-teal-500/20 dark:border-teal-400/12',
  },
  {
    methodKey: 'telescope',
    observer: 'Jim Stamm',
    age: '11h 17m',
    elongation: '6.0\u00B0',
    year: '2012',
    badgeClass: 'bg-sky-500/10 dark:bg-sky-500/8 text-sky-700 dark:text-sky-400 border border-sky-500/20 dark:border-sky-400/12',
  },
  {
    methodKey: 'ccd',
    observer: 'T. Legault',
    age: '0h 0m',
    elongation: '4.4\u00B0',
    year: '2013',
    badgeClass: 'bg-violet-500/10 dark:bg-violet-500/8 text-violet-700 dark:text-violet-400 border border-violet-500/20 dark:border-violet-400/12',
  },
  {
    methodKey: 'oldMoon',
    observer: 'A.E. Seraji et al.',
    age: '\u221216h 28m',
    elongation: '\u2014',
    year: '2019',
    badgeClass: 'bg-orange-500/10 dark:bg-orange-500/8 text-orange-700 dark:text-orange-400 border border-orange-500/20 dark:border-orange-400/12',
  },
]
</script>
