import React, { useState, useRef } from "react";
import { Play, Pause, RotateCcw, HelpCircle, ArrowLeft, ArrowRight, Home } from "lucide-react";

const validSymbols = [
  "+", "/", "%", "<", "<=", "=", "==", "!=", "&&", "||", "!", "&", "|", "^", "~", "<<",
  "+=", "-=", "*=", "/=", "%=", "(", ")", "[", "]", "{", "}", ";", ",", ":", ".", "'", '"'
];

const animationSpeed = 1200;

function formatValue(value: string | number) {
  if (value === "_") return "_";
  if (isNaN(Number(value)) || validSymbols.includes(String(value)))
    return `'${value}'`;
  return value;
}

const highlightWords = (message: string) => {
  const keywords = [
    "Enqueuing", "Dequeuing", "Peeking", "Resetting", "Value", "Size", "Capacity",
    "Invalid", "Queue Full", "Queue Empty", "Warning", "enqueue", "dequeue", "peek",
    "reset", "Help", "Linear Queue"
  ];
  let highlightedMessage = message;
  keywords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    highlightedMessage = highlightedMessage.replace(
      regex,
      `<span class="text-yellow-400 font-semibold">${word}</span>`
    );
  });
  return highlightedMessage;
};

const defaultQueueSize = 5;

const getElementStyle = (status: string) => {
  const baseStyle =
    "w-20 h-20 flex flex-col items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg relative";
  switch (status) {
    case "enqueuing":
      return `${baseStyle} bg-gradient-to-br from-orange-500 to-yellow-400 scale-110 shadow-orange-400/50 animate-pulse`;
    case "dequeuing":
      return `${baseStyle} bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-500/50 animate-pulse`;
    case "peek":
      return `${baseStyle} bg-gradient-to-br from-green-500 to-emerald-600 scale-110 shadow-green-500/50 animate-pulse`;
    default:
      return `${baseStyle} bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30`;
  }
};

const LinearQueueVisualizer: React.FC = () => {
  const [queue, setQueue] = useState<(string | number)[]>(Array(defaultQueueSize).fill("_"));
  const [queueMax, setQueueMax] = useState(defaultQueueSize);
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const [capacityInput, setCapacityInput] = useState(defaultQueueSize);
  const [lastEnqueued, setLastEnqueued] = useState("-");
  const [lastDequeued, setLastDequeued] = useState("-");
  const [message, setMessage] = useState("Welcome: Use the controls to enqueue, dequeue, peek, or reset the queue!");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [code, setCode] = useState<string>("");

  // For animation status
  const [elementStatus, setElementStatus] = useState<string[]>(Array(defaultQueueSize).fill(""));

  const queueInputRef = useRef<HTMLInputElement>(null);

  // Utility
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Message with highlight
  const updateMessage = (msg: string) => {
    setMessage(msg);
  };

  // Code block update
  const updateCode = (operation: string, value: any = null) => {
    let code = `// Linear Queue Implementation\n`;
    code += `let queue = [${queue.map(v => formatValue(v)).join(", ")}];\n`;
    code += `let queueMax = ${queueMax};\n`;
    code += `let front = ${front};\n`;
    code += `let rear = ${rear};\n\n`;

    switch (operation) {
      case "init":
        code += "// Ready for operations...\n";
        break;
      case "capacity":
        code += `// Updating Capacity\nqueueMax = ${value};\n`;
        code += `if (rear >= queueMax) {\n  // Warning: Queue size exceeds capacity!\n}\n`;
        break;
      case "enqueue":
        code += `// Enqueue Operation\nif (rear < queueMax - 1) {\n  rear++;\n  queue[rear] = ${formatValue(value)};\n  if (front === -1) front = 0;\n} else {\n  // Queue Full!\n}\n`;
        break;
      case "dequeue":
        code += `// Dequeue Operation\nif (front !== -1) {\n  let value = queue[front];\n  queue[front] = '_';\n  front++;\n  if (front > rear) {\n    front = -1;\n    rear = -1;\n  }\n  // Dequeued: ${formatValue(lastDequeued)}\n} else {\n  // Queue Empty!\n}\n`;
        break;
      case "peek":
        code += `// Peek Operation\nif (front !== -1) {\n  let value = queue[front];\n  // Front Value: ${front !== -1 ? formatValue(queue[front]) : "-"}\n} else {\n  // Queue Empty!\n}\n`;
        break;
      case "reset":
        code += `// Reset Operation\nqueue = Array(5).fill('_');\nqueueMax = 5;\nfront = -1;\nrear = -1;\n`;
        break;
    }
    setCode(code);
  };

  // Controls
  const handleEnqueue = async () => {
    if (isAnimating) return;
    const value = inputValue.trim();
    if (
      value === "" ||
      (!validSymbols.includes(value) && isNaN(Number(value)))
    ) {
      updateMessage("Invalid Value: Enter a valid number or a valid symbol (e.g., 10, +, &&) to enqueue.");
      updateCode("init");
      return;
    }
    if (rear >= queue.length - 1) {
      updateMessage("Queue Full: Cannot enqueue to the Linear Queue.");
      updateCode("enqueue", value);
      return;
    }
    setIsAnimating(true);
    updateMessage(`Enqueuing Element: Value ${formatValue(value)} is being added at index ${rear + 1}.`);
    updateCode("enqueue", value);

    // Animate
    const newStatus = [...elementStatus];
    newStatus[rear + 1] = "enqueuing";
    setElementStatus(newStatus);
    await sleep(animationSpeed);

    const newQueue = [...queue];
    newQueue[rear + 1] = value;
    setQueue(newQueue);
    setRear(rear + 1);
    if (front === -1) setFront(0);
    setLastEnqueued(value);
    setInputValue("");
    newStatus[rear + 1] = "";
    setElementStatus([...newStatus]);
    setIsAnimating(false);
  };

  const handleDequeue = async () => {
    if (isAnimating || front === -1) {
      updateMessage("Queue Empty: The Linear Queue is empty! Nothing to dequeue.");
      updateCode("dequeue");
      return;
    }
    setIsAnimating(true);
    const value = queue[front];
    updateMessage(`Dequeuing Element: Value ${formatValue(value)} is being removed from index ${front}.`);
    updateCode("dequeue");

    // Animate
    const newStatus = [...elementStatus];
    newStatus[front] = "dequeuing";
    setElementStatus(newStatus);
    await sleep(animationSpeed);

    const newQueue = [...queue];
    newQueue[front] = "_";
    let newFront = front + 1;
    let newRear = rear;
    if (newFront > rear) {
      newFront = -1;
      newRear = -1;
    }
    setQueue(newQueue);
    setFront(newFront);
    setRear(newRear);
    setLastDequeued(value);
    newStatus[front] = "";
    setElementStatus([...newStatus]);
    setIsAnimating(false);
  };

  const handlePeek = async () => {
    if (isAnimating || front === -1) {
      updateMessage("Queue Empty: The Linear Queue is empty! Nothing to peek.");
      updateCode("peek");
      return;
    }
    setIsAnimating(true);
    const value = queue[front];
    updateMessage(`Peeking Front Element: Value ${formatValue(value)} at index ${front}.`);
    updateCode("peek");

    // Animate
    const newStatus = [...elementStatus];
    newStatus[front] = "peek";
    setElementStatus(newStatus);
    await sleep(animationSpeed);
    newStatus[front] = "";
    setElementStatus([...newStatus]);
    setIsAnimating(false);
  };

  const handleReset = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    updateMessage("Resetting Queue: The Linear Queue is being cleared and capacity set to 5.");
    updateCode("reset");
    await sleep(animationSpeed);
    setQueue(Array(defaultQueueSize).fill("_"));
    setQueueMax(defaultQueueSize);
    setFront(-1);
    setRear(-1);
    setLastEnqueued("-");
    setLastDequeued("-");
    setCapacityInput(defaultQueueSize);
    setElementStatus(Array(defaultQueueSize).fill(""));
    setIsAnimating(false);
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCapacity = parseInt(e.target.value);
    if (isNaN(newCapacity) || newCapacity < 1) {
      updateMessage("Invalid Capacity: Enter a positive number for queue capacity.");
      setCapacityInput(queueMax);
      updateCode("capacity", queueMax);
      return;
    }
    setCapacityInput(newCapacity);
    setQueueMax(newCapacity);
    let newQueue = Array(newCapacity).fill("_");
    let newRear = rear;
    let newFront = front;
    let newStatus = Array(newCapacity).fill("");
    if (rear !== -1) {
      for (let i = front; i <= Math.min(rear, newCapacity - 1); i++) {
        newQueue[i] = queue[i];
        newStatus[i] = elementStatus[i];
      }
      if (rear >= newCapacity) {
        newRear = newCapacity - 1;
        updateMessage(`Warning: Queue truncated to fit new capacity (${newCapacity}).`);
      }
    }
    setQueue(newQueue);
    setRear(newRear);
    setFront(newFront);
    setElementStatus(newStatus);
    updateMessage(`Capacity Updated: Queue capacity set to ${newCapacity}.`);
    updateCode("capacity", newCapacity);
  };

  // Theme
  React.useEffect(() => {
    document.body.classList.toggle("light-mode", !isDarkMode);
    updateCode("init");
    // eslint-disable-next-line
  }, [isDarkMode]);

  // Initial code
  React.useEffect(() => {
    updateCode("init");
    // eslint-disable-next-line
  }, []);

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Linear Queue Visualizer
            </span>
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">How Linear Queue Works</h2>
          <p className="text-gray-300 leading-relaxed">
            A Linear Queue is a First-In-First-Out (FIFO) data structure. Elements are added at the rear and removed from the front. 
            Once full, no more elements can be added until dequeued. Used in scenarios like print job scheduling or CPU task management.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Time Complexity:</strong> O(1)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space Complexity:</strong> O(1)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Operations:</strong> Enqueue, Dequeue, Peek, Reset
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <label htmlFor="queueInput" className="text-gray-300">Value:</label>
            <input
              ref={queueInputRef}
              type="text"
              id="queueInput"
              placeholder="e.g. 10, +, &&"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isAnimating}
              className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors w-32"
            />
            <label htmlFor="queueCapacity" className="text-gray-300">Capacity:</label>
            <input
              type="number"
              id="queueCapacity"
              value={capacityInput}
              min={1}
              max={100}
              onChange={handleCapacityChange}
              disabled={isAnimating}
              className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-cyan-500 transition-colors w-24"
            />
            <button
              onClick={handleEnqueue}
              disabled={isAnimating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              <Play className="h-5 w-5" />
              Enqueue
            </button>
            <button
              onClick={handleDequeue}
              disabled={isAnimating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              <Pause className="h-5 w-5" />
              Dequeue
            </button>
            <button
              onClick={handlePeek}
              disabled={isAnimating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              <HelpCircle className="h-5 w-5" />
              Peek
            </button>
            <button
              onClick={handleReset}
              disabled={isAnimating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <HelpCircle className="h-5 w-5" />
              Help
            </button>
            <div className="flex items-center ml-4">
              <span className="text-gray-400 mr-2">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode((v) => !v)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:bg-cyan-600 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">Queue Visualization</h2>
              <div className="flex flex-col items-center">
                <div className="flex gap-4 mb-4">
                  <div className="pointer-events-none text-cyan-400 font-mono font-semibold">
                    Front: {front}
                  </div>
                  <div className="pointer-events-none text-pink-400 font-mono font-semibold">
                    Rear: {rear}
                  </div>
                </div>
                <div className="flex gap-4 justify-center items-end min-h-[100px]">
                  {queue.map((v, i) =>
                    v !== "_" ? (
                      <div key={i} className={getElementStyle(elementStatus[i])}>
                        <span className="value">{v}</span>
                        <span className="text-xs text-gray-200 opacity-70 mt-1">Index: {i}</span>
                        {front === i && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-cyan-400 text-xs font-bold">Front</span>
                        )}
                        {rear === i && (
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-pink-400 text-xs font-bold">Rear</span>
                        )}
                      </div>
                    ) : (
                      <div key={i} className="w-20 h-20 flex flex-col items-center justify-center rounded-xl bg-gray-700/60 border border-gray-600 text-gray-400 text-lg font-bold opacity-50 relative">
                        <span>_</span>
                        <span className="text-xs opacity-60 mt-1">Index: {i}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-6 flex-wrap text-sm mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded"></div>
                  <span>Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-yellow-400 rounded"></div>
                  <span>Enqueuing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded"></div>
                  <span>Dequeuing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
                  <span>Peeking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 border border-gray-600 rounded"></div>
                  <span>Empty</span>
                </div>
              </div>
            </div>
            {/* Side Info */}
            <div className="w-full md:w-96 bg-gray-900/60 rounded-2xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-cyan-300">Queue Info</h2>
              <div className="mb-2 flex justify-between">
                <span>Front Element</span>
                <span className="font-mono text-cyan-400">{front !== -1 ? queue[front] : "-"}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span>Last Enqueued</span>
                <span className="font-mono text-green-400">{lastEnqueued}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span>Last Dequeued</span>
                <span className="font-mono text-red-400">{lastDequeued}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span>Size</span>
                <span className="font-mono text-yellow-400">{front === -1 ? 0 : rear - front + 1}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span>Capacity</span>
                <span className="font-mono text-blue-400">{queueMax}</span>
              </div>
              <div className="mb-2">
                <span>Queue Array</span>
                <div className="font-mono text-gray-200 bg-gray-800 rounded-lg px-2 py-1 mt-1 text-sm">
                  [{queue.map(formatValue).join(", ")}]
                </div>
              </div>
              <div
                className="mt-4 p-3 rounded-lg bg-gray-800 text-gray-100 text-sm font-mono border border-gray-700"
                dangerouslySetInnerHTML={{ __html: highlightWords(message) }}
              />
              <div className="mt-4 p-3 rounded-lg bg-gray-800 text-gray-100 text-xs font-mono border border-gray-700 whitespace-pre-wrap">
                {code}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-gray-800 text-gray-100 text-xs border border-gray-700">
                <h3 className="text-cyan-400 font-bold mb-2">Linear Queue Notes</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    A <span className="text-yellow-400 font-semibold">Linear Queue</span> follows the FIFO principle with elements added at the rear and removed from the front.
                  </li>
                  <li>
                    It has a fixed size, and once full, no more elements can be added until dequeued.
                  </li>
                  <li>
                    Empty slots are marked with '_', and pointers (front, rear) track the queue's state.
                  </li>
                  <li>
                    Used in scenarios like print job scheduling or CPU task management.
                  </li>
                  <li>
                    Key operations: <span className="text-yellow-400 font-semibold">enqueue</span>, <span className="text-yellow-400 font-semibold">dequeue</span>, <span className="text-yellow-400 font-semibold">peek</span>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-cyan-700 shadow-2xl relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl"
                onClick={() => setShowHelp(false)}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">How to Use</h3>
              <ul className="list-disc ml-5 text-gray-200 space-y-2 mb-4">
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
              <h3 className="text-xl font-bold mb-2 text-cyan-400">Color Types</h3>
              <ul className="list-disc ml-5 text-gray-200 space-y-2">
                <li>
                  <span className="inline-block w-4 h-4 bg-gradient-to-br from-orange-500 to-yellow-400 rounded mr-2"></span>
                  <strong>Enqueuing</strong>: Orange indicates an element being added to the queue.
                </li>
                <li>
                  <span className="inline-block w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded mr-2"></span>
                  <strong>Dequeuing</strong>: Red indicates an element being removed from the queue.
                </li>
                <li>
                  <span className="inline-block w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded mr-2"></span>
                  <strong>Peeking</strong>: Green indicates the front element being viewed without removal.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinearQueueVisualizer;