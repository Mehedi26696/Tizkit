export type TableCell = {
  id: string;
  content: string;
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right';
  rowSpan?: number;
  colSpan?: number;
};

export type ParsedTable = {
  rows: number;
  cols: number;
  cells: TableCell[][];
};

const cleanRow = (row: string) =>
  row
    .replace(/\\hline/g, '')
    .replace(/\\cline\{[^}]+\}/g, '')
    .replace(/%.*$/g, '')
    .trim();

const buildCell = (rowIdx: number, colIdx: number, content: string): TableCell => ({
  id: `cell-${rowIdx}-${colIdx}`,
  content: content.trim(),
  backgroundColor: '#ffffff',
  textColor: '#000000',
  bold: false,
  alignment: 'left',
});

export function parseTabular(latex: string): ParsedTable | null {
  if (!latex) return null;

  const match = latex.match(/\\begin\{tabular\}(?:\[[^\]]*\])?\{[^}]*\}([\s\S]*?)\\end\{tabular\}/);
  if (!match) return null;

  const body = match[1];
  const rawRows = body.split(/\\\\/).map(cleanRow).filter(Boolean);
  if (rawRows.length === 0) return null;

  const rows = rawRows.map((row) => row.split(/\s*&\s*/));
  const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0);
  if (maxCols === 0) return null;

  const cells = rows.map((row, rowIdx) => {
    const filled = [...row];
    while (filled.length < maxCols) {
      filled.push('');
    }
    return filled.map((cell, colIdx) => buildCell(rowIdx, colIdx, cell));
  });

  return { rows: cells.length, cols: maxCols, cells };
}
