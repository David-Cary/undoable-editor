import { shallowReactive } from 'vue'
import { UndoableActionTrack } from 'undoable-edits'

export class ReactiveUndoTrack extends UndoableActionTrack {
  constructor() {
    super()
    this.appliedActions = shallowReactive(this.appliedActions)
    this.undoneActions = shallowReactive(this.undoneActions)
  }
}
