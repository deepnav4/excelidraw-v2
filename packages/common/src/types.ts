// Shape Types
export type Point = {
  x: number;
  y: number;
};

export type StrokeWidth = 1 | 2 | 4;
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle = "solid" | "hachure" | "cross-hatch";

export type BaseShape = {
  id: string;
  strokeWidth: StrokeWidth;
  strokeFill: string;
  bgFill: string;
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  opacity: number; // 10-100
};

export type Rectangle = BaseShape & {
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Ellipse = BaseShape & {
  type: "ellipse";
  x: number;
  y: number;
  radX: number;
  radY: number;
};

export type Diamond = BaseShape & {
  type: "diamond";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Line = Omit<BaseShape, "bgFill" | "fillStyle"> & {
  type: "line";
  x: number;
  y: number;
  toX: number;
  toY: number;
};

export type Arrow = Omit<BaseShape, "bgFill" | "fillStyle"> & {
  type: "arrow";
  x: number;
  y: number;
  toX: number;
  toY: number;
};

export type FreeDraw = BaseShape & {
  type: "free-draw";
  points: Point[];
};

export type FontFamily = "hand-drawn" | "normal" | "code";
export type FontSize = "Small" | "Medium" | "Large";
export type TextAlign = "left" | "center" | "right";

export const FONT_SIZE_MAP: Record<FontSize, number> = {
  Small: 16,
  Medium: 20,
  Large: 28,
};

export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  "hand-drawn": "Caveat, cursive",
  "normal": "Outfit, sans-serif",
  "code": "Courier New, monospace",
};

export type TextShape = Omit<BaseShape, "fillStyle"> & {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: FontSize;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  bgFill: string; // Background color for text
};

export type Shape =
  | Rectangle
  | Ellipse
  | Diamond
  | Line
  | Arrow
  | FreeDraw
  | TextShape;

// Tool Types
export type ToolType =
  | "selection"
  | "grab"
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "line"
  | "arrow"
  | "free-draw"
  | "text"
  | "eraser";
