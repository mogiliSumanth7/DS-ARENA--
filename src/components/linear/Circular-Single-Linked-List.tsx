import React, { useState } from "react";

type Node = {
  value: number;
  next: Node | null;
};

function createNode(value: number): Node {
  return { value, next: null };
}

const CircularSingleLinkedList: React.FC = () => {
  const [head, setHead] = useState<Node | null>(null);
  const [input, setInput] = useState("");
  const [list, setList] = useState<number[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Helper to update the list for rendering
  const updateList = (start: Node | null) => {
    const result: number[] = [];
    if (!start) {
      setList([]);
      return;
    }
    let curr = start;
    do {
      result.push(curr.value);
      curr = curr.next!;
    } while (curr !== start && curr !== null);
    setList(result);
  };

  // Insert at end
  const insert = (value: number) => {
    const newNode = createNode(value);
    if (!head) {
      newNode.next = newNode;
      setHead(newNode);
      updateList(newNode);
      return;
    }
    let curr = head;
    while (curr.next !== head) {
      curr = curr.next!;
    }
    curr.next = newNode;
    newNode.next = head;
    updateList(head);
  };

  // Delete by value
  const remove = (value: number) => {
    if (!head) return;
    let curr = head;
    let prev: Node | null = null;
    do {
      if (curr.value === value) {
        if (prev) {
          prev.next = curr.next;
          if (curr === head) setHead(curr.next);
        } else {
          // Deleting head
          if (curr.next === head) {
            setHead(null);
            updateList(null);
            return;
          }
          let tail = head;
          while (tail.next !== head) tail = tail.next!;
          tail.next = curr.next;
          setHead(curr.next);
        }
        updateList(head === curr ? curr.next : head);
        return;
      }
      prev = curr;
      curr = curr.next!;
    } while (curr !== head);
  };

  // Update by index
  const update = (idx: number, newValue: number) => {
    if (!head) return;
    let curr = head;
    let i = 0;
    do {
      if (i === idx) {
        curr.value = newValue;
        updateList(head);
        return;
      }
      curr = curr.next!;
      i++;
    } while (curr !== head);
  };

  // Handle input
  const handleAdd = () => {
    const num = parseInt(input);
    if (!isNaN(num)) {
      insert(num);
      setInput("");
    }
  };

  // Handle update save
  const handleUpdateSave = (idx: number) => {
    const num = parseInt(editValue);
    if (!isNaN(num)) {
      update(idx, num);
      setEditIdx(null);
      setEditValue("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center w-full">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Circular Singly Linked List
            </span>
          </h1>
        </div>

        {/* Info Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-2 text-purple-300">How it Works</h2>
          <p className="text-gray-300 leading-relaxed">
            A circular singly linked list is a linked list where the last node points back to the head, forming a circle.
            You can add nodes to the end and remove nodes by value.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Insert:</strong> O(n)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Delete:</strong> O(n)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Circular:</strong> Last node points to head
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-cyan-300">Add Node</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter value"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Add
            </button>
          </div>
        </div>

        {/* Visualization Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-white text-center">Visualization</h3>
          <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
            {list.length === 0 ? (
              <span className="text-gray-400">List is empty</span>
            ) : (
              list.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-xl font-bold text-white text-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg mb-2 relative">
                    {editIdx === idx ? (
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-12 text-black rounded px-1 mb-1 text-center"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateSave(idx)}
                            className="bg-green-600 hover:bg-green-700 text-xs rounded px-2 py-0.5 font-bold"
                            title="Save"
                          >
                            ✔
                          </button>
                          <button
                            onClick={() => {
                              setEditIdx(null);
                              setEditValue("");
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-xs rounded px-2 py-0.5 font-bold"
                            title="Cancel"
                          >
                            ✖
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {val}
                        <button
                          onClick={() => remove(val)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
                          title="Delete"
                        >
                          ×
                        </button>
                        <button
                          onClick={() => {
                            setEditIdx(idx);
                            setEditValue(val.toString());
                          }}
                          className="absolute -bottom-2 -right-2 bg-yellow-400 hover:bg-yellow-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg text-black"
                          title="Edit"
                        >
                          ✎
                        </button>
                      </>
                    )}
                  </div>
                  {idx < list.length - 1 && (
                    <span className="text-2xl text-purple-400 mt-2">&#8594;</span>
                  )}
                  {idx === list.length - 1 && list.length > 1 && (
                    <span className="text-2xl text-pink-400 mt-2">&#8634;</span>
                  )}
                </div>
              ))
            )}
          </div>
          {list.length > 0 && (
            <p className="text-center text-lg text-purple-300 font-semibold">
              Head: <span className="text-white">{list[0]}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircularSingleLinkedList;