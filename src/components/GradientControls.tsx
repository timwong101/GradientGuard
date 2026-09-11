import { Copy, Plus, Trash2 } from 'lucide-react'
import { gradientCss } from '../core/gradient'
import { normalizeHex } from '../core/color'
import type { EditorState } from '../core/types'

export const presets: Array<{ name: string; stops: EditorState['stops']; angle: number }> = [
  { name: 'Ember', angle: 118, stops: [{ id: 'ember-1', color: '#F2A87B', position: 0 }, { id: 'ember-2', color: '#C85B72', position: 46 }, { id: 'ember-3', color: '#613659', position: 100 }] },
  { name: 'Meadow', angle: 105, stops: [{ id: 'meadow-1', color: '#E8E3A2', position: 0 }, { id: 'meadow-2', color: '#69A88D', position: 55 }, { id: 'meadow-3', color: '#24545C', position: 100 }] },
  { name: 'Dusk', angle: 132, stops: [{ id: 'dusk-1', color: '#F4D8C2', position: 0 }, { id: 'dusk-2', color: '#8E667F', position: 52 }, { id: 'dusk-3', color: '#342E4E', position: 100 }] },
  { name: 'Paper', angle: 90, stops: [{ id: 'paper-1', color: '#FFF8E8', position: 0 }, { id: 'paper-2', color: '#DFC9B6', position: 50 }, { id: 'paper-3', color: '#7D685B', position: 100 }] },
]

interface Props {
  state: EditorState
  update: (patch: Partial<EditorState>) => void
}

export function GradientControls({ state, update }: Props) {
  const selected = state.stops.find((stop) => stop.id === state.selectedStopId) ?? state.stops[0]
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
      <div className="stop-editor">
        <div className="gradient-rail" style={{ background: gradientCss(state.stops, 90) }}>
          {state.stops.map((stop) => (
            <button key={stop.id} className={`stop-handle ${stop.id === selected.id ? 'selected' : ''}`} style={{ left: `${stop.position}%`, background: stop.color }} onClick={() => update({ selectedStopId: stop.id })} aria-label={`Select stop at ${stop.position}%`} />
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
