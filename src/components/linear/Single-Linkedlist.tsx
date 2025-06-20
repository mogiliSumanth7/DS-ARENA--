import React, { useState } from "react";

type Node = {
  value: number;
  next: Node | null;
};

const SingleLinkedList: React.FC = () => {
  const [head, setHead] = useState<Node | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<number[]>([]);

  // Insert at end
  const insert = () => {
    const num = parseInt(input, 10);
    if (isNaN(num)) return;
    const newNode: Node = { value: num, next: null };
    if (!head) {
      setHead(newNode);
    } else {
      let curr = head;
      while (curr.next) curr = curr.next;
      curr.next = newNode;
      setHead({ ...head });
    }
    setInput("");
  };

  // Delete first occurrence
  const remove = () => {
    const num = parseInt(input, 10);
    if (isNaN(num) || !head) return;
    if (head.value === num) {
      setHead(head.next);
    } else {
      let curr = head;
      let prev: Node | null = null;
      while (curr && curr.value !== num) {
        prev = curr;
        curr = curr.next;
      }
      if (curr && prev) {
        prev.next = curr.next;
        setHead({ ...head }); // This triggers re-render
      }
    }
    setInput("");
  };

  // Display list
  const display = () => {
    let arr: number[] = [];
    let curr = head;
    while (curr) {
      arr.push(curr.value);
      curr = curr.next;
    }
    setOutput(arr);
  };

  // Visual node rendering
  const renderList = () => {
    let nodes = [];
    let curr = head;
    let idx = 0;
    while (curr) {
      nodes.push(
        <div key={idx} className="flex items-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-xl font-bold text-white text-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg border-2 border-blue-400">
            {curr.value}
          </div>
          {curr.next && (
            <span className="mx-2 text-3xl text-purple-400 font-bold">&rarr;</span>
          )}
        </div>
      );
      curr = curr.next;
      idx++;
    }
    if (nodes.length === 0) {
      return <span className="text-gray-400">List is empty</span>;
    }
    return nodes;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center w-full">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Singly Linked List
            </span>
          </h1>
        </div>

        {/* Info Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-700">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">How It Works</h2>
          <p className="text-gray-300 leading-relaxed">
            This visualization lets you insert and delete nodes in a singly linked list.
            Click "Insert" to add a node at the end, "Delete" to remove the first occurrence of a value, and "Display" to show the current list.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Insert:</strong> Adds node at end
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
              <strong className="text-purple-300">Delete:</strong> Removes first occurrence
            </div>
            <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-500/30">
              <strong className="text-cyan-300">Display:</strong> Shows current list
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter value"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={insert}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Insert
            </button>
            <button
              onClick={remove}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Delete
            </button>
            <button
              onClick={display}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Display
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-700 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-6 text-blue-200">Current List</h3>
          <div className="flex flex-wrap gap-4 justify-center items-center mb-4">
            {renderList()}
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            <strong>Output:</strong> {output.length > 0 ? output.join(" → ") : "No output yet"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleLinkedList;