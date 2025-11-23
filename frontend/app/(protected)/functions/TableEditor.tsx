'use client';

import React, { useState, useEffect } from 'react';
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
}

const TableEditor: React.FC<TableEditorProps> = ({ onTableChange }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [cells, setCells] = useState<Cell[][]>(() => 
    Array(3).fill(null).map((_, i) => 
      Array(3).fill(null).map((_, j) => ({
        id: `cell-${i}-${j}`,
        content: `Cell ${i + 1},${j + 1}`,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        bold: false,
        alignment: 'left' as const,
      }))
    )
  );
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
              italic: false, // Default value for italic
            }))
          ),
          rows: rows, // Include rows
          cols: cols, // Include cols
        },
      });
      if (result.data) {
        setGeneratedLatex(result.data.latex_code);
        console.log('Generated LaTeX:', result.data.latex_code);

        // Pass the generated LaTeX code to the parent component
        onTableChange({ rows, cols, cells, latexCode: result.data.latex_code });

        // Call preview API
        const previewResult = await latexService.preview({
          type: 'table',
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
            rows: rows, // Include rows
            cols: cols, // Include cols
          },
          latex_code: result.data.latex_code,
          output_format: 'png',
        });
        const blob = previewResult.data; // Ensure previewResult is used correctly
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
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

  // Auto-generate LaTeX when table changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateLatex();
    }, 300);

    return () => clearTimeout(timeoutId); // Ensure cleanup function is returned
  }, [JSON.stringify(cells)]); // Serialize cells to avoid unnecessary renders

  // Initial trigger when component mounts
  useEffect(() => {
    onTableChange({ rows, cols, cells });
  }, []); // Empty dependency array to run only on mount

  // Update parent when table structure changes
  useEffect(() => {
    onTableChange({ rows, cols, cells });
  }, [rows, cols, cells, onTableChange]);

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

  const updateCell = (rowIndex: number, colIndex: number, updates: Partial<Cell>) => {
    const newCells = cells.map((row, i) =>
      i === rowIndex
        ? row.map((cell, j) => (j === colIndex ? { ...cell, ...updates } : cell))
        : row
    );
    setCells(newCells);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Row
        </button>
        <button
          onClick={addColumn}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Column
        </button>
        <button
          onClick={generateLatex}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={isCompiling}
        >
          {isCompiling ? 'Generating...' : 'Generate LaTeX'}
        </button>
      </div>

      <div className="flex">
        {/* Left Panel: Table Editor */}
        <div className="w-1/2 pr-4">
          <div>
            <table className="border-collapse border border-gray-300">
              <tbody>
                {cells.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={cell.id}
                        className="border border-gray-300 p-2 min-w-[120px]"
                        style={{
                          backgroundColor: cell.backgroundColor,
                          color: cell.textColor,
                          fontWeight: cell.bold ? 'bold' : 'normal',
                          textAlign: cell.alignment,
                        }}
                      >
                        <input
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateCell(i, j, { content: e.target.value })}
                          className="w-full bg-transparent border-none outline-none"
                          style={{ color: 'inherit' }}
                        />
                        <div className="mt-1 flex gap-1">
                          <input
                            type="color"
                            value={cell.backgroundColor}
                            onChange={(e) => updateCell(i, j, { backgroundColor: e.target.value })}
                            className="w-6 h-6"
                            title="Background color"
                          />
                          <input
                            type="color"
                            value={cell.textColor}
                            onChange={(e) => updateCell(i, j, { textColor: e.target.value })}
                            className="w-6 h-6"
                            title="Text color"
                          />
                          <button
                            onClick={() => updateCell(i, j, { bold: !cell.bold })}
                            className={`w-6 h-6 text-xs font-bold ${
                              cell.bold ? 'bg-gray-700 text-white' : 'bg-gray-200'
                            }`}
                            title="Bold"
                          >
                            B
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableEditor;