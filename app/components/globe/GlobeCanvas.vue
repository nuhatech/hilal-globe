<template>
  <canvas
    ref="canvasRef"
    class="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @wheel.prevent="onWheel"
  />
</template>

<script setup lang="ts">
import {
  geoOrthographic,
  geoPath,
  geoGraticule,
  geoCircle,
  type GeoProjection,
  type GeoPath,
} from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import landTopo from '~/assets/data/ne_110m_land.json'
import { getSubsolarPoint } from '@domain/terminator/SubsolarService'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Theme
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const DARK_COLORS = {
  ocean: '#0c1526',
  sphereStroke: 'rgba(255,255,255,0.15)',
  graticule: 'rgba(255,255,255,0.08)',
  landFill: 'rgba(255,255,255,0.06)',
  landStroke: 'rgba(255,255,255,0.5)',
  outline: 'rgba(255,255,255,0.2)',
}

const LIGHT_COLORS = {
  ocean: '#ffffff',
  sphereStroke: 'rgba(0,0,0,0.12)',
  graticule: 'rgba(0,0,0,0.06)',
  landFill: '#1e3a5f',
  landStroke: '#0f2440',
  outline: 'rgba(0,0,0,0.15)',
}

const colors = computed(() => isDark.value ? DARK_COLORS : LIGHT_COLORS)

// Stores
const visibilityStore = useVisibilityStore()
const overlayStore = useOverlayStore()
const locationStore = useLocationStore()

// Terminator date: selected date at 18:00 UTC (approximate sunset for Middle East/East Africa)
const terminatorDate = computed(() => new Date(`${visibilityStore.selectedDate}T18:00:00Z`))

// Projection state
const rotation = reactive<[number, number]>([0, -20])
const scale = ref(1)

// Drag state
const dragging = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const rotationStart = reactive<[number, number]>([0, 0])

// Click vs drag detection (touch needs a larger threshold than mouse)
const CLICK_THRESHOLD_MOUSE = 3
const CLICK_THRESHOLD_TOUCH = 12
const CLICK_TIME_THRESHOLD = 300
let dragDistance = 0
let pointerDownTime = 0
let lastPointerType = 'mouse'

// Multi-touch pinch state
const activePointers = new Map<number, { x: number; y: number }>()
let pinching = false
let pinchStartDist = 0
let pinchStartScale = 1

// Sensitivity constants
const DRAG_SENSITIVITY = 0.4
const MIN_SCALE = 0.5
const MAX_SCALE = 8
const ZOOM_FACTOR = 0.001
const PINCH_SENSITIVITY = 1.5

// Keep a reference to the current projection for click inversion
let currentProjection: GeoProjection | null = null

// Convert TopoJSON to GeoJSON once
const landGeo = computed(() => {
  const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>
  return feature(topo, topo.objects.land) as FeatureCollection<Geometry, GeoJsonProperties>
})

const graticule = geoGraticule().step([30, 30])()

// Build projection & path each frame
function createProjectionAndPath(width: number, height: number) {
  const baseScale = Math.min(width, height) / 2.2
  const projection: GeoProjection = geoOrthographic()
    .scale(baseScale * scale.value)
    .translate([width / 2, height / 2])
    .rotate(rotation)
    .clipAngle(90)

  // Store for click inversion
  currentProjection = projection

  const ctx = canvasRef.value!.getContext('2d')!
  const path: GeoPath = geoPath(projection, ctx)

  return { projection, path, ctx }
}

function drawVisibilityZones(
  ctx: CanvasRenderingContext2D,
  path: GeoPath,
) {
  const geoJson = visibilityStore.geoJson
  if (!geoJson || !overlayStore.showVisibility) return

  // Higher opacity in dark mode so colors stay vivid on dark background
  const alpha = isDark.value ? 'B3' : '70'

  // Each feature is a contour MultiPolygon for one zone level.
  // Rendered outermost (D) first, innermost (A) last — better zones paint on top.
  for (const feat of geoJson.features) {
    const color = (feat.properties as Record<string, string>)?.color
    if (!color) continue
    ctx.beginPath()
    path(feat.geometry)
    ctx.fillStyle = color + alpha
    ctx.fill()
  }
}

function drawLocationMarker(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
) {
  const coord = locationStore.selectedCoord
  if (!coord) return

  // Project lat/lon to screen coords
  const projected = projection([coord.lon, coord.lat])
  if (!projected) return // Behind the globe

  const [x, y] = projected

  // Draw marker: white circle with dark outline
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Inner dot
  ctx.beginPath()
  ctx.arc(x, y, 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fill()
}

function drawTerminator(ctx: CanvasRenderingContext2D, path: GeoPath) {
  if (!overlayStore.showTerminator) return

  const sub = getSubsolarPoint(terminatorDate.value)
  // Antisolar point (center of night hemisphere)
  const antiLat = -sub.lat
  let antiLon = sub.lon + 180
  if (antiLon > 180) antiLon -= 360

  // Night hemisphere polygon (circle of 90° radius)
  const nightGeo = geoCircle()
    .center([antiLon, antiLat])
    .radius(90)
    .precision(1)()

  // Fill night side with dark overlay
  ctx.beginPath()
  path(nightGeo)
  ctx.fillStyle = isDark.value ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,20,0.12)'
  ctx.fill()

  // Draw terminator line
  ctx.beginPath()
  path(nightGeo)
  ctx.strokeStyle = isDark.value ? 'rgba(255,200,80,0.35)' : 'rgba(200,150,50,0.4)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  // Size canvas backing store to DPR
  canvas.width = width * dpr
  canvas.height = height * dpr

  const { projection, path, ctx } = createProjectionAndPath(width, height)
  const c = colors.value

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  // 1. Ocean / globe background
  ctx.beginPath()
  path({ type: 'Sphere' })
  ctx.fillStyle = c.ocean
  ctx.fill()
  ctx.strokeStyle = c.sphereStroke
  ctx.lineWidth = 1
  ctx.stroke()

  // 2. Land fill (underneath zones so zones show on land)
  ctx.beginPath()
  path(landGeo.value)
  ctx.fillStyle = c.landFill
  ctx.fill()

  // 3. Graticule
  if (overlayStore.showGraticule) {
    ctx.beginPath()
    path(graticule)
    ctx.strokeStyle = c.graticule
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // 4. Visibility zones (semi-transparent fills, on top of land + ocean)
  drawVisibilityZones(ctx, path)

  // 5. Land borders (on top of zones for clarity)
  ctx.beginPath()
  path(landGeo.value)
  ctx.strokeStyle = c.landStroke
  ctx.lineWidth = isDark.value ? 1 : 0.5
  ctx.stroke()

  // 6. Terminator (night overlay + line — above zones & borders so it's visible)
  drawTerminator(ctx, path)

  // 7. Location marker (on top of everything, under outline)
  drawLocationMarker(ctx, projection)

  // 8. Globe outline (crisp edge)
  ctx.beginPath()
  path({ type: 'Sphere' })
  ctx.strokeStyle = c.outline
  ctx.lineWidth = 1.5
  ctx.stroke()
}

// Pointer helpers
function getPinchDist(): number {
  const pts = Array.from(activePointers.values())
  if (pts.length < 2) return 0
  const dx = pts[1]!.x - pts[0]!.x
  const dy = pts[1]!.y - pts[0]!.y
  return Math.sqrt(dx * dx + dy * dy)
}

// Pointer handlers
function onPointerDown(e: PointerEvent) {
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

  if (activePointers.size === 2) {
    // Second finger down — switch to pinch mode, cancel any drag
    pinching = true
    dragging.value = false
    pinchStartDist = getPinchDist()
    pinchStartScale = scale.value
    return
  }

  if (activePointers.size === 1) {
    // Single finger — start drag
    dragging.value = true
    pinching = false
    dragStart.x = e.clientX
    dragStart.y = e.clientY
    rotationStart[0] = rotation[0]
    rotationStart[1] = rotation[1]
    dragDistance = 0
    pointerDownTime = Date.now()
    lastPointerType = e.pointerType
  }
}

function onPointerMove(e: PointerEvent) {
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (pinching && activePointers.size >= 2) {
    // Pinch zoom
    const dist = getPinchDist()
    if (pinchStartDist > 0) {
      const ratio = dist / pinchStartDist
      scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchStartScale * Math.pow(ratio, PINCH_SENSITIVITY)))
    }
    return
  }

  if (!dragging.value) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  dragDistance = Math.sqrt(dx * dx + dy * dy)
  rotation[0] = rotationStart[0] + dx * DRAG_SENSITIVITY
  rotation[1] = Math.max(-90, Math.min(90, rotationStart[1] - dy * DRAG_SENSITIVITY))
}

function onPointerUp(e: PointerEvent) {
  const wasPinching = pinching
  activePointers.delete(e.pointerId)

  if (activePointers.size < 2) {
    pinching = false
  }

  // If we were pinching, don't treat lift as a click or drag end
  if (wasPinching) {
    dragging.value = false
    return
  }

  if (!dragging.value) return
  dragging.value = false

  const elapsed = Date.now() - pointerDownTime

  // Distinguish click from drag — touch needs a larger movement threshold
  const threshold = lastPointerType === 'touch' ? CLICK_THRESHOLD_TOUCH : CLICK_THRESHOLD_MOUSE
  if (dragDistance < threshold && elapsed < CLICK_TIME_THRESHOLD) {
    handleGlobeClick(e)
  }
}

function handleGlobeClick(e: PointerEvent) {
  if (!currentProjection || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Invert screen coords to [lon, lat]
  const coords = currentProjection.invert?.([x, y])
  if (!coords) return // Click outside globe hemisphere

  const [lon, lat] = coords
  locationStore.selectLocation(lat, lon)
}

function onWheel(e: WheelEvent) {
  const delta = -e.deltaY * ZOOM_FACTOR
  scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value * (1 + delta)))
}

// Watch reactive state and redraw
watch(
  [rotation, scale, colors, terminatorDate, () => visibilityStore.geoJson, () => overlayStore.showVisibility, () => overlayStore.showGraticule, () => overlayStore.showTerminator, () => locationStore.selectedCoord],
  () => draw(),
  { deep: true },
)

// ResizeObserver for responsive canvas
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  draw()
  resizeObserver = new ResizeObserver(() => draw())
  if (canvasRef.value) {
    resizeObserver.observe(canvasRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>
