export type DiagramNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rectangle' | 'circle' | 'diamond';
  text: string;
  fillColor: string;
  strokeColor: string;
  textColor: string;
  strokeWidth: number;
};

export type DiagramConnection = {
  id: string;
  from: string;
  to: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  type: 'arrow' | 'line';
  color: string;
  strokeWidth: number;
};

export type ParsedDiagram = {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  canvasWidth: number;
  canvasHeight: number;
};

type ExistingDiagram = {
  nodes?: DiagramNode[];
  connections?: DiagramConnection[];
};

const DEFAULT_CANVAS = { width: 500, height: 350 };
const PIXELS_PER_CM = 50;

const CSS_COLOR_NAMES = new Set([
  'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink',
  'gray', 'grey', 'lightblue', 'lightgreen', 'darkblue', 'darkgreen', 'darkred',
  'darkorange', 'brown', 'cyan', 'magenta', 'teal', 'lime', 'navy', 'maroon',
]);

const unescapeLabel = (text: string) =>
  text
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\#/g, '#')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .trim();

const getDefaultDimensions = (type: DiagramNode['type']) => {
  if (type === 'circle') return { width: 70, height: 70 };
  if (type === 'diamond') return { width: 90, height: 50 };
  return { width: 90, height: 50 };
};

const nodeCenter = (node: DiagramNode) => ({
  x: node.x + node.width / 2,
  y: node.y + node.height / 2,
});

const isHexColor = (value: string) => /^#?[0-9A-Fa-f]{6}$/.test(value.trim());

const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const resolveColor = (
  raw: string | undefined,
  colorMap: Map<string, string>,
  existingFallback?: string
) => {
  if (!raw) return existingFallback || '#374151';
  const cleaned = raw.trim();
  if (colorMap.has(cleaned)) {
    return colorMap.get(cleaned) as string;
  }
  if (isHexColor(cleaned)) {
    return normalizeHex(cleaned);
  }
  if (CSS_COLOR_NAMES.has(cleaned.toLowerCase())) {
    return cleaned;
  }
  return existingFallback || '#374151';
};

export function parseTikzDiagram(latex: string, existing?: ExistingDiagram): ParsedDiagram | null {
  if (!latex) return null;

  const tikzMatch = latex.match(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/);
  if (!tikzMatch) return null;

  const tikz = tikzMatch[0];
  const nodes: DiagramNode[] = [];
  const connections: DiagramConnection[] = [];
  const existingNodeMap = new Map((existing?.nodes || []).map((node) => [node.id, node]));
  const existingConnMap = new Map(
    (existing?.connections || []).map((conn) => [`${conn.from}->${conn.to}`, conn])
  );
  const colorMap = new Map<string, string>();

  const colorRegex = /\\definecolor\{([^}]+)\}\{HTML\}\{([0-9A-Fa-f]{6})\}/g;
  let colorMatch: RegExpExecArray | null;
  while ((colorMatch = colorRegex.exec(tikz))) {
    colorMap.set(colorMatch[1].trim(), `#${colorMatch[2]}`);
  }

  const nodeRegex = /\\node\s*\(([^)]+)\)\s*\[([^\]]*)\]\s*(?:at\s*\(([^,]+),\s*([^)]+)\)\s*)?\{([\s\S]*?)\};/g;
  let nodeMatch: RegExpExecArray | null;
  while ((nodeMatch = nodeRegex.exec(tikz))) {
    const [, rawId, rawAttrs, rawX, rawY, rawLabel] = nodeMatch;
    const attrs = rawAttrs || '';
    const type: DiagramNode['type'] = attrs.includes('circle')
      ? 'circle'
      : attrs.includes('diamond')
        ? 'diamond'
        : 'rectangle';

    const x = rawX ? parseFloat(rawX) : NaN;
    const y = rawY ? parseFloat(rawY) : NaN;
    if (Number.isNaN(x) || Number.isNaN(y)) {
      continue;
    }

    const { width, height } = getDefaultDimensions(type);
    const centerX = DEFAULT_CANVAS.width / 2;
    const centerY = DEFAULT_CANVAS.height / 2;
    const nodeCenterX = x * PIXELS_PER_CM + centerX;
    const nodeCenterY = -y * PIXELS_PER_CM + centerY;

    const fillMatch = attrs.match(/fill=([^,\]]+)/);
    const drawMatch = attrs.match(/draw=([^,\]]+)/);
    const existingNode = existingNodeMap.get(rawId.trim());

    const fillColor = resolveColor(fillMatch?.[1], colorMap, existingNode?.fillColor || '#ffffff');
    const strokeColor = resolveColor(drawMatch?.[1], colorMap, existingNode?.strokeColor || '#374151');

    nodes.push({
      id: rawId.trim(),
      x: nodeCenterX - width / 2,
      y: nodeCenterY - height / 2,
      width,
      height,
      type,
      text: unescapeLabel(rawLabel || ''),
      fillColor,
      strokeColor,
      textColor: existingNode?.textColor || '#1f2937',
      strokeWidth: existingNode?.strokeWidth || 2,
    });
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const drawRegex = /\\draw\s*\[([^\]]*)\]\s*\(([^)]+)\)\s*(--|to)\s*\(([^)]+)\);/g;
  let drawMatch: RegExpExecArray | null;
  let idx = 0;
  while ((drawMatch = drawRegex.exec(tikz))) {
    const [, rawAttrs, rawFrom, , rawTo] = drawMatch;
    const from = rawFrom.trim();
    const to = rawTo.trim();
    const fromNode = nodeMap.get(from);
    const toNode = nodeMap.get(to);
    if (!fromNode || !toNode) continue;

    const attrs = rawAttrs || '';
    const existingConn = existingConnMap.get(`${from}->${to}`);
    const type: DiagramConnection['type'] = attrs.includes('->') || attrs.includes('<->')
      ? 'arrow'
      : attrs.includes('-')
        ? 'line'
        : existingConn?.type || 'arrow';
    const colorMatch = attrs.match(/draw=([^,\]]+)/);
    const fromPoint = nodeCenter(fromNode);
    const toPoint = nodeCenter(toNode);
    const connectionColor = resolveColor(colorMatch?.[1], colorMap, existingConn?.color || '#374151');

    connections.push({
      id: `conn-${from}-${to}-${idx++}`,
      from,
      to,
      fromPoint,
      toPoint,
      type,
      color: connectionColor,
      strokeWidth: existingConn?.strokeWidth || 2,
    });
  }

  if (nodes.length === 0) return null;
  return { nodes, connections, canvasWidth: DEFAULT_CANVAS.width, canvasHeight: DEFAULT_CANVAS.height };
}
