import { historyReducer, initialEditorState, type HistoryState } from './editor-state'

describe('editor history', () => {
  it('groups live drag updates without losing earlier edits and redoes the whole drag', () => {
    const initial: HistoryState = { past: [], present: initialEditorState, future: [] }
    const edited = historyReducer(initial, { type: 'update', patch: { text: 'Earlier edit' } })
    const group = Symbol('drag')
    let dragged = edited
    for (let position = 1; position <= 90; position += 1) {
      dragged = historyReducer(dragged, { type: 'update', group, patch: {
        stops: dragged.present.stops.map((stop, index) => index === 0 ? { ...stop, position } : stop),
      } })
      expect(dragged.present.stops[0].position).toBe(position)
    }
    expect(dragged.past).toHaveLength(2)
    const undone = historyReducer(dragged, { type: 'undo' })
    expect(undone.present).toEqual(edited.present)
    expect(historyReducer(undone, { type: 'redo' }).present).toEqual(dragged.present)
    expect(historyReducer(undone, { type: 'undo' }).present).toEqual(initialEditorState)
  })

  it('keeps separate gestures and ordinary edits as separate undo steps', () => {
    const initial: HistoryState = { past: [], present: initialEditorState, future: [] }
    const first = historyReducer(initial, { type: 'update', group: Symbol('drag'), patch: { angle: 20 } })
    const second = historyReducer(first, { type: 'update', group: Symbol('drag'), patch: { angle: 40 } })
    const keyboard = historyReducer(second, { type: 'update', patch: { angle: 41 } })
    expect(historyReducer(keyboard, { type: 'undo' }).present.angle).toBe(40)
    expect(historyReducer(second, { type: 'undo' }).present.angle).toBe(20)
  })

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
