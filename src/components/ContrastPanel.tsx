import { Check, ChevronRight, CircleAlert, Eye, EyeOff, Sparkles } from 'lucide-react'
import type { ContrastResult, EditorState } from '../core/types'

interface Props {
  state: EditorState
  result: ContrastResult
  suggestion: { textColor: string; scrimColor: string | null; scrimOpacity: number }
  update: (patch: Partial<EditorState>) => void
  applyFix: () => void
}

export function ContrastPanel({ state, result, suggestion, update, applyFix }: Props) {
  const status = result.passes ? 'pass' : 'fail'
  return (
    <section className="results-section" aria-labelledby="contrast-heading">
      <div className="section-heading">
        <div><span className="eyebrow">Live analysis</span><h2 id="contrast-heading">Contrast</h2></div>
        <button className="icon-button" title={state.heatmap ? 'Hide heatmap' : 'Show heatmap'} aria-label={state.heatmap ? 'Hide heatmap' : 'Show heatmap'} onClick={() => update({ heatmap: !state.heatmap })}>{state.heatmap ? <EyeOff size={17} /> : <Eye size={17} />}</button>
      </div>
      <div className={`status-banner ${status}`}>
        <span className="status-icon">{result.passes ? <Check size={18} /> : <CircleAlert size={18} />}</span>
        <div><strong>Estimated AA {result.passes ? 'pass' : 'fail'}</strong><span>{result.passes ? 'Every sampled point meets the target.' : 'Some text sits over an unsafe region.'}</span></div>
      </div>
      <div className="ratio-summary">
        <div><span>Worst sampled contrast</span><strong data-testid="worst-ratio">{result.ratio.toFixed(2)}<small>:1</small></strong></div>
        <div className="threshold"><span>Required</span><strong>{result.threshold.toFixed(1)}:1</strong></div>
      </div>
      <div className="meter-label"><span>Sample coverage passing</span><strong>{Math.round(result.passPercentage)}%</strong></div>
      <div className="meter"><span style={{ width: `${result.passPercentage}%` }} /></div>
      <dl className="result-list">
        <div><dt>Worst location</dt><dd>{Math.round(result.worst.x)}% × {Math.round(result.worst.y)}%</dd></div>
        <div><dt>Suggested text</dt><dd><i className="color-dot" style={{ background: suggestion.textColor }} />{suggestion.textColor}</dd></div>
        <div><dt>Required scrim</dt><dd>{suggestion.scrimColor ? <><i className="color-dot" style={{ background: suggestion.scrimColor }} />{suggestion.scrimColor} · {Math.ceil(suggestion.scrimOpacity * 100)}%</> : 'None'}</dd></div>
      </dl>
      {!result.passes && <button className="primary-button make-readable" onClick={applyFix}><Sparkles size={16} /> Make readable <ChevronRight size={16} /></button>}
      {result.passes && <div className="all-clear"><Check size={15} /> No correction needed</div>}
      <p className="disclaimer">Conservative rectangular sampling. This estimate supports design decisions but is not formal WCAG certification.</p>
    </section>
  )
}
