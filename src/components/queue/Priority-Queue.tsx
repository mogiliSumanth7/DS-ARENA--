import React, { useRef, useState, useEffect } from "react";


type QueueItem = {
  element: string;
  priority: number;
};

const animationSpeed = 1200;

const getPriorityClass = (priority: number) => {
  if (priority >= 1 && priority <= 33) return "high-priority";
  if (priority >= 34 && priority <= 66) return "medium-priority";
  return "low-priority";
};

const formatValue = (value: string | number) =>
  isNaN(Number(value)) ? `'${value}'` : value;

const highlightWords = (message: string) => {
  const keywords = [
    "Inserting", "Dequeuing", "Peeking", "Resetting", "Element", "Priority", "Size",
    "Invalid", "Queue Empty", "Warning", "insert", "dequeue", "peek",
    "reset", "Help", "Priority Queue", "Min-Priority", "High Priority", "Low Priority"
  ];
  let highlightedMessage = message;
  keywords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    highlightedMessage = highlightedMessage.replace(
      regex,
      `<span class="highlight-word">${word}</span>`
    );
  });
  return highlightedMessage;
};

const PriorityQueueVisualizer: React.FC = () => {
  const [priorityQueue, setPriorityQueue] = useState<QueueItem[]>([]);
  const [element, setElement] = useState("");
  const [priority, setPriority] = useState<number | "">("");
  const [lastInserted, setLastInserted] = useState<string>("-");
  const [lastDequeued, setLastDequeued] = useState<string>("-");
  const [message, setMessage] = useState<string>(
    "Welcome: Use the controls to <span class='highlight-word'>insert</span> elements with priority, <span class='highlight-word'>dequeue</span> highest priority element, or <span class='highlight-word'>peek</span> at the next element!"
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [codeContent, setCodeContent] = useState("// Priority Queue Implementation\nlet priorityQueue = [];\n// Lower priority number = Higher priority\n// Ready for operations...\n");
  const queueContainerRef = useRef<HTMLDivElement>(null);

  // Utility
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Message and code update helpers
  const updateMessage = (msg: string) => {
    setMessage(highlightWords(msg));
  };

  const updateCode = (operation: string, el?: string, prio?: number) => {
    let code = `// Priority Queue Implementation\n`;
    code += `let priorityQueue = [${priorityQueue.map(item =>
      `{element: ${formatValue(item.element)}, priority: ${item.priority}}`
    ).join(", ")}];\n`;
    code += `// Lower priority number = Higher priority\n\n`;

    switch (operation) {
      case "init":
        code += "// Ready for operations...\n";
        break;
      case "insert":
        code += "// Insert Operation\n";
        code += `let newItem = {element: ${formatValue(el!)}, priority: ${prio}};\n`;
        code += "priorityQueue.push(newItem);\n";
        code += "// Sort by priority (ascending)\n";
        code += "priorityQueue.sort((a, b) => a.priority - b.priority);\n";
        code += `// Inserted: ${formatValue(el!)} with priority ${prio}\n`;
        break;
      case "dequeue":
        code += "// Dequeue Operation\n";
        code += "if (priorityQueue.length > 0) {\n";
        code += "    let removed = priorityQueue.shift();\n";
        code += `    // Dequeued: ${formatValue(lastDequeued)}\n`;
        code += "} else {\n";
        code += "    // Priority Queue Empty!\n";
        code += "}\n";
        break;
      case "peek":
        code += "// Peek Operation\n";
        code += "if (priorityQueue.length > 0) {\n";
        code += "    let next = priorityQueue[0];\n";
        code += `    // Next Element: ${priorityQueue.length > 0 ? formatValue(priorityQueue[0].element) : "-"}\n`;
        code += `    // Priority: ${priorityQueue.length > 0 ? priorityQueue[0].priority : "-"}\n`;
        code += "} else {\n";
        code += "    // Priority Queue Empty!\n";
        code += "}\n";
        break;
      case "reset":
        code += "// Reset Operation\n";
        code += "priorityQueue = [];\n";
        code += "// All elements cleared\n";
        break;
    }
    setCodeContent(code);
  };

  // Controls disabling during animation
  const controlsDisabled = isAnimating;

  // Insert operation
  const handleInsert = async () => {
    if (isAnimating) return;
    if (
      element.trim() === "" ||
      isNaN(Number(priority)) ||
      Number(priority) < 1 ||
      Number(priority) > 100
    ) {
      updateMessage("Invalid Input: Enter a valid element and priority (1-100). Lower priority numbers indicate higher priority.");
      updateCode("init");
      return;
    }
    setIsAnimating(true);
    updateMessage(`Inserting Element: ${formatValue(element)} with priority ${priority}. Lower numbers = higher priority.`);
    updateCode("insert", element, Number(priority));

    // Add to queue and sort
    const newQueue = [...priorityQueue, { element, priority: Number(priority) }];
    newQueue.sort((a, b) => a.priority - b.priority);
    setPriorityQueue(newQueue);
    setLastInserted(element);

    // Animate: add a temp element
    if (queueContainerRef.current) {
      const tempDiv = document.createElement("div");
      tempDiv.className = `element ${getPriorityClass(Number(priority))} inserting`;
      tempDiv.innerHTML = `<span class="value">${element}</span><span class="priority">Priority: ${priority}</span>`;
      queueContainerRef.current.appendChild(tempDiv);
      await sleep(animationSpeed);
      queueContainerRef.current.removeChild(tempDiv);
    }

    setElement("");
    setPriority("");
    setIsAnimating(false);
  };

  // Dequeue operation
  const handleDequeue = async () => {
    if (isAnimating || priorityQueue.length === 0) {
      updateMessage("Priority Queue Empty: No elements to dequeue!");
      updateCode("dequeue");
      return;
    }
    setIsAnimating(true);
    const removed = priorityQueue[0];
    updateMessage(`Dequeuing Element: ${formatValue(removed.element)} with priority ${removed.priority} (highest priority).`);
    setLastDequeued(removed.element);

    // Animate: add dequeuing class to first element
    if (queueContainerRef.current) {
      const el = queueContainerRef.current.querySelector(".element");
      if (el) {
        el.classList.add("dequeuing");
        await sleep(animationSpeed);
      }
    }

    setPriorityQueue(priorityQueue.slice(1));
    updateCode("dequeue");
    setIsAnimating(false);
  };

  // Peek operation
  const handlePeek = async () => {
    if (isAnimating || priorityQueue.length === 0) {
      updateMessage("Priority Queue Empty: No elements to peek!");
      updateCode("peek");
      return;
    }
    setIsAnimating(true);
    const next = priorityQueue[0];
    updateMessage(`Peeking Next Element: ${formatValue(next.element)} with priority ${next.priority} (highest priority).`);
    updateCode("peek");

    // Animate: add peek class to first element
    if (queueContainerRef.current) {
      const el = queueContainerRef.current.querySelector(".element");
      if (el) {
        el.classList.add("peek");
        await sleep(animationSpeed);
        el.classList.remove("peek");
      }
    }
    setIsAnimating(false);
  };

  // Reset operation
  const handleReset = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    updateMessage("Resetting Priority Queue: All elements cleared and queue reset.");
    updateCode("reset");
    setPriorityQueue([]);
    setLastInserted("-");
    setLastDequeued("-");
    await sleep(animationSpeed);
    setIsAnimating(false);
  };

  // Theme toggle
  const handleModeToggle = () => {
    setIsDarkMode((prev) => !prev);
    updateMessage(
      "Mode Switched: " +
        (!isDarkMode
          ? "Dark mode enabled for a sleek experience!"
          : "Light mode enabled for a bright look!")
    );
    updateCode("init");
  };

  // Help modal
  const handleHelpOpen = () => {
    setShowHelp(true);
    updateMessage("Help Opened: View instructions and priority system information.");
  };
  const handleHelpClose = () => {
    setShowHelp(false);
    updateMessage("Help Closed: Continue exploring the Priority Queue Visualizer!");
  };

  // Keyboard shortcut for closing help
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showHelp) handleHelpClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line
  }, [showHelp]);

  // Set body class for theme
  useEffect(() => {
    document.body.classList.toggle("light-mode", !isDarkMode);
  }, [isDarkMode]);

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Priority Queue Visualizer
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Dark Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={handleModeToggle}
                disabled={controlsDisabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer dark:bg-gray-600 peer-checked:bg-purple-600 transition-all"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>

        {/* Subtitle */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700 text-center">
          <div className="text-lg text-gray-300">
            An interactive tool to understand Priority Queue operations with min-priority implementation where lower numbers indicate higher priority.
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Visualization Card */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-purple-300">Priority Queue (Min-Priority)</h2>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <input
                id="elementInput"
                type="text"
                placeholder="Element (e.g. Task1, A, 42)"
                value={element}
                onChange={e => setElement(e.target.value)}
                disabled={controlsDisabled}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                id="priorityInput"
                type="number"
                placeholder="Priority (1-100)"
                min={1}
                max={100}
                value={priority}
                onChange={e => setPriority(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={controlsDisabled}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors w-32"
              />
              <button
                onClick={handleInsert}
                disabled={controlsDisabled}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                Insert
              </button>
              <button
                onClick={handleDequeue}
                disabled={controlsDisabled}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                Dequeue
              </button>
              <button
                onClick={handlePeek}
                disabled={controlsDisabled}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                Peek
              </button>
              <button
                onClick={handleReset}
                disabled={controlsDisabled}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                Reset
              </button>
              <button
                onClick={handleHelpOpen}
                disabled={controlsDisabled}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-400 hover:from-yellow-600 hover:to-orange-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                Help
              </button>
            </div>
            {/* Queue Visualization */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="text-gray-400">Next:</div>
                <div className="font-bold text-lg text-white">
                  {priorityQueue.length > 0 ? priorityQueue[0].element : "None"}
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                {priorityQueue.map((item, idx) => (
                  <div
                    key={item.element + item.priority + idx}
                    className={`w-20 h-20 flex flex-col items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg
                      ${
                        getPriorityClass(item.priority) === "high-priority"
                          ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/50"
                          : getPriorityClass(item.priority) === "medium-priority"
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-400/50"
                          : "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50"
                      }
                    `}
                  >
                    <span>{item.element}</span>
                    <span className="text-xs font-normal">P: {item.priority}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-gray-400">Size</div>
                <div className="text-2xl font-bold">{priorityQueue.length}</div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-gray-400">Next Priority</div>
                <div className="text-2xl font-bold">
                  {priorityQueue.length > 0 ? priorityQueue[0].priority : "-"}
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="text-gray-400">Highest Priority</div>
                <div className="text-2xl font-bold">
                  {priorityQueue.length > 0 ? priorityQueue[0].element : "-"}
                </div>
              </div>
            </div>
          </div>
          {/* Side Info Card */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4 text-pink-300">Queue Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400">Next Element</div>
                <div className="text-xl font-bold">{priorityQueue.length > 0 ? priorityQueue[0].element : "-"}</div>
              </div>
              <div>
                <div className="text-gray-400">Last Inserted</div>
                <div className="text-xl font-bold">{lastInserted}</div>
              </div>
              <div>
                <div className="text-gray-400">Last Dequeued</div>
                <div className="text-xl font-bold">{lastDequeued}</div>
              </div>
              <div>
                <div className="text-gray-400">Queue Size</div>
                <div className="text-xl font-bold">{priorityQueue.length}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-gray-400 mb-1">Priority Queue Array</div>
              <div className="bg-gray-700/50 rounded-xl p-3 font-mono text-sm text-white break-all">
                [
                {priorityQueue.map((item, idx) =>
                  `{element: ${formatValue(item.element)}, priority: ${item.priority}}${idx < priorityQueue.length - 1 ? ", " : ""}`
                )}
                ]
              </div>
            </div>
            <div
              className="bg-gray-700/50 rounded-xl p-4 mt-4 text-sm"
              dangerouslySetInnerHTML={{ __html: message }}
            />
            <div className="bg-gray-900/60 rounded-xl p-4 mt-4 text-xs font-mono text-purple-200 whitespace-pre-wrap">
              {codeContent}
            </div>
          </div>
        </div>
        {/* Legend and modal omitted for brevity, copy from your HTML if needed */}
      </div>
      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay" style={{ display: "flex" }} onClick={e => {
          if (e.target === e.currentTarget) handleHelpClose();
        }}>
          <div className="modal">
            <button className="modal-close" onClick={handleHelpClose}>×</button>
            <h3>How to Use</h3>
            <p>This Priority Queue Visualizer helps you understand priority-based processing where elements are handled based on their priority level rather than arrival order.</p>
            <ul>
              <li><strong>Insert</strong>: Enter an element (text or number) and its priority (1-100). Lower numbers = higher priority.</li>
              <li><strong>Dequeue</strong>: Removes and returns the element with the highest priority (lowest number).</li>
              <li><strong>Peek</strong>: Views the next element to be dequeued without removing it.</li>
              <li><strong>Reset</strong>: Clears the entire priority queue.</li>
              <li><strong>Dark/Light Mode</strong>: Toggle between themes using the switch in the top-right.</li>
            </ul>
            <h3>Priority System</h3>
            <p>This uses a Min-Priority Queue system:</p>
            <ul>
              <li><strong>Priority 1-33</strong>: <span className="color-box high-priority"></span> High Priority (Red) - Processed first</li>
              <li><strong>Priority 34-66</strong>: <span className="color-box medium-priority"></span> Medium Priority (Orange)</li>
              <li><strong>Priority 67-100</strong>: <span className="color-box low-priority"></span> Low Priority (Green) - Processed last</li>
            </ul>
            <h3>Animation Colors</h3>
            <ul>
              <li><span className="color-box inserting"></span> <strong>Inserting</strong>: Blue indicates an element being added.</li>
              <li><span className="color-box dequeuing"></span> <strong>Dequeuing</strong>: Red indicates an element being removed.</li>
              <li><span className="color-box peek"></span> <strong>Peeking</strong>: Green indicates the next element being viewed.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityQueueVisualizer;