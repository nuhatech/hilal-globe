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
import {
  getLunarTriplet,
  getPreviousLunarMonth,
  getNextLunarMonth,
  todayDateStr,
} from '@domain/hijri/LunarMonthService'

const store = useVisibilityStore()

// Format "YYYY-MM-DD" → "18 Feb"
function formatShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

// 3-day triplet from domain, with display formatting added
const days = computed(() => {
  const triplet = getLunarTriplet(store.selectedDate)
  if (!triplet) return []
  return triplet.map(day => ({
    date: day.dateStr,
    shortDate: formatShort(day.dateStr),
    label: day.label,
  }))
})

const activeIndex = computed(() =>
  days.value.findIndex(d => d.date === store.selectedDate),
)

function selectDay(index: number) {
  const day = days.value[index]
  if (day) store.selectedDate = day.date
}

function setToday() {
  store.selectedDate = todayDateStr()
}

function prevMonth() {
  const date = getPreviousLunarMonth(store.selectedDate)
  if (date) store.selectedDate = date
}

function nextMonth() {
  const date = getNextLunarMonth(store.selectedDate)
  if (date) store.selectedDate = date
}
</script>
