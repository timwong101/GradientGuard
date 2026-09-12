import type { ContrastResult } from '../core/types'

export function Heatmap({ result, visible }: { result: ContrastResult; visible: boolean }) {
  if (!visible) return null
  return <div className="heatmap" aria-hidden="true">
    {result.samples.map((sample, index) => <span key={index} className={sample.ratio < result.threshold ? 'unsafe' : sample.ratio < result.threshold + 0.75 ? 'near' : 'safe'} style={{ left: `${sample.x}%`, top: `${sample.y}%` }} />)}
    <i className={`worst-marker ${result.passes ? 'passing' : ''}`} style={{ left: `${result.worst.x}%`, top: `${result.worst.y}%` }}><b>{result.passes ? '✓' : '!'}</b></i>
  </div>
}
