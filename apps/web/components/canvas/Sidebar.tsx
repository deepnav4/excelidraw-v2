"use client";

import { useState } from "react";
import { Circle, Square, Minus, Pencil, Sun, Moon, Monitor, AlignLeft, AlignCenter, AlignRight, Code2, Type } from "lucide-react";
import type { Shape, StrokeStyle, FontFamily, FontSize, TextAlign } from "@repo/common";
import { normalizeHexColor, isValidHexColor } from "@/lib/functions/colorUtils";
import { STROKE_COLORS, BG_COLORS, CANVAS_BACKGROUNDS, FILL_STYLES } from "@/lib/constants/constant";

interface SidebarProps {
  strokeFill: string;
  bgFill: string;
  fillStyle: string;
  strokeWidth: number;
  canvasBg: string;
  selectedShape: Shape | null;
  currentTool?: string;
  fontFamily?: FontFamily;
  fontSize?: FontSize;
  textAlign?: TextAlign;
  onStrokeFillChange: (color: string) => void;
  onBgFillChange: (color: string) => void;
  onFillStyleChange: (style: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onCanvasBgChange: (color: string) => void;
  onStrokeStyleChange: (style: StrokeStyle) => void;
  onOpacityChange: (opacity: number) => void;
  onFontFamilyChange?: (fontFamily: FontFamily) => void;
  onFontSizeChange?: (fontSize: FontSize) => void;
  onTextAlignChange?: (textAlign: TextAlign) => void;
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
  currentTool,
  fontFamily = "hand-drawn",
  fontSize = "Medium",
  textAlign = "left",
  onStrokeFillChange,
  onBgFillChange,
  onFillStyleChange,
  onStrokeWidthChange,
  onCanvasBgChange,
  onStrokeStyleChange,
  onOpacityChange,
  onFontFamilyChange,
  onFontSizeChange,
  onTextAlignChange,
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

  const handleCustomColorSubmit = () => {
    if (customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      onCanvasBgChange(customColor);
      setShowCustomColorInput(false);
      setCustomColor("");
    }
  };

  // Check if we're in text mode (text tool active or text shape selected)
  const isTextMode = currentTool === "text" || (selectedShape && selectedShape.type === "text");
  
  // Get current text properties from selected shape or defaults
  const currentFontFamily = (selectedShape && selectedShape.type === "text") 
    ? selectedShape.fontFamily 
    : fontFamily;
  const currentFontSize = (selectedShape && selectedShape.type === "text") 
    ? selectedShape.fontSize 
    : fontSize;
  const currentTextAlign = (selectedShape && selectedShape.type === "text") 
    ? selectedShape.textAlign 
    : textAlign;

  return (
    <div 
      className="w-72 p-5 flex flex-col gap-6 shadow-xl h-full overflow-y-auto"
      style={{ 
        backgroundColor: canvasBg,
        borderRight: `1px solid ${adaptiveColors.borderColor}`,
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      {/* Canvas Background - Hide in text mode */}
      {!isTextMode && (
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>
          Canvas Background
        </h3>
        <div className="grid grid-cols-6 gap-2">
            {CANVAS_BACKGROUNDS.map((color) => (
            <button
              key={color}
              onClick={() => onCanvasBgChange(color)}
              className={`w-9 h-9 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              style={{
              backgroundColor: color,
              borderColor: canvasBg === color ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
              borderWidth: canvasBg === color ? '2.5px' : '1px',
              boxShadow: canvasBg === color ? '0 0 0 2px rgba(0,0,0,0.05)' : 'none'
              }}
              title={color}
            />
            ))}
        </div>
        {!editingCanvasBg ? (
          <div className="mt-2.5 flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
            <span className="text-[11px] font-mono font-medium" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>{canvasBg}</span>
            <button
              onClick={() => {
                setEditingCanvasBg(true);
                setTempCanvasBg(canvasBg);
              }}
              className="p-1 rounded transition-all duration-200"
              style={{ color: adaptiveColors.textColor, opacity: 0.5 }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
              title="Edit hex code"
            >
              <Pencil className="w-3.5 h-3.5" />
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
              {tempCanvasBg && isValidHexColor(tempCanvasBg) && (
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: normalizeHexColor(tempCanvasBg) }}
                />
              )}
            </div>
            <button
              onClick={() => {
                if (isValidHexColor(tempCanvasBg)) {
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
      )}

      {/* Stroke Color */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>
          {isTextMode ? "Text Color" : (hasSelection ? "Stroke (Selected)" : "Stroke")}
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {STROKE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onStrokeFillChange(color)}
              className={`w-9 h-9 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              style={{
                backgroundColor: color === "#000000" ? "#000" : color,
                borderColor: strokeFill === color ? adaptiveColors.textColor : 'rgba(0,0,0,0.15)',
                borderWidth: strokeFill === color ? '2.5px' : '1px',
                boxShadow: strokeFill === color ? '0 0 0 2px rgba(0,0,0,0.05)' : 'none'
              }}
              title={color}
            />
          ))}
        </div>
        {!editingStroke ? (
          <div className="mt-2.5 flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
            <span className="text-[11px] font-mono font-medium" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>{strokeFill}</span>
            <button
              onClick={() => {
                setEditingStroke(true);
                setTempStroke(strokeFill);
              }}
              className="p-1 rounded transition-all duration-200"
              style={{ color: adaptiveColors.textColor, opacity: 0.5 }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
              title="Edit hex code"
            >
              <Pencil className="w-3.5 h-3.5" />
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
              {tempStroke && isValidHexColor(tempStroke) && (
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: normalizeHexColor(tempStroke) }}
                />
              )}
            </div>
            <button
              onClick={() => {
                if (isValidHexColor(tempStroke)) {
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

      {/* Background Color - Show for text or non-text shapes */}
      {(isTextMode || !selectedShape || (selectedShape.type !== "line" && selectedShape.type !== "arrow")) && (
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>
          {isTextMode ? "Text Background" : (hasSelection ? "Background (Selected)" : "Background")}
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {BG_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onBgFillChange(color)}
              className={`w-9 h-9 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              style={{
                backgroundColor: color === "transparent" ? "#fff" : color,
                borderColor: bgFill === color ? adaptiveColors.textColor : 'rgba(0,0,0,0.15)',
                borderWidth: bgFill === color ? '2.5px' : '1px',
                boxShadow: bgFill === color ? '0 0 0 2px rgba(0,0,0,0.05)' : 'none',
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
          <div className="mt-2.5 flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
            <span className="text-[11px] font-mono font-medium" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>{bgFill}</span>
            <button
              onClick={() => {
                setEditingBgFill(true);
                setTempBgFill(bgFill);
              }}
              className="p-1 rounded transition-all duration-200"
              style={{ color: adaptiveColors.textColor, opacity: 0.5 }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
              title="Edit hex code"
            >
              <Pencil className="w-3.5 h-3.5" />
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
              {tempBgFill && isValidHexColor(tempBgFill) && (
                <div
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: normalizeHexColor(tempBgFill) }}
                />
              )}
            </div>
            <button
              onClick={() => {
                if (isValidHexColor(tempBgFill)) {
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
      )}

      {/* Fill Style - Hide in text mode */}
      {!isTextMode && (
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>Fill</h3>
        <div className="flex gap-2.5">
          {FILL_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onFillStyleChange(style.id)}
              className={`p-2.5 rounded-lg border transition-all duration-200 hover:shadow-lg`}
              style={fillStyle === style.id ? {
                backgroundColor: adaptiveColors.textColor,
                color: adaptiveColors.toolbarBg,
                borderColor: adaptiveColors.textColor,
                borderWidth: '1.5px'
              } : {
                borderColor: 'rgba(0,0,0,0.15)',
                backgroundColor: 'rgba(255,255,255,0.5)',
                color: adaptiveColors.textColor,
                borderWidth: '1px'
              }}
              title={style.label}
            >
              {style.icon}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Stroke Width & Style - Hide in text mode */}
      {!isTextMode && (
      <div className="grid grid-cols-2 gap-3">
        {/* Stroke Width */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>Width</h3>
          <div className="relative">
            <select
              value={hasSelection && selectedShape ? selectedShape.strokeWidth : strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-full px-3 py-2.5 pr-8 rounded-lg border transition-all duration-200 focus:outline-none cursor-pointer appearance-none font-medium text-sm shadow-sm hover:shadow-md"
              style={{
                borderColor: 'rgba(0,0,0,0.12)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: adaptiveColors.textColor,
                borderWidth: '1.5px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <option value={1}>Thin</option>
              <option value={2}>Medium</option>
              <option value={4}>Thick</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4" style={{ color: adaptiveColors.textColor, opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stroke Style */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>Style</h3>
          <div className="relative">
            <select
              value={selectedShape?.strokeStyle || "solid"}
              onChange={(e) => onStrokeStyleChange(e.target.value as any)}
              disabled={!hasSelection || !selectedShape}
              className="w-full px-3 py-2.5 pr-8 rounded-lg border transition-all duration-200 focus:outline-none cursor-pointer appearance-none font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              style={{
                borderColor: 'rgba(0,0,0,0.12)',
                backgroundColor: hasSelection ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.03)',
                color: adaptiveColors.textColor,
                borderWidth: '1.5px',
                boxShadow: hasSelection ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4" style={{ color: adaptiveColors.textColor, opacity: hasSelection ? 0.5 : 0.25 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Opacity - Only show when shape is selected and not in text mode */}
      {!isTextMode && hasSelection && selectedShape && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6 }}>
            Opacity: {selectedShape.opacity}%
          </h3>
          <div className="space-y-2">
            <input
              type="range"
              min="10"
              max="100"
              value={selectedShape.opacity}
              onChange={(e) => onOpacityChange(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, ${adaptiveColors.textColor} 0%, ${adaptiveColors.textColor} ${selectedShape.opacity - 10}%, rgba(0,0,0,0.1) ${selectedShape.opacity - 10}%, rgba(0,0,0,0.1) 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] font-medium" style={{ color: adaptiveColors.textColor, opacity: 0.5 }}>
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {/* Text Properties - Show when text tool is active or text shape is selected */}
      {isTextMode && (
        <>
          {/* Font Family */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6, fontFamily: 'Outfit, sans-serif' }}>
              Font family
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onFontFamilyChange?.("hand-drawn")}
                className={`flex-1 p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center`}
                style={{
                  borderColor: currentFontFamily === "hand-drawn" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentFontFamily === "hand-drawn" ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
                title="Hand-drawn"
              >
                <svg className="w-5 h-5" style={{ color: adaptiveColors.textColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => onFontFamilyChange?.("normal")}
                className={`flex-1 p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center`}
                style={{
                  borderColor: currentFontFamily === "normal" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentFontFamily === "normal" ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
                title="Normal"
              >
                <Type className="w-5 h-5" style={{ color: adaptiveColors.textColor }} />
              </button>
              <button
                onClick={() => onFontFamilyChange?.("code")}
                className={`flex-1 p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center`}
                style={{
                  borderColor: currentFontFamily === "code" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentFontFamily === "code" ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
                title="Code"
              >
                <Code2 className="w-5 h-5" style={{ color: adaptiveColors.textColor }} />
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6, fontFamily: 'Outfit, sans-serif' }}>
              Font size
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onFontSizeChange?.("Small")}
                className={`flex-1 py-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 font-medium`}
                style={{
                  borderColor: currentFontSize === "Small" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentFontSize === "Small" ? 'rgba(0,0,0,0.05)' : 'transparent',
                  color: adaptiveColors.textColor,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '14px'
                }}
              >
                S
              </button>
              <button
                onClick={() => onFontSizeChange?.("Medium")}
                className={`flex-1 py-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 font-medium`}
                style={{
                  borderColor: currentFontSize === "Medium" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentFontSize === "Medium" ? 'rgba(0,0,0,0.05)' : 'transparent',
                  color: adaptiveColors.textColor,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '14px'
                }}
              >
                M
              </button>
              <button
                onClick={() => onFontSizeChange?.("Large")}
                className={`flex-1 py-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 font-medium`}
                style={{
                  borderColor: currentFontSize === "Large" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentFontSize === "Large" ? 'rgba(0,0,0,0.05)' : 'transparent',
                  color: adaptiveColors.textColor,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '14px'
                }}
              >
                L
              </button>
            </div>
          </div>

          {/* Text Align */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3" style={{ color: adaptiveColors.textColor, opacity: 0.6, fontFamily: 'Outfit, sans-serif' }}>
              Text align
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onTextAlignChange?.("left")}
                className={`flex-1 p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center`}
                style={{
                  borderColor: currentTextAlign === "left" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentTextAlign === "left" ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
                title="Left"
              >
                <AlignLeft className="w-5 h-5" style={{ color: adaptiveColors.textColor }} />
              </button>
              <button
                onClick={() => onTextAlignChange?.("center")}
                className={`flex-1 p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center`}
                style={{
                  borderColor: currentTextAlign === "center" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentTextAlign === "center" ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
                title="Center"
              >
                <AlignCenter className="w-5 h-5" style={{ color: adaptiveColors.textColor }} />
              </button>
              <button
                onClick={() => onTextAlignChange?.("right")}
                className={`flex-1 p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center`}
                style={{
                  borderColor: currentTextAlign === "right" ? adaptiveColors.textColor : 'rgba(0,0,0,0.1)',
                  backgroundColor: currentTextAlign === "right" ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
                title="Right"
              >
                <AlignRight className="w-5 h-5" style={{ color: adaptiveColors.textColor }} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
