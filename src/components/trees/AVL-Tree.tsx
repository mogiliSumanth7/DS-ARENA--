import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
  Zap,
  Search as SearchIcon,
  Trash2,
  Plus,
  Home,
} from "lucide-react";

// --- AVL Node Type ---
type AVLNodeType = {
  value: number;
  left: AVLNodeType | null;
  right: AVLNodeType | null;
  height: number;
  x: number;
  y: number;
  depth: number;
  id: number;
};

const NODE_SIZE = 50;
const LEVEL_HEIGHT = 80;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

let globalNodeId = 0;

// --- AVL Logic ---
function getHeight(node: AVLNodeType | null): number {
  return node ? node.height : 0;
}

function getBalance(node: AVLNodeType | null): number {
  return node ? getHeight(node.right) - getHeight(node.left) : 0;
}

function updateHeight(node: AVLNodeType) {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function rightRotate(y: AVLNodeType): AVLNodeType {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function leftRotate(x: AVLNodeType): AVLNodeType {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function insertAVL(
  node: AVLNodeType | null,
  value: number
): AVLNodeType {
  if (!node) {
    return {
      value,
      left: null,
      right: null,
      height: 1,
      x: 0,
      y: 0,
      depth: 0,
      id: ++globalNodeId,
    };
  }
  if (value < node.value) {
    node.left = insertAVL(node.left, value);
  } else if (value > node.value) {
    node.right = insertAVL(node.right, value);
  } else {
    // Duplicate values not allowed
    return node;
  }
  updateHeight(node);

  const balance = getBalance(node);

  // Left Left
  if (balance < -1 && value < (node.left?.value ?? 0)) {
    return rightRotate(node);
  }
  // Right Right
  if (balance > 1 && value > (node.right?.value ?? 0)) {
    return leftRotate(node);
  }
  // Left Right
  if (balance < -1 && value > (node.left?.value ?? 0)) {
    node.left = node.left ? leftRotate(node.left) : null;
    return rightRotate(node);
  }
  // Right Left
  if (balance > 1 && value < (node.right?.value ?? 0)) {
    node.right = node.right ? rightRotate(node.right) : null;
    return leftRotate(node);
  }
  return node;
}

function minValueNode(node: AVLNodeType): AVLNodeType {
  let current = node;
  while (current.left) current = current.left;
  return current;
}

function deleteAVL(
  node: AVLNodeType | null,
  value: number
): AVLNodeType | null {
  if (!node) return null;
  if (value < node.value) {
    node.left = deleteAVL(node.left, value);
  } else if (value > node.value) {
    node.right = deleteAVL(node.right, value);
  } else {
    // Node with only one child or no child
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    // Node with two children
    const temp = minValueNode(node.right);
    node.value = temp.value;
    node.right = deleteAVL(node.right, temp.value);
  }
  updateHeight(node);

  const balance = getBalance(node);

  // Left Left
  if (balance < -1 && getBalance(node.left) <= 0) {
    return rightRotate(node);
  }
  // Left Right
  if (balance < -1 && getBalance(node.left) > 0) {
    node.left = node.left ? leftRotate(node.left) : null;
    return rightRotate(node);
  }
  // Right Right
  if (balance > 1 && getBalance(node.right) >= 0) {
    return leftRotate(node);
  }
  // Right Left
  if (balance > 1 && getBalance(node.right) < 0) {
    node.right = node.right ? rightRotate(node.right) : null;
    return leftRotate(node);
  }
  return node;
}

function searchAVL(node: AVLNodeType | null, value: number): boolean {
  if (!node) return false;
  if (value === node.value) return true;
  if (value < node.value) return searchAVL(node.left, value);
  return searchAVL(node.right, value);
}

function getTreeHeight(node: AVLNodeType | null): number {
  return node ? 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right)) : 0;
}

function getNodeCount(node: AVLNodeType | null): number {
  return node ? 1 + getNodeCount(node.left) + getNodeCount(node.right) : 0;
}

// --- Layout ---
function calculatePositions(
  node: AVLNodeType | null,
  x: number,
  y: number,
  spacing: number,
  depth: number
) {
  if (!node) return;
  node.x = x;
  node.y = y;
  node.depth = depth;
  if (node.left) {
    calculatePositions(node.left, x - spacing, y + LEVEL_HEIGHT, spacing / 2, depth + 1);
  }
  if (node.right) {
    calculatePositions(node.right, x + spacing, y + LEVEL_HEIGHT, spacing / 2, depth + 1);
  }
}

// --- Main Component ---
const AVLTreeVisualizer: React.FC = () => {
  const [tree, setTree] = useState<AVLNodeType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("Welcome! Start by inserting nodes to build your AVL tree.");
  const [operation, setOperation] = useState<string>("");
  const [showHelp, setShowHelp] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw tree
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tree) return;

    // Draw edges
    const drawEdges = (node: AVLNodeType) => {
      if (node.left) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + NODE_SIZE / 2);
        ctx.lineTo(node.left.x, node.left.y + NODE_SIZE / 2);
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawEdges(node.left);
      }
      if (node.right) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + NODE_SIZE / 2);
        ctx.lineTo(node.right.x, node.right.y + NODE_SIZE / 2);
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawEdges(node.right);
      }
    };

    // Draw nodes
    const drawNodes = (node: AVLNodeType) => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y + NODE_SIZE / 2, NODE_SIZE / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#3b82f6";
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Node value
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.value.toString(), node.x, node.y + NODE_SIZE / 2);

      // Balance factor badge
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x + NODE_SIZE / 2 - 10, node.y + 10, 12, 0, 2 * Math.PI);
      ctx.fillStyle = "#f472b6";
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText(
        (getBalance(node) > 0 ? "+" : "") + getBalance(node),
        node.x + NODE_SIZE / 2 - 10,
        node.y + 10
      );
      ctx.restore();

      if (node.left) drawNodes(node.left);
      if (node.right) drawNodes(node.right);
    };

    drawEdges(tree);
    drawNodes(tree);
  }, [tree]);

  // --- Handlers ---
  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage("Please enter a valid number.");
      return;
    }
    if (searchAVL(tree, value)) {
      setMessage(`Value ${value} already exists in the tree.`);
      setInputValue("");
      return;
    }
    let newTree = insertAVL(tree, value);
    // Layout
    calculatePositions(
      newTree,
      CANVAS_WIDTH / 2,
      40,
      Math.max(120, CANVAS_WIDTH / Math.pow(2, getTreeHeight(newTree))),
      0
    );
    setTree(newTree);
    setMessage(`Inserted ${value} into AVL tree.`);
    setOperation("insert");
    setInputValue("");
    setSearchResult(null);
  };

  const handleSearch = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage("Please enter a valid number.");
      return;
    }
    const found = searchAVL(tree, value);
    setSearchResult(found ? `Found ${value} in the tree!` : `Value ${value} not found.`);
    setMessage(found ? `Found ${value} in the tree!` : `Value ${value} not found.`);
    setOperation("search");
    setInputValue("");
  };

  const handleDelete = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage("Please enter a valid number.");
      return;
    }
    if (!searchAVL(tree, value)) {
      setMessage(`Value ${value} not found in the tree.`);
      setInputValue("");
      return;
    }
    let newTree = deleteAVL(tree, value);
    // Layout
    if (newTree)
      calculatePositions(
        newTree,
        CANVAS_WIDTH / 2,
        40,
        Math.max(120, CANVAS_WIDTH / Math.pow(2, getTreeHeight(newTree))),
        0
      );
    setTree(newTree);
    setMessage(`Deleted ${value} from AVL tree.`);
    setOperation("delete");
    setInputValue("");
    setSearchResult(null);
  };

  const handleRandom = () => {
    globalNodeId = 0;
    let values: number[] = [];
    while (values.length < 7) {
      const v = Math.floor(Math.random() * 90) + 10;
      if (!values.includes(v)) values.push(v);
    }
    let newTree: AVLNodeType | null = null;
    for (const v of values) {
      newTree = insertAVL(newTree, v);
    }
    calculatePositions(
      newTree,
      CANVAS_WIDTH / 2,
      40,
      Math.max(120, CANVAS_WIDTH / Math.pow(2, getTreeHeight(newTree))),
      0
    );
    setTree(newTree);
    setMessage("Random AVL tree generated!");
    setOperation("random");
    setInputValue("");
    setSearchResult(null);
  };

  const handleReset = () => {
    setTree(null);
    setMessage("Tree cleared! Ready for new operations.");
    setOperation("");
    setInputValue("");
    setSearchResult(null);
    globalNodeId = 0;
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50"
          >
            <Home size={20} />
            <span>Back to Home</span>
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AVL Tree Visualizer
              </span>
            </h1>
            <p className="text-gray-400">
              Interactive AVL tree with step-by-step balancing and rotations
            </p>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50"
          >
            <HelpCircle size={20} />
            <span>Help</span>
          </button>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
            <h3 className="text-xl font-bold mb-4 text-cyan-300">How to Use</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">AVL Operations</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• <strong>Insert:</strong> Add nodes with balancing</li>
                  <li>• <strong>Search:</strong> Find nodes in the tree</li>
                  <li>• <strong>Delete:</strong> Remove nodes with rebalancing</li>
                  <li>• <strong>Random:</strong> Generate a random AVL tree</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">Controls</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Enter a value and click Insert/Search/Delete</li>
                  <li>• Use Random to generate a tree</li>
                  <li>• Reset to clear everything</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
            <div className="text-blue-300 text-sm font-medium">Nodes</div>
            <div className="text-2xl font-bold">{getNodeCount(tree)}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
            <div className="text-purple-300 text-sm font-medium">Height</div>
            <div className="text-2xl font-bold">{getTreeHeight(tree)}</div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
            <div className="text-green-300 text-sm font-medium">Operation</div>
            <div className="text-lg font-bold capitalize">{operation || "None"}</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
            <div className="text-yellow-300 text-sm font-medium">Result</div>
            <div className="text-2xl font-bold">{searchResult || "-"}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300">AVL Operations</h3>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleInsert}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold transition-all duration-300"
                >
                  <Plus size={20} />
                  Insert
                </button>
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300"
                >
                  <SearchIcon size={20} />
                  Search
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300"
                >
                  <Trash2 size={20} />
                  Delete
                </button>
                <button
                  onClick={handleRandom}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300"
                >
                  <Zap size={20} />
                  Random
                </button>
              </div>
            </div>
            {/* Animation Controls (not implemented, for future use) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300">Animation & Traversal</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl font-semibold transition-all duration-300"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2 text-white">Tree Visualization</h3>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">{message}</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-auto max-w-full border border-gray-700/50 rounded-lg bg-gray-800/30"
            />
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-8 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Normal Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
              <span className="text-gray-300">Balance Factor</span>
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

export default AVLTreeVisualizer;