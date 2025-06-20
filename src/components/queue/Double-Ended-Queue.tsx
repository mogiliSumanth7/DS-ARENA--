import React, { useState, useRef, useEffect } from "react";


type DequeValue = string;

const validSymbols = [
  "+", "/", "%", "<", "<=", "=", "==", "!=", "&&", "||", "!", "&", "|", "^", "~", "<<",
  "+=", "-=", "*=", "/=", "%=", "(", ")", "[", "]", "{", "}", ";", ",", ":", ".", "'", '"'
];

const animationSpeed = 1200;

const formatValue = (value: DequeValue | "_") =>
  value === "_"
    ? "_"
    : isNaN(Number(value)) || validSymbols.includes(value)
    ? `'${value}'`
    : value;

const highlightWords = (message: string) => {
  const keywords = [
    "Inserting", "Deleting", "Resetting", "Value", "Size", "Capacity",
    "Invalid", "Queue Overflow", "Queue Underflow", "Warning", "insert", "delete",
    "reset", "Help", "Double Ended Queue", "Deque", "Front", "Rear"
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

const initialDequeArray = (maxSize: number) => Array(maxSize).fill("_");

const DoubleEndedQueue: React.FC = () => {
  const [deque, setDeque] = useState<DequeValue[]>([]);
  const [maxSize, setMaxSize] = useState<number>(6);
  const [inputValue, setInputValue] = useState<string>("");
  const [capacityInput, setCapacityInput] = useState<string>("6");
  const [lastInserted, setLastInserted] = useState<string>("-");
  const [lastDeleted, setLastDeleted] = useState<string>("-");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [message, setMessage] = useState<string>(
    "Welcome: Use the controls to <span class=\"highlight-word\">insert</span> and <span class=\"highlight-word\">delete</span> elements from both ends of the deque!"
  );
  const [code, setCode] = useState<string>(
    "// Double Ended Queue Implementation\nlet deque = [];\nconst maxSize = 6;\n// Ready for operations...\n"
  );
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Animation refs
  const [dequeArray, setDequeArray] = useState<(DequeValue | "_")[]>(initialDequeArray(6));
  const [dequeDisplay, setDequeDisplay] = useState<DequeValue[]>([]);
  const [dequeFront, setDequeFront] = useState<number | "-">("-");
  const [dequeRear, setDequeRear] = useState<number | "-">("-");

  // For animation classes
  const [animClasses, setAnimClasses] = useState<string[]>([]);

  // For updating code content
  const updateCode = (operation: string, value: any = null) => {
    let code = `// Double Ended Queue Implementation\n`;
    code += `let deque = [${deque.map(v => formatValue(v)).join(", ")}];\n`;
    code += `const maxSize = ${maxSize};\n\n`;

    switch (operation) {
      case "init":
        code += "// Ready for operations...\n";
        break;
      case "capacity":
        code += "// Updating Capacity\n";
        code += `maxSize = ${value};\n`;
        code += `if (deque.length >= maxSize) {\n`;
        code += "    // Warning: Deque size exceeds capacity!\n";
        code += "}\n";
        break;
      case "insertFront":
        code += "// Insert Front Operation\n";
        code += "if (deque.length >= maxSize) {\n";
        code += '    return "Queue Overflow";\n';
        code += "}\n";
        code += `deque.unshift(${formatValue(value)});\n`;
        code += `// Inserted at front: ${formatValue(value)}\n`;
        break;
      case "insertRear":
        code += "// Insert Rear Operation\n";
        code += "if (deque.length >= maxSize) {\n";
        code += '    return "Queue Overflow";\n';
        code += "}\n";
        code += `deque.push(${formatValue(value)});\n`;
        code += `// Inserted at rear: ${formatValue(value)}\n`;
        break;
      case "deleteFront":
        code += "// Delete Front Operation\n";
        code += "if (deque.length === 0) {\n";
        code += '    return "Queue Underflow";\n';
        code += "}\n";
        code += "const removed = deque.shift();\n";
        code += `// Deleted from front: ${formatValue(lastDeleted)}\n`;
        break;
      case "deleteRear":
        code += "// Delete Rear Operation\n";
        code += "if (deque.length === 0) {\n";
        code += '    return "Queue Underflow";\n';
        code += "}\n";
        code += "const removed = deque.pop();\n";
        code += `// Deleted from rear: ${formatValue(lastDeleted)}\n`;
        break;
      case "reset":
        code += "// Reset Operation\n";
        code += "deque = [];\n";
        code += "maxSize = 6;\n";
        break;
    }
    setCode(code);
  };

  // For updating message box
  const updateMessage = (msg: string) => {
    setMessage(highlightWords(msg));
  };

  // For updating deque array display
  const updateDequeArray = (dq: DequeValue[], size: number) => {
    const displayArray = Array(size).fill("_");
    dq.forEach((value, index) => {
      displayArray[index] = value;
    });
    setDequeArray(displayArray);
  };

  // For updating deque display and pointers
  const updateDequeDisplay = (dq: DequeValue[]) => {
    setDequeDisplay([...dq]);
    setDequeFront(dq.length > 0 ? 0 : "-");
    setDequeRear(dq.length > 0 ? dq.length - 1 : "-");
    updateDequeArray(dq, maxSize);
  };

  // On mount and when maxSize changes, update array
  useEffect(() => {
    updateDequeArray(deque, maxSize);
    updateDequeDisplay(deque);
    // eslint-disable-next-line
  }, [deque, maxSize]);

  // Mode toggle
  useEffect(() => {
    document.body.classList.toggle("light-mode", !isDarkMode);
  }, [isDarkMode]);

  // Insert Front
  const insertFront = async () => {
    if (isAnimating) return;
    const value = inputValue.trim();
    if (
      value === "" ||
      (!validSymbols.includes(value) && isNaN(Number(value)))
    ) {
      updateMessage(
        "Invalid Value: Enter a valid number or a valid symbol (e.g., 10, +, &&) to insert."
      );
      updateCode("init");
      return;
    }
    if (deque.length >= maxSize) {
      updateMessage("Queue Overflow: Cannot insert to the Double Ended Queue.");
      updateCode("insertFront", value);
      return;
    }
    setIsAnimating(true);
    updateMessage(
      `Inserting at Front: Value ${formatValue(
        value
      )} is being added to the front of the deque.`
    );
    updateCode("insertFront", value);

    setDeque(prev => [value, ...prev]);
    setLastInserted(value);
    setAnimClasses(prev => ["insert-front", ...prev]);
    setInputValue("");
    setTimeout(() => {
      setAnimClasses([]);
      setIsAnimating(false);
    }, animationSpeed);
  };

  // Insert Rear
  const insertRear = async () => {
    if (isAnimating) return;
    const value = inputValue.trim();
    if (
      value === "" ||
      (!validSymbols.includes(value) && isNaN(Number(value)))
    ) {
      updateMessage(
        "Invalid Value: Enter a valid number or a valid symbol (e.g., 10, +, &&) to insert."
      );
      updateCode("init");
      return;
    }
    if (deque.length >= maxSize) {
      updateMessage("Queue Overflow: Cannot insert to the Double Ended Queue.");
      updateCode("insertRear", value);
      return;
    }
    setIsAnimating(true);
    updateMessage(
      `Inserting at Rear: Value ${formatValue(
        value
      )} is being added to the rear of the deque.`
    );
    updateCode("insertRear", value);

    setDeque(prev => [...prev, value]);
    setLastInserted(value);
    setAnimClasses(prev => [...prev, "insert-rear"]);
    setInputValue("");
    setTimeout(() => {
      setAnimClasses([]);
      setIsAnimating(false);
    }, animationSpeed);
  };

  // Delete Front
  const deleteFront = async () => {
    if (isAnimating) return;
    if (deque.length === 0) {
      updateMessage(
        "Queue Underflow: The Double Ended Queue is empty! Nothing to delete from front."
      );
      updateCode("deleteFront");
      return;
    }
    setIsAnimating(true);
    const value = deque[0];
    updateMessage(
      `Deleting from Front: Value ${formatValue(
        value
      )} is being removed from the front.`
    );
    setAnimClasses(prev => ["delete-front", ...prev.slice(1)]);
    setTimeout(() => {
      setDeque(prev => {
        const newDeque = prev.slice(1);
        setLastDeleted(value);
        updateCode("deleteFront");
        setAnimClasses([]);
        setIsAnimating(false);
        return newDeque;
      });
    }, animationSpeed);
  };

  // Delete Rear
  const deleteRear = async () => {
    if (isAnimating) return;
    if (deque.length === 0) {
      updateMessage(
        "Queue Underflow: The Double Ended Queue is empty! Nothing to delete from rear."
      );
      updateCode("deleteRear");
      return;
    }
    setIsAnimating(true);
    const value = deque[deque.length - 1];
    updateMessage(
      `Deleting from Rear: Value ${formatValue(
        value
      )} is being removed from the rear.`
    );
    setAnimClasses(prev => [
      ...prev.slice(0, prev.length - 1),
      "delete-rear"
    ]);
    setTimeout(() => {
      setDeque(prev => {
        const newDeque = prev.slice(0, prev.length - 1);
        setLastDeleted(value);
        updateCode("deleteRear");
        setAnimClasses([]);
        setIsAnimating(false);
        return newDeque;
      });
    }, animationSpeed);
  };

  // Reset Deque
  const resetDeque = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    updateMessage(
      "Resetting Deque: The Double Ended Queue is being cleared and capacity set to 6."
    );
    updateCode("reset");
    setDeque([]);
    setMaxSize(6);
    setCapacityInput("6");
    setLastInserted("-");
    setLastDeleted("-");
    setTimeout(() => {
      setIsAnimating(false);
    }, animationSpeed);
  };

  // Update Capacity
  const updateDequeCapacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCapacity = parseInt(e.target.value);
    if (isNaN(newCapacity) || newCapacity < 1) {
      updateMessage(
        "Invalid Capacity: Enter a positive number for deque capacity."
      );
      setCapacityInput(maxSize.toString());
      updateCode("capacity", maxSize);
      return;
    }
    setMaxSize(newCapacity);
    setCapacityInput(newCapacity.toString());
    if (deque.length > newCapacity) {
      setDeque(deque.slice(0, newCapacity));
      updateMessage(`Warning: Deque truncated to fit new capacity (${newCapacity}).`);
    } else {
      updateMessage(`Capacity Updated: Deque capacity set to ${newCapacity}.`);
    }
    updateCode("capacity", newCapacity);
  };

  // Mode toggle
  const toggleMode = () => {
    setIsDarkMode((prev) => !prev);
    updateMessage(
      "Mode Switched: " +
        (!isDarkMode
          ? "Dark mode enabled for a sleek, high-contrast experience!"
          : "Light mode enabled for a bright look!")
    );
    updateCode("init");
  };

  // Help modal
  const openModal = () => {
    setShowHelp(true);
    updateMessage(
      "Help Opened: View instructions and color types for using the Double Ended Queue Visualizer."
    );
  };
  const closeModal = () => {
    setShowHelp(false);
    updateMessage(
      "Help Closed: Continue exploring the Double Ended Queue Visualizer!"
    );
  };

  // Keyboard: Escape closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showHelp) closeModal();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [showHelp]);

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="w-32"></div>
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Double Ended Queue (Deque)
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Dark Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleMode}
                disabled={isAnimating}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer dark:bg-gray-600 peer-checked:bg-purple-600 transition-all"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-lg text-gray-300 mb-8 text-center">
          An interactive tool to understand the Double Ended Queue with operations at both ends and smooth animations.
        </div>

        {/* Main Container */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Visualization */}
          <div className="md:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-purple-300">Deque Visualization</h2>
            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-8">
              <input
                type="text"
                placeholder="e.g. 10, +, &&"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isAnimating}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="number"
                value={capacityInput}
                min={1}
                max={100}
                onChange={updateDequeCapacity}
                disabled={isAnimating}
                className="w-24 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button onClick={insertFront} disabled={isAnimating}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300">
                Insert Front
              </button>
              <button onClick={insertRear} disabled={isAnimating}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300">
                Insert Rear
              </button>
              <button onClick={deleteFront} disabled={isAnimating}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300">
                Delete Front
              </button>
              <button onClick={deleteRear} disabled={isAnimating}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300">
                Delete Rear
              </button>
              <button onClick={resetDeque} disabled={isAnimating}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300">
                Reset
              </button>
              <button onClick={openModal} disabled={isAnimating}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300">
                Help
              </button>
            </div>

            {/* Deque Array Visualization */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex flex-col items-center mr-4">
                <span className="text-sm text-gray-400 mb-1">Front</span>
                <span className="text-lg font-bold text-purple-300">{dequeFront}</span>
              </div>
              <div className="flex gap-4">
                {dequeArray.map((v, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg
                      ${animClasses[i] === "insert-front" ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-110 shadow-green-500/50" : ""}
                      ${animClasses[i] === "insert-rear" ? "bg-gradient-to-br from-orange-500 to-yellow-500 scale-110 shadow-orange-500/50" : ""}
                      ${animClasses[i] === "delete-front" ? "bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-500/50 animate-pulse" : ""}
                      ${animClasses[i] === "delete-rear" ? "bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-500/50 animate-pulse" : ""}
                      ${!animClasses[i] ? "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30" : ""}
                    `}
                  >
                    <span>{formatValue(v)}</span>
                    <span className="text-xs text-gray-300">Idx {i}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center ml-4">
                <span className="text-sm text-gray-400 mb-1">Rear</span>
                <span className="text-lg font-bold text-pink-300">{dequeRear}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-700/50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-gray-400">Size</span>
                <span className="text-2xl font-bold">{deque.length}</span>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-gray-400">Capacity</span>
                <span className="text-2xl font-bold">{maxSize}</span>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-gray-400">Front Value</span>
                <span className="text-2xl font-bold">{deque.length > 0 ? deque[0] : "-"}</span>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-4 flex flex-col items-center">
                <span className="text-gray-400">Rear Value</span>
                <span className="text-2xl font-bold">{deque.length > 0 ? deque[deque.length - 1] : "-"}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 flex-wrap text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
                <span>Insert Front</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded"></div>
                <span>Insert Rear</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded"></div>
                <span>Delete Front/Rear</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded"></div>
                <span>Idle</span>
              </div>
            </div>
          </div>

          {/* Side Info Box */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-pink-300 mb-2">Deque Info</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Front Element</span>
                <span className="font-bold">{deque.length > 0 ? deque[0] : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Rear Element</span>
                <span className="font-bold">{deque.length > 0 ? deque[deque.length - 1] : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Inserted</span>
                <span className="font-bold">{lastInserted}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Deleted</span>
                <span className="font-bold">{lastDeleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Size of Deque</span>
                <span className="font-bold">{deque.length}</span>
              </div>
              <div>
                <span>Deque Array: </span>
                <span className="font-mono text-xs">
                  [
                  {dequeArray.map((v, i) => (
                    <span key={i}>{formatValue(v)}{i < dequeArray.length - 1 ? ", " : ""}</span>
                  ))}
                  ]
                </span>
              </div>
            </div>
            <div
              className="bg-gray-700/40 rounded-xl p-4 mt-2 text-sm"
              dangerouslySetInnerHTML={{ __html: message }}
            />
            <div className="bg-gray-700/40 rounded-xl p-4 mt-2 text-xs font-mono whitespace-pre-wrap">
              {code}
            </div>
          </div>
        </div>
      </div>
      {showHelp && (
        <div
          className="modal-overlay"
          id="helpModal"
          style={{ display: "flex" }}
          onClick={e => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal">
            <button className="modal-close" id="closeModal" onClick={closeModal}>
              ×
            </button>
            <h3>How to Use</h3>
            <p>
              This Double Ended Queue (Deque) Visualizer helps you understand how elements can be inserted and deleted from both ends through interactive animations.
            </p>
            <ul>
              <li>
                <strong>Insert Front</strong>: Enter a number or symbol (e.g., 10, +, &&) in the "Value" field and click "Insert Front" to add it to the front of the deque.
              </li>
              <li>
                <strong>Insert Rear</strong>: Click "Insert Rear" to add the element to the rear of the deque.
              </li>
              <li>
                <strong>Delete Front</strong>: Click "Delete Front" to remove the front element from the deque.
              </li>
              <li>
                <strong>Delete Rear</strong>: Click "Delete Rear" to remove the rear element from the deque.
              </li>
              <li>
                <strong>Reset</strong>: Click "Reset" to clear the deque and set the capacity back to 6.
              </li>
              <li>
                <strong>Capacity</strong>: Adjust the deque's maximum size (1-100) using the "Capacity" field.
              </li>
              <li>
                <strong>Dark/Light Mode</strong>: Toggle between dark and light themes using the switch in the top-right corner.
              </li>
            </ul>
            <h3>Color Types</h3>
            <p>The following colors indicate different deque operations:</p>
            <ul>
              <li>
                <span className="color-box insert-front"></span>{" "}
                <strong>Insert Front</strong>: Green indicates an element being added to the front.
              </li>
              <li>
                <span className="color-box insert-rear"></span>{" "}
                <strong>Insert Rear</strong>: Orange indicates an element being added to the rear.
              </li>
              <li>
                <span className="color-box delete-front"></span>{" "}
                <strong>Delete Front</strong>: Red indicates an element being removed from the front.
              </li>
              <li>
                <span className="color-box delete-rear"></span>{" "}
                <strong>Delete Rear</strong>: Red indicates an element being removed from the rear.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubleEndedQueue;