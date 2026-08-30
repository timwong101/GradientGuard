import { AlignCenter, AlignLeft, AlignRight, Monitor, Smartphone, Square } from 'lucide-react'
import type { EditorState, PreviewSize, TextAlign } from '../core/types'

interface Props { state: EditorState; update: (patch: Partial<EditorState>) => void }

export function TextControls({ state, update }: Props) {
  const alignments: Array<[TextAlign, typeof AlignLeft]> = [['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]]
  const sizes: Array<[PreviewSize, typeof Monitor]> = [['desktop', Monitor], ['mobile', Smartphone], ['square', Square]]
  return (
    <>
      <section className="control-section" aria-labelledby="text-heading">
        <span className="eyebrow">Overlay</span><h2 id="text-heading">Text</h2>
        <label className="field"><span>Content</span><textarea value={state.text} maxLength={120} rows={3} onChange={(event) => update({ text: event.target.value })} /></label>
        <div className="field-row">
          <label><span>Size</span><span className="input-suffix"><input aria-label="Font size" type="number" min="12" max="96" value={state.fontSize} onChange={(event) => update({ fontSize: Number(event.target.value) })} /><b>px</b></span></label>
          <label><span>Weight</span><select aria-label="Font weight" value={state.fontWeight} onChange={(event) => update({ fontWeight: Number(event.target.value) })}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option><option value="800">Extra bold</option></select></label>
        </div>
        <div className="field-row">
          <label className="color-field"><span>Text color</span><span className="color-input"><input aria-label="Text color picker" type="color" value={state.textColor} onChange={(event) => update({ textColor: event.target.value.toUpperCase(), scrimColor: null, scrimOpacity: 0 })} /><input aria-label="Text color hex" value={state.textColor} readOnly /></span></label>
          <label><span>Alignment</span><span className="segmented compact">{alignments.map(([value, Icon]) => <button key={value} type="button" className={state.textAlign === value ? 'active' : ''} onClick={() => update({ textAlign: value })} aria-label={`${value} align`}><Icon size={15} /></button>)}</span></label>
        </div>
      </section>
      <section className="control-section" aria-labelledby="frame-heading">
        <span className="eyebrow">Canvas</span><h2 id="frame-heading">Preview size</h2>
        <div className="segmented">{sizes.map(([value, Icon]) => <button key={value} className={state.previewSize === value ? 'active' : ''} onClick={() => update({ previewSize: value })}><Icon size={15} /> {value}</button>)}</div>
      </section>
    </>
  )
}
