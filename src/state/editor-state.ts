import { decodeState } from '../core/share-state'
import type { EditorState } from '../core/types'

export const initialEditorState: EditorState = {
  stops: [
    { id: 'peach', color: '#F2A87B', position: 0 },
    { id: 'rose', color: '#C85B72', position: 46 },
    { id: 'plum', color: '#613659', position: 100 },
  ],
  selectedStopId: 'rose', angle: 118, text: 'Design that everyone can read.',
  fontSize: 52, fontWeight: 700, textColor: '#FFFFFF', textAlign: 'left',
  textX: 12, textY: 38, previewSize: 'desktop', scrimColor: null, scrimOpacity: 0, heatmap: true,
}

export interface HistoryState {
  past: EditorState[]
  present: EditorState
  future: EditorState[]
}

export type EditorAction =
  | { type: 'update'; patch: Partial<EditorState> }
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
  return { past: [...history.past.slice(-49), history.present], present, future: [] }
}

export function createInitialHistory(search = window.location.search): HistoryState {
  const encoded = new URLSearchParams(search).get('state')
  return { past: [], present: encoded ? decodeState(encoded, initialEditorState) : initialEditorState, future: [] }
}
