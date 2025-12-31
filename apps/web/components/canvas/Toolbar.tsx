"use client";

import { useState } from "react";
import type { ToolType, StrokeWidth } from "@repo/common";
import {
  Square,
  Circle,
  Diamond,
  Minus,
  MoveHorizontal,
  Pencil,
  Hand,
  Type,
  Eraser,
  Trash2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOLBAR_COLORS, STROKE_WIDTHS } from "@/lib/constants/constant";

interface ToolbarProps {
  onToolChange: (tool: ToolType) => void;
  onStrokeWidthChange: (width: StrokeWidth) => void;
  onStrokeColorChange: (color: string) => void;
  onBgColorChange: (color: string) => void;
  onClear: () => void;
  onExport: () => void;
  shapeCount: number;
}

const tools: { type: ToolType; icon: React.ReactNode; label: string }[] = [
  { type: "selection", icon: <Hand className="w-5 h-5" />, label: "Select" },
  { type: "grab", icon: <Hand className="w-5 h-5" />, label: "Pan" },
  { type: "rectangle", icon: <Square className="w-5 h-5" />, label: "Rectangle" },
  { type: "ellipse", icon: <Circle className="w-5 h-5" />, label: "Ellipse" },
  { type: "diamond", icon: <Diamond className="w-5 h-5" />, label: "Diamond" },
  { type: "line", icon: <Minus className="w-5 h-5" />, label: "Line" },
  { type: "arrow", icon: <MoveHorizontal className="w-5 h-5" />, label: "Arrow" },
  { type: "free-draw", icon: <Pencil className="w-5 h-5" />, label: "Free Draw" },
  { type: "text", icon: <Type className="w-5 h-5" />, label: "Text" },
  { type: "eraser", icon: <Eraser className="w-5 h-5" />, label: "Eraser" },
];

export function Toolbar({
  onToolChange,
  onStrokeWidthChange,
  onStrokeColorChange,
  onBgColorChange,
  onClear,
  onExport,
  shapeCount,
}: ToolbarProps) {
  const [activeTool, setActiveTool] = useState<ToolType>("rectangle");
  const [activeWidth, setActiveWidth] = useState<StrokeWidth>(2);
  const [activeStrokeColor, setActiveStrokeColor] = useState("#000000");
  const [activeBgColor, setActiveBgColor] = useState("#00000000");

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    onToolChange(tool);
  };

  const handleWidthClick = (width: StrokeWidth) => {
    setActiveWidth(width);
    onStrokeWidthChange(width);
  };

  const handleStrokeColorClick = (color: string) => {
    setActiveStrokeColor(color);
    onStrokeColorChange(color);
  };

  const handleBgColorClick = (color: string) => {
    setActiveBgColor(color);
    onBgColorChange(color);
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => handleToolClick(tool.type)}
              className={cn(
                "p-2 rounded hover:bg-gray-600 transition-colors",
                activeTool === tool.type && "bg-blue-600 hover:bg-blue-700"
              )}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Stroke Width */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => handleWidthClick(width)}
              className={cn(
                "px-3 py-2 rounded hover:bg-gray-600 transition-colors",
                activeWidth === width && "bg-blue-600 hover:bg-blue-700"
              )}
              title={`Width ${width}`}
            >
              <div
                className="bg-white rounded-full"
                style={{
                  width: `${width * 2 + 4}px`,
                  height: `${width * 2 + 4}px`,
                }}
              />
            </button>
          ))}
        </div>

        {/* Stroke Color */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Stroke:</span>
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            {TOOLBAR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleStrokeColorClick(color)}
                className={cn(
                  "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                  activeStrokeColor === color
                    ? "border-blue-500"
                    : "border-gray-600"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Fill:</span>
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleBgColorClick("#00000000")}
              className={cn(
                "w-8 h-8 rounded border-2 hover:scale-110 transition-transform bg-white",
                activeBgColor === "#00000000"
                  ? "border-blue-500"
                  : "border-gray-600"
              )}
              title="Transparent"
            >
              <div className="w-full h-full flex items-center justify-center text-red-500 text-xl">
                ∅
              </div>
            </button>
            {TOOLBAR_COLORS.slice(1).map((color) => (
              <button
                key={color}
                onClick={() => handleBgColorClick(color)}
                className={cn(
                  "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                  activeBgColor === color
                    ? "border-blue-500"
                    : "border-gray-600"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1 ml-auto">
          <button
            onClick={onClear}
            className="p-2 rounded hover:bg-gray-600 transition-colors text-red-400 hover:text-red-300"
            title="Clear Canvas"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={onExport}
            className="p-2 rounded hover:bg-gray-600 transition-colors text-green-400 hover:text-green-300"
            title="Export as PNG"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Shape Count */}
        <div className="text-sm text-gray-400">
          Shapes: {shapeCount}
        </div>
      </div>
    </div>
  );
}
