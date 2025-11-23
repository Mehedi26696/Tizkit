'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Arrow } from 'react-konva';

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
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({ onDiagramChange }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [nodeType, setNodeType] = useState<'rectangle' | 'circle' | 'diamond'>('rectangle');
  const [connectionType, setConnectionType] = useState<'arrow' | 'line'>('arrow');
  const [connectionColor, setConnectionColor] = useState<string>('#000000');
  const [connectionStrokeWidth, setConnectionStrokeWidth] = useState<number>(2);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [editingNodeText, setEditingNodeText] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const stageRef = useRef<any>(null);

  const calculateConnectionPoint = (fromNode: Node, toNode: Node, isFrom: boolean) => {
    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;
    
    // Calculate angle between centers
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx);
    
    if (isFrom) {
      // Calculate connection point on fromNode surface
      if (fromNode.type === 'circle') {
        const radius = fromNode.width / 2;
        return {
          x: fromCenterX + Math.cos(angle) * radius,
          y: fromCenterY + Math.sin(angle) * radius
        };
      } else if (fromNode.type === 'diamond') {
        // For diamond, approximate as circle for simplicity
        const radius = fromNode.width * 0.35; // Slightly smaller than actual diamond
        return {
          x: fromCenterX + Math.cos(angle) * radius,
          y: fromCenterY + Math.sin(angle) * radius
        };
      } else {
        // Rectangle - calculate edge intersection
        const halfWidth = fromNode.width / 2;
        const halfHeight = fromNode.height / 2;
        
        if (Math.abs(dx) * halfHeight > Math.abs(dy) * halfWidth) {
          // Intersect with left or right edge
          const x = fromCenterX + (dx > 0 ? halfWidth : -halfWidth);
          const y = fromCenterY + (dy * halfWidth) / Math.abs(dx);
          return { x, y };
        } else {
          // Intersect with top or bottom edge
          const x = fromCenterX + (dx * halfHeight) / Math.abs(dy);
          const y = fromCenterY + (dy > 0 ? halfHeight : -halfHeight);
          return { x, y };
        }
      }
    } else {
      // Calculate connection point on toNode surface
      const reverseAngle = angle + Math.PI; // Opposite direction
      
      if (toNode.type === 'circle') {
        const radius = toNode.width / 2;
        return {
          x: toCenterX + Math.cos(reverseAngle) * radius,
          y: toCenterY + Math.sin(reverseAngle) * radius
        };
      } else if (toNode.type === 'diamond') {
        const radius = toNode.width * 0.35;
        return {
          x: toCenterX + Math.cos(reverseAngle) * radius,
          y: toCenterY + Math.sin(reverseAngle) * radius
        };
      } else {
        // Rectangle
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

  // Initial trigger when component mounts
  useEffect(() => {
    onDiagramChange({ nodes, connections });
  }, []); // Empty dependency array to run only on mount

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedNode && e.key === 'Delete') {
        e.preventDefault();
        if (window.confirm('Delete the selected node?')) {
          deleteNode(selectedNode);
        }
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

  const addNode = () => {
    const newNode: Node = {
      id: `node${Date.now()}`,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      width: nodeType === 'circle' ? 80 : 100,
      height: nodeType === 'circle' ? 80 : 60,
      type: nodeType,
      text: 'New Node',
      fillColor: '#f5f5f5',
      strokeColor: '#666666',
      textColor: '#000000',
      strokeWidth: 2,
    };
    
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    onDiagramChange({ nodes: newNodes, connections });
  };

  const updateNode = (id: string, updates: Partial<Node>) => {
    const newNodes = nodes.map(node => 
      node.id === id ? { ...node, ...updates } : node
    );
    setNodes(newNodes);
    onDiagramChange({ nodes: newNodes, connections });
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    const newConnections = connections.map(conn => 
      conn.id === id ? { ...conn, ...updates } : conn
    );
    setConnections(newConnections);
    onDiagramChange({ nodes, connections: newConnections });
  };

  const deleteNode = (id: string) => {
    const newNodes = nodes.filter(node => node.id !== id);
    const newConnections = connections.filter(conn => conn.from !== id && conn.to !== id);
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNode(null);
    onDiagramChange({ nodes: newNodes, connections: newConnections });
  };

  const handleNodeClick = (nodeId: string, e: any) => {
    e.cancelBubble = true; // Stop event propagation
    if (isConnecting) {
      if (!connectionStart) {
        setConnectionStart(nodeId);
      } else if (connectionStart !== nodeId) {
        // Create connection
        const fromNode = nodes.find(n => n.id === connectionStart);
        const toNode = nodes.find(n => n.id === nodeId);
        
        if (fromNode && toNode) {
          const fromPoint = calculateConnectionPoint(fromNode, toNode, true);
          const toPoint = calculateConnectionPoint(fromNode, toNode, false);
          
          const newConnection: Connection = {
            id: `conn${Date.now()}`,
            from: connectionStart,
            to: nodeId,
            fromPoint,
            toPoint,
            type: connectionType,
            color: connectionColor,
            strokeWidth: connectionStrokeWidth
          };
          
          const newConnections = [...connections, newConnection];
          setConnections(newConnections);
          onDiagramChange({ nodes, connections: newConnections });
        }
        
        setIsConnecting(false);
        setConnectionStart(null);
      }
    } else {
      setSelectedNode(nodeId);
    }
  };

  const handleNodeRightClick = (nodeId: string, e: any) => {
    e.evt.preventDefault(); // Prevent context menu
    e.cancelBubble = true; // Stop event propagation
    if (window.confirm('Delete this node?')) {
      deleteNode(nodeId);
    }
  };

  const handleNodeDoubleClick = (nodeId: string, e: any) => {
    e.cancelBubble = true; // Stop event propagation
    if (!isConnecting) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setEditingNodeText(nodeId);
        setTempText(node.text);
      }
    }
  };

  const finishEditingText = () => {
    if (editingNodeText) {
      updateNode(editingNodeText, { text: tempText });
      setEditingNodeText(null);
      setTempText('');
    }
  };

  const cancelEditingText = () => {
    setEditingNodeText(null);
    setTempText('');
  };

  const deleteConnection = (connectionId: string) => {
    const newConnections = connections.filter(conn => conn.id !== connectionId);
    setConnections(newConnections);
    setSelectedConnection(null);
    onDiagramChange({ nodes, connections: newConnections });
  };

  const startConnecting = () => {
    setIsConnecting(true);
    setConnectionStart(null);
    setSelectedNode(null);
  };

  const cancelConnecting = () => {
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const removeAllBorders = () => {
    const newNodes = nodes.map(node => ({ ...node, strokeWidth: 0 }));
    setNodes(newNodes);
    onDiagramChange({ nodes: newNodes, connections });
  };

  const clearAll = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setSelectedConnection(null);
    setIsConnecting(false);
    setConnectionStart(null);
    setEditingNodeText(null);
    onDiagramChange({ nodes: [], connections: [] });
  };

  const handleNodeDragEnd = (id: string, e: any) => {
    const newX = e.target.x();
    const newY = e.target.y();
    updateNode(id, { x: newX, y: newY });
    
    // Update connections with proper connection points
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
      onDiagramChange({ nodes, connections: newConnections });
    }
  };

  const renderNode = (node: Node) => {
    const isSelected = selectedNode === node.id;
    const isConnectingFrom = connectionStart === node.id;
    const isEditing = editingNodeText === node.id;
    const isHovered = hoveredNode === node.id;
    
    const strokeColor = isSelected ? '#ff4444' : isConnectingFrom ? '#44ff44' : node.strokeColor;
    const strokeWidth = isSelected || isConnectingFrom ? Math.max(node.strokeWidth, 3) : node.strokeWidth;
    const showBorder = strokeWidth > 0;

    switch (node.type) {
      case 'circle':
        return (
          <React.Fragment key={node.id}>
            <Circle
              x={node.x + node.width / 2}
              y={node.y + node.height / 2}
              radius={node.width / 2}
              fill={node.fillColor}
              stroke={showBorder ? strokeColor : undefined}
              strokeWidth={showBorder ? strokeWidth : 0}
              draggable={!isConnecting}
              onClick={(e) => handleNodeClick(node.id, e)}
              onDblClick={(e) => handleNodeDoubleClick(node.id, e)}
              onContextMenu={(e) => handleNodeRightClick(node.id, e)}
              onDragEnd={(e) => handleNodeDragEnd(node.id, e)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            />
            {!isEditing && (
              <Text
                x={node.x + 10}
                y={node.y + node.height / 2 - 8}
                width={node.width - 20}
                height={16}
                text={node.text}
                fontSize={11}
                fontFamily="Arial"
                fill={node.textColor}
                align="center"
                verticalAlign="middle"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />
            )}
            {isHovered && !isConnecting && !isEditing && (
              <React.Fragment>
                {/* Background Color Control */}
                <Rect
                  x={node.x + node.width - 25}
                  y={node.y + 5}
                  width={20}
                  height={20}
                  fill="white"
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <Text
                  x={node.x + node.width - 22}
                  y={node.y + 8}
                  width={14}
                  height={14}
                  text="🎨"
                  fontSize={10}
                  align="center"
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = node.fillColor;
                    input.onchange = (e) => updateNode(node.id, { fillColor: (e.target as HTMLInputElement).value });
                    input.click();
                  }}
                />
                
                {/* Text Color Control */}
                <Rect
                  x={node.x + node.width - 25}
                  y={node.y + 30}
                  width={20}
                  height={20}
                  fill="white"
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <Text
                  x={node.x + node.width - 22}
                  y={node.y + 33}
                  width={14}
                  height={14}
                  text="T"
                  fontSize={12}
                  fontStyle="bold"
                  fill={node.textColor}
                  align="center"
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = node.textColor;
                    input.onchange = (e) => updateNode(node.id, { textColor: (e.target as HTMLInputElement).value });
                    input.click();
                  }}
                />
              </React.Fragment>
            )}
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
              stroke={showBorder ? strokeColor : undefined}
              strokeWidth={showBorder ? strokeWidth : 0}
              rotation={45}
              offsetX={(node.width * 0.7) / 2}
              offsetY={(node.height * 0.7) / 2}
              draggable={!isConnecting}
              onClick={(e) => handleNodeClick(node.id, e)}
              onDblClick={(e) => handleNodeDoubleClick(node.id, e)}
              onContextMenu={(e) => handleNodeRightClick(node.id, e)}
              onDragEnd={(e) => handleNodeDragEnd(node.id, e)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            />
            {!isEditing && (
              <Text
                x={node.x + 10}
                y={node.y + node.height / 2 - 8}
                width={node.width - 20}
                height={16}
                text={node.text}
                fontSize={10}
                fontFamily="Arial"
                fill={node.textColor}
                align="center"
                verticalAlign="middle"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />
            )}
            {isHovered && !isConnecting && !isEditing && (
              <React.Fragment>
                {/* Background Color Control */}
                <Rect
                  x={node.x + node.width - 25}
                  y={node.y + 5}
                  width={20}
                  height={20}
                  fill="white"
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <Text
                  x={node.x + node.width - 22}
                  y={node.y + 8}
                  width={14}
                  height={14}
                  text="🎨"
                  fontSize={10}
                  align="center"
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = node.fillColor;
                    input.onchange = (e) => updateNode(node.id, { fillColor: (e.target as HTMLInputElement).value });
                    input.click();
                  }}
                />
                
                {/* Text Color Control */}
                <Rect
                  x={node.x + node.width - 25}
                  y={node.y + 30}
                  width={20}
                  height={20}
                  fill="white"
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <Text
                  x={node.x + node.width - 22}
                  y={node.y + 33}
                  width={14}
                  height={14}
                  text="T"
                  fontSize={12}
                  fontStyle="bold"
                  fill={node.textColor}
                  align="center"
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = node.textColor;
                    input.onchange = (e) => updateNode(node.id, { textColor: (e.target as HTMLInputElement).value });
                    input.click();
                  }}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        );
      default: // rectangle
        return (
          <React.Fragment key={node.id}>
            <Rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={node.fillColor}
              stroke={showBorder ? strokeColor : undefined}
              strokeWidth={showBorder ? strokeWidth : 0}
              draggable={!isConnecting}
              onClick={(e) => handleNodeClick(node.id, e)}
              onDblClick={(e) => handleNodeDoubleClick(node.id, e)}
              onContextMenu={(e) => handleNodeRightClick(node.id, e)}
              onDragEnd={(e) => handleNodeDragEnd(node.id, e)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            />
            {!isEditing && (
              <Text
                x={node.x + 8}
                y={node.y + node.height / 2 - 8}
                width={node.width - 16}
                height={16}
                text={node.text}
                fontSize={12}
                fontFamily="Arial"
                fill={node.textColor}
                align="center"
                verticalAlign="middle"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />
            )}
            {isHovered && !isConnecting && !isEditing && (
              <React.Fragment>
                {/* Background Color Control */}
                <Rect
                  x={node.x + node.width - 25}
                  y={node.y + 5}
                  width={20}
                  height={20}
                  fill="white"
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <Text
                  x={node.x + node.width - 22}
                  y={node.y + 8}
                  width={14}
                  height={14}
                  text="🎨"
                  fontSize={10}
                  align="center"
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = node.fillColor;
                    input.onchange = (e) => updateNode(node.id, { fillColor: (e.target as HTMLInputElement).value });
                    input.click();
                  }}
                />
                
                {/* Text Color Control */}
                <Rect
                  x={node.x + node.width - 25}
                  y={node.y + 30}
                  width={20}
                  height={20}
                  fill="white"
                  stroke="#ccc"
                  strokeWidth={1}
                />
                <Text
                  x={node.x + node.width - 22}
                  y={node.y + 33}
                  width={14}
                  height={14}
                  text="T"
                  fontSize={12}
                  fontStyle="bold"
                  fill={node.textColor}
                  align="center"
                  onClick={(e) => {
                    e.cancelBubble = true;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = node.textColor;
                    input.onchange = (e) => updateNode(node.id, { textColor: (e.target as HTMLInputElement).value });
                    input.click();
                  }}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        );
    }
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  const selectedConnectionData = selectedConnection ? connections.find(c => c.id === selectedConnection) : null;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4 flex gap-2 flex-wrap">
        <select
          value={nodeType}
          onChange={(e) => setNodeType(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="diamond">Diamond</option>
        </select>
        
        <button
          onClick={addNode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Node
        </button>

        <button
          onClick={clearAll}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear All
        </button>

        <button
          onClick={removeAllBorders}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={nodes.length === 0}
        >
          Remove Borders
        </button>

        <div className="border-l border-gray-300 pl-2 ml-2">
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded mr-2"
            disabled={nodes.length < 2}
          >
            <option value="arrow">Arrow</option>
            <option value="line">Line</option>
          </select>

          <input
            type="color"
            value={connectionColor}
            onChange={(e) => setConnectionColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded mr-2"
            title="Connection Color"
            disabled={nodes.length < 2}
          />

          <select
            value={connectionStrokeWidth}
            onChange={(e) => setConnectionStrokeWidth(Number(e.target.value))}
            className="px-2 py-2 border border-gray-300 rounded mr-2 text-sm"
            disabled={nodes.length < 2}
          >
            <option value={1}>1px</option>
            <option value={2}>2px</option>
            <option value={3}>3px</option>
            <option value={4}>4px</option>
            <option value={5}>5px</option>
          </select>
          
          {!isConnecting ? (
            <button
              onClick={startConnecting}
              disabled={nodes.length < 2}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Connect Nodes
            </button>
          ) : (
            <button
              onClick={cancelConnecting}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {isConnecting && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">
            {!connectionStart 
              ? "Click on the first node to start connecting" 
              : "Click on the second node to complete the connection"
            }
          </p>
        </div>
      )}

      {editingNodeText && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded">
          <h4 className="text-sm font-medium mb-2">Edit Node Text:</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishEditingText();
                if (e.key === 'Escape') cancelEditingText();
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
              autoFocus
            />
            <button
              onClick={finishEditingText}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ✓
            </button>
            <button
              onClick={cancelEditingText}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="border border-gray-300 rounded relative">
            <Stage 
              width={600} 
              height={400} 
              ref={stageRef}
              onClick={(e) => {
                // Check if we clicked on empty canvas
                if (e.target === e.target.getStage()) {
                  setSelectedNode(null);
                  setSelectedConnection(null);
                }
              }}
            >
              <Layer>
                {nodes.map(renderNode)}
                {connections.map(conn => {
                  const isConnectionSelected = selectedConnection === conn.id;
                  const connectionColor = isConnectionSelected ? '#ff4444' : conn.color;
                  const connectionStrokeWidth = isConnectionSelected ? Math.max(conn.strokeWidth, 3) : conn.strokeWidth;
                  
                  return conn.type === 'arrow' ? (
                    <Arrow
                      key={conn.id}
                      points={[conn.fromPoint.x, conn.fromPoint.y, conn.toPoint.x, conn.toPoint.y]}
                      stroke={connectionColor}
                      strokeWidth={connectionStrokeWidth}
                      fill={connectionColor}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        setSelectedConnection(conn.id);
                        setSelectedNode(null);
                      }}
                      onDblClick={(e) => {
                        e.cancelBubble = true;
                        if (window.confirm('Delete this connection?')) {
                          deleteConnection(conn.id);
                        }
                      }}
                    />
                  ) : (
                    <Arrow
                      key={conn.id}
                      points={[conn.fromPoint.x, conn.fromPoint.y, conn.toPoint.x, conn.toPoint.y]}
                      stroke={connectionColor}
                      strokeWidth={connectionStrokeWidth}
                      fill={connectionColor}
                      pointerLength={0}
                      pointerWidth={0}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        setSelectedConnection(conn.id);
                        setSelectedNode(null);
                      }}
                      onDblClick={(e) => {
                        e.cancelBubble = true;
                        if (window.confirm('Delete this connection?')) {
                          deleteConnection(conn.id);
                        }
                      }}
                    />
                  );
                })}
              </Layer>
            </Stage>
            
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
                <div className="text-center text-gray-600">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-lg font-medium mb-2">No Nodes Yet</p>
                  <p className="text-sm">Click "Add Node" to start building your diagram</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>• Double-click nodes to edit text</p>
            <p>• Right-click nodes to delete them</p>
            <p>• Hover over nodes to see color controls (🎨 for background, T for text)</p>
            <p>• Click nodes to select and use properties panel</p>
            <p>• Set border width to 0 for borderless nodes</p>
            <p>• Click connections to select and customize</p>
            <p>• Double-click connections to delete them</p>
            <p>• Drag nodes to reposition</p>
            {nodes.length < 2 && (
              <p className="text-orange-600">• Add at least 2 nodes to enable connections</p>
            )}
          </div>
        </div>

        {selectedNodeData && (
          <div className="w-64 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-3">Node Properties</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Text:</label>
              <input
                type="text"
                value={selectedNodeData.text}
                onChange={(e) => updateNode(selectedNode!, { text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Type:</label>
              <select
                value={selectedNodeData.type}
                onChange={(e) => updateNode(selectedNode!, { type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Fill Color:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedNodeData.fillColor}
                  onChange={(e) => updateNode(selectedNode!, { fillColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500">{selectedNodeData.fillColor}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Border Color:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedNodeData.strokeColor}
                  onChange={(e) => updateNode(selectedNode!, { strokeColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500">{selectedNodeData.strokeColor}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Text Color:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedNodeData.textColor}
                  onChange={(e) => updateNode(selectedNode!, { textColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500">{selectedNodeData.textColor}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Border Width:</label>
              <select
                value={selectedNodeData.strokeWidth}
                onChange={(e) => updateNode(selectedNode!, { strokeWidth: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value={0}>No Border</option>
                <option value={1}>1px</option>
                <option value={2}>2px</option>
                <option value={3}>3px</option>
                <option value={4}>4px</option>
                <option value={5}>5px</option>
                <option value={6}>6px</option>
              </select>
            </div>

            <button
              onClick={() => deleteNode(selectedNode!)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Node
            </button>
          </div>
        )}

        {selectedConnectionData && (
          <div className="w-64 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-3">Connection Properties</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Type:</label>
              <select
                value={selectedConnectionData.type}
                onChange={(e) => updateConnection(selectedConnection!, { type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="arrow">Arrow</option>
                <option value="line">Line</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Color:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedConnectionData.color}
                  onChange={(e) => updateConnection(selectedConnection!, { color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500">{selectedConnectionData.color}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Stroke Width:</label>
              <select
                value={selectedConnectionData.strokeWidth}
                onChange={(e) => updateConnection(selectedConnection!, { strokeWidth: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value={1}>1px</option>
                <option value={2}>2px</option>
                <option value={3}>3px</option>
                <option value={4}>4px</option>
                <option value={5}>5px</option>
                <option value={6}>6px</option>
              </select>
            </div>

            <button
              onClick={() => deleteConnection(selectedConnection!)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Connection
            </button>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
        💡 <strong>Tip:</strong> Hover over nodes to see quick color controls (🎨 for background, T for text color). Use the properties panel for more detailed customization. Changes are automatically reflected in the LaTeX code.
      </div>
    </div>
  );
};

export default DiagramEditor;