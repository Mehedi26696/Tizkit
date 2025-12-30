'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Trash2, Type, Palette, AlignLeft, AlignCenter, AlignRight, 
  Bold, Sparkles, GripHorizontal, GripVertical, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { latexService } from '@/services/latexService';
import axios from 'axios';

interface Cell {
  id: string;
  content: string;
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right';
  rowSpan?: number;
  colSpan?: number;
}

interface TableEditorProps {
  onTableChange: (tableData: {
    rows: number;
    cols: number;
    cells: Cell[][];
    latexCode?: string;
  }) => void;
  initialData?: {
    rows?: number;
    cols?: number;
    cells?: Cell[][];
  } | null;
}

const createDefaultCells = (numRows: number, numCols: number): Cell[][] => {
  return Array(numRows).fill(null).map((_, i) => 
    Array(numCols).fill(null).map((_, j) => ({
      id: `cell-${i}-${j}`,
      content: `Cell ${i + 1},${j + 1}`,
      backgroundColor: '#ffffff',
      textColor: '#000000',
      bold: false,
      alignment: 'left' as const,
    }))
  );
};

const TableEditor: React.FC<TableEditorProps> = ({ onTableChange, initialData }) => {
  const [rows, setRows] = useState(() => initialData?.rows ?? 3);
  const [cols, setCols] = useState(() => initialData?.cols ?? 3);
  const [cells, setCells] = useState<Cell[][]>(() => 
    initialData?.cells ?? createDefaultCells(initialData?.rows ?? 3, initialData?.cols ?? 3)
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from initial data when it arrives
  useEffect(() => {
    if (initialData && !isInitialized) {
      if (initialData.rows) setRows(initialData.rows);
      if (initialData.cols) setCols(initialData.cols);
      if (initialData.cells) setCells(initialData.cells);
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [generatedLatex, setGeneratedLatex] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Function to call backend for LaTeX generation
  const generateLatex = async () => {
    try {
      setIsCompiling(true);
      console.log('Payload sent to backend:', {
        data: {
          cells: cells.map((row) =>
            row.map((cell) => ({
              content: cell.content,
              backgroundColor: cell.backgroundColor,
              textColor: cell.textColor,
              bold: cell.bold,
              italic: false, // Default value for italic
            }))
          ),
        },
      });
      const result = await latexService.generateLatex({
        type: 'table',
        data: {
          cells: cells.map((row) =>
            row.map((cell) => ({
              content: cell.content,
              backgroundColor: cell.backgroundColor,
              textColor: cell.textColor,
              bold: cell.bold,
              italic: false,
              alignment: cell.alignment,
            }))
          ),
          rows: rows,
          cols: cols,
        },
      });
      if (result.data) {
        setGeneratedLatex(result.data.latex_code);
        console.log('Generated LaTeX:', result.data.latex_code);

        // Pass the generated LaTeX code to the parent component
        onTableChange({ rows, cols, cells, latexCode: result.data.latex_code });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 422) {
        const errorBlob = error.response.data;
        const reader = new FileReader();
        reader.onload = () => {
          console.error('Validation error:', reader.result);
        };
        reader.readAsText(errorBlob);
      } else {
        console.error('Failed to generate LaTeX:', error);
      }
    } finally {
      setIsCompiling(false);
    }
  };

  // Sync with parent whenever table structure changes
  useEffect(() => {
    onTableChange({ rows, cols, cells });
  }, [rows, cols, cells, onTableChange]);

  // Auto-generate LaTeX when table changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateLatex();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [JSON.stringify(cells)]);


  const addRow = () => {
    const newRow = Array(cols).fill(null).map((_, j) => ({
      id: `cell-${rows}-${j}`,
      content: `Cell ${rows + 1},${j + 1}`,
      backgroundColor: '#ffffff',
      textColor: '#000000',
      bold: false,
      alignment: 'left' as const,
    }));
    setCells((prevCells) => [...prevCells, newRow]);
    setRows((prevRows) => prevRows + 1);
  };

  const addColumn = () => {
    setCells((prevCells) =>
      prevCells.map((row, i) => [
        ...row,
        {
          id: `cell-${i}-${cols}`,
          content: `Cell ${i + 1},${cols + 1}`,
          backgroundColor: '#ffffff',
          textColor: '#000000',
          bold: false,
          alignment: 'left' as const,
        },
      ])
    );
    setCols((prevCols) => prevCols + 1);
  };

  const deleteRow = () => {
    if (rows <= 1) return;
    setCells((prevCells) => prevCells.slice(0, -1));
    setRows((prevRows) => prevRows - 1);
  };

  const deleteColumn = () => {
    if (cols <= 1) return;
    setCells((prevCells) => prevCells.map((row) => row.slice(0, -1)));
    setCols((prevCols) => prevCols - 1);
  };

  const deleteSpecificRow = (index: number) => {
    if (rows <= 1) return;
    setCells((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) => prev - 1);
  };

  const deleteSpecificColumn = (index: number) => {
    if (cols <= 1) return;
    setCells((prev) => prev.map((row) => row.filter((_, j) => j !== index)));
    setCols((prev) => prev - 1);
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rows) return;
    
    setCells((prev) => {
      const newCells = [...prev];
      const temp = newCells[index];
      newCells[index] = newCells[newIndex];
      newCells[newIndex] = temp;
      return newCells;
    });
  };

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= cols) return;
    
    setCells((prev) => {
      return prev.map((row) => {
        const newRow = [...row];
        const temp = newRow[index];
        newRow[index] = newRow[newIndex];
        newRow[newIndex] = temp;
        return newRow;
      });
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, updates: Partial<Cell>) => {
    const newCells = cells.map((row, i) =>
      i === rowIndex
        ? row.map((cell, j) => (j === colIndex ? { ...cell, ...updates } : cell))
        : row
    );
    setCells(newCells);
  };

  return (
    <Card className="p-0 bg-white shadow-xl border-gray-200/50 overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Premium Toolbar */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={addRow}
              className="h-9 px-3 hover:bg-white hover:shadow-sm rounded-lg text-gray-700 font-medium transition-all"
            >
              <Plus className="w-4 h-4 mr-2 text-blue-600" /> Row
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addColumn}
              className="h-9 px-3 hover:bg-white hover:shadow-sm rounded-lg text-gray-700 font-medium transition-all"
            >
              <Plus className="w-4 h-4 mr-2 text-green-600" /> Column
            </Button>
          </div>
          
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={generateLatex}
            disabled={isCompiling}
            className="h-9 px-4 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 rounded-xl transition-all shadow-sm group"
          >
            {isCompiling ? (
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            )}
            Refresh LaTeX
          </Button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-full border border-blue-100/50">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{rows}x{cols} Table</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/30 p-6 custom-scrollbar">
        <div className="relative inline-block bg-white rounded-2xl shadow-2xl border border-gray-100 shadow-gray-200/50">
          <table className="border-collapse">
            <thead>
              <tr className="group/header">
                {/* Empty cell for row controls column */}
                <th className="bg-gray-100/50 border-b border-r border-gray-200 w-12 sticky top-0 left-0 z-30 rounded-tl-2xl">
                  <div className="flex items-center justify-center">
                    <GripVertical className="w-4 h-4 text-gray-400 opacity-50" />
                  </div>
                </th>
                {Array.from({ length: cols }).map((_, j) => (
                  <th key={`col-ctrl-${j}`} className="bg-gray-50/80 border-b border-r border-gray-200 p-2 min-w-[140px] sticky top-0 z-20 group/col relative">
                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover/col:opacity-100 transition-all duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveColumn(j, 'left')}
                        disabled={j === 0}
                        className="w-7 h-7 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-20"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSpecificColumn(j)}
                        disabled={cols <= 1}
                        className="w-7 h-7 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-md disabled:opacity-20"
                        title="Delete Column"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveColumn(j, 'right')}
                        disabled={j === cols - 1}
                        className="w-7 h-7 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-20"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {/* Column indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 scale-x-0 group-hover/col:scale-x-100 transition-transform origin-center"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cells.map((row, i) => (
                <tr key={i} className="group/row">
                  {/* Row controls */}
                  <td className="bg-gray-50/80 border-r border-b border-gray-200 p-2 w-12 sticky left-0 z-20 group/row-ctrl relative overflow-hidden">
                    <div className="flex flex-col items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveRow(i, 'up')}
                        disabled={i === 0}
                        className="w-7 h-7 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSpecificRow(i)}
                        disabled={rows <= 1}
                        className="w-7 h-7 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-md disabled:opacity-20"
                        title="Delete Row"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveRow(i, 'down')}
                        disabled={i === rows - 1}
                        className="w-7 h-7 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {/* Row indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-400 scale-y-0 group-hover/row:scale-y-100 transition-transform origin-center"></div>
                  </td>
                  {row.map((cell, j) => (
                    <td
                      key={cell.id}
                      className="border-r border-b border-gray-100 p-0 min-w-[140px] focus-within:ring-2 focus-within:ring-blue-400/30 transition-all relative group/cell"
                      style={{
                        backgroundColor: cell.backgroundColor,
                      }}
                    >
                      <div className="p-3">
                        <textarea
                          rows={1}
                          value={cell.content}
                          onChange={(e) => updateCell(i, j, { content: e.target.value })}
                          className="w-full bg-transparent border-none outline-none resize-none font-medium text-sm p-0 mb-2 min-h-[1.5rem]"
                          style={{ 
                            color: cell.textColor,
                            fontWeight: cell.bold ? '700' : '500',
                            textAlign: cell.alignment || 'left',
                          }}
                        />
                        
                        <div className="flex items-center justify-between opacity-0 group-hover/cell:opacity-100 focus-within:opacity-100 transition-opacity duration-200 mt-auto pt-2 border-t border-gray-100/50">
                          <div className="flex gap-1">
                            <label className="relative cursor-pointer group/tool">
                              <input
                                type="color"
                                value={cell.backgroundColor}
                                onChange={(e) => updateCell(i, j, { backgroundColor: e.target.value })}
                                className="sr-only"
                              />
                              <div className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 bg-white transition-colors shadow-sm">
                                <Palette className="w-3 h-3 text-gray-500" />
                              </div>
                            </label>
                            
                            <label className="relative cursor-pointer group/tool">
                              <input
                                type="color"
                                value={cell.textColor}
                                onChange={(e) => updateCell(i, j, { textColor: e.target.value })}
                                className="sr-only"
                              />
                              <div className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 bg-white transition-colors shadow-sm">
                                <Type className="w-3 h-3 text-gray-500" />
                              </div>
                            </label>
                          </div>

                          <div className="flex bg-gray-100/50 p-0.5 rounded-lg border border-gray-200/50 gap-0.5">
                            <button
                              onClick={() => updateCell(i, j, { alignment: 'left' })}
                              className={`p-1 rounded-md transition-all ${cell.alignment === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                              title="Align Left"
                            >
                              <AlignLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateCell(i, j, { alignment: 'center' })}
                              className={`p-1 rounded-md transition-all ${cell.alignment === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                              title="Align Center"
                            >
                              <AlignCenter className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateCell(i, j, { alignment: 'right' })}
                              className={`p-1 rounded-md transition-all ${cell.alignment === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                              title="Align Right"
                            >
                              <AlignRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateCell(i, j, { bold: !cell.bold })}
                              className={`p-1 rounded-md transition-all ${cell.bold ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                              title="Bold"
                            >
                              <Bold className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default TableEditor;