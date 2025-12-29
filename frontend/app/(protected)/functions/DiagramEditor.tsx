'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Arrow } from 'react-konva';
import { 
  Trash2, Link2, Square, CircleIcon, Diamond, 
  ArrowRight, Minus, Palette, MousePointer2, 
  Move, RotateCcw, Layers, Settings2, Sparkles
} from 'lucide-react';

interface Node {
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
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  type: 'arrow' | 'line';
  color: string;
  strokeWidth: number;
}

interface DiagramEditorProps {
  onDiagramChange: (diagramData: any) => void;
  initialData?: {
    nodes?: Node[];
    connections?: Connection[];
  } | null;
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({ onDiagramChange, initialData }) => {
  const [nodes, setNodes] = useState<Node[]>(() => initialData?.nodes ?? []);
  const [connections, setConnections] = useState<Connection[]>(() => initialData?.connections ?? []);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [nodeType, setNodeType] = useState<'rectangle' | 'circle' | 'diamond'>('rectangle');
  const [connectionType, setConnectionType] = useState<'arrow' | 'line'>('arrow');
  const [connectionColor, setConnectionColor] = useState<string>('#374151');
  const [connectionStrokeWidth, setConnectionStrokeWidth] = useState<number>(2);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [editingNodeText, setEditingNodeText] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'shapes' | 'style' | 'connect'>('shapes');
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 500, height: 350 });

  // Responsive stage size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageSize({ 
          width: Math.max(300, rect.width - 2), 
          height: Math.max(250, Math.min(400, window.innerHeight * 0.4))
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const calculateConnectionPoint = (fromNode: Node, toNode: Node, isFrom: boolean) => {
    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;
    
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx);
    
    if (isFrom) {
      if (fromNode.type === 'circle') {
        const radius = fromNode.width / 2;
        return { x: fromCenterX + Math.cos(angle) * radius, y: fromCenterY + Math.sin(angle) * radius };
      } else if (fromNode.type === 'diamond') {
        const radius = fromNode.width * 0.35;
        return { x: fromCenterX + Math.cos(angle) * radius, y: fromCenterY + Math.sin(angle) * radius };
      } else {
        const halfWidth = fromNode.width / 2;
        const halfHeight = fromNode.height / 2;
        if (Math.abs(dx) * halfHeight > Math.abs(dy) * halfWidth) {
          const x = fromCenterX + (dx > 0 ? halfWidth : -halfWidth);
          const y = fromCenterY + (dy * halfWidth) / Math.abs(dx);
          return { x, y };
        } else {
          const x = fromCenterX + (dx * halfHeight) / Math.abs(dy);
          const y = fromCenterY + (dy > 0 ? halfHeight : -halfHeight);
          return { x, y };
        }
      }
    } else {
      const reverseAngle = angle + Math.PI;
      if (toNode.type === 'circle') {
        const radius = toNode.width / 2;
        return { x: toCenterX + Math.cos(reverseAngle) * radius, y: toCenterY + Math.sin(reverseAngle) * radius };
      } else if (toNode.type === 'diamond') {
        const radius = toNode.width * 0.35;
        return { x: toCenterX + Math.cos(reverseAngle) * radius, y: toCenterY + Math.sin(reverseAngle) * radius };
      } else {
        const halfWidth = toNode.width / 2;
        const halfHeight = toNode.height / 2;
        const reverseDx = -dx;
        const reverseDy = -dy;
        if (Math.abs(reverseDx) * halfHeight > Math.abs(reverseDy) * halfWidth) {
          const x = toCenterX + (reverseDx > 0 ? halfWidth : -halfWidth);
          const y = toCenterY + (reverseDy * halfWidth) / Math.abs(reverseDx);
          return { x, y };
        } else {
          const x = toCenterX + (reverseDx * halfHeight) / Math.abs(reverseDy);
          const y = toCenterY + (reverseDy > 0 ? halfHeight : -halfHeight);
          return { x, y };
        }
      }
    }
  };

  useEffect(() => {
    if (initialData && !isInitialized) {
      if (initialData.nodes) setNodes(initialData.nodes);
      if (initialData.connections) setConnections(initialData.connections);
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  useEffect(() => {
    onDiagramChange({ nodes, connections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedNode && e.key === 'Delete') {
        e.preventDefault();
        deleteNode(selectedNode);
      }
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setSelectedConnection(null);
        setIsConnecting(false);
        setConnectionStart(null);
        setEditingNodeText(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  const addNode = (type?: 'rectangle' | 'circle' | 'diamond') => {
    const shapeType = type || nodeType;
    const newNode: Node = {
      id: `node${Date.now()}`,
      x: 50 + Math.random() * (stageSize.width - 150),
      y: 50 + Math.random() * (stageSize.height - 100),
      width: shapeType === 'circle' ? 70 : 90,
      height: shapeType === 'circle' ? 70 : 50,
      type: shapeType,
      text: 'Node',
      fillColor: '#ffffff',
      strokeColor: '#374151',
      textColor: '#1f2937',
      strokeWidth: 2,
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    setSelectedNode(newNode.id);
    onDiagramChange({ nodes: newNodes, connections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
  };

  const updateNode = (id: string, updates: Partial<Node>) => {
    const newNodes = nodes.map(node => node.id === id ? { ...node, ...updates } : node);
    setNodes(newNodes);
    onDiagramChange({ nodes: newNodes, connections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    const newConnections = connections.map(conn => conn.id === id ? { ...conn, ...updates } : conn);
    setConnections(newConnections);
    onDiagramChange({ nodes, connections: newConnections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
  };

  const deleteNode = (id: string) => {
    const newNodes = nodes.filter(node => node.id !== id);
    const newConnections = connections.filter(conn => conn.from !== id && conn.to !== id);
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNode(null);
    onDiagramChange({ nodes: newNodes, connections: newConnections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
  };

  const deleteConnection = (id: string) => {
    const newConnections = connections.filter(conn => conn.id !== id);
    setConnections(newConnections);
    setSelectedConnection(null);
    onDiagramChange({ nodes, connections: newConnections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
  };

  const handleNodeClick = (nodeId: string, e: any) => {
    e.cancelBubble = true;
    if (isConnecting) {
      if (!connectionStart) {
        setConnectionStart(nodeId);
      } else if (connectionStart !== nodeId) {
        const fromNode = nodes.find(n => n.id === connectionStart);
        const toNode = nodes.find(n => n.id === nodeId);
        if (fromNode && toNode) {
          const newConnection: Connection = {
            id: `conn${Date.now()}`,
            from: connectionStart,
            to: nodeId,
            fromPoint: calculateConnectionPoint(fromNode, toNode, true),
            toPoint: calculateConnectionPoint(fromNode, toNode, false),
            type: connectionType,
            color: connectionColor,
            strokeWidth: connectionStrokeWidth
          };
          const newConnections = [...connections, newConnection];
          setConnections(newConnections);
          onDiagramChange({ nodes, connections: newConnections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
        }
        setIsConnecting(false);
        setConnectionStart(null);
      }
    } else {
      setSelectedNode(nodeId);
      setSelectedConnection(null);
    }
  };

  const handleNodeDoubleClick = (nodeId: string, e: any) => {
    e.cancelBubble = true;
    if (!isConnecting) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setEditingNodeText(nodeId);
        setTempText(node.text);
      }
    }
  };

  const handleNodeDragEnd = (id: string, e: any) => {
    const newX = e.target.x();
    const newY = e.target.y();
    updateNode(id, { x: newX, y: newY });
    
    const draggedNode = nodes.find(n => n.id === id);
    if (draggedNode) {
      const updatedNode = { ...draggedNode, x: newX, y: newY };
      const newConnections = connections.map(conn => {
        if (conn.from === id || conn.to === id) {
          const fromNode = conn.from === id ? updatedNode : nodes.find(n => n.id === conn.from);
          const toNode = conn.to === id ? updatedNode : nodes.find(n => n.id === conn.to);
          if (fromNode && toNode) {
            return {
              ...conn,
              fromPoint: calculateConnectionPoint(fromNode, toNode, true),
              toPoint: calculateConnectionPoint(fromNode, toNode, false)
            };
          }
        }
        return conn;
      });
      setConnections(newConnections);
      onDiagramChange({ nodes, connections: newConnections, canvasWidth: stageSize.width, canvasHeight: stageSize.height });
    }
  };

  const clearAll = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setSelectedConnection(null);
    onDiagramChange({ nodes: [], connections: [], canvasWidth: stageSize.width, canvasHeight: stageSize.height });
  };

  const renderNode = (node: Node) => {
    const isSelected = selectedNode === node.id;
    const isConnectingFrom = connectionStart === node.id;
    const strokeColor = isSelected ? '#FA5F55' : isConnectingFrom ? '#22c55e' : node.strokeColor;
    const strokeWidth = isSelected || isConnectingFrom ? Math.max(node.strokeWidth, 3) : node.strokeWidth;

    const commonProps = {
      draggable: !isConnecting,
      onClick: (e: any) => handleNodeClick(node.id, e),
      onDblClick: (e: any) => handleNodeDoubleClick(node.id, e),
      onDragEnd: (e: any) => handleNodeDragEnd(node.id, e),
    };

    const textProps = {
      text: node.text,
      fontSize: 11,
      fontFamily: 'Inter, system-ui, sans-serif',
      fill: node.textColor,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
    };

    switch (node.type) {
      case 'circle':
        return (
          <React.Fragment key={node.id}>
            <Circle
              x={node.x + node.width / 2}
              y={node.y + node.height / 2}
              radius={node.width / 2}
              fill={node.fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              shadowColor="rgba(0,0,0,0.1)"
              shadowBlur={isSelected ? 8 : 4}
              shadowOffset={{ x: 0, y: 2 }}
              {...commonProps}
            />
            <Text x={node.x + 8} y={node.y + node.height / 2 - 6} width={node.width - 16} {...textProps} />
          </React.Fragment>
        );
      case 'diamond':
        return (
          <React.Fragment key={node.id}>
            <Rect
              x={node.x + node.width / 2}
              y={node.y + node.height / 2}
              width={node.width * 0.7}
              height={node.height * 0.7}
              fill={node.fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              rotation={45}
              offsetX={(node.width * 0.7) / 2}
              offsetY={(node.height * 0.7) / 2}
              shadowColor="rgba(0,0,0,0.1)"
              shadowBlur={isSelected ? 8 : 4}
              {...commonProps}
            />
            <Text x={node.x + 8} y={node.y + node.height / 2 - 6} width={node.width - 16} {...textProps} fontSize={10} />
          </React.Fragment>
        );
      default:
        return (
          <React.Fragment key={node.id}>
            <Rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={node.fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              cornerRadius={6}
              shadowColor="rgba(0,0,0,0.1)"
              shadowBlur={isSelected ? 8 : 4}
              shadowOffset={{ x: 0, y: 2 }}
              {...commonProps}
            />
            <Text x={node.x + 6} y={node.y + node.height / 2 - 6} width={node.width - 12} {...textProps} />
          </React.Fragment>
        );
    }
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  const selectedConnectionData = selectedConnection ? connections.find(c => c.id === selectedConnection) : null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FA5F55] to-[#FF8066] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Diagram Editor</h3>
            <p className="text-xs text-gray-500">{nodes.length} nodes • {connections.length} connections</p>
          </div>
        </div>
        {nodes.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Toolbar Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {[
          { id: 'shapes', icon: Layers, label: 'Shapes' },
          { id: 'connect', icon: Link2, label: 'Connect' },
          { id: 'style', icon: Settings2, label: 'Properties' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-100">
        {activeTab === 'shapes' && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addNode('rectangle')}
              className="group flex flex-col items-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#FA5F55] hover:shadow-md hover:shadow-[#FA5F55]/10 transition-all"
            >
              <div className="w-10 h-10 bg-gray-50 group-hover:bg-[#FA5F55]/10 rounded-lg flex items-center justify-center transition-colors">
                <Square className="w-5 h-5 text-gray-600 group-hover:text-[#FA5F55] transition-colors" />
              </div>
              <span className="text-xs font-medium text-gray-700">Rectangle</span>
            </button>
            <button
              onClick={() => addNode('circle')}
              className="group flex flex-col items-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#FA5F55] hover:shadow-md hover:shadow-[#FA5F55]/10 transition-all"
            >
              <div className="w-10 h-10 bg-gray-50 group-hover:bg-[#FA5F55]/10 rounded-lg flex items-center justify-center transition-colors">
                <CircleIcon className="w-5 h-5 text-gray-600 group-hover:text-[#FA5F55] transition-colors" />
              </div>
              <span className="text-xs font-medium text-gray-700">Circle</span>
            </button>
            <button
              onClick={() => addNode('diamond')}
              className="group flex flex-col items-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#FA5F55] hover:shadow-md hover:shadow-[#FA5F55]/10 transition-all"
            >
              <div className="w-10 h-10 bg-gray-50 group-hover:bg-[#FA5F55]/10 rounded-lg flex items-center justify-center transition-colors">
                <Diamond className="w-5 h-5 text-gray-600 group-hover:text-[#FA5F55] transition-colors" />
              </div>
              <span className="text-xs font-medium text-gray-700">Diamond</span>
            </button>
          </div>
        )}

        {activeTab === 'connect' && (
          <div className="space-y-3">
            {nodes.length < 2 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Add at least 2 nodes</p>
                <p className="text-xs text-gray-400 mt-1">Then you can connect them</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConnectionType('arrow')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      connectionType === 'arrow' 
                        ? 'bg-[#FA5F55] text-white shadow-md shadow-[#FA5F55]/25' 
                        : 'bg-white border border-gray-200 hover:border-[#FA5F55] text-gray-700'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Arrow
                  </button>
                  <button
                    onClick={() => setConnectionType('line')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      connectionType === 'line' 
                        ? 'bg-[#FA5F55] text-white shadow-md shadow-[#FA5F55]/25' 
                        : 'bg-white border border-gray-200 hover:border-[#FA5F55] text-gray-700'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    Line
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={connectionColor}
                        onChange={(e) => setConnectionColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs text-gray-600 font-mono">{connectionColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Thickness</label>
                    <select
                      value={connectionStrokeWidth}
                      onChange={(e) => setConnectionStrokeWidth(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#FA5F55] outline-none transition-colors"
                    >
                      {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>{w}px</option>)}
                    </select>
                  </div>
                </div>

                {!isConnecting ? (
                  <button
                    onClick={() => { setIsConnecting(true); setConnectionStart(null); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FA5F55] to-[#FF8066] text-white rounded-xl hover:shadow-lg hover:shadow-[#FA5F55]/25 transition-all text-sm font-medium"
                  >
                    <Link2 className="w-4 h-4" />
                    Start Connecting Nodes
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${!connectionStart ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-xs font-medium text-emerald-700">
                          {!connectionStart ? 'Click the first node' : 'Now click the second node'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsConnecting(false); setConnectionStart(null); }}
                      className="w-full px-3 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'style' && selectedNodeData && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Text Label</label>
              <input
                type="text"
                value={selectedNodeData.text}
                onChange={(e) => updateNode(selectedNode!, { text: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 outline-none transition-all"
                placeholder="Enter text..."
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Fill', key: 'fillColor' },
                { label: 'Border', key: 'strokeColor' },
                { label: 'Text', key: 'textColor' },
              ].map((item) => (
                <div key={item.key} className="bg-white p-2 rounded-xl border border-gray-100">
                  <label className="text-[10px] text-gray-500 mb-1 block text-center">{item.label}</label>
                  <input
                    type="color"
                    value={(selectedNodeData as any)[item.key]}
                    onChange={(e) => updateNode(selectedNode!, { [item.key]: e.target.value })}
                    className="w-full h-8 rounded-lg cursor-pointer border-0"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Border Width</label>
                <select
                  value={selectedNodeData.strokeWidth}
                  onChange={(e) => updateNode(selectedNode!, { strokeWidth: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#FA5F55] outline-none"
                >
                  <option value={0}>None</option>
                  {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>{w}px</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Shape Type</label>
                <select
                  value={selectedNodeData.type}
                  onChange={(e) => updateNode(selectedNode!, { type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#FA5F55] outline-none"
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => deleteNode(selectedNode!)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-xs font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Node
            </button>
          </div>
        )}

        {activeTab === 'style' && selectedConnectionData && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Type</label>
                <select
                  value={selectedConnectionData.type}
                  onChange={(e) => updateConnection(selectedConnection!, { type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#FA5F55] outline-none"
                >
                  <option value="arrow">Arrow</option>
                  <option value="line">Line</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Width</label>
                <select
                  value={selectedConnectionData.strokeWidth}
                  onChange={(e) => updateConnection(selectedConnection!, { strokeWidth: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#FA5F55] outline-none"
                >
                  {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>{w}px</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-xl border border-gray-100">
              <label className="text-xs text-gray-500 mb-2 block">Connection Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedConnectionData.color}
                  onChange={(e) => updateConnection(selectedConnection!, { color: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0"
                />
                <span className="text-xs text-gray-600 font-mono">{selectedConnectionData.color}</span>
              </div>
            </div>
            
            <button
              onClick={() => deleteConnection(selectedConnection!)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-xs font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Connection
            </button>
          </div>
        )}

        {activeTab === 'style' && !selectedNodeData && !selectedConnectionData && (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-2xl flex items-center justify-center">
              <MousePointer2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No selection</p>
            <p className="text-xs text-gray-400 mt-1">Click a node or connection to edit</p>
          </div>
        )}
      </div>

      {/* Text Edit Modal */}
      {editingNodeText && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl animate-in slide-in-from-top-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateNode(editingNodeText, { text: tempText });
                  setEditingNodeText(null);
                }
                if (e.key === 'Escape') setEditingNodeText(null);
              }}
              className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-xl focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 outline-none bg-white"
              autoFocus
              placeholder="Enter node text..."
            />
            <button
              onClick={() => { updateNode(editingNodeText, { text: tempText }); setEditingNodeText(null); }}
              className="px-4 py-2 bg-[#FA5F55] text-white rounded-xl text-sm font-medium hover:bg-[#e54d43] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
        style={{ minHeight: '320px' }}
      >
        {/* Canvas Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Canvas</span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{stageSize.width} × {stageSize.height}</span>
          </div>
        </div>

        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          onClick={(e) => {
            if (e.target === e.target.getStage()) {
              setSelectedNode(null);
              setSelectedConnection(null);
            }
          }}
          className="mt-8"
          style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' }}
        >
          <Layer>
            {/* Dot Grid pattern */}
            {Array.from({ length: Math.ceil(stageSize.width / 20) }).map((_, i) =>
              Array.from({ length: Math.ceil((stageSize.height - 32) / 20) }).map((_, j) => (
                <Circle key={`dot${i}-${j}`} x={i * 20 + 10} y={j * 20 + 10} radius={1} fill="#d1d5db" />
              ))
            )}
            
            {/* Connections */}
            {connections.map(conn => (
              <Arrow
                key={conn.id}
                points={[conn.fromPoint.x, conn.fromPoint.y, conn.toPoint.x, conn.toPoint.y]}
                stroke={selectedConnection === conn.id ? '#FA5F55' : conn.color}
                strokeWidth={selectedConnection === conn.id ? Math.max(conn.strokeWidth, 3) : conn.strokeWidth}
                fill={selectedConnection === conn.id ? '#FA5F55' : conn.color}
                pointerLength={conn.type === 'arrow' ? 10 : 0}
                pointerWidth={conn.type === 'arrow' ? 10 : 0}
                onClick={(e) => { e.cancelBubble = true; setSelectedConnection(conn.id); setSelectedNode(null); }}
                onDblClick={(e) => { e.cancelBubble = true; deleteConnection(conn.id); }}
              />
            ))}
            
            {/* Nodes */}
            {nodes.map(renderNode)}
          </Layer>
        </Stage>

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50/95 to-white/95 pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center shadow-sm">
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Start Creating</p>
              <p className="text-xs text-gray-500 max-w-[180px]">Add shapes from the toolbar above to build your diagram</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tips */}
      <div className="flex items-center justify-center gap-4 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5" /> Drag to move
        </span>
        <span className="h-3 w-px bg-gray-300" />
        <span className="flex items-center gap-1.5">
          <MousePointer2 className="w-3.5 h-3.5" /> Double-click to edit text
        </span>
        <span className="h-3 w-px bg-gray-300" />
        <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium">Del</kbd> to delete</span>
      </div>
    </div>
  );
};

export default DiagramEditor;
