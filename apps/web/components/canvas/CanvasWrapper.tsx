"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { CanvasEngine } from "@/lib/canvas-engine/CanvasEngine";
import type { ToolType, Shape } from "@repo/common";
import { TopToolbar } from "./TopToolbar";
import Sidebar from "./Sidebar";
import { Minus, Plus } from "lucide-react";
import { getAdaptiveColors } from "@/lib/utils";

export function CanvasWrapper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const [shapeCount, setShapeCount] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolType>("rectangle");
  const [strokeFill, setStrokeFill] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('excelidraw_stroke_color') || '#1e1e1e';
    }
    return '#1e1e1e';
  });
  const [bgFill, setBgFill] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('excelidraw_bg_color') || 'transparent';
    }
    return 'transparent';
  });
  const [fillStyle, setFillStyle] = useState("solid");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canvasBg, setCanvasBg] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('excelidraw_canvas_bg') || '#ffffff';
    }
    return '#ffffff';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calculate adaptive colors based on canvas background
  const adaptiveColors = useMemo(() => {
    return getAdaptiveColors(canvasBg);
  }, [canvasBg]);

  // Persist colors to localStorage
  useEffect(() => {
    localStorage.setItem('excelidraw_canvas_bg', canvasBg);
  }, [canvasBg]);

  useEffect(() => {
    localStorage.setItem('excelidraw_stroke_color', strokeFill);
  }, [strokeFill]);

  useEffect(() => {
    localStorage.setItem('excelidraw_bg_color', bgFill);
  }, [bgFill]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CanvasEngine(canvasRef.current);
    engine.setOnShapeCountChange(setShapeCount);
    engine.setOnSelectionChange(setSelectedShape);
    engine.setOnHistoryChange((undo, redo) => {
      setCanUndo(undo);
      setCanRedo(redo);
    });
    engineRef.current = engine;

    // Force initial resize after layout is complete
    requestAnimationFrame(() => {
      engine.resizeCanvas();
    });

    // Handle fullscreen changes to resize canvas
    const handleFullscreenChange = () => {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        engine.resizeCanvas();
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      engine.destroy();
    };
  }, []);

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    engineRef.current?.setTool(tool);
  };

  const handleStrokeFillChange = (color: string) => {
    setStrokeFill(color);
    engineRef.current?.setStrokeFill(color);
    
    // If a shape is selected, update it
    if (selectedShape) {
      engineRef.current?.updateSelectedShapeStrokeColor(color);
    }
  };

  const handleBgFillChange = (color: string) => {
    setBgFill(color);
    engineRef.current?.setBgFill(color);
    
    // If a shape is selected, update it
    if (selectedShape) {
      engineRef.current?.updateSelectedShapeBgColor(color);
    }
  };

  const handleFillStyleChange = (style: string) => {
    setFillStyle(style);
    engineRef.current?.setFillStyle(style as any);
    
    // If a shape is selected, update it
    if (selectedShape) {
      engineRef.current?.updateSelectedShapeFillStyle(style as any);
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    setStrokeWidth(width);
    engineRef.current?.setStrokeWidth(width as any);
  };

  const handleZoomIn = () => {
    engineRef.current?.zoomIn();
    const scale = engineRef.current?.getScale() || 1;
    setZoom(Math.round(scale * 100));
  };

  const handleZoomOut = () => {
    engineRef.current?.zoomOut();
    const scale = engineRef.current?.getScale() || 1;
    setZoom(Math.round(scale * 100));
  };

  const handleResetZoom = () => {
    engineRef.current?.resetZoom();
    setZoom(100);
  };

  const handleClearCanvas = () => {
    if (window.confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
      engineRef.current?.clearCanvas();
      setSelectedShape(null);
    }
  };

  const handleUndo = () => {
    engineRef.current?.undo();
  };

  const handleRedo = () => {
    engineRef.current?.redo();
  };

  const handleCanvasBgChange = (color: string) => {
    setCanvasBg(color);
  };

  const handleStrokeStyleChange = (style: any) => {
    engineRef.current?.updateSelectedShapeStrokeStyle(style);
  };

  const handleOpacityChange = (opacity: number) => {
    engineRef.current?.updateSelectedShapeOpacity(opacity);
  };

  return (
    <div className="h-screen w-full flex flex-col" style={{ backgroundColor: canvasBg }}>
      <TopToolbar 
        onToolChange={handleToolChange} 
        activeTool={activeTool} 
        onClearCanvas={handleClearCanvas}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        adaptiveColors={adaptiveColors}
        shapeCount={shapeCount}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Sidebar */}
        <div 
          className={`absolute left-0 top-0 h-full z-20 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            strokeFill={strokeFill}
            bgFill={bgFill}
            fillStyle={fillStyle}
            strokeWidth={strokeWidth}
            canvasBg={canvasBg}
            selectedShape={selectedShape}
            onStrokeFillChange={handleStrokeFillChange}
            onBgFillChange={handleBgFillChange}
            onFillStyleChange={handleFillStyleChange}
            onStrokeWidthChange={handleStrokeWidthChange}
            onCanvasBgChange={handleCanvasBgChange}
            onStrokeStyleChange={handleStrokeStyleChange}
            onOpacityChange={handleOpacityChange}
            hasSelection={!!selectedShape}
            adaptiveColors={adaptiveColors}
          />
        </div>
        
        <div ref={containerRef} className="flex-1 relative z-0">
          <canvas
            ref={canvasRef}
            className="w-full h-full absolute top-0 left-0"
            style={{ minHeight: '100%' }}
          />
          
          {/* Zoom Controls */}
          <div 
            className="absolute bottom-6 left-6 flex items-center gap-1 backdrop-blur-sm shadow-lg rounded-xl p-1.5 z-10"
            style={{ 
              backgroundColor: adaptiveColors.toolbarBg,
              borderColor: adaptiveColors.borderColor,
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-black/5 rounded-lg transition-all duration-200"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" style={{ color: adaptiveColors.textColor }} />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-2 text-sm font-medium hover:bg-black/5 rounded-lg transition-all duration-200 min-w-[60px]"
              title="Reset Zoom"
              style={{ color: adaptiveColors.textColor }}
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-black/5 rounded-lg transition-all duration-200"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" style={{ color: adaptiveColors.textColor }} />
            </button>
          </div>

          {/* Shape Count */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 z-10">
            {shapeCount} {shapeCount === 1 ? "shape" : "shapes"}
          </div>
        </div>
      </div>
    </div>
  );
}
