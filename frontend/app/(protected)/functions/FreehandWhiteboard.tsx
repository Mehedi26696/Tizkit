"use client";
import React, { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";


interface FreehandWhiteboardProps {
  onExport?: (blob: Blob, type: 'png' | 'svg') => void | Promise<void>;
  onExportData?: (data: any) => void | Promise<void>;
}

const FreehandWhiteboard: React.FC<FreehandWhiteboardProps> = ({ onExport, onExportData }) => {
  // Export vector/position data
  const handleExportData = () => {
    if (onExportData) {
      onExportData(lines);
    }
  };
  const [tool, setTool] = useState<"pen" | "brush" | "eraser">("pen");
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);
  const [strokeColor, setStrokeColor] = useState("#FFD700");  
  const [strokeWidth, setStrokeWidth] = useState(6);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color: strokeColor, width: strokeWidth }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // Export PNG
  const handleExportPNG = () => {
    const stage = document.getElementsByTagName('canvas')[0];
    if (!stage) return;
    stage.toBlob((blob: Blob | null) => {
      if (blob && onExport) onExport(blob, 'png');
    });
  };

  // Export SVG
  const handleExportSVG = () => {
    const konvaStage = document.querySelector('.konvajs-content');
    if (!konvaStage) return;
    // Konva does not natively support SVG export, so we fallback to PNG
    handleExportPNG();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">iPad-style Paint Whiteboard</h1>
      {/* Toolbar */}
  <div className="flex gap-3 mb-4 bg-gray-800 px-4 py-2 rounded-xl shadow-lg">
        <button
          onClick={handleExportData}
          className="px-3 py-1 rounded bg-green-400 text-black font-bold shadow"
        >
          Export Data
        </button>
        <button
          onClick={() => setTool("pen")}
          className={`px-3 py-1 rounded ${tool === "pen" ? "bg-yellow-400 text-black" : "bg-gray-600 text-yellow-300"}`}
        >
          Pen
        </button>
        <button
          onClick={() => setTool("brush")}
          className={`px-3 py-1 rounded ${tool === "brush" ? "bg-yellow-400 text-black" : "bg-gray-600 text-yellow-300"}`}
        >
          Brush
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`px-3 py-1 rounded ${tool === "eraser" ? "bg-red-500 text-white" : "bg-gray-600 text-yellow-300"}`}
        >
          Eraser
        </button>

        <input
          type="color"
          value={strokeColor}
          onChange={(e) => {
            setStrokeColor(e.target.value);
            if (tool === 'eraser') {
              setTool('pen');
            }
          }}
          className="w-10 h-10 rounded-full border-2 border-yellow-400 cursor-pointer"
        />

        <input
          type="range"
          min="2"
          max="40"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-32 accent-yellow-400"
        />
        <span>{strokeWidth}px</span>
        <button
          onClick={handleExportPNG}
          className="px-3 py-1 rounded bg-yellow-400 text-black font-bold shadow"
        >
          Export PNG
        </button>
        <button
          onClick={handleExportSVG}
          className="px-3 py-1 rounded bg-yellow-400 text-black font-bold shadow"
        >
          Export SVG
        </button>
      </div>
      {/* Canvas */}
      <div className="border-4 border-yellow-400 rounded-xl shadow-xl bg-white">
        <Stage
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === "eraser" ? "white" : line.color}
                strokeWidth={line.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default FreehandWhiteboard;