/**
 * Generate a static elevation grid at 3° resolution for the hilal visibility globe.
 *
 * Fetches elevation data from the Open Topo Data API (ETOPO1 dataset) in batches,
 * writes an Int16Array binary file to public/data/elevation-3deg.bin.
 *
 * Row-major order matching VisibilityGridService:
 *   row 0 = lat -88.5 (southernmost), col 0 = lon -178.5 (westernmost)
 *
 * Saves progress to a temp file so it can resume if interrupted.
 *
 * Usage: node scripts/generate-elevation-grid.mjs
 */

import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RESOLUTION = 3
const WIDTH = Math.ceil(360 / RESOLUTION) // 120
const HEIGHT = Math.ceil(180 / RESOLUTION) // 60
const TOTAL = WIDTH * HEIGHT // 7200

// Open Topo Data allows up to 100 locations per request, 1 req/sec for public API
const BATCH_SIZE = 100
const API_BASE = 'https://api.opentopodata.org/v1/etopo1'
const DELAY_MS = 1500 // 1.5s between requests (conservative)

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, '..', 'public', 'data', 'elevation-3deg.bin')
const progressPath = resolve(__dirname, '..', '.elevation-progress.json')

// Build all grid points in row-major order
const points = []
for (let row = 0; row < HEIGHT; row++) {
  const lat = -90 + RESOLUTION / 2 + row * RESOLUTION
  for (let col = 0; col < WIDTH; col++) {
    const lon = -180 + RESOLUTION / 2 + col * RESOLUTION
    points.push({ lat, lon, index: row * WIDTH + col })
  }
}

console.log(`Grid: ${WIDTH}x${HEIGHT} = ${TOTAL} points at ${RESOLUTION}° resolution`)

// Load progress if available
let elevations
let startBatch = 0
if (existsSync(progressPath)) {
  const progress = JSON.parse(readFileSync(progressPath, 'utf-8'))
  elevations = new Int16Array(progress.data)
  startBatch = progress.completedBatches
  console.log(`Resuming from batch ${startBatch}...`)
} else {
  elevations = new Int16Array(TOTAL)
}

async function fetchBatch(batch, retries = 6) {
  // Open Topo Data uses pipe-separated "lat,lon" pairs
  const locations = batch.map((p) => `${p.lat},${p.lon}`).join('|')
  const url = `${API_BASE}?locations=${locations}`

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await fetch(url)
      if (resp.ok) {
        const data = await resp.json()
        if (data.status === 'OK' || data.status === 'ok') {
          return data.results.map((r) => r.elevation)
        }
        throw new Error(`API returned status: ${data.status} - ${data.error || 'unknown'}`)
      }
      if (resp.status === 429 && attempt < retries - 1) {
        const wait = 3000 * Math.pow(2, attempt)
        console.log(`    Rate limited, retrying in ${(wait / 1000).toFixed(0)}s...`)
        await new Promise((r) => setTimeout(r, wait))
        continue
      }
      throw new Error(`API error: ${resp.status} ${resp.statusText}`)
    } catch (err) {
      if (attempt < retries - 1 && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.message?.includes('fetch failed'))) {
        const wait = 3000 * Math.pow(2, attempt)
        console.log(`    Network error, retrying in ${(wait / 1000).toFixed(0)}s...`)
        await new Promise((r) => setTimeout(r, wait))
        continue
      }
      throw err
    }
  }
}

function saveProgress(completedBatches) {
  writeFileSync(progressPath, JSON.stringify({
    completedBatches,
    data: Array.from(elevations),
  }))
}

async function main() {
  const batches = []
  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    batches.push(points.slice(i, i + BATCH_SIZE))
  }

  const remaining = batches.length - startBatch
  const estMinutes = ((remaining * DELAY_MS) / 1000 / 60).toFixed(1)
  console.log(`Fetching batches ${startBatch + 1}..${batches.length} (~${estMinutes} min)...`)

  for (let b = startBatch; b < batches.length; b++) {
    const batch = batches[b]
    const elev = await fetchBatch(batch)

    for (let j = 0; j < batch.length; j++) {
      // Clamp negative elevations (ocean) to 0
      const val = Math.max(0, Math.round(elev[j] ?? 0))
      elevations[batch[j].index] = val
    }

    // Save progress every 5 batches
    if ((b + 1) % 5 === 0) {
      saveProgress(b + 1)
    }

    if ((b + 1) % 10 === 0 || b === batches.length - 1) {
      console.log(`  ${b + 1}/${batches.length} batches done`)
    }

    if (b < batches.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }

  // Write final binary file
  writeFileSync(outPath, Buffer.from(elevations.buffer))

  // Clean up progress file
  if (existsSync(progressPath)) {
    unlinkSync(progressPath)
  }

  console.log(`\nWrote ${outPath}`)
  console.log(`  Size: ${elevations.byteLength} bytes (${(elevations.byteLength / 1024).toFixed(1)} KB)`)

  // Quick sanity check
  const himalayas = lookupIndex(28.5, 88.5)
  const ocean = lookupIndex(1.5, -178.5)
  const alps = lookupIndex(46.5, 7.5)
  console.log(`\nSanity check:`)
  console.log(`  Himalayas (28.5, 88.5): ${elevations[himalayas]}m`)
  console.log(`  Pacific Ocean (1.5, -178.5): ${elevations[ocean]}m`)
  console.log(`  Alps (46.5, 7.5): ${elevations[alps]}m`)
}

function lookupIndex(lat, lon) {
  const col = Math.round((lon - (-180 + RESOLUTION / 2)) / RESOLUTION)
  const row = Math.round((lat - (-90 + RESOLUTION / 2)) / RESOLUTION)
  return row * WIDTH + col
}

main().catch((err) => {
  console.error('Fatal:', err.message || err)
  saveProgress(startBatch)
  console.error('Progress saved. Run again to resume.')
  process.exit(1)
})
