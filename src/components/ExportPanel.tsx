import { Check, Clipboard } from 'lucide-react'
import { useState } from 'react'
import { gradientCss } from '../core/gradient'
import type { EditorState } from '../core/types'

export function createCss(state: EditorState): string {
  const layers = state.scrimColor && state.scrimOpacity > 0
    ? `linear-gradient(${state.scrimColor}${Math.round(state.scrimOpacity * 255).toString(16).padStart(2, '0')}, ${state.scrimColor}${Math.round(state.scrimOpacity * 255).toString(16).padStart(2, '0')}),\n    ${gradientCss(state.stops, state.angle)}`
    : gradientCss(state.stops, state.angle)
  return `.gradient-hero {\n  background: ${layers};\n  color: ${state.textColor};\n}`
}

export function ExportPanel({ state }: { state: EditorState }) {
  const [copied, setCopied] = useState(false)
  const css = createCss(state)
  const copy = async () => {
    try { await navigator.clipboard.writeText(css); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { setCopied(false) }
  }
  return (
    <section className="results-section export-section" aria-labelledby="export-heading">
      <div className="section-heading"><div><span className="eyebrow">Production</span><h2 id="export-heading">CSS output</h2></div><button className="icon-button" onClick={copy} title="Copy CSS" aria-label="Copy CSS">{copied ? <Check size={16} /> : <Clipboard size={16} />}</button></div>
      <pre data-testid="css-output"><code>{css}</code></pre>
      <button className="secondary-button full-button" onClick={copy}>{copied ? <><Check size={15} /> Copied</> : <><Clipboard size={15} /> Copy CSS</>}</button>
    </section>
  )
}
