'use client';

import React, { useState } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  const [showPalette, setShowPalette] = useState(false);

  // Common LaTeX colors with their hex equivalents
  const latexColors = [
    { name: 'white', hex: '#FFFFFF', latex: 'white' },
    { name: 'black', hex: '#000000', latex: 'black' },
    { name: 'red', hex: '#FF0000', latex: 'red' },
    { name: 'green', hex: '#00FF00', latex: 'green' },
    { name: 'blue', hex: '#0000FF', latex: 'blue' },
    { name: 'cyan', hex: '#00FFFF', latex: 'cyan' },
    { name: 'magenta', hex: '#FF00FF', latex: 'magenta' },
    { name: 'yellow', hex: '#FFFF00', latex: 'yellow' },
    { name: 'orange', hex: '#FFA500', latex: 'orange' },
    { name: 'violet', hex: '#8A2BE2', latex: 'violet' },
    { name: 'brown', hex: '#A52A2A', latex: 'brown' },
    { name: 'pink', hex: '#FFC0CB', latex: 'pink' },
    { name: 'gray', hex: '#808080', latex: 'gray' },
    { name: 'darkgray', hex: '#404040', latex: 'darkgray' },
    { name: 'lightgray', hex: '#D3D3D3', latex: 'lightgray' },
  ];

  // Predefined tints for blue (as example)
  const blueTints = [
    { name: 'blue!10', hex: '#E6F3FF', latex: 'blue!10' },
    { name: 'blue!20', hex: '#CCE7FF', latex: 'blue!20' },
    { name: 'blue!30', hex: '#B3DBFF', latex: 'blue!30' },
    { name: 'blue!40', hex: '#99CFFF', latex: 'blue!40' },
    { name: 'blue!50', hex: '#80C3FF', latex: 'blue!50' },
    { name: 'blue!60', hex: '#66B7FF', latex: 'blue!60' },
    { name: 'blue!70', hex: '#4DABFF', latex: 'blue!70' },
    { name: 'blue!80', hex: '#339FFF', latex: 'blue!80' },
    { name: 'blue!90', hex: '#1A93FF', latex: 'blue!90' },
    { name: 'blue!100', hex: '#0000FF', latex: 'blue' },
  ];

  const hexToLatex = (hex: string): string => {
    // Find exact match first
    const exactMatch = [...latexColors, ...blueTints].find(color => 
      color.hex.toLowerCase() === hex.toLowerCase()
    );
    if (exactMatch) return exactMatch.latex;

    // For custom colors, return the hex value (LaTeX xcolor can handle HTML colors)
    return hex;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer"
          style={{ backgroundColor: selectedColor }}
          onClick={() => setShowPalette(!showPalette)}
        />
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8"
        />
        <span className="text-sm font-mono">
          {hexToLatex(selectedColor)}
        </span>
      </div>

      {showPalette && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-80">
          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-2">Standard Colors</h4>
            <div className="grid grid-cols-5 gap-2">
              {latexColors.map((color) => (
                <div
                  key={color.name}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                  title={color.latex}
                  onClick={() => {
                    onColorChange(color.hex);
                    setShowPalette(false);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-2">Blue Tints</h4>
            <div className="grid grid-cols-5 gap-2">
              {blueTints.map((color) => (
                <div
                  key={color.name}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                  title={color.latex}
                  onClick={() => {
                    onColorChange(color.hex);
                    setShowPalette(false);
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowPalette(false)}
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;