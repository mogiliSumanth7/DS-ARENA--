import React, { useRef, useState, useEffect } from "react";

// Tailwind color classes for queue states
const colorClasses = {
  empty: "bg-gradient-to-br from-gray-700 to-gray-900 text-gray-400 border-gray-600",
  enqueuing: "bg-gradient-to-br from-orange-500 to-yellow-400 text-white border-yellow-400 animate-pulse scale-105 shadow-lg shadow-yellow-400/30",
  dequeuing: "bg-gradient-to-br from-red-600 to-rose-500 text-white border-rose-400 animate-pulse scale-105 shadow-lg shadow-rose-400/30",
  peek: "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400 animate-pulse scale-105 shadow-lg shadow-green-400/30",
  filled: "bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-blue-400 shadow-lg shadow-blue-400/20",
};

const validSymbols = [
  "+", "/", "%", "<", "<=", "=", "==", "!=", "&&", "||", "!", "&", "|", "^", "~", "<<",
  "+=", "-=", "*=", "/=", "%=", "(", ")", "[", "]", "{", "}", ";", ",", ":", ".", "'", '"'
];

const animationSpeed = 900;

function formatValue(value: string | number) {
  if (value === "_") return "_";
  if (isNaN(Number(value)) || validSymbols.includes(String(value))) return `'${value}'`;
  return value;
}

function highlightWords(message: string) {
  const keywords = [
    "Enqueuing", "Dequeuing", "Peeking", "Resetting", "Value", "Size", "Capacity",
    "Invalid", "Queue Full", "Queue Empty", "Warning", "enqueue", "dequeue", "peek",
    "reset", "Help", "Circular Queue", "Wrapped"
  ];
  let highlightedMessage = message;
  keywords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    highlightedMessage = highlightedMessage.replace(
      regex,
      `<span class="text-yellow-300 font-semibold">${word}</span>`
    );
  });
  return highlightedMessage;
}

const defaultCapacity = 5;

type QueueElement = string | number | "_";

const CircularQueue: React.FC = () => {
  // State
  const [queue, setQueue] = useState<QueueElement[]>(Array(defaultCapacity).fill("_"));
  const [queueMax, setQueueMax] = useState(defaultCapacity);
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const [capacityInput, setCapacityInput] = useState(defaultCapacity);
  const [lastEnqueued, setLastEnqueued] = useState<string | number>("-");
  const [lastDequeued, setLastDequeued] = useState<string | number>("-");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [message, setMessage] = useState(
    "Welcome: Use the controls to <span class=\"text-yellow-300 font-semibold\">enqueue</span>, <span class=\"text-yellow-300 font-semibold\">dequeue</span>, <span class=\"text-yellow-300 font-semibold\">peek</span>, or <span class=\"text-yellow-300 font-semibold\">reset</span> the circular queue!"
  );
  const [showHelp, setShowHelp] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const queueContainerRef = useRef<HTMLDivElement>(null);

  // Helpers
  const getSize = () => {
    if (front === -1) return 0;
    return (rear - front + queue.length) % queue.length + 1;
  };

  const isQueueFull = () => ((rear + 1) % queue.length) === front;
  const isQueueEmpty = () => front === -1;

  // Effects
  useEffect(() => {
    updateCode("init");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light");
      document.body.classList.add("bg-gray-900", "text-white");
    } else {
      document.body.classList.remove("bg-gray-900", "text-white");
      document.body.classList.add("light");
    }
    return () => {
      document.body.classList.remove("bg-gray-900", "text-white", "light");
    };
  }, [isDarkMode]);

  // UI Update helpers
  function updateMessage(msg: string) {
    setMessage(highlightWords(msg));
  }

  function updateCode(operation: string, value: any = null) {
    let code = `// Circular Queue Implementation\n`;
    code += `let queue = [${queue.map(v => formatValue(v)).join(", ")}];\n`;
    code += `let queueMax = ${queueMax};\n`;
    code += `let front = ${front};\n`;
    code += `let rear = ${rear};\n\n`;

    switch (operation) {
      case "init":
        code += "// Ready for operations...\n";
        break;
      case "capacity":
        code += "// Updating Capacity\n";
        code += `queueMax = ${value};\n`;
        code += `if (${getSize()} > queueMax) {\n`;
        code += "    // Warning: Queue size exceeds capacity!\n}\n";
        break;
      case "enqueue":
        code += "// Enqueue Operation\n";
        code += "if (!isQueueFull()) {\n";
        code += "    if (isQueueEmpty()) {\n        front = 0;\n    }\n";
        code += "    rear = (rear + 1) % queueMax;\n";
        code += `    queue[rear] = ${formatValue(value)};\n`;
        code += "} else {\n    // Queue Full!\n}\n";
        break;
      case "dequeue":
        code += "// Dequeue Operation\n";
        code += "if (!isQueueEmpty()) {\n";
        code += "    let value = queue[front];\n";
        code += "    queue[front] = '_';\n";
        code += "    if (front === rear) {\n        front = -1;\n        rear = -1;\n    } else {\n        front = (front + 1) % queueMax;\n    }\n";
        code += `    // Dequeued: ${formatValue(lastDequeued)}\n`;
        code += "} else {\n    // Queue Empty!\n}\n";
        break;
      case "peek":
        code += "// Peek Operation\n";
        code += "if (!isQueueEmpty()) {\n";
        code += "    let value = queue[front];\n";
        code += `    // Front Value: ${front !== -1 ? formatValue(queue[front]) : "-"}\n`;
        code += "} else {\n    // Queue Empty!\n}\n";
        break;
      case "reset":
        code += "// Reset Operation\n";
        code += "queue = Array(5).fill('_');\n";
        code += "queueMax = 5;\n";
        code += "front = -1;\n";
        code += "rear = -1;\n";
        break;
    }
    setCodeContent(code);
  }

  // Operations
  async function enqueue() {
    if (isAnimating) return;
    const value = inputValue.trim();
    if (
      value === "" ||
      (!validSymbols.includes(value) && isNaN(Number(value)))
    ) {
      updateMessage(
        "Invalid Value: Enter a valid number or a valid symbol (e.g., 10, +, &&) to enqueue."
      );
      updateCode("init");
      return;
    }
    if (isQueueFull()) {
      updateMessage("Queue Full: Cannot enqueue to the Circular Queue.");
      updateCode("enqueue", value);
      return;
    }
    setIsAnimating(true);

    let newRear = (rear + 1) % queue.length;
    let newFront = front === -1 ? 0 : front;
    let newQueue = [...queue];
    newQueue[newRear] = value;
    setQueue(newQueue);
    setRear(newRear);
    setFront(newFront);
    setLastEnqueued(value);

    updateMessage(
      `Enqueuing Element: Value ${formatValue(value)} is being added at index ${newRear}${newRear < (rear - 1 + queue.length) % queue.length ? " (Wrapped)" : ""}.`
    );
    updateCode("enqueue", value);

    await new Promise(res => setTimeout(res, animationSpeed));
    setInputValue("");
    setIsAnimating(false);
  }

  async function dequeue() {
    if (isAnimating) return;
    if (isQueueEmpty()) {
      updateMessage("Queue Empty: The Circular Queue is empty! Nothing to dequeue.");
      updateCode("dequeue");
      return;
    }
    setIsAnimating(true);

    let value = queue[front];
    let newQueue = [...queue];
    newQueue[front] = "_";
    let newFront = front;
    let newRear = rear;
    if (front === rear) {
      newFront = -1;
      newRear = -1;
    } else {
      newFront = (front + 1) % queue.length;
    }
    setQueue(newQueue);
    setFront(newFront);
    setRear(newRear);
    setLastDequeued(value);

    updateMessage(
      `Dequeuing Element: Value ${formatValue(value)} is being removed from index ${front}.`
    );
    updateCode("dequeue");

    await new Promise(res => setTimeout(res, animationSpeed));
    setIsAnimating(false);
  }

  async function peekQueue() {
    if (isAnimating) return;
    if (isQueueEmpty()) {
      updateMessage("Queue Empty: The Circular Queue is empty! Nothing to peek.");
      updateCode("peek");
      return;
    }
    setIsAnimating(true);
    setPeekIndex(front);

    updateMessage(
      `Peeking Front Element: Value ${formatValue(queue[front])} at index ${front}.`
    );
    updateCode("peek");

    await new Promise(res => setTimeout(res, animationSpeed));
    setPeekIndex(null);
    setIsAnimating(false);
  }

  async function resetQueue() {
    if (isAnimating) return;
    setIsAnimating(true);

    updateMessage("Resetting Queue: The Circular Queue is being cleared and capacity set to 5.");
    updateCode("reset");

    setQueue(Array(defaultCapacity).fill("_"));
    setQueueMax(defaultCapacity);
    setFront(-1);
    setRear(-1);
    setLastEnqueued("-");
    setLastDequeued("-");
    setCapacityInput(defaultCapacity);

    await new Promise(res => setTimeout(res, animationSpeed));
    setIsAnimating(false);
  }

  function updateQueueCapacity(e: React.ChangeEvent<HTMLInputElement>) {
    const newCapacity = parseInt(e.target.value);
    if (isNaN(newCapacity) || newCapacity < 1) {
      updateMessage("Invalid Capacity: Enter a positive number for queue capacity.");
      setCapacityInput(queueMax);
      updateCode("capacity", queueMax);
      return;
    }
    setQueueMax(newCapacity);
    setCapacityInput(newCapacity);

    // Copy elements to new queue
    let oldQueue = queue;
    let newQueue: QueueElement[] = Array(newCapacity).fill("_");
    let newFront = -1;
    let newRear = -1;
    let count = 0;

    if (front !== -1) {
      let current = front;
      let newIndex = 0;
      while (current !== rear && newIndex < newCapacity) {
        newQueue[newIndex] = oldQueue[current];
        newFront = newFront === -1 ? 0 : newFront;
        newRear = newIndex;
        current = (current + 1) % oldQueue.length;
        newIndex++;
        count++;
      }
      if (current === rear && newIndex < newCapacity) {
        newQueue[newIndex] = oldQueue[current];
        newRear = newIndex;
      } else if (count > 0 && newIndex >= newCapacity) {
        updateMessage(`Warning: Queue truncated to fit new capacity (${newCapacity}).`);
      }
    }

    setQueue(newQueue);
    setFront(newFront);
    setRear(newRear);

    updateMessage(`Capacity Updated: Queue capacity set to ${newCapacity}.`);
    updateCode("capacity", newCapacity);
  }

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center w-full">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Circular Queue Visualizer
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700 text-center">
          <span className="text-gray-300 text-lg">
            An interactive tool to understand the First-In-First-Out (FIFO) Circular Queue with wrap-around functionality and smooth animations.
          </span>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <label htmlFor="queueInput" className="text-gray-300 font-semibold">Value:</label>
            <input
              type="text"
              id="queueInput"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder='e.g., "10", "+", "&&"'
              disabled={isAnimating}
              className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 w-32"
            />
            <label htmlFor="queueCapacity" className="text-gray-300 font-semibold">Capacity:</label>
            <input
              type="number"
              id="queueCapacity"
              value={capacityInput}
              min={1}
              max={100}
              onChange={updateQueueCapacity}
              disabled={isAnimating}
              className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 w-24"
            />
            <button
              onClick={enqueue}
              disabled={isAnimating}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:bg-gray-600"
            >
              Enqueue
            </button>
            <button
              onClick={dequeue}
              disabled={isAnimating}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:bg-gray-600"
            >
              Dequeue
            </button>
            <button
              onClick={peekQueue}
              disabled={isAnimating}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:bg-gray-600"
            >
              Peek
            </button>
            <button
              onClick={resetQueue}
              disabled={isAnimating}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={() => setShowHelp(true)}
              disabled={isAnimating}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:bg-gray-600"
            >
              Help
            </button>
            <div className="flex items-center ml-4">
              <span className="text-gray-400 mr-2">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode((d) => !d)}
                  disabled={isAnimating}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Queue Visualization */}
            <div className="flex-1 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4 text-blue-300">Circular Queue (FIFO)</h2>
              <div className="flex flex-col items-center w-full">
                <div className="flex flex-row items-end justify-center gap-2 w-full mb-4">
                  {queue.map((v, i) => {
                    let state = "filled";
                    if (v === "_") state = "empty";
                    if (i === rear && lastEnqueued !== "-" && !isAnimating) state = "enqueuing";
                    if (i === front && lastDequeued !== "-" && !isAnimating) state = "dequeuing";
                    if (peekIndex === i) state = "peek";
                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-end w-16 h-24 md:w-20 md:h-28 rounded-xl border-2 mx-1 transition-all duration-500 ${colorClasses[state as keyof typeof colorClasses]}`}
                        style={{
                          minWidth: "3.5rem",
                          minHeight: "5rem",
                        }}
                      >
                        <span className="text-xl md:text-2xl font-mono font-bold select-none">{v}</span>
                        <span className="text-xs text-gray-400 mt-1">Index: {i}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-row justify-between w-full px-2">
                  <div className="text-yellow-300 font-mono font-semibold">
                    Front: {front}
                  </div>
                  <div className="text-yellow-300 font-mono font-semibold">
                    Rear: {rear}
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-6 flex-wrap text-sm mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-600"></div>
                  <span>Filled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-700 to-gray-900"></div>
                  <span>Empty</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-500 to-yellow-400"></div>
                  <span>Enqueuing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-red-600 to-rose-500"></div>
                  <span>Dequeuing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600"></div>
                  <span>Peeking</span>
                </div>
              </div>
            </div>
            {/* Side Info */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-cyan-300">Queue Info</h2>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span>Front Element</span>
                    <span className="font-mono">{front !== -1 ? queue[front] : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Enqueued Item</span>
                    <span className="font-mono">{lastEnqueued}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Dequeued Item</span>
                    <span className="font-mono">{lastDequeued}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size of Queue</span>
                    <span className="font-mono">{getSize()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queue Array</span>
                    <span className="font-mono">[{queue.map(formatValue).join(", ")}]</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div
                  className="mb-4 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: message }}
                />
                <div className="bg-gray-800/80 rounded-lg p-4 font-mono text-xs text-blue-200 whitespace-pre-wrap border border-blue-700">
                  {codeContent}
                </div>
              </div>
              <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h3 className="text-lg font-bold mb-2 text-blue-300">Circular Queue Notes</h3>
                <ul className="list-disc pl-6 text-gray-300 text-sm space-y-1">
                  <li>
                    A <span className="text-yellow-300 font-semibold">Circular Queue</span> follows the FIFO principle with elements added at the rear and removed from the front.
                  </li>
                  <li>
                    It has a fixed size, but wraps around when the rear reaches the end, improving space efficiency.
                  </li>
                  <li>
                    Empty slots are marked with '_', and pointers (front, rear) track the queue's state.
                  </li>
                  <li>
                    Used in scenarios like buffering data streams or process scheduling.
                  </li>
                  <li>
                    Key operations: <span className="text-yellow-300 font-semibold">enqueue</span>, <span className="text-yellow-300 font-semibold">dequeue</span>, <span className="text-yellow-300 font-semibold">peek</span>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Complexity Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Enqueue:</strong> O(1)
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
              <strong className="text-red-300">Dequeue:</strong> O(1)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Peek:</strong> O(1)
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Space:</strong> O(1)
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) setShowHelp(false); }}>
          <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-blue-700 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-2xl text-red-400 hover:text-red-600 font-bold"
              onClick={() => setShowHelp(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4 text-yellow-300">How to Use</h3>
            <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-4">
              <li>
                <strong>Enqueue</strong>: Enter a number or symbol (e.g., 10, +, &&) in the "Value" field and click "Enqueue" to add it to the rear of the queue.
              </li>
              <li>
                <strong>Dequeue</strong>: Click "Dequeue" to remove the front element from the queue.
              </li>
              <li>
                <strong>Peek</strong>: Click "Peek" to view the front element without removing it.
              </li>
              <li>
                <strong>Reset</strong>: Click "Reset" to clear the queue and set the capacity back to 5.
              </li>
              <li>
                <strong>Capacity</strong>: Adjust the queue's maximum size (1-100) using the "Capacity" field.
              </li>
              <li>
                <strong>Dark/Light Mode</strong>: Toggle between dark and light themes using the switch in the controls.
              </li>
            </ul>
            <h3 className="text-xl font-bold mb-2 text-blue-300">Color Types</h3>
            <ul className="list-disc pl-6 text-gray-200 space-y-2">
              <li>
                <span className="inline-block w-4 h-4 rounded bg-gradient-to-br from-orange-500 to-yellow-400 mr-2"></span>
                <strong>Enqueuing</strong>: Orange indicates an element being added to the queue.
              </li>
              <li>
                <span className="inline-block w-4 h-4 rounded bg-gradient-to-br from-red-600 to-rose-500 mr-2"></span>
                <strong>Dequeuing</strong>: Red indicates an element being removed from the queue.
              </li>
              <li>
                <span className="inline-block w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600 mr-2"></span>
                <strong>Peeking</strong>: Green indicates the front element being viewed without removal.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircularQueue;