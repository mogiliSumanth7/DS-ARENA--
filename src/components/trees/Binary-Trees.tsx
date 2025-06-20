import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  TreePine, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  HelpCircle,
  Zap,
  Search,
  Trash2,
  Plus,
  Home,
  Settings
} from 'lucide-react';

// Types
interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
  depth: number;
  id: number;
}

interface VisualizationStep {
  description: string;
  tree: TreeNode | null;
  highlightedNodes: number[];
  currentNode?: number;
  operation: string;
  result?: string;
}

// Constants
const NODE_SIZE = 50;
const LEVEL_HEIGHT = 80;
const ANIMATION_SPEED = {
  slow: 1500,
  medium: 1000,
  fast: 500
};

// Utility Functions
let nodeIdCounter = 0;

const createNode = (value: number, x = 0, y = 0, depth = 0): TreeNode => ({
  value,
  left: null,
  right: null,
  x,
  y,
  depth,
  id: ++nodeIdCounter
});

const deepCopyTree = (node: TreeNode | null): TreeNode | null => {
  if (!node) return null;
  const copy = createNode(node.value, node.x, node.y, node.depth);
  copy.id = node.id;
  copy.left = deepCopyTree(node.left);
  copy.right = deepCopyTree(node.right);
  return copy;
};

const calculatePositions = (node: TreeNode | null, x: number, y: number, spacing: number): void => {
  if (!node) return;
  
  node.x = x;
  node.y = y;
  
  const childSpacing = spacing / 2;
  if (node.left) {
    calculatePositions(node.left, x - spacing, y + LEVEL_HEIGHT, childSpacing);
  }
  if (node.right) {
    calculatePositions(node.right, x + spacing, y + LEVEL_HEIGHT, childSpacing);
  }
};

const getTreeHeight = (node: TreeNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
};

const getNodeCount = (node: TreeNode | null): number => {
  if (!node) return 0;
  return 1 + getNodeCount(node.left) + getNodeCount(node.right);
};

const BinaryTreeVisualizer: React.FC = () => {
  // State
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<keyof typeof ANIMATION_SPEED>('medium');
  const [inputValue, setInputValue] = useState('');
  const [parentValue, setParentValue] = useState('');
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [showHelp, setShowHelp] = useState(false);
  const [operation, setOperation] = useState<string>('');
  const [message, setMessage] = useState('Welcome! Start by inserting nodes to build your binary tree.');

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Calculate tree layout
  const updateTreeLayout = useCallback((treeRoot: TreeNode | null) => {
    if (!treeRoot) return;
    const containerWidth = 800;
    const startX = containerWidth / 2;
    const startY = 60;
    const initialSpacing = Math.max(120, containerWidth / Math.pow(2, getTreeHeight(treeRoot)));
    calculatePositions(treeRoot, startX, startY, initialSpacing);
  }, []);

  // Tree Operations
  const insertNode = async (value: number, parentVal?: number, dir?: 'left' | 'right') => {
    const newSteps: VisualizationStep[] = [];
    let currentTree = deepCopyTree(tree);

    if (!currentTree) {
      // Insert root
      currentTree = createNode(value);
      updateTreeLayout(currentTree);
      newSteps.push({
        description: `Creating root node with value ${value}`,
        tree: deepCopyTree(currentTree),
        highlightedNodes: [currentTree.id],
        operation: 'insert',
        result: `Root node ${value} created successfully!`
      });
    } else if (parentVal === undefined) {
      setMessage('Please specify a parent node value for insertion.');
      return;
    } else {
      // Find parent and insert
      const findAndInsert = (node: TreeNode | null, path: number[] = []): boolean => {
        if (!node) return false;
        
        newSteps.push({
          description: `Searching for parent node ${parentVal}... Currently at node ${node.value}`,
          tree: deepCopyTree(currentTree),
          highlightedNodes: [node.id],
          operation: 'insert'
        });

        if (node.value === parentVal) {
          const targetChild = dir === 'left' ? node.left : node.right;
          if (targetChild) {
            newSteps.push({
              description: `Parent found, but ${dir} child already exists!`,
              tree: deepCopyTree(currentTree),
              highlightedNodes: [node.id, targetChild.id],
              operation: 'insert',
              result: `Cannot insert: ${dir} child of ${parentVal} already exists.`
            });
            return false;
          }
          
          const newNode = createNode(value);
          if (dir === 'left') {
            node.left = newNode;
          } else {
            node.right = newNode;
          }
          
          updateTreeLayout(currentTree);
          
          newSteps.push({
            description: `Inserting ${value} as ${dir} child of ${parentVal}`,
            tree: deepCopyTree(currentTree),
            highlightedNodes: [node.id, newNode.id],
            operation: 'insert',
            result: `Successfully inserted ${value} as ${dir} child of ${parentVal}!`
          });
          return true;
        }

        return findAndInsert(node.left, [...path, 0]) || findAndInsert(node.right, [...path, 1]);
      };

      if (!findAndInsert(currentTree)) {
        setMessage(`Parent node ${parentVal} not found in the tree.`);
        return;
      }
    }

    setTree(currentTree);
    setSteps(newSteps);
    setCurrentStep(-1);
    playAnimation(newSteps);
  };

  const searchNode = async (value: number) => {
    if (!tree) {
      setMessage('Tree is empty. Please insert some nodes first.');
      return;
    }

    const newSteps: VisualizationStep[] = [];
    let found = false;

    const search = (node: TreeNode | null): boolean => {
      if (!node) return false;

      newSteps.push({
        description: `Searching for ${value}... Currently examining node ${node.value}`,
        tree: deepCopyTree(tree),
        highlightedNodes: [node.id],
        operation: 'search'
      });

      if (node.value === value) {
        newSteps.push({
          description: `Found the target value ${value}!`,
          tree: deepCopyTree(tree),
          highlightedNodes: [node.id],
          operation: 'search',
          result: `Successfully found node with value ${value}!`
        });
        found = true;
        return true;
      }

      return search(node.left) || search(node.right);
    };

    search(tree);

    if (!found) {
      newSteps.push({
        description: `Search completed. Value ${value} not found in the tree.`,
        tree: deepCopyTree(tree),
        highlightedNodes: [],
        operation: 'search',
        result: `Node with value ${value} not found in the tree.`
      });
    }

    setSteps(newSteps);
    setCurrentStep(-1);
    playAnimation(newSteps);
  };

  const deleteNode = async (value: number) => {
    if (!tree) {
      setMessage('Tree is empty. Nothing to delete.');
      return;
    }

    const newSteps: VisualizationStep[] = [];
    let currentTree = deepCopyTree(tree);
    let deleted = false;

    const deleteHelper = (node: TreeNode | null, val: number): TreeNode | null => {
      if (!node) return null;

      newSteps.push({
        description: `Searching for node ${val} to delete... Currently at node ${node.value}`,
        tree: deepCopyTree(currentTree),
        highlightedNodes: [node.id],
        operation: 'delete'
      });

      if (val < node.value) {
        node.left = deleteHelper(node.left, val);
      } else if (val > node.value) {
        node.right = deleteHelper(node.right, val);
      } else {
        deleted = true;
        newSteps.push({
          description: `Found node ${val} to delete. Analyzing deletion case...`,
          tree: deepCopyTree(currentTree),
          highlightedNodes: [node.id],
          operation: 'delete'
        });

        // Node to be deleted found
        if (!node.left && !node.right) {
          // Leaf node
          newSteps.push({
            description: `Node ${val} is a leaf node. Simply removing it.`,
            tree: deepCopyTree(currentTree),
            highlightedNodes: [node.id],
            operation: 'delete'
          });
          return null;
        } else if (!node.left) {
          // Only right child
          newSteps.push({
            description: `Node ${val} has only right child. Replacing with right subtree.`,
            tree: deepCopyTree(currentTree),
            highlightedNodes: [node.id, node.right!.id],
            operation: 'delete'
          });
          return node.right;
        } else if (!node.right) {
          // Only left child
          newSteps.push({
            description: `Node ${val} has only left child. Replacing with left subtree.`,
            tree: deepCopyTree(currentTree),
            highlightedNodes: [node.id, node.left!.id],
            operation: 'delete'
          });
          return node.left;
        } else {
          // Two children - find inorder successor (smallest in right subtree)
          let successor = node.right;
          while (successor.left) {
            successor = successor.left;
          }
          
          newSteps.push({
            description: `Node ${val} has two children. Finding inorder successor...`,
            tree: deepCopyTree(currentTree),
            highlightedNodes: [node.id, successor.id],
            operation: 'delete'
          });

          node.value = successor.value;
          node.right = deleteHelper(node.right, successor.value);
        }
      }
      return node;
    };

    currentTree = deleteHelper(currentTree, value);
    
    if (deleted) {
      updateTreeLayout(currentTree);
      newSteps.push({
        description: `Node ${value} successfully deleted from the tree.`,
        tree: deepCopyTree(currentTree),
        highlightedNodes: [],
        operation: 'delete',
        result: `Successfully deleted node with value ${value}!`
      });
    } else {
      newSteps.push({
        description: `Node ${value} not found in the tree. Nothing to delete.`,
        tree: deepCopyTree(currentTree),
        highlightedNodes: [],
        operation: 'delete',
        result: `Node with value ${value} not found. Nothing was deleted.`
      });
    }

    setTree(currentTree);
    setSteps(newSteps);
    setCurrentStep(-1);
    playAnimation(newSteps);
  };

  const traverseTree = async (type: 'inorder' | 'preorder' | 'postorder') => {
    if (!tree) {
      setMessage('Tree is empty. Please insert some nodes first.');
      return;
    }

    const newSteps: VisualizationStep[] = [];
    const result: number[] = [];

    const traverse = (node: TreeNode | null) => {
      if (!node) return;

      if (type === 'preorder') {
        result.push(node.value);
        newSteps.push({
          description: `${type.toUpperCase()}: Visiting node ${node.value} (Root -> Left -> Right)`,
          tree: deepCopyTree(tree),
          highlightedNodes: [node.id],
          operation: type,
          result: `Current sequence: [${result.join(', ')}]`
        });
      }

      if (node.left) {
        newSteps.push({
          description: `${type.toUpperCase()}: Moving to left subtree of ${node.value}`,
          tree: deepCopyTree(tree),
          highlightedNodes: [node.id, node.left.id],
          operation: type
        });
        traverse(node.left);
      }

      if (type === 'inorder') {
        result.push(node.value);
        newSteps.push({
          description: `${type.toUpperCase()}: Visiting node ${node.value} (Left -> Root -> Right)`,
          tree: deepCopyTree(tree),
          highlightedNodes: [node.id],
          operation: type,
          result: `Current sequence: [${result.join(', ')}]`
        });
      }

      if (node.right) {
        newSteps.push({
          description: `${type.toUpperCase()}: Moving to right subtree of ${node.value}`,
          tree: deepCopyTree(tree),
          highlightedNodes: [node.id, node.right.id],
          operation: type
        });
        traverse(node.right);
      }

      if (type === 'postorder') {
        result.push(node.value);
        newSteps.push({
          description: `${type.toUpperCase()}: Visiting node ${node.value} (Left -> Right -> Root)`,
          tree: deepCopyTree(tree),
          highlightedNodes: [node.id],
          operation: type,
          result: `Current sequence: [${result.join(', ')}]`
        });
      }
    };

    traverse(tree);

    newSteps.push({
      description: `${type.toUpperCase()} traversal completed!`,
      tree: deepCopyTree(tree),
      highlightedNodes: [],
      operation: type,
      result: `Final ${type} sequence: [${result.join(', ')}]`
    });

    setSteps(newSteps);
    setCurrentStep(-1);
    playAnimation(newSteps);
  };

  // Animation Control
  const playAnimation = (stepsToPlay: VisualizationStep[]) => {
    if (stepsToPlay.length === 0) return;
    
    setIsPlaying(true);
    let stepIndex = 0;

    const playStep = () => {
      if (stepIndex < stepsToPlay.length) {
        setCurrentStep(stepIndex);
        const step = stepsToPlay[stepIndex];
        setMessage(step.description);
        
        stepIndex++;
        animationRef.current = setTimeout(playStep, ANIMATION_SPEED[animationSpeed]);
      } else {
        setIsPlaying(false);
        const lastStep = stepsToPlay[stepsToPlay.length - 1];
        if (lastStep.result) {
          setMessage(lastStep.result);
        }
      }
    };

    playStep();
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const resetVisualization = () => {
    pauseAnimation();
    setTree(null);
    setSteps([]);
    setCurrentStep(-1);
    setMessage('Tree cleared! Ready for new operations.');
    nodeIdCounter = 0;
  };

  const generateRandomTree = () => {
    resetVisualization();
    const values = [50, 30, 70, 20, 40, 60, 80];
    let newTree: TreeNode | null = null;

    // Build tree sequentially
    values.forEach((value, index) => {
      if (index === 0) {
        newTree = createNode(value);
      } else {
        // Simple BST insertion for demo
        const insert = (node: TreeNode, val: number) => {
          if (val < node.value) {
            if (!node.left) {
              node.left = createNode(val);
            } else {
              insert(node.left, val);
            }
          } else {
            if (!node.right) {
              node.right = createNode(val);
            } else {
              insert(node.right, val);
            }
          }
        };
        if (newTree) insert(newTree, value);
      }
    });

    if (newTree) {
      updateTreeLayout(newTree);
      setTree(newTree);
      setMessage('Random binary search tree generated! Try some operations.');
    }
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tree) return;

    const currentTreeState = steps[currentStep]?.tree || tree;
    const highlighted = steps[currentStep]?.highlightedNodes || [];

    // Draw edges first
    const drawEdges = (node: TreeNode) => {
      if (node.left) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + NODE_SIZE / 2);
        ctx.lineTo(node.left.x, node.left.y + NODE_SIZE / 2);
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawEdges(node.left);
      }
      if (node.right) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + NODE_SIZE / 2);
        ctx.lineTo(node.right.x, node.right.y + NODE_SIZE / 2);
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawEdges(node.right);
      }
    };

    // Draw nodes
    const drawNodes = (node: TreeNode) => {
      const isHighlighted = highlighted.includes(node.id);
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y + NODE_SIZE / 2, NODE_SIZE / 2, 0, 2 * Math.PI);
      
      if (isHighlighted) {
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
      }
      
      ctx.fill();
      ctx.stroke();

      // Node value
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.value.toString(), node.x, node.y + NODE_SIZE / 2);

      if (node.left) drawNodes(node.left);
      if (node.right) drawNodes(node.right);
    };

    if (currentTreeState) {
      drawEdges(currentTreeState);
      drawNodes(currentTreeState);
    }
  }, [tree, steps, currentStep]);

  // Event handlers
  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    const parent = parentValue ? parseInt(parentValue) : undefined;
    if (parentValue && isNaN(parent!)) return;

    setOperation('insert');
    insertNode(value, parent, direction);
    setInputValue('');
    setParentValue('');
  };

  const handleSearch = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    setOperation('search');
    searchNode(value);
    setInputValue('');
  };

  const handleDelete = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    setOperation('delete');
    deleteNode(value);
    setInputValue('');
  };

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
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Binary Tree Visualizer
              </span>
            </h1>
            <p className="text-gray-400">Interactive tree operations with step-by-step visualization</p>
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
                <h4 className="font-semibold text-purple-300 mb-2">Basic Operations</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• <strong>Insert:</strong> Add nodes with optional parent specification</li>
                  <li>• <strong>Search:</strong> Find nodes in the tree</li>
                  <li>• <strong>Delete:</strong> Remove nodes (handles all cases)</li>
                  <li>• <strong>Traverse:</strong> Walk through tree in different orders</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">Controls</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Use speed slider to control animation timing</li>
                  <li>• Pause/resume animations anytime</li>
                  <li>• Generate random tree for quick testing</li>
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
            <div className="text-lg font-bold capitalize">{operation || 'None'}</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
            <div className="text-yellow-300 text-sm font-medium">Step</div>
            <div className="text-2xl font-bold">{currentStep + 1}/{steps.length || 1}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300">Tree Operations</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value"
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <input
                  type="number"
                  value={parentValue}
                  onChange={(e) => setParentValue(e.target.value)}
                  placeholder="Parent value (optional)"
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex gap-4 items-center">
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as 'left' | 'right')}
                  className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="left">Left Child</option>
                  <option value="right">Right Child</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleInsert}
                  disabled={isPlaying || !inputValue}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                  Insert
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isPlaying || !inputValue}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <Search size={20} />
                  Search
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPlaying || !inputValue}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                  Delete
                </button>
                <button
                  onClick={generateRandomTree}
                  disabled={isPlaying}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <Zap size={20} />
                  Random
                </button>
              </div>
            </div>

            {/* Animation Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300">Animation & Traversal</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => traverseTree('inorder')}
                  disabled={isPlaying || !tree}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed text-sm"
                >
                  Inorder
                </button>
                <button
                  onClick={() => traverseTree('preorder')}
                  disabled={isPlaying || !tree}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed text-sm"
                >
                  Preorder
                </button>
                <button
                  onClick={() => traverseTree('postorder')}
                  disabled={isPlaying || !tree}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed text-sm"
                >
                  Postorder
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(e.target.value as keyof typeof ANIMATION_SPEED)}
                  className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="slow">Slow</option>
                  <option value="medium">Medium</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div className="flex gap-3">
                {isPlaying ? (
                  <button
                    onClick={pauseAnimation}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl font-semibold transition-all duration-300"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => steps.length > 0 && playAnimation(steps)}
                    disabled={steps.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    <Play size={16} />
                    Replay
                  </button>
                )}
                <button
                  onClick={resetVisualization}
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
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
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
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Highlighted Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gray-500"></div>
              <span className="text-gray-300">Edge</span>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        {steps.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Step Navigation</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentStep(Math.max(-1, currentStep - 1))}
                disabled={currentStep <= -1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              
              <div className="flex-1 text-center">
                <div className="text-sm text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep >= steps.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinaryTreeVisualizer;