import { UndoableActionSequence, UndoableDeleteProperty, UndoableSetProperty, UndoableSplice, UndoableTransferItem } from 'undoable-edits';
export function createTransferAction(from, to) {
    let removal;
    let value;
    if ('key' in from) {
        if ('key' in to) {
            if (from.source === to.source && from.key === to.key)
                return;
        }
        removal = new UndoableDeleteProperty(from.source, from.key);
        value = from.source[from.key];
    }
    else {
        if ('index' in to) {
            if (from.source === to.source && from.index === to.index)
                return;
            return new UndoableTransferItem(from, to);
        }
        removal = new UndoableSplice(from.source, from.index, 1);
        value = from.source[from.index];
    }
    const insertion = 'key' in to
        ? new UndoableSetProperty(to.source, to.key, value)
        : new UndoableSplice(to.source, to.index, 0, value);
    return new UndoableActionSequence([removal, insertion]);
}
export class ValueTransferHandler {
    from;
    to;
    action;
    getAction() {
        if (this.from != null && this.to != null) {
            return createTransferAction(this.from, this.to);
        }
    }
    startTransfer(from) {
        this.from = from;
        this.to = undefined;
    }
    completeTransfer(to) {
        this.to = to;
        this.action = this.getAction();
        if (this.action != null) {
            this.action.redo();
        }
        return this.action;
    }
}
