<template>
  <div
    class="absolute top-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200/50 bg-slate-100/80 px-2 py-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
  >
    <!-- Today button -->
    <button
      class="rounded-full px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/10"
      @click="setToday"
    >
      {{ $t('date.today') }}
    </button>

    <!-- Separator -->
    <div class="h-4 w-px bg-slate-300/50 dark:bg-white/10" />

    <!-- Prev month arrow -->
    <button
      class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10"
      :title="$t('date.prevMonth')"
      @click="prevMonth"
    >
      <ChevronLeft class="h-3 w-3" />
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
      class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/60 dark:text-white/50 dark:hover:bg-white/10"
      :title="$t('date.nextMonth')"
      @click="nextMonth"
    >
      <ChevronRight class="h-3 w-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
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
