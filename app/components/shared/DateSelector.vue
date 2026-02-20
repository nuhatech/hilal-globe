<template>
  <div
    class="absolute top-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200/50 bg-slate-100/80 px-2 py-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
  >
    <!-- Today button -->
    <button
      class="rounded-full px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
      @click="setToday"
    >
      Today
    </button>

    <!-- Separator -->
    <div class="h-4 w-px bg-slate-300/50 dark:bg-white/10" />

    <!-- Prev month arrow -->
    <button
      class="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10"
      title="Previous lunar month"
      @click="prevMonth"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- 3 day tabs -->
    <button
      v-for="(day, i) in days"
      :key="i"
      class="rounded-full px-3 py-1 text-xs transition-colors"
      :class="
        i === activeIndex
          ? 'bg-white font-medium text-slate-800 shadow-sm dark:bg-white/15 dark:text-white'
          : 'text-slate-500 hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10'
      "
      @click="selectDay(i)"
    >
      {{ day.shortDate }}<span class="hidden sm:inline">&ensp;· {{ day.label }}</span>
    </button>

    <!-- Next month arrow -->
    <button
      class="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10"
      title="Next lunar month"
      @click="nextMonth"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { findPreviousNewMoon, findNextNewMoon } from '@domain/astronomy/ConjunctionService'

const store = useVisibilityStore()

// Format a Date to "18 Feb" style short date
function formatShort(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

// Convert a Date to ISO date string (YYYY-MM-DD)
function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// Add days to a Date (UTC)
function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

// Conjunction for the current selected date
// Use end-of-day so a conjunction occurring any time during the selected date is included
const conjunction = computed(() => {
  const d = new Date(store.selectedDate + 'T23:59:59Z')
  return findPreviousNewMoon(d)
})

// The 3-day triplet based on the conjunction
const days = computed(() => {
  const conj = conjunction.value
  if (!conj) return []

  const conjDate = conj.date
  const d0 = new Date(Date.UTC(conjDate.getUTCFullYear(), conjDate.getUTCMonth(), conjDate.getUTCDate()))
  const d1 = addDays(d0, 1)
  const d2 = addDays(d0, 2)

  return [
    { date: toDateStr(d0), shortDate: formatShort(d0), label: 'Conjunction' },
    { date: toDateStr(d1), shortDate: formatShort(d1), label: 'Next Day' },
    { date: toDateStr(d2), shortDate: formatShort(d2), label: 'Day After' },
  ]
})

// Which tab (0, 1, 2) is active, or -1 if none
const activeIndex = computed(() => {
  const idx = days.value.findIndex(d => d.date === store.selectedDate)
  return idx
})

function selectDay(index: number) {
  const day = days.value[index]
  if (day) store.selectedDate = day.date
}

function setToday() {
  const d = new Date()
  store.selectedDate = toDateStr(d)
}

function prevMonth() {
  const conj = conjunction.value
  if (!conj) return
  // Go 1 day before this conjunction and find the previous one
  const before = conj.date
  const searchDate = new Date(Date.UTC(before.getUTCFullYear(), before.getUTCMonth(), before.getUTCDate()))
  searchDate.setUTCDate(searchDate.getUTCDate() - 1)
  const prev = findPreviousNewMoon(searchDate)
  if (prev) {
    // Default to conj + 1 (most interesting evening)
    const d = new Date(Date.UTC(prev.date.getUTCFullYear(), prev.date.getUTCMonth(), prev.date.getUTCDate()))
    d.setUTCDate(d.getUTCDate() + 1)
    store.selectedDate = toDateStr(d)
  }
}

function nextMonth() {
  const conj = conjunction.value
  if (!conj) return
  // Go 1 day after this conjunction and find the next one
  const after = conj.date
  const searchDate = new Date(Date.UTC(after.getUTCFullYear(), after.getUTCMonth(), after.getUTCDate()))
  searchDate.setUTCDate(searchDate.getUTCDate() + 1)
  const next = findNextNewMoon(searchDate)
  if (next) {
    // Default to conj + 1 (most interesting evening)
    const d = new Date(Date.UTC(next.date.getUTCFullYear(), next.date.getUTCMonth(), next.date.getUTCDate()))
    d.setUTCDate(d.getUTCDate() + 1)
    store.selectedDate = toDateStr(d)
  }
}
</script>
