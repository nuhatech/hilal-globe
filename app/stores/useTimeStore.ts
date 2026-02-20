export const useTimeStore = defineStore('time', () => {
  const now = ref(new Date())

  let timer: ReturnType<typeof setInterval> | null = null

  function startClock() {
    if (timer) return
    timer = setInterval(() => {
      now.value = new Date()
    }, 60_000) // update every minute
  }

  function stopClock() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return { now, startClock, stopClock }
})
