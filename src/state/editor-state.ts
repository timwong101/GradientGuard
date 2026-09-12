import { decodeState } from '../core/share-state'
import type { EditorState } from '../core/types'
import { presets } from '../core/presets'

export const initialEditorState: EditorState = {
  stops: presets[0].stops,
  selectedStopId: presets[0].stops[1].id, angle: presets[0].angle, text: 'Design that everyone can read.',
  fontSize: 52, fontWeight: 700, textColor: '#FFFFFF', textAlign: 'left',
  textX: 12, textY: 38, previewSize: 'desktop', scrimColor: null, scrimOpacity: 0, heatmap: true,
}

export interface HistoryState {
  past: EditorState[]
  present: EditorState
  future: EditorState[]
  lastUpdateGroup?: symbol
}

export type EditorAction =
  | { type: 'update'; patch: Partial<EditorState>; group?: symbol }
  | { type: 'replace'; state: EditorState }
  | { type: 'undo' }
  | { type: 'redo' }

export function historyReducer(history: HistoryState, action: EditorAction): HistoryState {
  if (action.type === 'undo') {
    if (!history.past.length) return history
    const present = history.past.at(-1)!
    return { past: history.past.slice(0, -1), present, future: [history.present, ...history.future] }
  }
  if (action.type === 'redo') {
    if (!history.future.length) return history
    const [present, ...future] = history.future
    return { past: [...history.past, history.present], present, future }
  }
  const present = action.type === 'replace' ? action.state : { ...history.present, ...action.patch }
  if (JSON.stringify(present) === JSON.stringify(history.present)) return history
  const group = action.type === 'update' ? action.group : undefined
  // A gesture's first change saves its starting state; later changes update only the preview.
  const past = group !== undefined && group === history.lastUpdateGroup
    ? history.past
    : [...history.past.slice(-49), history.present]
  return { past, present, future: [], lastUpdateGroup: group }
}

export function createInitialHistory(search = window.location.search): HistoryState {
  const encoded = new URLSearchParams(search).get('state')
  return { past: [], present: encoded ? decodeState(encoded, initialEditorState) : initialEditorState, future: [] }
}
