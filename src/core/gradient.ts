import { hexToRgb, rgbToHex } from './color'
import type { ColorStop } from './types'

export function interpolateGradient(stops: ColorStop[], position: number): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const clamped = Math.max(0, Math.min(100, position))
  const upperIndex = sorted.findIndex((stop) => stop.position >= clamped)
  if (upperIndex <= 0) return sorted[0].color
  if (upperIndex === -1) return sorted.at(-1)!.color
  const lower = sorted[upperIndex - 1]
  const upper = sorted[upperIndex]
  const amount = (clamped - lower.position) / Math.max(1, upper.position - lower.position)
  const first = hexToRgb(lower.color)
  const second = hexToRgb(upper.color)
  return rgbToHex({
    r: first.r + (second.r - first.r) * amount,
    g: first.g + (second.g - first.g) * amount,
    b: first.b + (second.b - first.b) * amount,
  })
}

export function gradientCss(stops: ColorStop[], angle: number): string {
  const stopList = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ')
  return `linear-gradient(${angle}deg, ${stopList})`
}
