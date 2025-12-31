"use client";

import { useState } from "react";
import type { ToolType } from "@repo/common";
import {
  Hand,
  MousePointer2,
  Square,
  Circle,
  Diamond,
  Minus,
  ArrowRight,
  Pencil,
  Type,
  Eraser,
  Share2,
  Menu,
  Trash2,
  Undo2,
  Redo2,
  Maximize,
  Minimize,
  Copy,
  Clipboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HamburgerIcon } from "@/components/ui/HamburgerIcon";

interface TopToolbarProps {
  onToolChange: (tool: ToolType) => void;
  activeTool: ToolType;
  onClearCanvas?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onCopy?: () => void;
  onPaste?: () => void;
  hasSelection?: boolean;
  adaptiveColors?: {
    toolbarBg: string;
    sidebarBg: string;
    textColor: string;
    borderColor: string;
  };
  shapeCount?: number;
}

const tools: { type: ToolType; icon: React.ReactNode; label: string }[] = [
  { type: "selection", icon: <MousePointer2 className="w-5 h-5" />, label: "Select" },
  { type: "grab", icon: <Hand className="w-5 h-5" />, label: "Pan" },
  { type: "rectangle", icon: <Square className="w-5 h-5" />, label: "Rectangle" },
  { type: "ellipse", icon: <Circle className="w-5 h-5" />, label: "Circle" },
  { type: "diamond", icon: <Diamond className="w-5 h-5" />, label: "Diamond" },
  { type: "line", icon: <Minus className="w-5 h-5" />, label: "Line" },
  { type: "arrow", icon: <ArrowRight className="w-5 h-5" />, label: "Arrow" },
  { type: "free-draw", icon: <Pencil className="w-5 h-5" />, label: "Draw" },
  // { type: "text", icon: <Type className="w-5 h-5" />, label: "Text" }, // Disabled temporarily
  { type: "eraser", icon: <Eraser className="w-5 h-5" />, label: "Eraser" },
];

export function TopToolbar({ 
  onToolChange, 
  activeTool, 
  onClearCanvas, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false, 
  onToggleSidebar, 
  isSidebarOpen = false,
  onCopy,
  onPaste,
  hasSelection = false,
  adaptiveColors = {
    toolbarBg: 'rgba(255, 255, 255, 0.90)',
    sidebarBg: '#ffffff',
    textColor: '#1f2937',
    borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  shapeCount = 0
}: TopToolbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-14 flex items-center justify-center px-6 relative z-30">
      {/* Left - Menu Button */}
      <div className="absolute left-6 flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-black/5"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          style={{ color: adaptiveColors.textColor }}
        >
          <HamburgerIcon isOpen={isSidebarOpen} />
        </button>
      </div>

      {/* Center - Tools */}
      <div 
        className="flex items-center gap-1 backdrop-blur-sm rounded-xl p-1 shadow-sm"
        style={{
          backgroundColor: adaptiveColors.toolbarBg,
          borderColor: adaptiveColors.borderColor,
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onToolChange(tool.type)}
            className={cn(
              "p-2.5 rounded-lg transition-all duration-200",
              activeTool === tool.type 
                ? "shadow-sm" 
                : "hover:bg-black/5"
            )}
            style={
              activeTool === tool.type 
                ? { 
                    backgroundColor: adaptiveColors.textColor, 
                    color: adaptiveColors.toolbarBg 
                  } 
                : { color: adaptiveColors.textColor }
            }
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Right - Actions */}
      <div className="absolute right-6 flex items-center gap-2">
        <button 
          onClick={onCopy}
          disabled={!hasSelection}
          className={cn(
            "p-2 rounded-lg transition-all duration-200 flex items-center gap-1.5",
            hasSelection 
              ? "hover:bg-black/5" 
              : "opacity-30 cursor-not-allowed"
          )}
          style={{ color: adaptiveColors.textColor }}
          title="Copy (Ctrl+C)"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button 
          onClick={onPaste}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-black/5"
          style={{ color: adaptiveColors.textColor }}
          title="Paste (Ctrl+V)"
        >
          <Clipboard className="w-4 h-4" />
        </button>
        <div className="w-px h-6 opacity-20" style={{ backgroundColor: adaptiveColors.textColor }} />
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            canUndo 
              ? "hover:bg-black/5" 
              : "opacity-30 cursor-not-allowed"
          )}
          style={{ color: adaptiveColors.textColor }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            canRedo 
              ? "hover:bg-black/5" 
              : "opacity-30 cursor-not-allowed"
          )}
          style={{ color: adaptiveColors.textColor }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 opacity-20" style={{ backgroundColor: adaptiveColors.textColor }} />
        <button 
          onClick={toggleFullscreen}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-black/5"
          style={{ color: adaptiveColors.textColor }}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
        <button 
          onClick={onClearCanvas}
          className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-black/5 transition-all duration-200 flex items-center gap-2"
          style={{ color: adaptiveColors.textColor }}
          title="Clear canvas"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
        <button 
          className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm backdrop-blur-sm"
          style={{
            backgroundColor: adaptiveColors.toolbarBg,
            color: adaptiveColors.textColor,
            borderColor: adaptiveColors.borderColor,
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
