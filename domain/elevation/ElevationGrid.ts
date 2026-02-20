export class ElevationGrid {
  private data: Int16Array
  private width: number
  private height: number
  private resolution: number

  constructor(buffer: ArrayBuffer, resolution: number) {
    this.data = new Int16Array(buffer)
    this.resolution = resolution
    this.width = Math.ceil(360 / resolution)
    this.height = Math.ceil(180 / resolution)
  }

  /** Nearest-neighbor elevation lookup. Returns meters above sea level (clamped >= 0). */
  lookup(lat: number, lon: number): number {
    const col = Math.round((lon - (-180 + this.resolution / 2)) / this.resolution)
    const row = Math.round((lat - (-90 + this.resolution / 2)) / this.resolution)
    const c = Math.max(0, Math.min(this.width - 1, col))
    const r = Math.max(0, Math.min(this.height - 1, row))
    return Math.max(0, this.data[r * this.width + c] ?? 0)
  }
}
