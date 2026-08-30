import { forwardRef, useEffect, useRef, type ReactNode } from 'react'
import { Move } from 'lucide-react'
import type { EditorState } from '../core/types'

interface Props { state: EditorState; update: (patch: Partial<EditorState>) => void; textRef: React.RefObject<HTMLDivElement | null>; children?: ReactNode }

function gradientVector(angle: number, width: number, height: number) {
  const radians = (angle - 90) * Math.PI / 180
  const x = Math.cos(radians)
  const y = Math.sin(radians)
  const length = Math.abs(width * x) + Math.abs(height * y)
  return { x0: width / 2 - x * length / 2, y0: height / 2 - y * length / 2, x1: width / 2 + x * length / 2, y1: height / 2 + y * length / 2 }
}

export const PreviewCanvas = forwardRef<HTMLCanvasElement, Props>(function PreviewCanvas({ state, update, textRef, children }, forwardedRef) {
  const localRef = useRef<HTMLCanvasElement | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; textX: number; textY: number } | null>(null)
  const setCanvasRef = (canvas: HTMLCanvasElement | null) => {
    localRef.current = canvas
    if (typeof forwardedRef === 'function') forwardedRef(canvas)
    else if (forwardedRef) forwardedRef.current = canvas
  }

  useEffect(() => {
    const canvas = localRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return
    context.scale(dpr, dpr)
    const vector = gradientVector(state.angle, rect.width, rect.height)
    const gradient = context.createLinearGradient(vector.x0, vector.y0, vector.x1, vector.y1)
    ;[...state.stops].sort((a, b) => a.position - b.position).forEach((stop) => gradient.addColorStop(stop.position / 100, stop.color))
    context.fillStyle = gradient
    context.fillRect(0, 0, rect.width, rect.height)
    if (state.scrimColor && state.scrimOpacity > 0) {
      context.globalAlpha = state.scrimOpacity
      context.fillStyle = state.scrimColor
      context.fillRect(0, 0, rect.width, rect.height)
      context.globalAlpha = 1
    }
  }, [state.stops, state.angle, state.scrimColor, state.scrimOpacity, state.previewSize])

  const nudge = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const amount = event.shiftKey ? 2 : 0.5
    const xDirection = event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0
    const yDirection = event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0
    update({ textX: Math.max(0, Math.min(78, state.textX + xDirection)), textY: Math.max(0, Math.min(82, state.textY + yDirection)) })
  }

  return (
    <div className={`preview-frame ${state.previewSize}`} data-testid="preview-frame">
      <canvas ref={setCanvasRef} aria-label="Gradient preview" />
      <div ref={textRef} className="preview-text" data-testid="preview-text" tabIndex={0} role="group" aria-label="Draggable preview text. Use arrow keys to reposition." style={{ left: `${state.textX}%`, top: `${state.textY}%`, color: state.textColor, fontSize: `clamp(18px, ${state.fontSize / 12}vw, ${state.fontSize}px)`, fontWeight: state.fontWeight, textAlign: state.textAlign }} onKeyDown={nudge}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { startX: event.clientX, startY: event.clientY, textX: state.textX, textY: state.textY } }}
        onPointerMove={(event) => { if (!dragRef.current) return; const frame = event.currentTarget.parentElement!.getBoundingClientRect(); update({ textX: Math.max(0, Math.min(78, dragRef.current.textX + (event.clientX - dragRef.current.startX) / frame.width * 100)), textY: Math.max(0, Math.min(82, dragRef.current.textY + (event.clientY - dragRef.current.startY) / frame.height * 100)) }) }}
        onPointerUp={() => { dragRef.current = null }}>
        <Move className="drag-icon" size={16} aria-hidden="true" />
        <span>{state.text || 'Type something…'}</span>
      </div>
      {children}
    </div>
  )
})
