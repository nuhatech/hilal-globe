export const useOverlayStore = defineStore('overlay', () => {
  const showVisibility = ref(true)
  const showGraticule = ref(true)
  const showTerminator = ref(false)

  return { showVisibility, showGraticule, showTerminator }
})
