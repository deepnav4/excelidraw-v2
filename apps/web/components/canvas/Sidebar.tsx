"use client";

import { useState } from "react";
import { Circle, Square, Minus, Pencil, Sun, Moon, Monitor } from "lucide-react";
import type { Shape, StrokeStyle } from "@repo/common";

interface SidebarProps {
  strokeFill: string;
  bgFill: string;
  fillStyle: string;
  strokeWidth: number;
  canvasBg: string;
  selectedShape: Shape | null;
  onStrokeFillChange: (color: string) => void;
  onBgFillChange: (color: string) => void;
  onFillStyleChange: (style: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onCanvasBgChange: (color: string) => void;
  onStrokeStyleChange: (style: StrokeStyle) => void;
  onOpacityChange: (opacity: number) => void;
  hasSelection?: boolean;
  adaptiveColors?: {
    toolbarBg: string;
    sidebarBg: string;
    textColor: string;
    borderColor: string;
  };
}

export default function Sidebar({
  strokeFill,
  bgFill,
  fillStyle,
  strokeWidth,
  canvasBg,
  selectedShape,
  onStrokeFillChange,
  onBgFillChange,
  onFillStyleChange,
  onStrokeWidthChange,
  onCanvasBgChange,
  onStrokeStyleChange,
  onOpacityChange,
  hasSelection = false,
  adaptiveColors = {
    toolbarBg: 'rgba(255, 255, 255, 0.90)',
    sidebarBg: '#ffffff',
    textColor: '#1f2937',
    borderColor: 'rgba(0, 0, 0, 0.1)'
  },
}: SidebarProps) {
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [customColor, setCustomColor] = useState("");
  const [editingCanvasBg, setEditingCanvasBg] = useState(false);
  const [tempCanvasBg, setTempCanvasBg] = useState("");
  const [editingStroke, setEditingStroke] = useState(false);
  const [tempStroke, setTempStroke] = useState("");
  const [editingBgFill, setEditingBgFill] = useState(false);
  const [tempBgFill, setTempBgFill] = useState("");

  const strokeColors = ["#1e1e1e", "#1971c2", "#2f9e44", "#f08c00", "#e03131"];
  const bgColors = ["transparent", "#ffe3e3", "#d3f9d8", "#d0ebff", "#fff3bf"];
  const canvasBackgrounds = ["#ffffff", "#fef9f3", "#f0f9ff", "#fef2f2", "#f5f5f5"];
  const fillStyles = [
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

  const handleCustomColorSubmit = () => {
    if (customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      onCanvasBgChange(customColor);
      setShowCustomColorInput(false);
      setCustomColor("");
    }
  };

  const normalizeHexColor = (hex: string): string => {
    // Remove # if present
    let normalized = hex.replace(/^#/, '');
    
    // Convert 3-digit to 6-digit
    if (normalized.length === 3) {
      normalized = normalized.split('').map(c => c + c).join('');
    }
    
    // Add # prefix
    return `#${normalized}`;
  };

  return (
    <div 
      className="w-72 p-4 flex flex-col gap-4 shadow-xl h-full overflow-y-auto backdrop-blur-sm"
      style={{ 
        backgroundColor: adaptiveColors.sidebarBg,
        borderRight: `1px solid ${adaptiveColors.borderColor}`
      }}
    >
      {/* Canvas Background */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: adaptiveColors.textColor, opacity: 0.7 }}>
          Canvas Background
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {/* Current Color with Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={canvasBg}
              onChange={(e) => onCanvasBgChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title={canvasBg}
            />
            <button
              className="w-9 h-9 rounded-lg border-2 shadow-md transition-all duration-200 hover:scale-105 relative ring-1 ring-gray-300"
              style={{ 
                backgroundColor: canvasBg,
                borderColor: adaptiveColors.textColor
              }}
              title={`Current: ${canvasBg}`}
            >
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: adaptiveColors.textColor }}></div>
            </button>
          </div>
          {canvasBackgrounds.map((color) => (
            <button
              key={color}
              onClick={() => onCanvasBgChange(color)}
              className={`w-9 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-105 ring-1 ring-gray-300 ${
                canvasBg === color ? "shadow-md" : "border-gray-200"
              }`}
              style={{
                backgroundColor: color,
                borderColor: canvasBg === color ? adaptiveColors.textColor : undefined
              }}
              title={color}
            />
          ))}
        </div>
        {!editingCanvasBg ? (
          <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1">
            <span className="text-xs text-gray-600 font-mono">{canvasBg}</span>
            <button
              onClick={() => {
                setEditingCanvasBg(true);
                setTempCanvasBg(canvasBg);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Edit hex code"
            >
              <Pencil className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={tempCanvasBg}
                onChange={(e) => setTempCanvasBg(e.target.value)}
                className="w-full px-2 py-1 text-xs font-mono border-2 rounded-lg focus:outline-none"
                style={{ borderColor: adaptiveColors.textColor }}
                placeholder="#ffffff"
                autoFocus
              />
              {tempCanvasBg && /^#?[0-9A-Fa-f]{3,6}$/.test(tempCanvasBg) && (
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: normalizeHexColor(tempCanvasBg) }}
                />
              )}
            </div>
            <button
              onClick={() => {
                if (/^#?[0-9A-Fa-f]{3,6}$/.test(tempCanvasBg)) {
                  onCanvasBgChange(normalizeHexColor(tempCanvasBg));
                }
                setEditingCanvasBg(false);
              }}
              className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
              title="Apply"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Stroke Color */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: adaptiveColors.textColor, opacity: 0.7 }}>
          {hasSelection ? "Stroke (Selected)" : "Stroke"}
        </h3>
        <div className="flex gap-2.5">
          {/* Current Color with Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={strokeFill}
              onChange={(e) => onStrokeFillChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title={strokeFill}
            />
            <button
              className="w-9 h-9 rounded-lg border-2 shadow-md transition-all duration-200 hover:scale-105 relative ring-1 ring-gray-300"
              style={{ 
                backgroundColor: strokeFill,
                borderColor: adaptiveColors.textColor
              }}
              title={`Current: ${strokeFill}`}
            >
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: adaptiveColors.textColor }}></div>
            </button>
          </div>
          {strokeColors.map((color) => (
            <button
              key={color}
              onClick={() => onStrokeFillChange(color)}
              className={`w-9 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-110 ring-1 ring-gray-300 ${
                strokeFill === color ? "shadow-md" : "border-gray-200"
              }`}
              style={{
                backgroundColor: color === "#000000" ? "#000" : color,
                borderColor: strokeFill === color ? adaptiveColors.textColor : undefined
              }}
              title={color}
            />
          ))}
        </div>
        {!editingStroke ? (
          <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1">
            <span className="text-xs text-gray-600 font-mono">{strokeFill}</span>
            <button
              onClick={() => {
                setEditingStroke(true);
                setTempStroke(strokeFill);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Edit hex code"
            >
              <Pencil className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={tempStroke}
                onChange={(e) => setTempStroke(e.target.value)}
                className="w-full px-2 py-1 text-xs font-mono border-2 rounded-lg focus:outline-none"
                style={{ borderColor: adaptiveColors.textColor }}
                placeholder="#000000"
                autoFocus
              />
              {tempStroke && /^#?[0-9A-Fa-f]{3,6}$/.test(tempStroke) && (
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: normalizeHexColor(tempStroke) }}
                />
              )}
            </div>
            <button
              onClick={() => {
                if (/^#?[0-9A-Fa-f]{3,6}$/.test(tempStroke)) {
                  onStrokeFillChange(normalizeHexColor(tempStroke));
                }
                setEditingStroke(false);
              }}
              className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
              title="Apply"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: adaptiveColors.textColor, opacity: 0.7 }}>
          {hasSelection ? "Background (Selected)" : "Background"}
        </h3>
        <div className="flex gap-2.5">
          {/* Current Color with Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={bgFill === "transparent" ? "#ffffff" : bgFill}
              onChange={(e) => onBgFillChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title={bgFill}
            />
            <button
              className="w-9 h-9 rounded-lg border-2 shadow-md transition-all duration-200 hover:scale-105 relative ring-1 ring-gray-300"
              style={{
                backgroundColor: bgFill === "transparent" ? "#fff" : bgFill,
                borderColor: adaptiveColors.textColor,
                backgroundImage:
                  bgFill === "transparent"
                    ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                    : "none",
                backgroundSize: bgFill === "transparent" ? "8px 8px" : "auto",
                backgroundPosition:
                  bgFill === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : "0 0",
              }}
              title={`Current: ${bgFill}`}
            >
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: adaptiveColors.textColor }}></div>
            </button>
          </div>
          {bgColors.map((color) => (
            <button
              key={color}
              onClick={() => onBgFillChange(color)}
              className={`w-9 h-9 rounded-lg border-2 transition-all duration-200 hover:scale-110 ring-1 ring-gray-300 ${
                bgFill === color ? "shadow-md" : "border-gray-200"
              }`}
              style={{
                backgroundColor: color === "transparent" ? "#fff" : color,
                borderColor: bgFill === color ? adaptiveColors.textColor : undefined,
                backgroundImage:
                  color === "transparent"
                    ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                    : "none",
                backgroundSize: color === "transparent" ? "8px 8px" : "auto",
                backgroundPosition:
                  color === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : "0 0",
              }}
              title={color}
            />
          ))}
        </div>
        {!editingBgFill ? (
          <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1">
            <span className="text-xs text-gray-600 font-mono">{bgFill}</span>
            <button
              onClick={() => {
                setEditingBgFill(true);
                setTempBgFill(bgFill);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Edit hex code"
            >
              <Pencil className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={tempBgFill}
                onChange={(e) => setTempBgFill(e.target.value)}
                className="w-full px-2 py-1 text-xs font-mono border-2 rounded-lg focus:outline-none"
                style={{ borderColor: adaptiveColors.textColor }}
                placeholder="#ffffff"
                autoFocus
              />
              {tempBgFill && /^#?[0-9A-Fa-f]{3,6}$/.test(tempBgFill) && (
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: normalizeHexColor(tempBgFill) }}
                />
              )}
            </div>
            <button
              onClick={() => {
                if (/^#?[0-9A-Fa-f]{3,6}$/.test(tempBgFill)) {
                  onBgFillChange(normalizeHexColor(tempBgFill));
                }
                setEditingBgFill(false);
              }}
              className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
              title="Apply"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Fill Style */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: adaptiveColors.textColor, opacity: 0.7 }}>Fill</h3>
        <div className="flex gap-2.5">
          {fillStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onFillStyleChange(style.id)}
              className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${
                fillStyle === style.id
                  ? "shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
              style={fillStyle === style.id ? {
                backgroundColor: adaptiveColors.textColor,
                color: adaptiveColors.toolbarBg,
                borderColor: adaptiveColors.textColor
              } : {}}
              title={style.label}
            >
              {style.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: adaptiveColors.textColor, opacity: 0.7 }}>Stroke Width</h3>
        <div className="flex gap-2.5">
          {[1, 2, 4].map((width) => (
            <button
              key={width}
              onClick={() => onStrokeWidthChange(width)}
              className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${
                strokeWidth === width
                  ? "shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              style={strokeWidth === width ? {
                backgroundColor: adaptiveColors.textColor,
                borderColor: adaptiveColors.textColor
              } : {}}
            >
              <Minus strokeWidth={width} className="w-6 h-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Style - Only show when shape is selected */}
      {hasSelection && selectedShape && (
        <>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: adaptiveColors.textColor, opacity: 0.7 }}>Stroke Style</h3>
            <div className="flex gap-2.5">
              <button
                onClick={() => onStrokeStyleChange("solid")}
                className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 ${
                  selectedShape.strokeStyle === "solid"
                    ? "shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                style={selectedShape.strokeStyle === "solid" ? {
                  backgroundColor: adaptiveColors.textColor,
                  borderColor: adaptiveColors.textColor
                } : {}}
                title="Solid"
              >
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
              </button>
              <button
                onClick={() => onStrokeStyleChange("dashed")}
                className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 ${
                  selectedShape.strokeStyle === "dashed"
                    ? "shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                style={selectedShape.strokeStyle === "dashed" ? {
                  backgroundColor: adaptiveColors.textColor,
                  borderColor: adaptiveColors.textColor
                } : {}}
              >
                <div className="w-full h-0.5 border-t-2 border-dashed border-gray-600"></div>
              </button>
              <button
                onClick={() => onStrokeStyleChange("dotted")}
                className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 ${
                  selectedShape.strokeStyle === "dotted"
                    ? "shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                style={selectedShape.strokeStyle === "dotted" ? {
                  backgroundColor: adaptiveColors.textColor,
                  borderColor: adaptiveColors.textColor
                } : {}}
              >
                <div className="w-full h-0.5 border-t-2 border-dotted border-gray-600"></div>
              </button>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: adaptiveColors.textColor, opacity: 0.7 }}>
              Opacity: {selectedShape.opacity}%
            </h3>
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="100"
                value={selectedShape.opacity}
                onChange={(e) => onOpacityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${selectedShape.opacity - 10}%, #e5e7eb ${selectedShape.opacity - 10}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
