import React, { useRef, useEffect, useState } from "react";

// --- Types ---
type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
  depth: number;
  id: number;
  insertionHistory: InsertionHistoryStep[];
  insertionOrder: number;
};

type InsertionHistoryStep = {
  currentNodeId: number | null;
  currentNodeValue: number | null;
  value: number;
  isComparison: boolean;
  edgeId: string | null;
};

type Step = {
  description: string;
  tree: TreeNode | null;
  highlightedNodes: { id: number; className: string }[];
  comparisons: number;
  nodeCount: number;
  treeHeight: number;
  time: number;
  operation: string;
};

// --- Constants ---
const nodeSize = 40;
const xOffsetBase = 200;

// --- Helper Functions ---
function calculateTreeHeight(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(calculateTreeHeight(node.left), calculateTreeHeight(node.right));
}

function deepCopyTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  const copy: TreeNode = {
    ...node,
    left: deepCopyTree(node.left),
    right: deepCopyTree(node.right),
    insertionHistory: [...node.insertionHistory],
  };
  return copy;
}

function countTreeNodes(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + countTreeNodes(node.left) + countTreeNodes(node.right);
}

// --- Main Component ---
const BinarySearchTreeVisualizer: React.FC = () => {
  // --- State ---
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [nodeId, setNodeId] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [treeHeight, setTreeHeight] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(150);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [operationSteps, setOperationSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isStepNavigationMode, setIsStepNavigationMode] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [stepInfo, setStepInfo] = useState<string>("🎯 Select an operation to begin!");
  const [operation, setOperation] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [updateOldValue, setUpdateOldValue] = useState<string>("");
  const [updateNewValue, setUpdateNewValue] = useState<string>("");

  // --- Refs ---
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    setTreeHeight(calculateTreeHeight(tree));
    setNodeCount(countTreeNodes(tree));
  }, [tree]);

  // --- Tree Position Calculation ---
  function calculateNodePositions(
    node: TreeNode | null,
    x: number,
    y: number,
    depth: number,
    containerWidth: number
  ) {
    if (!node) return;
    const centerX = containerWidth / 2 - nodeSize / 2;
    node.x = centerX + (x - centerX);
    node.y = 20 + depth * 100;
    node.depth = depth;
    const xOffset = xOffsetBase / (depth + 1);
    if (node.left) {
      calculateNodePositions(node.left, x - xOffset, y, depth + 1, containerWidth);
    }
    if (node.right) {
      calculateNodePositions(node.right, x + xOffset, y, depth + 1, containerWidth);
    }
  }

  // --- Render Tree Nodes and Edges ---
  function renderTreeNodes(node: TreeNode | null): JSX.Element[] {
    if (!node) return [];
    const nodes: JSX.Element[] = [];
    const queue: TreeNode[] = [node];
    while (queue.length) {
      const curr = queue.shift()!;
      nodes.push(
        <div
          key={curr.id}
          className="node"
          style={{
            left: curr.x,
            top: curr.y,
            position: "absolute",
            width: nodeSize,
            height: nodeSize,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to top, #0288d1, #4fc3f7)",
            color: "#fff",
            fontFamily: "Roboto Mono, monospace",
            fontSize: "0.9rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        >
          {curr.value}
        </div>
      );
      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }
    return nodes;
  }

  function renderTreeEdges(node: TreeNode | null): JSX.Element[] {
    if (!node) return [];
    const edges: JSX.Element[] = [];
    function traverse(n: TreeNode) {
      if (n.left) {
        edges.push(
          <line
            key={`edge-${n.id}-left`}
            x1={n.x + nodeSize / 2}
            y1={n.y + nodeSize / 2}
            x2={n.left.x + nodeSize / 2}
            y2={n.left.y + nodeSize / 2}
            stroke="#eee"
            strokeWidth={2}
          />
        );
        traverse(n.left);
      }
      if (n.right) {
        edges.push(
          <line
            key={`edge-${n.id}-right`}
            x1={n.x + nodeSize / 2}
            y1={n.y + nodeSize / 2}
            x2={n.right.x + nodeSize / 2}
            y2={n.right.y + nodeSize / 2}
            stroke="#eee"
            strokeWidth={2}
          />
        );
        traverse(n.right);
      }
    }
    traverse(node);
    return edges;
  }

  // --- Insert Operation (Synchronous, for demo) ---
  function insertNode(
    current: TreeNode | null,
    value: number,
    x: number,
    y: number,
    depth: number
  ): TreeNode {
    if (!current) {
      const newId = nodeId + 1;
      setNodeId(newId);
      return {
        value,
        left: null,
        right: null,
        x,
        y,
        depth,
        id: newId,
        insertionHistory: [],
        insertionOrder: newId,
      };
    }
    if (value < current.value) {
      current.left = insertNode(current.left, value, x - xOffsetBase / (depth + 1), y + 100, depth + 1);
    } else {
      current.right = insertNode(current.right, value, x + xOffsetBase / (depth + 1), y + 100, depth + 1);
    }
    return current;
  }

  // --- Handlers ---
  function handleInsert() {
    if (!inputValue || isNaN(Number(inputValue))) {
      setStepInfo("⚠️ Please enter a valid number!");
      return;
    }
    const value = Number(inputValue);
    const containerWidth = treeContainerRef.current?.clientWidth || 800;
    const centerX = containerWidth / 2;
    const newTree = insertNode(tree, value, centerX, 20, 0);
    calculateNodePositions(newTree, centerX, 20, 0, containerWidth);
    setTree({ ...newTree });
    setInputValue("");
    setOperation("insert");
    setStepInfo(`🎉 Inserted value ${value} into the BST`);
  }

  function handleReset() {
    setTree(null);
    setNodeId(0);
    setNodeCount(0);
    setTreeHeight(0);
    setComparisons(0);
    setOperationSteps([]);
    setCurrentStepIndex(-1);
    setIsStepNavigationMode(false);
    setStepInfo("🎯 Tree reset! Select an operation to begin!");
    setOperation(null);
  }

  // --- Search Operation ---
  function handleSearch() {
    if (!searchValue || isNaN(Number(searchValue))) {
      setStepInfo("⚠️ Please enter a valid number to search!");
      return;
    }
    const value = Number(searchValue);
    let found = false;
    let comparisons = 0;
    let curr = tree;
    while (curr) {
      comparisons++;
      if (curr.value === value) {
        found = true;
        break;
      }
      curr = value < curr.value ? curr.left : curr.right;
    }
    setComparisons(comparisons);
    if (found) {
      setStepInfo(`✅ Value ${value} found in the BST!`);
    } else {
      setStepInfo(`❌ Value ${value} not found in the BST.`);
    }
    setSearchValue("");
  }

  // --- Update Operation ---
  function handleUpdate() {
    if (
      !updateOldValue ||
      !updateNewValue ||
      isNaN(Number(updateOldValue)) ||
      isNaN(Number(updateNewValue))
    ) {
      setStepInfo("⚠️ Please enter valid numbers for update!");
      return;
    }
    const oldVal = Number(updateOldValue);
    const newVal = Number(updateNewValue);

    // Remove old value, then insert new value
    let removed = false;
    function removeNode(node: TreeNode | null, value: number): TreeNode | null {
      if (!node) return null;
      if (value < node.value) {
        node.left = removeNode(node.left, value);
      } else if (value > node.value) {
        node.right = removeNode(node.right, value);
      } else {
        removed = true;
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        // Node with two children: get inorder successor
        let successor = node.right;
        while (successor.left) successor = successor.left;
        node.value = successor.value;
        node.right = removeNode(node.right, successor.value);
      }
      return node;
    }
    let newTree = removeNode(tree, oldVal);
    if (!removed) {
      setStepInfo(`❌ Value ${oldVal} not found for update.`);
      setUpdateOldValue("");
      setUpdateNewValue("");
      return;
    }
    // Insert new value
    const containerWidth = treeContainerRef.current?.clientWidth || 800;
    const centerX = containerWidth / 2;
    newTree = insertNode(newTree, newVal, centerX, 20, 0);
    calculateNodePositions(newTree, centerX, 20, 0, containerWidth);
    setTree({ ...newTree });
    setStepInfo(`🔄 Updated value ${oldVal} to ${newVal} in the BST.`);
    setUpdateOldValue("");
    setUpdateNewValue("");
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Binary Search Tree Visualizer
            </span>
          </h1>
          <p className="text-gray-400">Interactive BST operations with step-by-step visualization</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
            <div className="text-blue-300 text-sm font-medium">Nodes</div>
            <div className="text-2xl font-bold">{nodeCount}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
            <div className="text-purple-300 text-sm font-medium">Height</div>
            <div className="text-2xl font-bold">{treeHeight}</div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
            <div className="text-green-300 text-sm font-medium">Comparisons</div>
            <div className="text-2xl font-bold">{comparisons}</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
            <div className="text-yellow-300 text-sm font-medium">Step Info</div>
            <div className="text-xs font-mono text-yellow-100">{stepInfo}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center flex-wrap">
            {/* Insert */}
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Insert e.g. 42"
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors mb-2 md:mb-0"
            />
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold transition-all duration-300"
            >
              Insert
            </button>
            {/* Search */}
            <input
              type="number"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search e.g. 42"
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors mb-2 md:mb-0"
            />
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl font-semibold transition-all duration-300"
            >
              Search
            </button>
            {/* Update */}
            <input
              type="number"
              value={updateOldValue}
              onChange={e => setUpdateOldValue(e.target.value)}
              placeholder="Old value"
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors mb-2 md:mb-0"
            />
            <input
              type="number"
              value={updateNewValue}
              onChange={e => setUpdateNewValue(e.target.value)}
              placeholder="New value"
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors mb-2 md:mb-0"
            />
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl font-semibold transition-all duration-300"
            >
              Update
            </button>
            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl font-semibold transition-all duration-300"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2 text-white">Tree Visualization</h3>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {stepInfo}
            </p>
          </div>
          <div
            ref={treeContainerRef}
            className="relative w-full min-h-[500px] bg-gray-900/50 rounded-xl p-4 overflow-auto border border-gray-700/50"
          >
            <svg width="100%" height="100%" className="absolute top-0 left-0 z-1">
              {renderTreeEdges(tree)}
            </svg>
            {renderTreeNodes(tree)}
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-8 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
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

export default BinarySearchTreeVisualizer;