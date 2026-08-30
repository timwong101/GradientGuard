export interface RGB {
  r: number
  g: number
  b: number
}

export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '')
  const expanded = raw.length === 3 ? raw.split('').map((character) => character + character).join('') : raw
  return /^[0-9a-fA-F]{6}$/.test(expanded) ? `#${expanded.toUpperCase()}` : null
}

export function hexToRgb(value: string): RGB {
  const hex = normalizeHex(value)
  if (!hex) throw new Error(`Invalid color: ${value}`)
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const channel = (value: number) => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase()
}

export function relativeLuminance(color: string): number {
  const channels = Object.values(hexToRgb(color)).map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

export function mixColors(bottom: string, top: string, opacity: number): string {
  const background = hexToRgb(bottom)
  const foreground = hexToRgb(top)
  return rgbToHex({
    r: background.r * (1 - opacity) + foreground.r * opacity,
    g: background.g * (1 - opacity) + foreground.g * opacity,
    b: background.b * (1 - opacity) + foreground.b * opacity,
  })
}
