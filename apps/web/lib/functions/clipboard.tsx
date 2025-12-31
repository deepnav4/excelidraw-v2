import type { Shape } from "@repo/common";

// Helper function to deep clone shapes
function deepCloneShape(shape: Shape): Shape {
  if (shape.type === "free-draw") {
    return {
      ...shape,
      points: shape.points.map(p => ({ ...p }))
    };
  }
  return { ...shape };
}

export class ClipboardManager {
  private copiedShape: Shape | null = null;

  copyShape(shape: Shape | null): boolean {
    if (!shape) return false;
    this.copiedShape = deepCloneShape(shape);
    return true;
  }

  pasteShape(): Shape | null {
    if (!this.copiedShape) return null;
    
    const newShape = deepCloneShape(this.copiedShape);
    newShape.id = Date.now().toString() + Math.random();
    
    // Offset the pasted shape slightly so it's visible
    const offset = 20;
    if ('x' in newShape && 'y' in newShape) {
      newShape.x += offset;
      newShape.y += offset;
    }
    
    return newShape;
  }

  hasCopiedShape(): boolean {
    return this.copiedShape !== null;
  }

  clear(): void {
    this.copiedShape = null;
  }
}
