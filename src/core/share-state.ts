import type { EditorState, PreviewSize, TextAlign } from './types'

interface SharedState {
  v: 1
  s: Array<[string, number]>
  a: number
  t: string
  fs: number
  fw: number
  c: string
  al: TextAlign
  x: number
  y: number
  p: PreviewSize
  sc: string | null
  so: number
}

export function encodeState(state: EditorState): string {
  const shared: SharedState = {
    v: 1,
    s: state.stops.map((stop) => [stop.color, stop.position]),
    a: state.angle,
    t: state.text,
    fs: state.fontSize,
    fw: state.fontWeight,
    c: state.textColor,
    al: state.textAlign,
    x: state.textX,
    y: state.textY,
    p: state.previewSize,
    sc: state.scrimColor,
    so: state.scrimOpacity,
  }
  return btoa(encodeURIComponent(JSON.stringify(shared)))
}

export function decodeState(value: string, fallback: EditorState): EditorState {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(value))) as Partial<SharedState>
    if (
      parsed.v !== 1 || !Array.isArray(parsed.s) || parsed.s.length < 2 ||
      !parsed.s.every((stop) => Array.isArray(stop) && /^#[0-9a-f]{6}$/i.test(stop[0]) && Number.isFinite(stop[1]) && stop[1] >= 0 && stop[1] <= 100) ||
      typeof parsed.t !== 'string' || typeof parsed.a !== 'number' || typeof parsed.fs !== 'number' ||
      typeof parsed.fw !== 'number' || !/^#[0-9a-f]{6}$/i.test(parsed.c ?? '') ||
      !['left', 'center', 'right'].includes(parsed.al ?? '') || !['desktop', 'mobile', 'square'].includes(parsed.p ?? '') ||
      typeof parsed.x !== 'number' || typeof parsed.y !== 'number' || typeof parsed.so !== 'number' ||
      (parsed.sc !== null && !/^#[0-9a-f]{6}$/i.test(parsed.sc ?? ''))
    ) return fallback
    return {
      ...fallback,
      stops: parsed.s.map(([color, position], index) => ({ id: `shared-${index}`, color, position })),
      selectedStopId: 'shared-0', angle: parsed.a, text: parsed.t.slice(0, 120),
      fontSize: parsed.fs, fontWeight: parsed.fw, textColor: parsed.c!, textAlign: parsed.al!,
      textX: parsed.x, textY: parsed.y, previewSize: parsed.p!, scrimColor: parsed.sc!, scrimOpacity: parsed.so,
    }
  } catch {
    return fallback
  }
}
