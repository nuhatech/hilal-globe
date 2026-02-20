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
              <h2 class="text-sm font-semibold text-slate-800 dark:text-white/90">World Sighting Records</h2>
              <p class="mt-0.5 text-[11px] text-slate-400 dark:text-white/30">Extreme limits of crescent detection</p>
            </div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10 transition-colors"
              title="Close"
              @click="$emit('close')"
            >
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="px-5 py-4 space-y-5">
            <!-- Summary table -->
            <section>
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-2">Record Holders</h3>
              <div class="overflow-x-auto -mx-1">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-left text-slate-400 dark:text-white/30 border-b border-slate-200/40 dark:border-white/8">
                      <th class="px-1.5 py-1.5 font-medium">Method</th>
                      <th class="px-1.5 py-1.5 font-medium">Observer</th>
                      <th class="px-1.5 py-1.5 font-medium text-right">Age</th>
                      <th class="px-1.5 py-1.5 font-medium text-right">Elong.</th>
                      <th class="px-1.5 py-1.5 font-medium text-right">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="r in records"
                      :key="r.method"
                      class="border-t border-slate-200/20 dark:border-white/5"
                    >
                      <td class="px-1.5 py-1.5">
                        <span
                          class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                          :class="r.badgeClass"
                        >
                          {{ r.method }}
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
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">Notable Observations</h3>

              <!-- O'Meara naked eye -->
              <div class="rounded-xl border border-slate-200/40 dark:border-white/8 bg-white/50 dark:bg-white/[0.02] px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-slate-800 dark:text-white/85">Stephen James O'Meara</p>
                    <p class="text-[10px] text-slate-400 dark:text-white/30">25 Feb 1990 &middot; Tennessee, USA</p>
                  </div>
                  <span class="shrink-0 rounded-md bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Naked Eye</span>
                </div>
                <div class="mt-2 flex gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 dark:text-white/30">Age</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">15h 33m</span>
                  </div>
                  <div>
                    <span class="text-slate-400 dark:text-white/30">Elong.</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">7.7&deg;</span>
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/40">
                  Unbroken for 35+ years. O'Meara was the first to spot Halley's Comet on its 1985 return. The 7.7&deg; elongation sits at the Danjon limit &mdash; the theoretical maximum for naked-eye visibility.
                </p>
              </div>

              <!-- Legault CCD -->
              <div class="rounded-xl border border-slate-200/40 dark:border-white/8 bg-white/50 dark:bg-white/[0.02] px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-slate-800 dark:text-white/85">Thierry Legault</p>
                    <p class="text-[10px] text-slate-400 dark:text-white/30">8 Jul 2013 &middot; &Eacute;lancourt, France</p>
                  </div>
                  <span class="shrink-0 rounded-md bg-violet-500/10 dark:bg-violet-500/10 border border-violet-500/20 dark:border-violet-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-400">CCD</span>
                </div>
                <div class="mt-2 flex gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 dark:text-white/30">Age</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">0h 0m</span>
                  </div>
                  <div>
                    <span class="text-slate-400 dark:text-white/30">Elong.</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">4.4&deg;</span>
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/40">
                  Captured at the precise instant of conjunction. This record can only be duplicated, never surpassed &mdash; you cannot photograph the Moon younger than age zero. Used near-infrared imaging with the Sun only 4.4&deg; away.
                </p>
              </div>

              <!-- Stamm telescope -->
              <div class="rounded-xl border border-slate-200/40 dark:border-white/8 bg-white/50 dark:bg-white/[0.02] px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-slate-800 dark:text-white/85">Jim Stamm</p>
                    <p class="text-[10px] text-slate-400 dark:text-white/30">22 Mar 2012 &middot; Tucson, Arizona, USA</p>
                  </div>
                  <span class="shrink-0 rounded-md bg-sky-500/10 dark:bg-sky-500/10 border border-sky-500/20 dark:border-sky-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-400">Telescope</span>
                </div>
                <div class="mt-2 flex gap-4 text-xs">
                  <div>
                    <span class="text-slate-400 dark:text-white/30">Age</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">11h 17m</span>
                  </div>
                  <div>
                    <span class="text-slate-400 dark:text-white/30">Elong.</span>
                    <span class="ml-1 font-mono text-slate-700 dark:text-white/70">6.0&deg;</span>
                  </div>
                </div>
                <p class="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/40">
                  ICOP record for youngest geocentric age through a telescope. The 6.0&deg; elongation is below Odeh's empirical Danjon limit of 6.4&deg; for optical aid.
                </p>
              </div>
            </section>

            <!-- Danjon limit -->
            <section>
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-2">The Danjon Limit</h3>
              <p class="text-[11px] leading-relaxed text-slate-500 dark:text-white/40 mb-3">
                The minimum Sun-Moon elongation at which a crescent can physically exist. Below this limit, no part of the illuminated crescent is bright enough to detect.
              </p>
              <div class="overflow-x-auto -mx-1">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="text-left text-slate-400 dark:text-white/30 border-b border-slate-200/40 dark:border-white/8">
                      <th class="px-1.5 py-1 font-medium">Method</th>
                      <th class="px-1.5 py-1 font-medium text-right">Limit</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600 dark:text-white/60">
                    <tr class="border-t border-slate-200/20 dark:border-white/5">
                      <td class="px-1.5 py-1">Naked eye</td>
                      <td class="px-1.5 py-1 font-mono text-right">~7.5&deg;&ndash;8&deg;</td>
                    </tr>
                    <tr class="border-t border-slate-200/20 dark:border-white/5">
                      <td class="px-1.5 py-1">Optical aid (telescope)</td>
                      <td class="px-1.5 py-1 font-mono text-right">~6&deg;&ndash;6.5&deg;</td>
                    </tr>
                    <tr class="border-t border-slate-200/20 dark:border-white/5">
                      <td class="px-1.5 py-1">CCD / infrared imaging</td>
                      <td class="px-1.5 py-1 font-mono text-right">~4&deg;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Why age is misleading -->
            <section class="rounded-xl border border-emerald-800/10 dark:border-emerald-400/10 bg-emerald-900/[0.04] dark:bg-emerald-950/20 px-4 py-3">
              <h3 class="text-[10px] font-semibold uppercase tracking-widest text-emerald-800/40 dark:text-emerald-400/50 mb-1">Why Moon Age Alone Is Misleading</h3>
              <p class="text-[11px] leading-relaxed text-slate-600 dark:text-white/50">
                A 20-hour-old moon at apogee with poor ecliptic angle can be harder to see than a 16-hour-old moon at perigee with steep ecliptic. The critical parameters are <strong class="text-slate-700 dark:text-white/60">elongation</strong>, <strong class="text-slate-700 dark:text-white/60">ARCV</strong> (arc of vision), <strong class="text-slate-700 dark:text-white/60">crescent width</strong>, and atmospheric conditions &mdash; not age.
              </p>
            </section>

            <!-- Sources -->
            <p class="text-[10px] text-slate-400 dark:text-white/20 leading-relaxed">
              Sources: ICOP (astronomycenter.net), Sky &amp; Telescope, Odeh (2006), Schaefer (1996), Legault, Bosscha Observatory.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const records = [
  {
    method: 'Naked Eye',
    observer: 'S.J. O\'Meara',
    age: '15h 33m',
    elongation: '7.7\u00B0',
    year: '1990',
    badgeClass: 'bg-emerald-500/10 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-400/12',
  },
  {
    method: 'Binoculars',
    observer: 'M.G. Mirsaeed',
    age: '11h 40m',
    elongation: '7.5\u00B0',
    year: '2002',
    badgeClass: 'bg-teal-500/10 dark:bg-teal-500/8 text-teal-700 dark:text-teal-400 border border-teal-500/20 dark:border-teal-400/12',
  },
  {
    method: 'Telescope',
    observer: 'Jim Stamm',
    age: '11h 17m',
    elongation: '6.0\u00B0',
    year: '2012',
    badgeClass: 'bg-sky-500/10 dark:bg-sky-500/8 text-sky-700 dark:text-sky-400 border border-sky-500/20 dark:border-sky-400/12',
  },
  {
    method: 'CCD',
    observer: 'T. Legault',
    age: '0h 0m',
    elongation: '4.4\u00B0',
    year: '2013',
    badgeClass: 'bg-violet-500/10 dark:bg-violet-500/8 text-violet-700 dark:text-violet-400 border border-violet-500/20 dark:border-violet-400/12',
  },
  {
    method: 'Old Moon',
    observer: 'A.E. Seraji et al.',
    age: '\u221216h 28m',
    elongation: '\u2014',
    year: '2019',
    badgeClass: 'bg-orange-500/10 dark:bg-orange-500/8 text-orange-700 dark:text-orange-400 border border-orange-500/20 dark:border-orange-400/12',
  },
]
</script>
