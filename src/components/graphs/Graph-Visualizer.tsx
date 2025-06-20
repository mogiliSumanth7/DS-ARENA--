import React, { useEffect, useRef, useState } from "react";

// Types
type GraphNode = {
  value: number;
  x: number;
  y: number;
  id: number;
  neighbors: GraphNode[];
  vx: number;
  vy: number;
  isFixed: boolean;
};

type GraphEdge = {
  source: GraphNode;
  target: GraphNode;
  id: string;
  weight: number;
};

type GraphType =
  | "Null Graph"
  | "Directed Graph"
  | "Undirected Graph"
  | "Weighted Graph"
  | "Unweighted Graph"
  | "Connected Graph"
  | "Disconnected Graph"
  | "Strongly Connected Graph"
  | "Weakly Connected Graph"
  | "Cyclic Graph"
  | "Acyclic Graph"
  | "Complete Graph"
  | "Sparse Graph"
  | "Dense Graph"
  | "Tree"
  | "Forest"
  | "Bipartite Graph"
  | "Multigraph"
  | "Pseudograph"
  | "Planar Graph";

// Helper functions
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Main Component
const GraphVisualizer: React.FC = () => {
  // State
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [nodeId, setNodeId] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(300);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [isDirected, setIsDirected] = useState(false);
  const [stepEntries, setStepEntries] = useState<string[]>([
    `🎯 Select an operation to begin!\n\nBFS uses Queue (FIFO - First In, First Out)\nDFS uses Stack (LIFO - Last In, First Out)\nAdjacency Matrix shows edge weights (0 = no edge)`,
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [layoutShape, setLayoutShape] = useState("circle");
  const [darkMode, setDarkMode] = useState(true);
  const [nodeValue, setNodeValue] = useState("");
  const [edgeWeight, setEdgeWeight] = useState("");
  const [sourceValue, setSourceValue] = useState("");
  const [targetValue, setTargetValue] = useState("");

  // Input refs
  const nodeValueRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  // SVG and container refs
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Constants
  const nodeSize = 40;
  const maxNodes = 15;

  // Effects
  useEffect(() => {
    // On mount, load dark mode preference
    const savedDark = localStorage.getItem("darkMode");
    if (savedDark !== null) setDarkMode(savedDark === "true");
    // On resize, reposition nodes
    const handleResize = debounce(() => {
      if (nodes.length) {
        repositionNodes();
        renderGraph();
        // updateAdjacencyMatrix(); // handled in renderGraph
      }
    }, 100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line
  }, [nodes, layoutShape, isDirected]);

  // Utility
  function sleep(ms: number) {
    return new Promise<void>((resolve) => {
      if (isPaused) {
        const checkPause = () => {
          if (!isPaused) resolve();
          else setTimeout(checkPause, 100);
        };
        setTimeout(checkPause, 100);
      } else {
        setTimeout(resolve, ms);
      }
    });
  }

  // Node/Edge helpers
  function getNodeByValue(value: number) {
    return nodes.find((n) => n.value === value);
  }

  function getEdge(source: GraphNode, target: GraphNode) {
    return edges.find(
      (e) =>
        (e.source === source && e.target === target) ||
        (!isDirected && e.source === target && e.target === source)
    );
  }

  // Graph Analysis
  function analyzeGraph(): GraphType[] {
    if (nodes.length === 0) return ["Null Graph"];
    const types: GraphType[] = [];
    types.push(isDirected ? "Directed Graph" : "Undirected Graph");
    const isWeighted = edges.some((e) => e.weight !== 1);
    types.push(isWeighted ? "Weighted Graph" : "Unweighted Graph");
    // Connected/Disconnected
    if (nodes.length > 0) {
      const visited = new Set<GraphNode>();
      function dfsConnect(node: GraphNode) {
        visited.add(node);
        node.neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor)) dfsConnect(neighbor);
        });
      }
      dfsConnect(nodes[0]);
      types.push(
        visited.size === nodes.length ? "Connected Graph" : "Disconnected Graph"
      );
    }
    // Strongly Connected (for directed)
    if (isDirected && nodes.length > 0) {
      let isStronglyConnected = true;
      for (const startNode of nodes) {
        const visited = new Set<GraphNode>();
        function dfsStrong(node: GraphNode) {
          visited.add(node);
          node.neighbors.forEach((neighbor) => {
            if (!visited.has(neighbor)) dfsStrong(neighbor);
          });
        }
        dfsStrong(startNode);
        if (visited.size !== nodes.length) {
          isStronglyConnected = false;
          break;
        }
      }
      types.push(
        isStronglyConnected ? "Strongly Connected Graph" : "Weakly Connected Graph"
      );
    }
    // Cyclic/Acyclic
    let hasCycle = false;
    const visited = new Set<GraphNode>();
    const recStack = new Set<GraphNode>();
    function detectCycle(node: GraphNode, parent: GraphNode | null = null): boolean {
      visited.add(node);
      recStack.add(node);
      for (const neighbor of node.neighbors) {
        if (!visited.has(neighbor)) {
          if (detectCycle(neighbor, node)) return true;
        } else if (neighbor !== parent && recStack.has(neighbor)) {
          return true;
        }
      }
      recStack.delete(node);
      return false;
    }
    for (const node of nodes) {
      if (!visited.has(node)) {
        if (detectCycle(node)) {
          hasCycle = true;
          break;
        }
      }
    }
    types.push(hasCycle ? "Cyclic Graph" : "Acyclic Graph");
    // Complete Graph
    const maxEdges = isDirected
      ? nodes.length * (nodes.length - 1)
      : (nodes.length * (nodes.length - 1)) / 2;
    if (edges.length === maxEdges && nodes.length > 0) {
      let isComplete = true;
      for (const node of nodes) {
        const expectedNeighbors = nodes.length - 1;
        if (node.neighbors.length !== expectedNeighbors) {
          isComplete = false;
          break;
        }
      }
      if (isComplete) types.push("Complete Graph");
    }
    // Sparse/Dense
    const edgeRatio = edges.length / (maxEdges || 1);
    if (edgeRatio < 0.3) types.push("Sparse Graph");
    else if (edgeRatio > 0.7) types.push("Dense Graph");
    // Tree/Forest
    if (!hasCycle && nodes.length > 0) {
      const isTree = nodes.length === edges.length + 1;
      types.push(isTree ? "Tree" : "Forest");
    }
    // Bipartite
    const colors = new Map<GraphNode, number>();
    let isBipartite = true;
    function bipartiteCheck(node: GraphNode, color: number): boolean {
      colors.set(node, color);
      for (const neighbor of node.neighbors) {
        if (!colors.has(neighbor)) {
          if (!bipartiteCheck(neighbor, -color)) return false;
        } else if (colors.get(neighbor) === color) {
          return false;
        }
      }
      return true;
    }
    for (const node of nodes) {
      if (!colors.has(node)) {
        if (!bipartiteCheck(node, 1)) {
          isBipartite = false;
          break;
        }
      }
    }
    if (isBipartite && nodes.length > 0) types.push("Bipartite Graph");
    // Multigraph/Pseudograph
    let isMultigraph = false;
    let isPseudograph = false;
    const edgeMap = new Map<string, number>();
    for (const edge of edges) {
      const key = `${Math.min(edge.source.id, edge.target.id)}-${Math.max(
        edge.source.id,
        edge.target.id
      )}`;
      edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
      if (edge.source === edge.target) isPseudograph = true;
    }
    if (Array.from(edgeMap.values()).some((count) => count > 1)) isMultigraph = true;
    if (isMultigraph) types.push("Multigraph");
    if (isPseudograph) types.push("Pseudograph");
    // Planar (simple check)
    if (
      nodes.length <= 5 &&
      edges.length <= 3 * nodes.length - 6 &&
      !isMultigraph &&
      !isPseudograph
    ) {
      types.push("Planar Graph");
    }
    return types;
  }

  // Node positioning
  function positionNodesInGrid() {
    if (!graphContainerRef.current) return;
    const containerWidth = graphContainerRef.current.clientWidth - nodeSize;
    const containerHeight = graphContainerRef.current.clientHeight - nodeSize;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const shape = layoutShape;
    if (nodes.length === 1) {
      nodes[0].x = centerX;
      nodes[0].y = centerY;
      return;
    }
    const numNodes = nodes.length;
    const radius = Math.min(containerWidth, containerHeight) * 0.3;
    const width = containerWidth * 0.6;
    const height = shape === "rectangle" ? containerHeight * 0.4 : width;
    if (shape === "circle") {
      nodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / numNodes;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
        node.isFixed = false;
      });
    } else if (shape === "square") {
      const sideLength = width;
      const nodesPerSide = Math.ceil(numNodes / 4);
      nodes.forEach((node, index) => {
        const side = Math.floor(index / nodesPerSide);
        const pos = (index % nodesPerSide) / (nodesPerSide || 1);
        let x = 0,
          y = 0;
        switch (side) {
          case 0:
            x = centerX - sideLength / 2 + pos * sideLength;
            y = centerY - sideLength / 2;
            break;
          case 1:
            x = centerX + sideLength / 2;
            y = centerY - sideLength / 2 + pos * sideLength;
            break;
          case 2:
            x = centerX + sideLength / 2 - pos * sideLength;
            y = centerY + sideLength / 2;
            break;
          case 3:
            x = centerX - sideLength / 2;
            y = centerY + sideLength / 2 - pos * sideLength;
            break;
        }
        node.x = Math.max(nodeSize / 2, Math.min(containerWidth, x));
        node.y = Math.max(nodeSize / 2, Math.min(containerHeight, y));
        node.isFixed = false;
      });
    } else if (shape === "rectangle") {
      const nodesPerSide = Math.ceil(numNodes / 4);
      nodes.forEach((node, index) => {
        const side = Math.floor(index / nodesPerSide);
        const pos = (index % nodesPerSide) / (nodesPerSide || 1);
        let x = 0,
          y = 0;
        switch (side) {
          case 0:
            x = centerX - width / 2 + pos * width;
            y = centerY - height / 2;
            break;
          case 1:
            x = centerX + width / 2;
            y = centerY - height / 2 + pos * height;
            break;
          case 2:
            x = centerX + width / 2 - pos * width;
            y = centerY + height / 2;
            break;
          case 3:
            x = centerX - width / 2;
            y = centerY + height / 2 - pos * height;
            break;
        }
        node.x = Math.max(nodeSize / 2, Math.min(containerWidth, x));
        node.y = Math.max(nodeSize / 2, Math.min(containerHeight, y));
        node.isFixed = false;
      });
    } else if (shape === "triangle") {
      const sideLength = width;
      const triHeight = (Math.sqrt(3) / 2) * sideLength;
      const nodesPerSide = Math.ceil(numNodes / 3);
      nodes.forEach((node, index) => {
        const side = Math.floor(index / nodesPerSide);
        const pos = (index % nodesPerSide) / (nodesPerSide || 1);
        let x = 0,
          y = 0;
        switch (side) {
          case 0:
            x = centerX - sideLength / 2 + pos * sideLength;
            y = centerY + triHeight / 2;
            break;
          case 1:
            x = centerX - sideLength / 2 + pos * (sideLength / 2);
            y = centerY + triHeight / 2 - pos * triHeight;
            break;
          case 2:
            x = centerX + pos * (sideLength / 2);
            y = centerY - triHeight / 2 + pos * triHeight;
            break;
        }
        node.x = Math.max(nodeSize / 2, Math.min(containerWidth, x));
        node.y = Math.max(nodeSize / 2, Math.min(containerHeight, y));
        node.isFixed = false;
      });
    }
  }

  function repositionNodes() {
    if (!graphContainerRef.current) return;
    const containerWidth = graphContainerRef.current.clientWidth - nodeSize;
    const containerHeight = graphContainerRef.current.clientHeight - nodeSize;
    nodes.forEach((node) => {
      node.x = Math.max(nodeSize / 2, Math.min(containerWidth, node.x));
      node.y = Math.max(nodeSize / 2, Math.min(containerHeight, node.y));
    });
  }

  // Rendering
  function renderGraph() {
    // This function should update the SVG and node positions.
    // For brevity, you can use a state variable to trigger re-render.
    setNodes([...nodes]);
    setEdges([...edges]);
    setNodeCount(nodes.length);
    setEdgeCount(edges.length);
    setStepCount(stepCount);
  }

  // Operations
  async function addNode(value: number) {
    if (nodes.length >= maxNodes) {
      alert(`Maximum ${maxNodes} nodes reached.`);
      return;
    }
    if (nodes.find((node) => node.value === value)) {
      alert(`Node with value ${value} already exists.`);
      return;
    }
    if (!graphContainerRef.current) return;
    const containerWidth = graphContainerRef.current.clientWidth - nodeSize;
    const containerHeight = graphContainerRef.current.clientHeight - nodeSize;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const newId = nodeId + 1;
    const newNode: GraphNode = {
      value,
      x: centerX,
      y: centerY,
      id: newId,
      neighbors: [],
      vx: 0,
      vy: 0,
      isFixed: false,
    };
    setNodeId(newId);
    setNodes((prev) => [...prev, newNode]);
    setNodeCount((c) => c + 1);
    setStepCount((c) => c + 1);
    positionNodesInGrid();
    renderGraph();
    appendStepInfo(
      `✅ Added node <span class="keyword-variable">${value}</span>\n📊 Graph now has ${
        nodeCount + 1
      } nodes\n🎯 Node positioned in ${layoutShape}, drag to reposition\n📋 Adjacency matrix updated with new row/column\n📈 Graph Type: ${analyzeGraph().join(", ")}`
    );
    await sleep(animationSpeed);
  }

  async function addEdge(sourceValue: number, targetValue: number, weight = 1) {
    const sourceNode = getNodeByValue(sourceValue);
    const targetNode = getNodeByValue(targetValue);
    if (!sourceNode || !targetNode) {
      alert("Source or target node not found.");
      return;
    }
    if (sourceNode === targetNode) {
      alert("Cannot add edge from a node to itself.");
      return;
    }
    if (getEdge(sourceNode, targetNode)) {
      alert("Edge already exists.");
      return;
    }
    const edgeId = `edge-${sourceNode.id}-${targetNode.id}`;
    const newEdge: GraphEdge = {
      source: sourceNode,
      target: targetNode,
      id: edgeId,
      weight,
    };
    setEdges((prev) => [...prev, newEdge]);
    sourceNode.neighbors.push(targetNode);
    if (!isDirected) targetNode.neighbors.push(sourceNode);
    setEdgeCount((c) => c + 1);
    setStepCount((c) => c + 1);
    renderGraph();
    appendStepInfo(
      `🔗 Added edge: <span class="keyword-variable">${sourceValue}</span> → <span class="keyword-variable">${targetValue}</span> (weight: <span class="keyword-variable">${weight}</span>)\n📊 Graph now has ${
        edgeCount + 1
      } edges\n📈 Graph type: ${isDirected ? "Directed" : "Undirected"}\n📋 Adjacency matrix updated: set [${sourceValue}][${targetValue}] = ${weight}${
        !isDirected ? ` and [${targetValue}][${sourceValue}] = ${weight}` : ""
      }\n📈 Graph Type: ${analyzeGraph().join(", ")}`
    );
    await sleep(animationSpeed);
  }

  async function removeNode(value: number) {
    const nodeIndex = nodes.findIndex((node) => node.value === value);
    if (nodeIndex === -1) {
      alert(`Node ${value} not found.`);
      return;
    }
    const node = nodes[nodeIndex];
    appendStepInfo(
      `🗑️ Removing node <span class="keyword-variable">${value}</span>\n📊 This will remove ${node.neighbors.length} connected edges\n📋 Adjacency matrix will remove row/column for ${value}`
    );
    await sleep(animationSpeed);
    setEdges((prev) =>
      prev.filter((edge) => edge.source !== node && edge.target !== node)
    );
    nodes.forEach((n) => {
      n.neighbors = n.neighbors.filter((neighbor) => neighbor !== node);
    });
    nodes.splice(nodeIndex, 1);
    setNodes([...nodes]);
    setNodeCount((c) => c - 1);
    setStepCount((c) => c + 1);
    positionNodesInGrid();
    renderGraph();
    appendStepInfo(
      `✅ Removed node <span class="keyword-variable">${value}</span>\n📊 Graph now has ${
        nodeCount - 1
      } nodes, ${edgeCount} edges\n📋 Adjacency matrix updated\n📈 Graph Type: ${analyzeGraph().join(", ")}`
    );
    await sleep(animationSpeed);
  }

  // Step log
  function appendStepInfo(text: string) {
    setStepEntries((prev) => [...prev, text]);
    setCurrentStepIndex(stepEntries.length);
  }

  // UI Handlers
  function handleAddNode() {
    const value = parseInt(nodeValue);
    if (isNaN(value)) {
      alert("Please enter a valid node value.");
      return;
    }
    addNode(value);
    setNodeValue(""); // clear input
  }
  function handleAddEdge() {
    const source = parseInt(sourceValue);
    const target = parseInt(targetValue);
    const weight = parseInt(edgeWeight) || 1;
    if (isNaN(source) || isNaN(target)) {
      alert("Please enter valid source and target values.");
      return;
    }
    if (weight <= 0) {
      alert("Weight must be a positive number.");
      return;
    }
    addEdge(source, target, weight);
    setSourceValue("");
    setTargetValue("");
    setEdgeWeight("");
  }
  function handleRemoveNode() {
    const value = parseInt(nodeValue);
    if (isNaN(value)) {
      alert("Please enter a valid node value.");
      return;
    }
    removeNode(value);
    setNodeValue("");
  }
  function handleGraphTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setIsDirected(e.target.value === "directed");
    reset();
  }
  function handleLayoutShapeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLayoutShape(e.target.value);
    if (nodes.length) {
      positionNodesInGrid();
      renderGraph();
    }
  }
  function reset() {
    setNodes([]);
    setEdges([]);
    setNodeId(0);
    setNodeCount(0);
    setEdgeCount(0);
    setStepCount(0);
    setIsProcessing(false);
    setIsPaused(false);
    setDraggedNode(null);
    setStepEntries([
      `🎯 Select an operation to begin!\n\nBFS uses Queue (FIFO - First In, First Out)\nDFS uses Stack (LIFO - Last In, First Out)\nAdjacency Matrix shows edge weights (0 = no edge)`,
    ]);
    setCurrentStepIndex(0);
    renderGraph();
    appendStepInfo(
      `🗑️ Graph Reset\nAll nodes and edges removed\nAdjacency matrix cleared\nGraph Type: Null Graph`
    );
  }
  function handleDarkModeToggle() {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", (!prev).toString());
      return !prev;
    });
  }

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div />
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Graph Visualizer
              </span>
            </h1>
            <p className="text-gray-400">
              Visualize graph operations with BFS/DFS, weighted edges, and graph type detection!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-300">Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleDarkModeToggle}
                className="form-checkbox h-5 w-5 text-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
            <div className="text-blue-300 text-sm font-medium">Nodes</div>
            <div className="text-2xl font-bold">{nodeCount}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
            <div className="text-purple-300 text-sm font-medium">Edges</div>
            <div className="text-2xl font-bold">{edgeCount}</div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
            <div className="text-green-300 text-sm font-medium">Directed</div>
            <div className="text-lg font-bold">{isDirected ? "Yes" : "No"}</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
            <div className="text-yellow-300 text-sm font-medium">Layout</div>
            <div className="text-lg font-bold capitalize">{layoutShape}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300">Graph Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={nodeValue}
                  onChange={e => setNodeValue(e.target.value)}
                  type="number"
                  placeholder="Node value"
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <input
                  value={edgeWeight}
                  onChange={e => setEdgeWeight(e.target.value)}
                  type="number"
                  placeholder="Edge weight (optional)"
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={sourceValue}
                  onChange={e => setSourceValue(e.target.value)}
                  type="number"
                  placeholder="Source node"
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <input
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  type="number"
                  placeholder="Target node"
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddNode}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold transition-all duration-300"
                >
                  Add Node
                </button>
                <button
                  onClick={handleAddEdge}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300"
                >
                  Add Edge
                </button>
                <button
                  onClick={handleRemoveNode}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300"
                >
                  Remove Node
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300">Settings</h3>
              <div className="flex gap-4 items-center">
                <label className="text-gray-300">Graph Type:</label>
                <select
                  value={isDirected ? "directed" : "undirected"}
                  onChange={handleGraphTypeChange}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="undirected">Undirected</option>
                  <option value="directed">Directed</option>
                </select>
                <label className="text-gray-300 ml-4">Layout:</label>
                <select
                  value={layoutShape}
                  onChange={handleLayoutShapeChange}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="triangle">Triangle</option>
                </select>
              </div>
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl font-semibold transition-all duration-300"
              >
                Reset Graph
              </button>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2 text-white">Graph Visualization</h3>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {stepEntries[currentStepIndex]}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 overflow-hidden relative" style={{ minHeight: 400 }}>
            <div
              className="graph-container"
              ref={graphContainerRef}
              style={{ position: "relative", width: "100%", height: 400 }}
            >
              <svg ref={svgRef} width="100%" height="100%">
                {/* Render edges and arrowheads here */}
              </svg>
              {/* Render nodes as absolutely positioned divs */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="node"
                  style={{
                    left: node.x,
                    top: node.y,
                    position: "absolute",
                    width: nodeSize,
                    height: nodeSize,
                    lineHeight: `${nodeSize}px`,
                    textAlign: "center",
                    borderRadius: "50%",
                    background: "linear-gradient(to top, #0288d1, #4fc3f7)",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                    userSelect: "none",
                    cursor: "grab",
                    border: "3px solid #fff",
                    transition: "box-shadow 0.2s, border 0.2s"
                  }}
                >
                  {node.value}
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-8 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
              <span className="text-gray-300">Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gray-500"></div>
              <span className="text-gray-300">Edge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;