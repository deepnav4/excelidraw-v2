import { Square, Circle, Diamond, Minus, Pencil } from "lucide-react";
import type { ToolType, StrokeWidth } from "@repo/common";
import React from "react";

// Color Constants
export const STROKE_COLORS = ["#1e1e1e", "#1971c2", "#2f9e44", "#f08c00", "#e03131", "#7950f2"];
export const BG_COLORS = ["transparent", "#ffe3e3", "#d3f9d8", "#d0ebff", "#fff3bf", "#f3f0ff"];
export const CANVAS_BACKGROUNDS = ["#ffffff", "#fef9f3", "#f0f9ff", "#fef2f2", "#f5f5f5", "#f8f0fc"];

// Toolbar Color Constants
export const TOOLBAR_COLORS = [
  "#000000",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
  "#e64980",
  "#be4bdb",
  "#ffffff",
];

// Stroke Width Constants
export const STROKE_WIDTHS: StrokeWidth[] = [1, 2, 4];

// Fill Style Constants
export const FILL_STYLES = [
  { 
    id: "solid", 
    label: "Solid", 
    icon: <Square className="w-5 h-5" fill="currentColor" />
  },
  { 
    id: "hachure", 
    label: "Hachure", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="3" y1="10" x2="14" y2="21" />
        <line x1="10" y1="3" x2="21" y2="14" />
      </svg>
    )
  },
  { 
    id: "cross-hatch", 
    label: "Cross", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="3" y1="10" x2="14" y2="21" />
        <line x1="10" y1="3" x2="21" y2="14" />
        <line x1="21" y1="10" x2="10" y2="21" />
        <line x1="14" y1="3" x2="3" y2="14" />
      </svg>
    )
  },
];
