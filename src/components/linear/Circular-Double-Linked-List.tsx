import React, { useRef, useState } from "react";

type Node<T> = {
  id: number;
  value: T;
  next: Node<T> | null;
  prev: Node<T> | null;
};

class CircularDoublyLinkedList<T> {
  head: Node<T> | null = null;
  private _id = 0;

  insert(value: T) {
    const newNode: Node<T> = { id: this._id++, value, next: null, prev: null };
    if (!this.head) {
      newNode.next = newNode;
      newNode.prev = newNode;
      this.head = newNode;
    } else {
      const tail = this.head.prev!;
      tail.next = newNode;
      newNode.prev = tail;
      newNode.next = this.head;
      this.head.prev = newNode;
    }
  }

  deleteById(id: number) {
    if (!this.head) return;
    let curr = this.head;
    let found = false;
    do {
      if (curr.id === id) {
        found = true;
        break;
      }
      curr = curr.next!;
    } while (curr !== this.head);

    if (!found) return;

    if (curr.next === curr) {
      // Only one node
      this.head = null;
    } else {
      curr.prev!.next = curr.next;
      curr.next!.prev = curr.prev;
      if (curr === this.head) {
        this.head = curr.next;
      }
    }
  }

  updateById(id: number, newValue: T) {
    if (!this.head) return;
    let curr = this.head;
    do {
      if (curr.id === id) {
        curr.value = newValue;
        break;
      }
      curr = curr.next!;
    } while (curr !== this.head);
  }

  toArray(): { id: number; value: T }[] {
    const arr: { id: number; value: T }[] = [];
    if (!this.head) return arr;
    let curr = this.head;
    do {
      arr.push({ id: curr.id, value: curr.value });
      curr = curr.next!;
    } while (curr !== this.head);
    return arr;
  }
}

const getNodeStyle = () =>
  "w-16 h-16 flex items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30 relative";

const CircularDoubleLinkedListComponent: React.FC = () => {
  const list = useRef(new CircularDoublyLinkedList<number>());
  const [input, setInput] = useState("");
  const [values, setValues] = useState<{ id: number; value: number }[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleAdd = () => {
    const num = parseInt(input, 10);
    if (!isNaN(num)) {
      list.current.insert(num);
      setValues(list.current.toArray());
      setInput("");
    }
  };

  const handleDelete = (id: number) => {
    list.current.deleteById(id);
    setValues(list.current.toArray());
  };

  const handleEdit = (id: number, value: number) => {
    setEditId(id);
    setEditValue(value.toString());
  };

  const handleUpdate = (id: number) => {
    const num = parseInt(editValue, 10);
    if (!isNaN(num)) {
      list.current.updateById(id, num);
      setValues(list.current.toArray());
      setEditId(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditValue("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700 shadow-lg">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Circular Doubly Linked List
            </span>
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter number"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 mt-8 mb-4">
            {values.length === 0 ? (
              <span className="text-gray-400">List is empty</span>
            ) : (
              values.map((node) => (
                <div key={node.id} className={getNodeStyle()}>
                  {editId === node.id ? (
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
                          onClick={() => handleUpdate(node.id)}
                          className="bg-green-600 hover:bg-green-700 text-xs rounded px-2 py-0.5 font-bold"
                          title="Save"
                        >
                          ✔
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-xs rounded px-2 py-0.5 font-bold"
                          title="Cancel"
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {node.value}
                      <button
                        onClick={() => handleDelete(node.id)}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
                        title="Delete"
                      >
                        ×
                      </button>
                      <button
                        onClick={() => handleEdit(node.id, node.value)}
                        className="absolute -bottom-2 -right-2 bg-yellow-400 hover:bg-yellow-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg text-black"
                        title="Edit"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          {values.length > 0 && (
            <div className="text-center text-gray-400 mt-2 text-sm">
              {values.map((_, idx) =>
                idx < values.length - 1 ? (
                  <span key={idx}>⇄ </span>
                ) : (
                  <span key={idx}>⇄ (circular)</span>
                )
              )}
            </div>
          )}
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-2 text-cyan-300">About</h3>
          <p className="text-gray-300 leading-relaxed">
            A circular doubly linked list is a linked data structure that consists
            of a set of sequentially linked records called nodes. Each node
            contains three fields: two link fields and one data field. The two link
            fields are references to the previous and to the next node in the
            sequence of nodes. The last node's next points to the head, and the
            head's prev points to the last node, making the list circular.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircularDoubleLinkedListComponent;