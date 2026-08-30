import { contrastRatio, mixColors } from './color'
import { interpolateGradient } from './gradient'
import type { ColorStop, ContrastResult, SamplePoint } from './types'

export function contrastThreshold(fontSize: number, fontWeight: number): number {
  return fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700) ? 3 : 4.5
}

export function analyzeRegion(
  stops: ColorStop[],
  textColor: string,
  fontSize: number,
  fontWeight: number,
  startX: number,
  width: number,
  scrimColor: string | null = null,
  scrimOpacity = 0,
  columns = 12,
  rows = 5,
): ContrastResult {
  const threshold = contrastThreshold(fontSize, fontWeight)
  const samples: SamplePoint[] = []
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = Math.max(0, Math.min(100, startX + (column / Math.max(1, columns - 1)) * width))
      const y = rows === 1 ? 50 : (row / (rows - 1)) * 100
      const base = interpolateGradient(stops, x)
      const color = scrimColor ? mixColors(base, scrimColor, scrimOpacity) : base
      const ratio = contrastRatio(textColor, color)
      samples.push({ x, y, color, ratio, passes: ratio >= threshold })
    }
  }
  const worst = samples.reduce((minimum, sample) => sample.ratio < minimum.ratio ? sample : minimum)
  const passing = samples.filter((sample) => sample.passes).length
  return {
    ratio: worst.ratio,
    threshold,
    passPercentage: (passing / samples.length) * 100,
    passes: worst.ratio >= threshold,
    worst,
    samples,
  }
}

export function analyzeColors(colors: Array<{ color: string; x: number; y: number }>, textColor: string, fontSize: number, fontWeight: number): ContrastResult {
  const threshold = contrastThreshold(fontSize, fontWeight)
  const samples = colors.map(({ color, x, y }) => {
    const ratio = contrastRatio(textColor, color)
    return { color, x, y, ratio, passes: ratio >= threshold }
  })
  const worst = samples.reduce((minimum, sample) => sample.ratio < minimum.ratio ? sample : minimum)
  const passing = samples.filter((sample) => sample.passes).length
  return { ratio: worst.ratio, threshold, passPercentage: passing / samples.length * 100, passes: worst.ratio >= threshold, worst, samples }
}
