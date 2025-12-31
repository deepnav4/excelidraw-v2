import type { Shape, Point, ToolType, StrokeWidth, StrokeStyle, FillStyle } from "@repo/common";
//@ts-ignore
import { ShapeRenderer } from "./ShapeRenderer";
import { saveToLocalStorage, loadFromLocalStorage } from "../storage/localStorage";
import {
  DEFAULT_STROKE_WIDTH,
  DEFAULT_STROKE_FILL,
  DEFAULT_BG_FILL,
  DEFAULT_STROKE_STYLE,
  DEFAULT_FILL_STYLE,
  LOCALSTORAGE_CANVAS_KEY,
} from "@repo/common";
import { v4 as uuidv4 } from "uuid";

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

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapeRenderer: ShapeRenderer;

  // Canvas state
  private shapes: Shape[] = [];
  private currentTool: ToolType = "rectangle";
  private isDrawing: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private currentShape: Shape | null = null;

  // Pan and zoom
  private panX: number = 0;
  private panY: number = 0;
  private scale: number = 1;
  private isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;

  // Style settings
  private strokeWidth: StrokeWidth = DEFAULT_STROKE_WIDTH as StrokeWidth;
  private strokeFill: string = DEFAULT_STROKE_FILL;
  private bgFill: string = DEFAULT_BG_FILL;
  private strokeStyle: StrokeStyle = DEFAULT_STROKE_STYLE as StrokeStyle;
  private fillStyle: FillStyle = DEFAULT_FILL_STYLE as FillStyle;

  // Selection
  private selectedShapeId: string | null = null;
  private onSelectionChange: ((shape: Shape | null) => void) | null = null;

  // Dragging selected shape
  private isDraggingShape: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private shapeOriginalPos: { x: number; y: number } | null = null;

  // Resizing selected shape
  private isResizingShape: boolean = false;
  private resizeHandle: string | null = null; // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private originalShapeBounds: { x: number; y: number; width: number; height: number } | null = null;

  // Text editing
  private activeTextInput: HTMLTextAreaElement | null = null;

  // Eraser state - track shapes marked for deletion
  private shapesMarkedForDeletion: Set<string> = new Set();

  // Render optimization
  private renderScheduled: boolean = false;

  // Undo/Redo
  private history: Shape[][] = [];
  private historyStep: number = -1;

  // Clipboard
  private copiedShape: Shape | null = null;

  // Callbacks
  private onShapeCountChange: ((count: number) => void) | null = null;
  private onHistoryChange: ((canUndo: boolean, canRedo: boolean) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.shapeRenderer = new ShapeRenderer(this.ctx);

    this.init();
  }

  private init() {
    this.resizeCanvas();
    this.loadShapes();
    this.setupEventListeners();
    this.render();
  }

  public resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Reset transform before scaling to prevent accumulation
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    // Use requestAnimationFrame to prevent multiple rapid renders
    if (!this.renderScheduled) {
      this.renderScheduled = true;
      requestAnimationFrame(() => {
        this.renderScheduled = false;
        this.render();
      });
    }
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this));
    this.canvas.addEventListener("mousemove", this.handleCursorUpdate.bind(this));
    window.addEventListener("resize", this.resizeCanvas.bind(this));
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      this.undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      this.redo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      this.copySelectedShape();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      this.pasteShape();
    }
  }

  private handleMouseDown(e: MouseEvent) {
    // Skip if text input is active
    if (this.activeTextInput) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    this.startX = (e.clientX - rect.left - this.panX) / this.scale;
    this.startY = (e.clientY - rect.top - this.panY) / this.scale;

    if (this.currentTool === "grab") {
      this.isPanning = true;
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      this.canvas.style.cursor = "grabbing";
      return;
    }

    if (this.currentTool === "text") {
      this.createTextInput(e.clientX - rect.left, e.clientY - rect.top);
      return;
    }

    if (this.currentTool === "eraser") {
      // Clear any previous marks
      this.shapesMarkedForDeletion.clear();
      // Start erasing - mark shapes at initial click point
      const clickedShapeIndex = this.findShapeAtPoint(this.startX, this.startY);
      if (clickedShapeIndex !== -1) {
        this.shapesMarkedForDeletion.add(this.shapes[clickedShapeIndex].id);
        this.render();
      }
      this.isDrawing = true; // Track that eraser is active
      return;
    }

    // FIRST: Check for resize handles on selected shape (works with any tool)
    if (this.selectedShapeId) {
      const selectedShape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (selectedShape) {
        const handle = this.getResizeHandleAtPoint(selectedShape, this.startX, this.startY);
        if (handle) {
          this.isResizingShape = true;
          this.resizeHandle = handle;
          this.resizeStartX = this.startX;
          this.resizeStartY = this.startY;
          this.originalShapeBounds = this.getShapeBounds(selectedShape);
          return;
        }
      }
    }

    // Allow selecting shapes with any tool (except drawing tools)
    const nonSelectableTools: ToolType[] = ["free-draw", "eraser", "text"];
    if (!nonSelectableTools.includes(this.currentTool)) {
      const clickedShapeIndex = this.findShapeAtPoint(this.startX, this.startY);
      if (clickedShapeIndex !== -1) {
        const clickedShape = this.shapes[clickedShapeIndex];
        
        // If clicking on already selected shape, start dragging (works with any tool)
        if (this.selectedShapeId === clickedShape.id) {
          this.isDraggingShape = true;
          this.dragStartX = this.startX;
          this.dragStartY = this.startY;
          
          if (clickedShape.type === "line" || clickedShape.type === "arrow") {
            this.shapeOriginalPos = { x: clickedShape.x, y: clickedShape.y };
          } else if (clickedShape.type === "free-draw") {
            if (clickedShape.points.length > 0) {
              this.shapeOriginalPos = { x: clickedShape.points[0].x, y: clickedShape.points[0].y };
            }
          } else {
            this.shapeOriginalPos = { x: clickedShape.x, y: clickedShape.y };
          }
          this.render();
          return;
        }
        
        // Select the shape (different shape than currently selected)
        this.selectedShapeId = clickedShape.id;
        if (this.onSelectionChange) {
          this.onSelectionChange(clickedShape);
        }
        
        this.render();
        return;
      } else {
        // Clicking empty space - deselect if something is selected
        if (this.selectedShapeId) {
          this.selectedShapeId = null;
          if (this.onSelectionChange) {
            this.onSelectionChange(null);
          }
          this.render();
          return;
        }
        
        // If selection tool and nothing selected, just return (don't draw)
        if (this.currentTool === "selection") {
          return;
        }
      }
    }

    // Start drawing for shape tools (not selection, grab, eraser, or text)
    if (!['selection', 'grab', 'eraser', 'text'].includes(this.currentTool)) {
      this.isDrawing = true;
    }

    if (this.currentTool === "free-draw") {
      this.currentShape = {
        id: uuidv4(),
        type: "free-draw",
        points: [{ x: this.startX, y: this.startY }],
        strokeWidth: this.strokeWidth,
        strokeFill: this.strokeFill,
        bgFill: this.bgFill,
        strokeStyle: this.strokeStyle,
        fillStyle: this.fillStyle,
        opacity: 100,
      };
    }
  }

  private findShapeAtPoint(x: number, y: number): number {
    // Check shapes in reverse order (top to bottom)
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      
      if (shape.type === "rectangle") {
        if (x >= shape.x && x <= shape.x + shape.width &&
            y >= shape.y && y <= shape.y + shape.height) {
          return i;
        }
      } else if (shape.type === "ellipse") {
        const dx = (x - shape.x) / shape.radX;
        const dy = (y - shape.y) / shape.radY;
        if (dx * dx + dy * dy <= 1) {
          return i;
        }
      } else if (shape.type === "diamond") {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const dx = Math.abs(x - centerX) / (shape.width / 2);
        const dy = Math.abs(y - centerY) / (shape.height / 2);
        if (dx + dy <= 1) {
          return i;
        }
      } else if (shape.type === "line" || shape.type === "arrow") {
        const distance = this.pointToLineDistance(x, y, shape.x, shape.y, shape.toX, shape.toY);
        if (distance < 10) {
          return i;
        }
      } else if (shape.type === "free-draw") {
        for (const point of shape.points) {
          const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
          if (distance < 10) {
            return i;
          }
        }
      } else if (shape.type === "text") {
        if (x >= shape.x && x <= shape.x + shape.width &&
            y >= shape.y - shape.height && y <= shape.y) {
          return i;
        }
      }
    }
    return -1;
  }

  private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private handleMouseMove(e: MouseEvent) {
    // Skip all mouse move handling if text input is active
    if (this.activeTextInput) {
      return;
    }
    
    if (this.isPanning) {
      const dx = e.clientX - this.lastPanX;
      const dy = e.clientY - this.lastPanY;
      this.panX += dx;
      this.panY += dy;
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      this.render();
      return;
    }

    // Handle resizing selected shape
    if (this.isResizingShape && this.selectedShapeId && this.originalShapeBounds) {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - this.panX) / this.scale;
      const currentY = (e.clientY - rect.top - this.panY) / this.scale;
      
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (shape) {
        this.resizeShape(shape, currentX, currentY);
        this.render();
      }
      return;
    }

    // Handle dragging selected shape
    if (this.isDraggingShape && this.selectedShapeId) {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - this.panX) / this.scale;
      const currentY = (e.clientY - rect.top - this.panY) / this.scale;
      
      const dx = currentX - this.dragStartX;
      const dy = currentY - this.dragStartY;
      
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (shape) {
        if (shape.type === "line") {
          shape.x += dx;
          shape.y += dy;
          shape.toX += dx;
          shape.toY += dy;
        } else if (shape.type === "arrow") {
          shape.x += dx;
          shape.y += dy;
          shape.toX += dx;
          shape.toY += dy;
        } else if (shape.type === "free-draw") {
          shape.points = shape.points.map(p => ({
            x: p.x + dx,
            y: p.y + dy
          }));
        } else if (shape.type === "ellipse") {
          shape.x += dx;
          shape.y += dy;
        } else {
          // rectangle, diamond, text
          shape.x += dx;
          shape.y += dy;
        }
        
        this.dragStartX = currentX;
        this.dragStartY = currentY;
        this.render();
      }
      return;
    }

    // Handle eraser - mark shapes while dragging
    if (this.currentTool === "eraser" && this.isDrawing) {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - this.panX) / this.scale;
      const currentY = (e.clientY - rect.top - this.panY) / this.scale;
      
      const hoveredShapeIndex = this.findShapeAtPoint(currentX, currentY);
      if (hoveredShapeIndex !== -1) {
        this.shapesMarkedForDeletion.add(this.shapes[hoveredShapeIndex].id);
        this.render();
      }
      return;
    }

    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left - this.panX) / this.scale;
    const currentY = (e.clientY - rect.top - this.panY) / this.scale;

    if (this.currentTool === "free-draw" && this.currentShape?.type === "free-draw") {
      this.currentShape.points.push({ x: currentX, y: currentY });
    } else {
      this.currentShape = this.createShape(currentX, currentY);
    }

    this.render();
  }

  private handleCursorUpdate(e: MouseEvent) {
    // Don't update cursor if we're in the middle of an action or text input is active
    if (this.isDrawing || this.isDraggingShape || this.isResizingShape || this.isPanning || this.activeTextInput) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.scale;
    const y = (e.clientY - rect.top - this.panY) / this.scale;

    // Check if hovering over a resize handle of the selected shape (works with any tool except eraser)
    if (this.selectedShapeId && this.currentTool !== "eraser") {
      const selectedShape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (selectedShape) {
        const handle = this.getResizeHandleAtPoint(selectedShape, x, y);
        if (handle) {
          // Set cursor based on handle direction
          if (handle === 'nw' || handle === 'se') {
            this.canvas.style.cursor = 'nwse-resize';
          } else if (handle === 'ne' || handle === 'sw') {
            this.canvas.style.cursor = 'nesw-resize';
          }
          return;
        }
        
        // Check if hovering over the shape itself
        const shapeIndex = this.findShapeAtPoint(x, y);
        if (shapeIndex !== -1 && this.shapes[shapeIndex].id === this.selectedShapeId) {
          this.canvas.style.cursor = 'move';
          return;
        }
      }
    }

    // Default cursor based on tool
    if (this.currentTool === "grab") {
      this.canvas.style.cursor = "grab";
    } else if (this.currentTool === "selection") {
      this.canvas.style.cursor = "default";
    } else if (this.currentTool === "eraser") {
      this.canvas.style.cursor = "pointer";
    } else {
      this.canvas.style.cursor = "crosshair";
    }
  }

  private handleMouseUp(e: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "grab";
      return;
    }

    // Handle eraser - delete all marked shapes
    if (this.currentTool === "eraser" && this.isDrawing) {
      // Delete all shapes that were marked (if any)
      if (this.shapesMarkedForDeletion.size > 0) {
        this.shapes = this.shapes.filter(shape => !this.shapesMarkedForDeletion.has(shape.id));
        this.saveShapes();
        this.notifyShapeCountChange();
      }
      this.shapesMarkedForDeletion.clear();
      this.isDrawing = false;
      this.render();
      return;
    }

    // Stop resizing selected shape
    if (this.isResizingShape) {
      this.isResizingShape = false;
      this.resizeHandle = null;
      this.originalShapeBounds = null;
      this.saveShapes();
      return;
    }

    // Stop dragging selected shape
    if (this.isDraggingShape) {
      this.isDraggingShape = false;
      this.shapeOriginalPos = null;
      this.saveShapes();
      return;
    }

    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left - this.panX) / this.scale;
    const endY = (e.clientY - rect.top - this.panY) / this.scale;

    if (this.currentTool === "free-draw") {
      if (this.currentShape) {
        this.shapes.push(this.currentShape);
        // Auto-select the newly created shape
        this.selectedShapeId = this.currentShape.id;
        if (this.onSelectionChange) {
          this.onSelectionChange(this.currentShape);
        }
      }
    } else {
      const shape = this.createShape(endX, endY);
      if (shape) {
        this.shapes.push(shape);
        // Auto-select the newly created shape
        this.selectedShapeId = shape.id;
        if (this.onSelectionChange) {
          this.onSelectionChange(shape);
        }
      }
    }

    this.isDrawing = false;
    this.currentShape = null;
    this.saveShapes();
    this.notifyShapeCountChange();
    this.render();
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, this.scale * delta));

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
    this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    this.scale = newScale;

    this.render();
  }

  private createShape(endX: number, endY: number): Shape | null {
    const width = endX - this.startX;
    const height = endY - this.startY;

    const baseProps = {
      id: uuidv4(),
      strokeWidth: this.strokeWidth,
      strokeFill: this.strokeFill,
      bgFill: this.bgFill,
      strokeStyle: this.strokeStyle,
      fillStyle: this.fillStyle,
      opacity: 100,
    };

    switch (this.currentTool) {
      case "rectangle":
        return {
          ...baseProps,
          type: "rectangle",
          x: this.startX,
          y: this.startY,
          width,
          height,
        };

      case "ellipse":
        return {
          ...baseProps,
          type: "ellipse",
          x: this.startX + width / 2,
          y: this.startY + height / 2,
          radX: Math.abs(width) / 2,
          radY: Math.abs(height) / 2,
        };

      case "diamond":
        return {
          ...baseProps,
          type: "diamond",
          x: this.startX,
          y: this.startY,
          width,
          height,
        };

      case "line":
        return {
          id: baseProps.id,
          type: "line",
          x: this.startX,
          y: this.startY,
          toX: endX,
          toY: endY,
          strokeWidth: baseProps.strokeWidth,
          strokeFill: baseProps.strokeFill,
          strokeStyle: baseProps.strokeStyle,
          opacity: baseProps.opacity,
        };

      case "arrow":
        return {
          id: baseProps.id,
          type: "arrow",
          x: this.startX,
          y: this.startY,
          toX: endX,
          toY: endY,
          strokeWidth: baseProps.strokeWidth,
          strokeFill: baseProps.strokeFill,
          strokeStyle: baseProps.strokeStyle,
          opacity: baseProps.opacity,
        };

      default:
        return null;
    }
  }

  private render() {
    // Don't render if text input is active
    if (this.activeTextInput) {
      return;
    }
    
    // Batch render calls using requestAnimationFrame
    if (this.renderScheduled) {
      return;
    }
    
    this.renderScheduled = true;
    requestAnimationFrame(() => {
      this.renderScheduled = false;
      
      // Save current context state
      this.ctx.save();
      
      // Reset transformations completely and clear canvas
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Restore the DPR scaling
      const dpr = window.devicePixelRatio || 1;
      this.ctx.scale(dpr, dpr);
      
      // Apply pan and zoom transformations
      this.ctx.translate(this.panX, this.panY);
      this.ctx.scale(this.scale, this.scale);

      // Draw all shapes
      this.shapes.forEach((shape) => {
        const isSelected = shape.id === this.selectedShapeId;
        const isMarkedForDeletion = this.shapesMarkedForDeletion.has(shape.id);
        
        if (isMarkedForDeletion) {
          // Render marked shapes with 30% opacity
          const originalOpacity = shape.opacity;
          shape.opacity = 30;
          this.shapeRenderer.renderShape(shape, false);
          shape.opacity = originalOpacity; // Restore original opacity
        } else {
          this.shapeRenderer.renderShape(shape, isSelected);
        }
      });

      // Draw current shape being drawn
      if (this.currentShape) {
        this.shapeRenderer.renderShape(this.currentShape, false);
      }

      this.ctx.restore();
    });
  }

  // Public API
  public setTool(tool: ToolType) {
    this.currentTool = tool;
    if (tool === "grab") {
      this.canvas.style.cursor = "grab";
    } else if (tool === "selection") {
      this.canvas.style.cursor = "default";
    } else {
      this.canvas.style.cursor = "crosshair";
    }
  }

  public setStrokeWidth(width: StrokeWidth) {
    this.strokeWidth = width;
  }

  public setStrokeFill(color: string) {
    this.strokeFill = color;
  }

  public setBgFill(color: string) {
    this.bgFill = color;
  }

  public setStrokeStyle(style: StrokeStyle) {
    this.strokeStyle = style;
  }

  public setFillStyle(style: FillStyle) {
    this.fillStyle = style;
  }

  public clearCanvas() {
    this.shapes = [];
    this.selectedShapeId = null;
    // Clear history completely - user cannot undo clear action
    this.history = [[]];
    this.historyStep = 0;
    this.saveShapes();
    this.notifyShapeCountChange();
    this.notifyHistoryChange();
    this.render();
  }

  public exportAsPNG() {
    const dataUrl = this.canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `excelidraw-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }

  public getShapeCount(): number {
    return this.shapes.length;
  }

  public getScale(): number {
    return this.scale;
  }

  public zoomIn() {
    const newScale = Math.min(5, this.scale * 1.1);
    this.scale = newScale;
    this.render();
  }

  public zoomOut() {
    const newScale = Math.max(0.1, this.scale * 0.9);
    this.scale = newScale;
    this.render();
  }

  public resetZoom() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  public setOnShapeCountChange(callback: (count: number) => void) {
    this.onShapeCountChange = callback;
  }

  public setOnSelectionChange(callback: (shape: Shape | null) => void) {
    this.onSelectionChange = callback;
  }

  public updateSelectedShapeBgColor(color: string) {
    if (!this.selectedShapeId) return;
    
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (shape && shape.type !== "line" && shape.type !== "arrow" && shape.type !== "text") {
      shape.bgFill = color;
      this.saveShapes();
      this.render();
      if (this.onSelectionChange) {
        this.onSelectionChange(deepCloneShape(shape));
      }
    }
  }

  public updateSelectedShapeStrokeColor(color: string) {
    if (!this.selectedShapeId) return;
    
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (shape) {
      shape.strokeFill = color;
      this.saveShapes();
      this.render();
      if (this.onSelectionChange) {
        this.onSelectionChange(deepCloneShape(shape));
      }
    }
  }

  public updateSelectedShapeStrokeStyle(style: StrokeStyle) {
    if (!this.selectedShapeId) return;
    
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (shape) {
      shape.strokeStyle = style;
      this.saveShapes();
      this.render();
      if (this.onSelectionChange) {
        this.onSelectionChange(deepCloneShape(shape));
      }
    }
  }

  public updateSelectedShapeStrokeWidth(width: StrokeWidth) {
    if (!this.selectedShapeId) return;
    
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (shape) {
      shape.strokeWidth = width;
      this.saveShapes();
      this.render();
      if (this.onSelectionChange) {
        this.onSelectionChange(deepCloneShape(shape));
      }
    }
  }

  public updateSelectedShapeOpacity(opacity: number) {
    if (!this.selectedShapeId) return;
    
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (shape) {
      shape.opacity = opacity;
      this.saveShapes();
      this.render();
      if (this.onSelectionChange) {
        this.onSelectionChange(deepCloneShape(shape));
      }
    }
  }

  public updateSelectedShapeFillStyle(style: FillStyle) {
    if (!this.selectedShapeId) return;
    
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (shape && 'fillStyle' in shape) {
      shape.fillStyle = style;
      this.saveShapes();
      this.render();
      if (this.onSelectionChange) {
        this.onSelectionChange(deepCloneShape(shape));
      }
    }
  }

  public copySelectedShape(): boolean {
    if (!this.selectedShapeId) return false;
    
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (shape) {
      this.copiedShape = deepCloneShape(shape);
      return true;
    }
    return false;
  }

  public pasteShape(): boolean {
    if (!this.copiedShape) return false;
    
    // Create a new shape from the copied one
    const newShape = deepCloneShape(this.copiedShape);
    newShape.id = Date.now().toString() + Math.random();
    
    // Offset the pasted shape slightly so it's visible
    const offset = 20;
    if ('x' in newShape && 'y' in newShape) {
      newShape.x += offset;
      newShape.y += offset;
    }
    
    // Add the new shape
    this.shapes.push(newShape);
    this.saveShapes();
    this.render();
    
    // Select the newly pasted shape
    this.selectedShapeId = newShape.id;
    if (this.onSelectionChange) {
      this.onSelectionChange(deepCloneShape(newShape));
    }
    
    if (this.onShapeCountChange) {
      this.onShapeCountChange(this.shapes.length);
    }
    
    return true;
  }

  public hasCopiedShape(): boolean {
    return this.copiedShape !== null;
  }

  private createTextInput(screenX: number, screenY: number) {
    // Remove any existing text input
    if (this.activeTextInput) {
      this.activeTextInput.remove();
      this.activeTextInput = null;
    }

    // Get canvas position and calculate canvas coordinates
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = (screenX - this.panX) / this.scale;
    const canvasY = (screenY - this.panY) / this.scale;

    // Create textarea instead of input for better text editing
    const textarea = document.createElement("textarea");
    
    // Style the textarea
    textarea.style.position = "absolute";
    textarea.style.left = `${screenX}px`;
    textarea.style.top = `${screenY}px`;
    textarea.style.fontSize = "20px";
    textarea.style.fontFamily = "Arial, sans-serif";
    textarea.style.border = "2px solid #3b82f6";
    textarea.style.borderRadius = "6px";
    textarea.style.padding = "8px";
    textarea.style.outline = "none";
    textarea.style.minWidth = "200px";
    textarea.style.minHeight = "40px";
    textarea.style.backgroundColor = "white";
    textarea.style.color = "#000";
    textarea.style.zIndex = "10000";
    textarea.style.resize = "none";
    textarea.style.overflow = "hidden";
    textarea.placeholder = "Type your text here...";
    
    // Prevent all mouse/touch events from reaching the canvas
    const stopPropagation = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    
    textarea.addEventListener("mousedown", stopPropagation, true);
    textarea.addEventListener("mousemove", stopPropagation, true);
    textarea.addEventListener("mouseup", stopPropagation, true);
    textarea.addEventListener("click", stopPropagation, true);
    textarea.addEventListener("dblclick", stopPropagation, true);
    textarea.addEventListener("touchstart", stopPropagation, true);
    textarea.addEventListener("touchmove", stopPropagation, true);
    textarea.addEventListener("touchend", stopPropagation, true);

    // Add to DOM and focus
    this.canvas.parentElement?.appendChild(textarea);
    this.activeTextInput = textarea;
    
    // Focus with a small delay to ensure it's rendered
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(0, 0);
    }, 10);

    // Function to finish text input and create shape
    let isFinishing = false;
    const finishText = () => {
      if (isFinishing) return;
      isFinishing = true;
      
      const text = textarea.value.trim();
      
      if (text) {
        // Create text shape at canvas coordinates
        const textShape: Shape = {
          id: uuidv4(),
          type: "text",
          x: canvasX,
          y: canvasY,
          width: 200,
          height: 30,
          text: text,
          fontSize: 20,
          fontFamily: "Arial, sans-serif",
          strokeWidth: this.strokeWidth,
          strokeFill: this.strokeFill,
          strokeStyle: this.strokeStyle,
          opacity: 100,
        } as Shape;
        
        // Add shape to canvas
        this.shapes.push(textShape);
        
        // Auto-select the newly created text
        this.selectedShapeId = textShape.id;
        if (this.onSelectionChange) {
          this.onSelectionChange(textShape);
        }
        
        // Save and render
        this.saveShapes();
        this.notifyShapeCountChange();
      }
      
      // Clean up
      if (textarea.parentElement) {
        textarea.remove();
      }
      this.activeTextInput = null;
      
      // Force immediate render after cleanup since we were blocking renders
      this.renderScheduled = false;
      this.render();
    };

    // Handle blur - finish text when clicking outside
    textarea.addEventListener("blur", () => {
      finishText();
    });

    // Handle keyboard events
    textarea.addEventListener("keydown", (e) => {
      e.stopPropagation();
      
      if (e.key === "Enter" && !e.shiftKey) {
        // Enter without shift - finish text
        e.preventDefault();
        finishText();
      } else if (e.key === "Escape") {
        // Escape - cancel without saving
        e.preventDefault();
        if (isFinishing) return;
        isFinishing = true;
        if (textarea.parentElement) {
          textarea.remove();
        }
        this.activeTextInput = null;
        requestAnimationFrame(() => {
          this.render();
        });
      }
      // Shift+Enter allows multi-line text
    });

    // Auto-resize textarea as user types
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  }

  private getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } {
    if (shape.type === "rectangle" || shape.type === "diamond") {
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    } else if (shape.type === "ellipse") {
      return { x: shape.x - shape.radX, y: shape.y - shape.radY, width: shape.radX * 2, height: shape.radY * 2 };
    } else if (shape.type === "line" || shape.type === "arrow") {
      const minX = Math.min(shape.x, shape.toX);
      const minY = Math.min(shape.y, shape.toY);
      return { x: minX, y: minY, width: Math.abs(shape.toX - shape.x), height: Math.abs(shape.toY - shape.y) };
    } else if (shape.type === "text") {
      // For text, shape.y is at the baseline (bottom), so we need to adjust
      return { x: shape.x, y: shape.y - (shape.height || 30), width: shape.width || 100, height: shape.height || 30 };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  private getResizeHandleAtPoint(shape: Shape, x: number, y: number): string | null {
    if (shape.type === "free-draw") return null; // No resize for free-draw
    
    const bounds = this.getShapeBounds(shape);
    const handleSize = 10;
    const padding = 8;
    const tolerance = handleSize / 2 + 2;

    const handles = [
      { name: 'nw', x: bounds.x - padding, y: bounds.y - padding },
      { name: 'ne', x: bounds.x + bounds.width + padding, y: bounds.y - padding },
      { name: 'sw', x: bounds.x - padding, y: bounds.y + bounds.height + padding },
      { name: 'se', x: bounds.x + bounds.width + padding, y: bounds.y + bounds.height + padding },
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) < tolerance && Math.abs(y - handle.y) < tolerance) {
        return handle.name;
      }
    }
    return null;
  }

  private resizeShape(shape: Shape, currentX: number, currentY: number) {
    if (!this.originalShapeBounds || !this.resizeHandle) return;

    const dx = currentX - this.resizeStartX;
    const dy = currentY - this.resizeStartY;
    const bounds = this.originalShapeBounds;
    const minSize = 20; // Minimum size for shapes

    if (shape.type === "rectangle" || shape.type === "diamond") {
      if (this.resizeHandle.includes('e')) {
        shape.width = Math.max(minSize, bounds.width + dx);
      }
      if (this.resizeHandle.includes('w')) {
        const newWidth = Math.max(minSize, bounds.width - dx);
        const widthDiff = bounds.width - newWidth;
        shape.x = bounds.x + widthDiff;
        shape.width = newWidth;
      }
      if (this.resizeHandle.includes('s')) {
        shape.height = Math.max(minSize, bounds.height + dy);
      }
      if (this.resizeHandle.includes('n')) {
        const newHeight = Math.max(minSize, bounds.height - dy);
        const heightDiff = bounds.height - newHeight;
        shape.y = bounds.y + heightDiff;
        shape.height = newHeight;
      }
    } else if (shape.type === "ellipse") {
      if (this.resizeHandle.includes('e')) {
        shape.radX = Math.max(minSize / 2, (bounds.width + dx) / 2);
      }
      if (this.resizeHandle.includes('w')) {
        const newWidth = Math.max(minSize, bounds.width - dx);
        shape.x = bounds.x + bounds.width / 2 - newWidth / 2;
        shape.radX = newWidth / 2;
      }
      if (this.resizeHandle.includes('s')) {
        shape.radY = Math.max(minSize / 2, (bounds.height + dy) / 2);
      }
      if (this.resizeHandle.includes('n')) {
        const newHeight = Math.max(minSize, bounds.height - dy);
        shape.y = bounds.y + bounds.height / 2 - newHeight / 2;
        shape.radY = newHeight / 2;
      }
    } else if (shape.type === "line" || shape.type === "arrow") {
      const wasStartLeft = bounds.x === shape.x;
      const wasStartTop = bounds.y === shape.y;

      if (this.resizeHandle === 'se') {
        if (wasStartLeft && wasStartTop) {
          shape.toX = shape.x + bounds.width + dx;
          shape.toY = shape.y + bounds.height + dy;
        } else {
          shape.x = bounds.x + bounds.width + dx;
          shape.y = bounds.y + bounds.height + dy;
        }
      } else if (this.resizeHandle === 'nw') {
        if (wasStartLeft && wasStartTop) {
          shape.x = bounds.x + dx;
          shape.y = bounds.y + dy;
        } else {
          shape.toX = bounds.x + dx;
          shape.toY = bounds.y + dy;
        }
      } else if (this.resizeHandle === 'ne') {
        if (wasStartLeft) {
          shape.toX = bounds.x + bounds.width + dx;
          shape.toY = bounds.y + dy;
        } else {
          shape.x = bounds.x + bounds.width + dx;
          shape.y = bounds.y + dy;
        }
      } else if (this.resizeHandle === 'sw') {
        if (wasStartTop) {
          shape.toX = bounds.x + dx;
          shape.toY = bounds.y + bounds.height + dy;
        } else {
          shape.x = bounds.x + dx;
          shape.y = bounds.y + bounds.height + dy;
        }
      }
    } else if (shape.type === "text") {
      const minSize = 20;
      if (this.resizeHandle.includes('e')) {
        shape.width = Math.max(minSize, bounds.width + dx);
      }
      if (this.resizeHandle.includes('w')) {
        const newWidth = Math.max(minSize, bounds.width - dx);
        const widthDiff = bounds.width - newWidth;
        shape.x = bounds.x + widthDiff;
        shape.width = newWidth;
      }
      if (this.resizeHandle.includes('s')) {
        shape.height = Math.max(minSize, bounds.height + dy);
      }
      if (this.resizeHandle.includes('n')) {
        const newHeight = Math.max(minSize, bounds.height - dy);
        const heightDiff = bounds.height - newHeight;
        // For text, y is at the baseline, so we need to adjust it
        shape.y = bounds.y + bounds.height - newHeight;
        shape.height = newHeight;
      }
    }
  }

  private notifyShapeCountChange() {
    if (this.onShapeCountChange) {
      this.onShapeCountChange(this.shapes.length);
    }
  }

  private saveShapes() {
    saveToLocalStorage(LOCALSTORAGE_CANVAS_KEY, this.shapes);
    this.saveToHistory();
  }

  private saveToHistory() {
    // Remove any history after current step
    this.history = this.history.slice(0, this.historyStep + 1);
    
    // Add current state to history (deep clone)
    this.history.push(JSON.parse(JSON.stringify(this.shapes)));
    this.historyStep++;
    
    // Limit history to 50 steps
    if (this.history.length > 50) {
      this.history.shift();
      this.historyStep--;
    }
    
    this.notifyHistoryChange();
  }

  private notifyHistoryChange() {
    if (this.onHistoryChange) {
      this.onHistoryChange(this.historyStep > 0, this.historyStep < this.history.length - 1);
    }
  }

  public undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.shapes = JSON.parse(JSON.stringify(this.history[this.historyStep]));
      saveToLocalStorage(LOCALSTORAGE_CANVAS_KEY, this.shapes);
      this.notifyShapeCountChange();
      this.notifyHistoryChange();
      this.render();
    }
  }

  public redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.shapes = JSON.parse(JSON.stringify(this.history[this.historyStep]));
      saveToLocalStorage(LOCALSTORAGE_CANVAS_KEY, this.shapes);
      this.notifyShapeCountChange();
      this.notifyHistoryChange();
      this.render();
    }
  }

  public setOnHistoryChange(callback: (canUndo: boolean, canRedo: boolean) => void) {
    this.onHistoryChange = callback;
  }

  private loadShapes() {
    const loaded = loadFromLocalStorage<Shape[]>(LOCALSTORAGE_CANVAS_KEY);
    if (loaded) {
      this.shapes = loaded;
      this.notifyShapeCountChange();
      // Initialize history with loaded shapes
      this.history = [JSON.parse(JSON.stringify(this.shapes))];
      this.historyStep = 0;
      this.notifyHistoryChange();
    }
  }

  public destroy() {
    window.removeEventListener("resize", this.resizeCanvas.bind(this));
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.canvas.removeEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.removeEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.removeEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.removeEventListener("wheel", this.handleWheel.bind(this));
  }
}
