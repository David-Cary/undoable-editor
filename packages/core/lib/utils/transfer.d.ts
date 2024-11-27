import { type UndoableAction, type ArrayElementReference } from 'undoable-edits';
export interface PropertyValueReference {
    source: Record<string, any>;
    key: string;
}
export declare function createTransferAction(from: PropertyValueReference | ArrayElementReference, to: PropertyValueReference | ArrayElementReference): UndoableAction | undefined;
export declare class ValueTransferHandler {
    from?: PropertyValueReference | ArrayElementReference;
    to?: PropertyValueReference | ArrayElementReference;
    action?: UndoableAction;
    getAction(): UndoableAction | undefined;
    startTransfer(from: PropertyValueReference | ArrayElementReference): void;
    completeTransfer(to: PropertyValueReference | ArrayElementReference): UndoableAction | undefined;
}
