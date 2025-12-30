import type { Shape } from "@repo/common";
import { ARROW_HEAD_LENGTH, ARROW_HEAD_ANGLE } from "@repo/common";

export class ShapeRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public renderShape(shape: Shape, isSelected: boolean = false) {
    this.ctx.save();

    // Apply opacity
    this.ctx.globalAlpha = (shape.opacity ?? 100) / 100;

    // Use normal line width (no automatic roughness multiplier)
    this.ctx.lineWidth = shape.strokeWidth;
    this.ctx.strokeStyle = shape.strokeFill;
    
    // Apply stroke style (dashed, dotted)
    if (shape.strokeStyle === "dashed") {
      this.ctx.setLineDash([10, 5]);
    } else if (shape.strokeStyle === "dotted") {
      this.ctx.setLineDash([2, 3]);
    } else {
      this.ctx.setLineDash([]);
    }

    switch (shape.type) {
      case "rectangle":
        this.renderRectangle(shape);
        break;
      case "ellipse":
        this.renderEllipse(shape);
        break;
      case "diamond":
        this.renderDiamond(shape);
        break;
      case "line":
        this.renderLine(shape);
        break;
      case "arrow":
        this.renderArrow(shape);
        break;
      case "free-draw":
        this.renderFreeDraw(shape);
        break;
      case "text":
        this.renderText(shape);
        break;
    }

    if (isSelected) {
      this.drawSelectionBox(shape);
    }

    this.ctx.restore();
  }

  private renderRectangle(shape: Extract<Shape, { type: "rectangle" }>) {
    if (shape.bgFill !== "#00000000") {
      this.ctx.fillStyle = shape.bgFill;
      
      // Apply fill style
      if (shape.fillStyle === "solid") {
        this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.fillStyle === "hachure") {
        this.applyHachureFill(shape.x, shape.y, shape.width, shape.height, shape.bgFill);
      } else if (shape.fillStyle === "cross-hatch") {
        this.applyCrossHatchFill(shape.x, shape.y, shape.width, shape.height, shape.bgFill);
      }
    }
    
    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  }

  private renderEllipse(shape: Extract<Shape, { type: "ellipse" }>) {
    // Draw fill if needed
    if (shape.bgFill !== "#00000000") {
      if (shape.fillStyle === "solid") {
        this.ctx.beginPath();
        this.ctx.ellipse(shape.x, shape.y, shape.radX, shape.radY, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = shape.bgFill;
        this.ctx.fill();
      } else {
        // For hachure and cross-hatch, use clipping
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.ellipse(shape.x, shape.y, shape.radX, shape.radY, 0, 0, Math.PI * 2);
        this.ctx.clip();
        
        const x = shape.x - shape.radX;
        const y = shape.y - shape.radY;
        const width = shape.radX * 2;
        const height = shape.radY * 2;
        
        if (shape.fillStyle === "hachure") {
          this.applyHachureFillNoClip(x, y, width, height, shape.bgFill);
        } else if (shape.fillStyle === "cross-hatch") {
          this.applyCrossHatchFillNoClip(x, y, width, height, shape.bgFill);
        }
        
        this.ctx.restore();
      }
    }
    
    // Draw the stroke outline
    this.ctx.beginPath();
    this.ctx.ellipse(shape.x, shape.y, shape.radX, shape.radY, 0, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  private renderDiamond(shape: Extract<Shape, { type: "diamond" }>) {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    // Draw fill if needed
    if (shape.bgFill !== "#00000000") {
      if (shape.fillStyle === "solid") {
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, shape.y);
        this.ctx.lineTo(shape.x + shape.width, centerY);
        this.ctx.lineTo(centerX, shape.y + shape.height);
        this.ctx.lineTo(shape.x, centerY);
        this.ctx.closePath();
        this.ctx.fillStyle = shape.bgFill;
        this.ctx.fill();
      } else {
        // For hachure and cross-hatch, use clipping
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, shape.y);
        this.ctx.lineTo(shape.x + shape.width, centerY);
        this.ctx.lineTo(centerX, shape.y + shape.height);
        this.ctx.lineTo(shape.x, centerY);
        this.ctx.closePath();
        this.ctx.clip();
        
        if (shape.fillStyle === "hachure") {
          this.applyHachureFillNoClip(shape.x, shape.y, shape.width, shape.height, shape.bgFill);
        } else if (shape.fillStyle === "cross-hatch") {
          this.applyCrossHatchFillNoClip(shape.x, shape.y, shape.width, shape.height, shape.bgFill);
        }
        
        this.ctx.restore();
      }
    }
    
    // Draw the stroke outline
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, shape.y);
    this.ctx.lineTo(shape.x + shape.width, centerY);
    this.ctx.lineTo(centerX, shape.y + shape.height);
    this.ctx.lineTo(shape.x, centerY);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private renderLine(shape: Extract<Shape, { type: "line" }>) {
    this.ctx.beginPath();
    this.ctx.moveTo(shape.x, shape.y);
    this.ctx.lineTo(shape.toX, shape.toY);
    this.ctx.stroke();
  }

  private renderArrow(shape: Extract<Shape, { type: "arrow" }>) {
    const angle = Math.atan2(shape.toY - shape.y, shape.toX - shape.x);

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(shape.x, shape.y);
    this.ctx.lineTo(shape.toX, shape.toY);
    this.ctx.stroke();

    // Draw arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(shape.toX, shape.toY);
    this.ctx.lineTo(
      shape.toX - ARROW_HEAD_LENGTH * Math.cos(angle - ARROW_HEAD_ANGLE),
      shape.toY - ARROW_HEAD_LENGTH * Math.sin(angle - ARROW_HEAD_ANGLE)
    );
    this.ctx.moveTo(shape.toX, shape.toY);
    this.ctx.lineTo(
      shape.toX - ARROW_HEAD_LENGTH * Math.cos(angle + ARROW_HEAD_ANGLE),
      shape.toY - ARROW_HEAD_LENGTH * Math.sin(angle + ARROW_HEAD_ANGLE)
    );
    this.ctx.stroke();
  }

  private renderFreeDraw(shape: Extract<Shape, { type: "free-draw" }>) {
    if (shape.points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);

    for (let i = 1; i < shape.points.length; i++) {
      this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
    }

    this.ctx.stroke();
  }

  private renderText(shape: Extract<Shape, { type: "text" }>) {
    this.ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
    this.ctx.fillStyle = shape.strokeFill;
    this.ctx.fillText(shape.text, shape.x, shape.y);
  }

  private drawSelectionBox(shape: Shape) {
    this.ctx.save();
    
    // Reset opacity for selection box (always fully opaque)
    this.ctx.globalAlpha = 1.0;
    
    // Draw bounding box with solid blue line
    this.ctx.strokeStyle = "#1971c2";
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([]);

    let bounds = { x: 0, y: 0, width: 0, height: 0 };

    if (shape.type === "rectangle") {
      this.ctx.strokeRect(shape.x - 8, shape.y - 8, shape.width + 16, shape.height + 16);
      bounds = { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    } else if (shape.type === "ellipse") {
      const x = shape.x - shape.radX;
      const y = shape.y - shape.radY;
      const width = shape.radX * 2;
      const height = shape.radY * 2;
      this.ctx.strokeRect(x - 8, y - 8, width + 16, height + 16);
      bounds = { x, y, width, height };
    } else if (shape.type === "diamond") {
      this.ctx.strokeRect(shape.x - 8, shape.y - 8, shape.width + 16, shape.height + 16);
      bounds = { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    } else if (shape.type === "line") {
      const minX = Math.min(shape.x, shape.toX);
      const minY = Math.min(shape.y, shape.toY);
      const width = Math.abs(shape.toX - shape.x);
      const height = Math.abs(shape.toY - shape.y);
      this.ctx.strokeRect(minX - 8, minY - 8, width + 16, height + 16);
      bounds = { x: minX, y: minY, width, height };
    } else if (shape.type === "arrow") {
      const minX = Math.min(shape.x, shape.toX);
      const minY = Math.min(shape.y, shape.toY);
      const width = Math.abs(shape.toX - shape.x);
      const height = Math.abs(shape.toY - shape.y);
      this.ctx.strokeRect(minX - 8, minY - 8, width + 16, height + 16);
      bounds = { x: minX, y: minY, width, height };
    } else if (shape.type === "free-draw") {
      const xs = shape.points.map(p => p.x);
      const ys = shape.points.map(p => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      this.ctx.strokeRect(minX - 8, minY - 8, maxX - minX + 16, maxY - minY + 16);
      bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else if (shape.type === "text") {
      this.ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
      const metrics = this.ctx.measureText(shape.text);
      this.ctx.strokeRect(shape.x - 8, shape.y - 8, metrics.width + 16, shape.fontSize + 16);
      bounds = { x: shape.x, y: shape.y, width: metrics.width, height: shape.fontSize };
    }

    // Draw resize handles (skip for free-draw)
    if (shape.type !== "free-draw") {
      const handleSize = 10;
      const padding = 8;
      
      // White fill with blue border for handles
      this.ctx.fillStyle = "#ffffff";
      this.ctx.strokeStyle = "#1971c2";
      this.ctx.lineWidth = 1.5;

      const handles = [
        { x: bounds.x - padding, y: bounds.y - padding }, // nw
        { x: bounds.x + bounds.width + padding, y: bounds.y - padding }, // ne
        { x: bounds.x - padding, y: bounds.y + bounds.height + padding }, // sw
        { x: bounds.x + bounds.width + padding, y: bounds.y + bounds.height + padding }, // se
      ];

      handles.forEach(handle => {
        this.ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        this.ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      });
    }

    this.ctx.restore();
  }

  private applyHachureFill(x: number, y: number, width: number, height: number, fillColor: string) {
    this.ctx.save();
    
    // Clip to the rectangle bounds
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    
    this.ctx.strokeStyle = fillColor;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    
    const gap = 8;
    const diagonalLength = Math.sqrt(width * width + height * height);
    
    // Draw diagonal lines from top-left to bottom-right
    for (let i = -height; i < width; i += gap) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i + height, y + height);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private applyCrossHatchFill(x: number, y: number, width: number, height: number, fillColor: string) {
    this.ctx.save();
    
    // Clip to the rectangle bounds
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    
    this.ctx.strokeStyle = fillColor;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    
    const gap = 8;
    
    // First direction: top-left to bottom-right
    for (let i = -height; i < width; i += gap) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i + height, y + height);
      this.ctx.stroke();
    }
    
    // Second direction: top-right to bottom-left
    for (let i = 0; i < width + height; i += gap) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i - height, y + height);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private applyHachureFillNoClip(x: number, y: number, width: number, height: number, fillColor: string) {
    this.ctx.strokeStyle = fillColor;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    
    const gap = 8;
    
    // Draw diagonal lines from top-left to bottom-right
    for (let i = -height; i < width; i += gap) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i + height, y + height);
      this.ctx.stroke();
    }
  }

  private applyCrossHatchFillNoClip(x: number, y: number, width: number, height: number, fillColor: string) {
    this.ctx.strokeStyle = fillColor;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    
    const gap = 8;
    
    // First direction: top-left to bottom-right
    for (let i = -height; i < width; i += gap) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i + height, y + height);
      this.ctx.stroke();
    }
    
    // Second direction: top-right to bottom-left
    for (let i = 0; i < width + height; i += gap) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i - height, y + height);
      this.ctx.stroke();
    }
  }
}
