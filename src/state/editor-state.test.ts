import { historyReducer, initialEditorState, type HistoryState } from './editor-state'

describe('editor history', () => {
  it('supports undo and redo', () => {
    const initial: HistoryState = { past: [], present: initialEditorState, future: [] }
    const edited = historyReducer(initial, { type: 'update', patch: { angle: 42 } })
    expect(edited.present.angle).toBe(42)

    const undone = historyReducer(edited, { type: 'undo' })
    expect(undone.present.angle).toBe(initialEditorState.angle)

    const redone = historyReducer(undone, { type: 'redo' })
    expect(redone.present.angle).toBe(42)
  })

  it('clears redo history after a new edit', () => {
    const initial: HistoryState = { past: [], present: initialEditorState, future: [] }
    const edited = historyReducer(initial, { type: 'update', patch: { angle: 42 } })
    const undone = historyReducer(edited, { type: 'undo' })
    const branched = historyReducer(undone, { type: 'update', patch: { angle: 75 } })
    expect(branched.future).toHaveLength(0)
  })
})
