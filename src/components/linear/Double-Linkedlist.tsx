import React, { useState } from "react";

type Node = {
  value: number;
  prev: Node | null;
  next: Node | null;
};

function createNode(value: number): Node {
  return { value, prev: null, next: null };
}

const DoubleLinkedList: React.FC = () => {
  const [head, setHead] = useState<Node | null>(null);
  const [tail, setTail] = useState<Node | null>(null);
  const [input, setInput] = useState<string>("");

  // Helper to traverse and collect values
  const toArray = (): number[] => {
    const arr: number[] = [];
    let curr = head;
    while (curr) {
      arr.push(curr.value);
      curr = curr.next;
    }
    return arr;
  };

  // Add to end
  const addNode = () => {
    const num = parseInt(input);
    if (isNaN(num)) return;
    const newNode = createNode(num);
    if (!head) {
      setHead(newNode);
      setTail(newNode);
    } else {
      if (tail) {
        tail.next = newNode;
        newNode.prev = tail;
        setTail(newNode);
      }
    }
    setInput("");
  };

  // Remove from end
  const removeNode = () => {
    if (!tail) return;
    if (tail.prev) {
      tail.prev.next = null;
      setTail(tail.prev);
    } else {
      setHead(null);
      setTail(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-32"></div>
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Double Linked List
            </span>
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">
            How Double Linked List Works
          </h2>
          <p className="text-gray-300 leading-relaxed">
            A double linked list is a linear data structure where each node points
            to both its previous and next node. You can efficiently add or remove
            nodes from both ends.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Insert/Remove at End:</strong>{" "}
              O(1)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Traversal:</strong> O(n)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Bidirectional:</strong> Yes
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter value"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={addNode}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Add
            </button>
            <button
              onClick={removeNode}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Remove Last
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Visualization
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Each node shows its value. The arrows indicate the double links
              between nodes.
            </p>
          </div>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {toArray().length === 0 ? (
              <span className="text-gray-400">List is empty</span>
            ) : (
              toArray().map((val, idx, arr) => (
                <React.Fragment key={idx}>
                  <div
                    className="w-16 h-16 flex items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30"
                  >
                    {val}
                  </div>
                  {idx < arr.length - 1 && (
                    <span className="text-2xl text-purple-300 select-none">
                      ⇄
                    </span>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubleLinkedList;