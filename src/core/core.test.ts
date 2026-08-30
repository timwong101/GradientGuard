import { contrastRatio, relativeLuminance } from './color'
import { contrastThreshold } from './contrast'
import { interpolateGradient } from './gradient'
import { minimumScrimOpacity } from './scrim'
import { decodeState, encodeState } from './share-state'
import { initialEditorState } from '../state/editor-state'

describe('WCAG contrast math', () => {
  it('calculates known relative luminance values', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#FFFFFF')).toBe(1)
    expect(relativeLuminance('#777777')).toBeCloseTo(0.1845, 3)
  })

  it('calculates known contrast ratios', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21)
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.478, 2)
  })

  it('selects the large-text threshold', () => {
    expect(contrastThreshold(24, 400)).toBe(3)
    expect(contrastThreshold(18.5, 700)).toBe(3)
    expect(contrastThreshold(18, 700)).toBe(4.5)
    expect(contrastThreshold(23, 400)).toBe(4.5)
  })
})

describe('gradient interpolation', () => {
  const stops = [
    { id: 'first', color: '#000000', position: 0 },
    { id: 'last', color: '#FFFFFF', position: 100 },
  ]
  it('interpolates colors between stops', () => {
    expect(interpolateGradient(stops, 0)).toBe('#000000')
    expect(interpolateGradient(stops, 50)).toBe('#808080')
    expect(interpolateGradient(stops, 100)).toBe('#FFFFFF')
  })
})

describe('scrim optimization', () => {
  it('finds the minimum opacity that passes every background', () => {
    const opacity = minimumScrimOpacity(['#FFFFFF', '#EEEEEE'], '#FFFFFF', '#000000', 4.5)
    expect(opacity).toBeGreaterThan(0.53)
    expect(opacity).toBeLessThan(0.54)
  })

  it('returns zero when no scrim is required', () => {
    expect(minimumScrimOpacity(['#111111'], '#FFFFFF', '#000000', 4.5)).toBe(0)
  })
})

describe('share state', () => {
  it('round-trips a valid editor state', () => {
    const changed = { ...initialEditorState, text: 'Shared gradient', angle: 45 }
    expect(decodeState(encodeState(changed), initialEditorState)).toMatchObject({ text: 'Shared gradient', angle: 45 })
  })

  it('falls back for malformed shared state', () => {
    expect(decodeState('not-valid-base64', initialEditorState)).toEqual(initialEditorState)
    const invalid = btoa(encodeURIComponent(JSON.stringify({ v: 1, s: [] })))
    expect(decodeState(invalid, initialEditorState)).toEqual(initialEditorState)
  })
})
