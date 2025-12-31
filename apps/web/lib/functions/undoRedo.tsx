import type { Shape } from "@repo/common";

class Stack<T> {
  private items: T[] = [];
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  push(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.items.shift();
    }
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  getAll(): T[] {
    return [...this.items];
  }
}

export class UndoRedoManager {
  private undoStack: Stack<Shape[]>;
  private redoStack: Stack<Shape[]>;
  private onHistoryChange: ((canUndo: boolean, canRedo: boolean) => void) | null = null;

  constructor(maxSize: number = 50) {
    this.undoStack = new Stack<Shape[]>(maxSize);
    this.redoStack = new Stack<Shape[]>(maxSize);
  }

  saveState(shapes: Shape[]): void {
    const clonedState = JSON.parse(JSON.stringify(shapes));
    this.undoStack.push(clonedState);
    this.redoStack.clear();
    this.notifyHistoryChange();
  }

  undo(currentShapes: Shape[]): Shape[] | null {
    if (this.undoStack.isEmpty()) {
      return null;
    }

    const currentState = JSON.parse(JSON.stringify(currentShapes));
    this.redoStack.push(currentState);

    const previousState = this.undoStack.pop();
    this.notifyHistoryChange();

    return previousState || null;
  }

  redo(): Shape[] | null {
    if (this.redoStack.isEmpty()) {
      return null;
    }

    const nextState = this.redoStack.pop();
    if (nextState) {
      this.undoStack.push(JSON.parse(JSON.stringify(nextState)));
      this.notifyHistoryChange();
      return nextState;
    }

    return null;
  }

  canUndo(): boolean {
    return !this.undoStack.isEmpty();
  }

  canRedo(): boolean {
    return !this.redoStack.isEmpty();
  }

  clear(): void {
    this.undoStack.clear();
    this.redoStack.clear();
    this.notifyHistoryChange();
  }

  initialize(initialState: Shape[]): void {
    this.clear();
    const clonedState = JSON.parse(JSON.stringify(initialState));
    this.undoStack.push(clonedState);
    this.notifyHistoryChange();
  }

  setOnHistoryChange(callback: (canUndo: boolean, canRedo: boolean) => void): void {
    this.onHistoryChange = callback;
  }

  private notifyHistoryChange(): void {
    if (this.onHistoryChange) {
      this.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }
}
