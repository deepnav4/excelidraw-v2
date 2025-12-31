"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasEngine } from "@/lib/canvas-engine/CanvasEngine";
import type { ToolType, Shape } from "@repo/common";
import { TopToolbar } from "./TopToolbar";
import Sidebar from "./Sidebar";
import { Minus, Plus } from "lucide-react";

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
    
    // If a shape is selected, update it
    if (selectedShape) {
      engineRef.current?.updateSelectedShapeStrokeWidth(width as any);
    }
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

  const handleCopy = () => {
    engineRef.current?.copySelectedShape();
  };

  const handlePaste = () => {
    engineRef.current?.pasteShape();
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
        onCopy={handleCopy}
        onPaste={handlePaste}
        hasSelection={!!selectedShape}
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
          />
        </div>
        
        <div ref={containerRef} className="flex-1 relative z-0">
          <canvas
            ref={canvasRef}
            className="w-full h-full absolute top-0 left-0"
            style={{ minHeight: '100%' }}
          />
          
          {/* Empty Canvas Placeholder */}
          {shapeCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
              <div className="w-full max-w-6xl px-8">
                {/* Main Title */}
                <div className="text-center mb-16">
                  <h1 
                    className="text-8xl mb-6"
                    style={{ 
                      fontFamily: 'Pacifico, cursive',
                      color: 'rgba(107, 114, 128, 0.12)',
                      letterSpacing: '0.02em',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    excelidraw
                  </h1>
                  <p 
                    className="text-lg"
                    style={{ 
                      fontFamily: 'Pacifico, cursive',
                      color: 'rgba(107, 114, 128, 0.23)',
                      fontWeight: 300
                    }}
                  >
                    All your data is saved locally in your browser.
                  </p>
                </div>

                {/* Features with Arrows */}
                <div className="relative mt-20">
                  {/* Top Left - Menu */}
                  <div className="absolute bottom-[230px] left-[0px]">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-30">
                      <defs>
                        <marker id="arrowhead1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="rgba(107, 114, 128, 0.5)" />
                        </marker>
                      </defs>
                      <path
                        d="M 80 80 Q 60 60, 40 30 L 20 10"
                        stroke="rgba(107, 114, 128, 0.5)"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead1)"
                      />
                    </svg>
                    <p
                      className="text-sm mt-2 ml-12"
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        color: 'rgba(107, 114, 128, 0.4)',
                        fontWeight: 300,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Customize colors<br />& styles
                    </p>
                  </div>

                  {/* Top Center - Toolbar */}
                  <div className="absolute bottom-[270px] left-[50%] translate-x-[-50%]">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-30 mx-auto">
                      <defs>
                        <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="rgba(107, 114, 128, 0.5)" />
                        </marker>
                      </defs>
                      <path
                        d="M 40 70 L 40 10"
                        stroke="rgba(107, 114, 128, 0.5)"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead2)"
                      />
                    </svg>
                    <p
                      className="text-sm text-center"
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        color: 'rgba(107, 114, 128, 0.4)',
                        fontWeight: 300,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Pick a tool &<br />Start drawing!
                    </p>
                  </div>

                  
                  

                  {/* Bottom Left - Zoom Controls */}
                  <div className="absolute bottom-[-100px] left-[90px]">
                    <p
                      className="text-sm mb-2 ml-8"
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        color: 'rgba(107, 114, 128, 0.4)',
                        fontWeight: 300,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Zoom in & out
                    </p>
                    <svg width="100" height="80" viewBox="0 0 100 80" className="opacity-30">
                      <defs>
                        <marker id="arrowhead4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="rgba(107, 114, 128, 0.5)" />
                        </marker>
                      </defs>
                      <path
                        d="M 80 10 Q 60 30, 40 50 L 20 70"
                        stroke="rgba(107, 114, 128, 0.5)"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead4)"
                      />
                    </svg>
                  </div>

                
                  
                </div>
                
              </div>
            </div>
          )}
          
          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-6 flex items-center gap-1 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 rounded-xl p-1.5 z-10">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 min-w-[60px]"
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Zoom In"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Shape Count */} 
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700">
            {shapeCount} {shapeCount === 1 ? "shape" : "shapes"}
          </div>
        </div>
      </div>
    </div>
  );
}
