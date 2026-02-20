import { contours } from 'd3-contour'
import type { Feature, FeatureCollection, MultiPolygon } from 'geojson'
import { ElevationGrid } from '../../domain/elevation/ElevationGrid'
import { ZoneCode } from '../../domain/models/ZoneCode'
import { ZONE_COLORS, ZONE_LABELS } from '../../domain/models/ZoneConfig'
import { computeVisibilityGrid, DEFAULT_RESOLUTION } from '../../domain/visibility/VisibilityGridService'

interface WorkerMessage {
  dateStr: string
  criterionId: string
  resolution?: number
  eZoneMode?: 0 | 1 | 2
  elevationData?: ArrayBuffer | null
}

/**
 * Zone contour thresholds and colors.
 * Contours are nested: threshold 0.5 covers D+C+B+A, 1.5 covers C+B+A, etc.
 * Rendered outermost-first so inner (better) zones paint on top.
 */
const ZONE_CONTOURS = [
  { threshold: 0.5, zone: ZoneCode.E, color: ZONE_COLORS[ZoneCode.E] },
  { threshold: 1.5, zone: ZoneCode.D, color: ZONE_COLORS[ZoneCode.D] },
  { threshold: 2.5, zone: ZoneCode.C, color: ZONE_COLORS[ZoneCode.C] },
  { threshold: 3.5, zone: ZoneCode.B, color: ZONE_COLORS[ZoneCode.B] },
  { threshold: 4.5, zone: ZoneCode.A, color: ZONE_COLORS[ZoneCode.A] },
]

/** Smoothness of zone boundaries in grid-cell units (higher = smoother) */
const BLUR_SIGMA = 1.5
/** Upsample factor: 4× turns 120×60 → 480×240 (~0.75° effective resolution) */
const UPSAMPLE_FACTOR = 4

/**
 * Build a 1-D Gaussian half-kernel of radius ceil(3·sigma).
 * Returns normalised weights [w0, w1, …, wRadius].
 */
function buildGaussianKernel(sigma: number): Float64Array {
  const radius = Math.ceil(sigma * 3)
  const kernel = new Float64Array(radius + 1)
  const s2 = 2 * sigma * sigma
  let sum = 0
  for (let i = 0; i <= radius; i++) {
    kernel[i] = Math.exp(-(i * i) / s2)
    sum += i === 0 ? kernel[i]! : 2 * kernel[i]!
  }
  // Normalise
  for (let i = 0; i <= radius; i++) kernel[i]! /= sum
  return kernel
}

/**
 * Apply 1-D Gaussian blur along a scanline with edge-clamping.
 * @param src  source samples (length = len)
 * @param dst  destination samples (length = len)
 * @param len  number of samples
 * @param kernel  half-kernel [w0 … wR]
 */
function gaussianBlur1D(
  src: Float64Array,
  dst: Float64Array,
  len: number,
  kernel: Float64Array,
): void {
  const R = kernel.length - 1
  for (let i = 0; i < len; i++) {
    let v = src[i]! * kernel[0]!
    for (let k = 1; k <= R; k++) {
      const left = Math.max(0, i - k)
      const right = Math.min(len - 1, i + k)
      v += (src[left]! + src[right]!) * kernel[k]!
    }
    dst[i] = v
  }
}

/**
 * Separable 2-D Gaussian blur (horizontal then vertical).
 * Mutates nothing — returns a new Float64Array.
 */
function gaussianBlur2D(
  values: Float64Array,
  width: number,
  height: number,
  sigma: number,
): Float64Array {
  const kernel = buildGaussianKernel(sigma)
  const tmp = new Float64Array(width * height)
  const out = new Float64Array(width * height)

  // Horizontal pass → tmp
  const rowBuf = new Float64Array(width)
  const rowOut = new Float64Array(width)
  for (let y = 0; y < height; y++) {
    const off = y * width
    rowBuf.set(values.subarray(off, off + width))
    gaussianBlur1D(rowBuf, rowOut, width, kernel)
    tmp.set(rowOut, off)
  }

  // Vertical pass → out
  const colBuf = new Float64Array(height)
  const colOut = new Float64Array(height)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) colBuf[y] = tmp[y * width + x]!
    gaussianBlur1D(colBuf, colOut, height, kernel)
    for (let y = 0; y < height; y++) out[y * width + x] = colOut[y]!
  }

  return out
}

/**
 * Bilinear upsample a 2-D grid by an integer factor.
 * Returns a new Float64Array of size (srcW*factor) × (srcH*factor).
 */
function bilinearUpsample(
  src: Float64Array,
  srcW: number,
  srcH: number,
  factor: number,
): { data: Float64Array; width: number; height: number } {
  const dstW = srcW * factor
  const dstH = srcH * factor
  const dst = new Float64Array(dstW * dstH)

  for (let dy = 0; dy < dstH; dy++) {
    // Map destination pixel centre back to source coordinates
    const sy = (dy + 0.5) / factor - 0.5
    const y0 = Math.max(0, Math.floor(sy))
    const y1 = Math.min(srcH - 1, y0 + 1)
    const fy = sy - y0

    for (let dx = 0; dx < dstW; dx++) {
      const sx = (dx + 0.5) / factor - 0.5
      const x0 = Math.max(0, Math.floor(sx))
      const x1 = Math.min(srcW - 1, x0 + 1)
      const fx = sx - x0

      const v00 = src[y0 * srcW + x0]!
      const v10 = src[y0 * srcW + x1]!
      const v01 = src[y1 * srcW + x0]!
      const v11 = src[y1 * srcW + x1]!

      dst[dy * dstW + dx] =
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy
    }
  }

  return { data: dst, width: dstW, height: dstH }
}

/**
 * Map contour coordinates from grid space to geographic (lon/lat).
 *
 * Grid covers lon [-180+res/2, 180-res/2] and lat [-90+res/2, 90-res/2].
 */
function gridToGeo(
  coordinates: number[][][][],
  gridWidth: number,
  gridHeight: number,
  resolution: number,
): number[][][][] {
  const lonMin = -180 + resolution / 2
  const latMin = -90 + resolution / 2
  const lonRange = gridWidth * resolution
  const latRange = gridHeight * resolution

  return coordinates.map((polygon) =>
    polygon.map((ring) =>
      ring.map((pt) => {
        const lon = lonMin + (pt[0]! / gridWidth) * lonRange
        const lat = latMin + (pt[1]! / gridHeight) * latRange
        return [lon, lat]
      }),
    ),
  )
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { dateStr, criterionId, resolution = DEFAULT_RESOLUTION, eZoneMode = 0, elevationData } = e.data

  const elevationGrid = elevationData
    ? new ElevationGrid(elevationData, resolution)
    : null

  const grid = computeVisibilityGrid(dateStr, criterionId, resolution, eZoneMode, elevationGrid)

  // --- Smooth pipeline: blur → upsample → contour ---
  const raw = Float64Array.from(grid.values)
  const blurred = gaussianBlur2D(raw, grid.width, grid.height, BLUR_SIGMA)
  const up = bilinearUpsample(blurred, grid.width, grid.height, UPSAMPLE_FACTOR)

  const contourGenerator = contours()
    .size([up.width, up.height])
    .smooth(true)

  const effectiveResolution = resolution / UPSAMPLE_FACTOR

  const features: Feature<MultiPolygon>[] = []

  for (const { threshold, zone, color } of ZONE_CONTOURS) {
    const [contour] = contourGenerator.thresholds([threshold])(Array.from(up.data))
    if (!contour || contour.coordinates.length === 0) continue

    features.push({
      type: 'Feature',
      properties: { zone, color, label: ZONE_LABELS[zone] },
      geometry: {
        type: 'MultiPolygon',
        coordinates: gridToGeo(
          contour.coordinates,
          up.width,
          up.height,
          effectiveResolution,
        ),
      },
    })
  }

  const geoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  }

  self.postMessage(geoJson)
}
