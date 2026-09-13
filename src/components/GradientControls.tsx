import { Copy, Plus, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { gradientCss } from '../core/gradient'
import { normalizeHex } from '../core/color'
import type { EditorState } from '../core/types'
import { presets } from '../core/presets'

interface Props {
  state: EditorState
  update: (patch: Partial<EditorState>, group?: symbol) => void
  tryContrastProblem: () => void
}

export function GradientControls({ state, update, tryContrastProblem }: Props) {
  const drag = useRef<{ pointerId: number; offset: number; group: symbol } | null>(null)
  const selected = state.stops.find((stop) => stop.id === state.selectedStopId) ?? state.stops[0]
  const moveStop = (id: string, position: number, group?: symbol) => update({
    selectedStopId: id,
    stops: state.stops.map((stop) => stop.id === id
      ? { ...stop, position: Math.max(0, Math.min(100, Math.round(position))) }
      : stop),
  }, group)
  const updateStop = (patch: Partial<typeof selected>) => update({ stops: state.stops.map((stop) => stop.id === selected.id ? { ...stop, ...patch } : stop) })
  const addStop = () => {
    const id = `stop-${Date.now()}`
    update({ stops: [...state.stops, { id, color: selected.color, position: Math.min(100, selected.position + 10) }], selectedStopId: id })
  }
  const duplicateStop = () => {
    const id = `stop-${Date.now()}`
    update({ stops: [...state.stops, { ...selected, id, position: Math.min(100, selected.position + 5) }], selectedStopId: id })
  }
  const removeStop = () => {
    if (state.stops.length <= 2) return
    const remaining = state.stops.filter((stop) => stop.id !== selected.id)
    update({ stops: remaining, selectedStopId: remaining[0].id })
  }

  return (
    <section className="control-section" aria-labelledby="gradient-heading">
      <div className="section-heading">
        <div><span className="eyebrow">Background</span><h2 id="gradient-heading">Gradient</h2></div>
        <button className="icon-button" onClick={addStop} title="Add color stop" aria-label="Add color stop"><Plus size={16} /></button>
      </div>
      <div className="preset-grid" role="group" aria-label="Gradient presets">
        {presets.map((preset) => <button key={preset.name} className="preset" title={preset.name} aria-label={`Use ${preset.name} preset`} onClick={() => update({ stops: preset.stops, selectedStopId: preset.stops[1].id, angle: preset.angle, scrimColor: null, scrimOpacity: 0 })}><span className="preset-swatch" style={{ background: gradientCss(preset.stops, preset.angle) }} /><span>{preset.name}</span></button>)}
      </div>
      <button className="example-action" onClick={tryContrastProblem}>Try a contrast problem <span aria-hidden="true">→</span></button>
      <div className="stop-editor">
        <div className="gradient-rail" style={{ background: gradientCss(state.stops, 90) }}>
          {state.stops.map((stop, index) => (
            <button key={stop.id} className={`stop-handle ${stop.id === selected.id ? 'selected' : ''}`}
              style={{ left: `${stop.position}%`, background: stop.color }}
              role="slider" aria-label={`Color stop ${index + 1} position`} aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={stop.position} aria-valuetext={`${stop.position}%`} aria-orientation="horizontal"
              title="Drag to move. Use arrow keys for precise adjustments."
              onClick={() => update({ selectedStopId: stop.id })}
              onPointerDown={(event) => {
                if (!event.isPrimary || event.button !== 0 || drag.current) return
                const handle = event.currentTarget
                const rail = handle.parentElement!
                drag.current = { pointerId: event.pointerId, offset: event.clientX - rail.getBoundingClientRect().left - rail.clientLeft - stop.position / 100 * rail.clientWidth, group: Symbol('color-stop-drag') }
                handle.setPointerCapture(event.pointerId)
                update({ selectedStopId: stop.id }, drag.current.group)
              }}
              onPointerMove={(event) => {
                if (drag.current?.pointerId !== event.pointerId) return
                const rail = event.currentTarget.parentElement!
                const position = (event.clientX - rail.getBoundingClientRect().left - rail.clientLeft - drag.current.offset) / rail.clientWidth * 100
                moveStop(stop.id, position, drag.current.group)
              }}
              onPointerUp={() => { drag.current = null }}
              onPointerCancel={() => { drag.current = null }}
              onLostPointerCapture={() => { drag.current = null }}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 10 : 1
                const positions: Record<string, number> = {
                  ArrowLeft: stop.position - step, ArrowDown: stop.position - step,
                  ArrowRight: stop.position + step, ArrowUp: stop.position + step,
                  Home: 0, End: 100,
                }
                if (!(event.key in positions)) return
                event.preventDefault()
                moveStop(stop.id, positions[event.key])
              }} />
          ))}
        </div>
        <input aria-label="Selected stop position" type="range" min="0" max="100" value={selected.position} onChange={(event) => updateStop({ position: Number(event.target.value) })} />
      </div>
      <div className="field-row stop-fields">
        <label className="color-field"><span>Color</span><span className="color-input"><input type="color" value={selected.color} onChange={(event) => updateStop({ color: event.target.value.toUpperCase() })} /><input aria-label="Selected stop hex color" value={selected.color} onChange={(event) => { const color = normalizeHex(event.target.value); if (color) updateStop({ color }) }} /></span></label>
        <label><span>Position</span><span className="input-suffix"><input type="number" min="0" max="100" value={selected.position} onChange={(event) => updateStop({ position: Math.max(0, Math.min(100, Number(event.target.value))) })} /><b>%</b></span></label>
      </div>
      <div className="button-row">
        <button className="secondary-button" onClick={duplicateStop}><Copy size={14} /> Duplicate</button>
        <button className="secondary-button danger" onClick={removeStop} disabled={state.stops.length <= 2}><Trash2 size={14} /> Delete</button>
      </div>
      <label className="field"><span>Angle <output>{state.angle}°</output></span><input aria-label="Gradient angle" type="range" min="0" max="360" value={state.angle} onChange={(event) => update({ angle: Number(event.target.value) })} /></label>
    </section>
  )
}
