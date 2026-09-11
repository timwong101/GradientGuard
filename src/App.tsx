import { useEffect, useReducer, useRef, useState } from 'react'
import { Check, Download, Redo2, Share2, ShieldCheck, Undo2 } from 'lucide-react'
import { GradientControls } from './components/GradientControls'
import { TextControls } from './components/TextControls'
import { PreviewCanvas } from './components/PreviewCanvas'
import { Heatmap } from './components/Heatmap'
import { ContrastPanel } from './components/ContrastPanel'
import { ExportPanel, createCss } from './components/ExportPanel'
import { analyzeColors, analyzeRegion } from './core/contrast'
import { contrastRatio, rgbToHex } from './core/color'
import { minimumScrimOpacity } from './core/scrim'
import { encodeState } from './core/share-state'
import type { ContrastResult, EditorState } from './core/types'
import { createInitialHistory, historyReducer } from './state/editor-state'

type MobileTab = 'controls' | 'preview' | 'results'

export default function App() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => createInitialHistory())
  const state = history.present
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview')
  const [notice, setNotice] = useState('')
  const [layoutVersion, setLayoutVersion] = useState(0)
  const [result, setResult] = useState<ContrastResult>(() => analyzeRegion(state.stops, state.textColor, state.fontSize, state.fontWeight, state.textX, 42))
  const update = (patch: Partial<EditorState>) => dispatch({ type: 'update', patch })

  useEffect(() => {
    const observer = new ResizeObserver(() => setLayoutVersion((version) => version + 1))
    if (canvasRef.current) observer.observe(canvasRef.current)
    if (textRef.current) observer.observe(textRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const canvas = canvasRef.current
      const text = textRef.current
      if (!canvas || !text) return
      const canvasRect = canvas.getBoundingClientRect()
      const textRect = text.getBoundingClientRect()
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context || canvasRect.width === 0) return
      const dpr = window.devicePixelRatio || 1
      const colors: Array<{ color: string; x: number; y: number }> = []
      const columns = 12
      const rows = 5
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const screenX = Math.max(canvasRect.left, Math.min(canvasRect.right - 1, textRect.left + column / (columns - 1) * textRect.width))
          const screenY = Math.max(canvasRect.top, Math.min(canvasRect.bottom - 1, textRect.top + row / (rows - 1) * textRect.height))
          const pixelX = Math.floor((screenX - canvasRect.left) * dpr)
          const pixelY = Math.floor((screenY - canvasRect.top) * dpr)
          const [r, g, b] = context.getImageData(pixelX, pixelY, 1, 1).data
          colors.push({ color: rgbToHex({ r, g, b }), x: (screenX - canvasRect.left) / canvasRect.width * 100, y: (screenY - canvasRect.top) / canvasRect.height * 100 })
        }
      }
      setResult(analyzeColors(colors, state.textColor, state.fontSize, state.fontWeight))
    }, 140)
    return () => window.clearTimeout(timer)
  }, [state, layoutVersion])

  const backgrounds = result.samples.map((sample) => sample.color)
  const whiteRatio = Math.min(...backgrounds.map((color) => contrastRatio('#FFFFFF', color)))
  const blackRatio = Math.min(...backgrounds.map((color) => contrastRatio('#000000', color)))
  const bestText = whiteRatio >= blackRatio ? '#FFFFFF' : '#000000'
  const bestRatio = Math.max(whiteRatio, blackRatio)
  const scrimColor = bestText === '#FFFFFF' ? '#000000' : '#FFFFFF'
  const minimumOpacity = bestRatio >= result.threshold ? 0 : minimumScrimOpacity(backgrounds, bestText, scrimColor, result.threshold)
  // Canvas compositing happens in device color space, so apply at whole-percent
  // precision to avoid an 8-bit rounding edge falling just below the target.
  const scrimOpacity = minimumOpacity === 0 ? 0 : Math.min(1, Math.ceil((minimumOpacity + Number.EPSILON) * 100) / 100)
  const suggestion = { textColor: bestText, scrimColor: scrimOpacity > 0 ? scrimColor : null, scrimOpacity }

  const applyFix = () => {
    update({ textColor: suggestion.textColor, scrimColor: suggestion.scrimColor, scrimOpacity: suggestion.scrimOpacity })
    setNotice(suggestion.scrimColor ? `Applied ${Math.ceil(suggestion.scrimOpacity * 100)}% ${suggestion.scrimColor === '#000000' ? 'black' : 'white'} scrim` : `Changed text to ${suggestion.textColor === '#000000' ? 'black' : 'white'}`)
    window.setTimeout(() => setNotice(''), 2500)
  }

  const share = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('state', encodeState(state))
    window.history.replaceState(null, '', url)
    try { await navigator.clipboard.writeText(url.toString()); setNotice('Share link copied') }
    catch { setNotice('Share link added to the address bar') }
    window.setTimeout(() => setNotice(''), 2500)
  }

  const exportCss = () => {
    const blob = new Blob([createCss(state)], { type: 'text/css' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'gradient-guard.css'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className={`app-shell view-${mobileTab}`}>
      <header className="topbar">
        <a href="/" className="brand" aria-label="GradientGuard home"><span className="brand-mark"><ShieldCheck size={18} /></span><span>GradientGuard</span></a>
        <p className="tagline">Readable gradients, measured everywhere.</p>
        <nav aria-label="Document actions">
          <button className="icon-button" disabled={!history.past.length} onClick={() => dispatch({ type: 'undo' })} title="Undo" aria-label="Undo"><Undo2 size={17} /></button>
          <button className="icon-button" disabled={!history.future.length} onClick={() => dispatch({ type: 'redo' })} title="Redo" aria-label="Redo"><Redo2 size={17} /></button>
          <span className="nav-divider" />
          <button className="top-action" onClick={share} aria-label="Share configuration"><Share2 size={16} /><span>Share</span></button>
          <button className="top-action primary-small" onClick={exportCss} aria-label="Export CSS file"><Download size={16} /><span>Export</span></button>
        </nav>
      </header>
      <div className="mobile-tabs" role="tablist">{(['controls', 'preview', 'results'] as MobileTab[]).map((tab) => <button role="tab" aria-selected={mobileTab === tab} className={mobileTab === tab ? 'active' : ''} key={tab} onClick={() => setMobileTab(tab)}>{tab}</button>)}</div>
      <main className="workspace">
        <aside className={`left-panel ${mobileTab === 'controls' ? 'mobile-active' : ''}`}><GradientControls state={state} update={update} /><TextControls state={state} update={update} /></aside>
        <section className={`stage ${mobileTab === 'preview' ? 'mobile-active' : ''}`} aria-label="Gradient workspace">
          <div className="stage-toolbar"><div><span className="live-dot" /> Analysis updates automatically</div><span>{state.previewSize === 'desktop' ? '1440 × 900' : state.previewSize === 'mobile' ? '390 × 844' : '1080 × 1080'}</span></div>
          <div className="stage-canvas-wrap"><div className="preview-stack"><PreviewCanvas ref={canvasRef} textRef={textRef} state={state} update={update}><Heatmap result={result} visible={state.heatmap} /></PreviewCanvas></div></div>
          <div className="stage-footer"><span>Drag the text or use arrow keys to reposition</span><span>{result.samples.length} points sampled</span></div>
        </section>
        <aside className={`right-panel ${mobileTab === 'results' ? 'mobile-active' : ''}`}><ContrastPanel state={state} result={result} suggestion={suggestion} update={update} applyFix={applyFix} /><ExportPanel state={state} /></aside>
      </main>
      {notice && <div className="toast" role="status"><Check size={16} />{notice}</div>}
    </div>
  )
}
