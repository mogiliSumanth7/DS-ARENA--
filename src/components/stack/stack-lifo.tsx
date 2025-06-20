import React, { useRef, useEffect, useState } from "react";
import { Home, RotateCcw, Sparkles, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";

const validSymbols = [
  "+", "/", "%", "<", "<=", "=", "==", "!=", "&&", "||", "!", "&", "|", "^", "~", "<<",
  "+=", "-=", "*=", "/=", "%=", "(", ")", "[", "]", "{", "}", ";", ",", ":", ".", "'", '"'
];

const animationSpeed = 900;

type StackElement = string | number;

const formatValue = (value: StackElement) =>
  isNaN(Number(value)) || validSymbols.includes(String(value)) ? `'${value}'` : value;

const highlightWords = (message: string) => {
  const keywords = [
    "Pushing", "Popping", "Peeking", "Resetting", "Value", "Size", "Capacity",
    "Invalid", "Stack Overflow", "Stack Underflow", "Stack Empty", "Warning",
    "push", "pop", "peek", "reset", "Help"
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Stacklifo: React.FC = () => {
  // Stack state
  const [stack, setStack] = useState<StackElement[]>([]);
  const [stackMax, setStackMax] = useState<number>(7);
  const [inputValue, setInputValue] = useState<string>("");
  const [capacityValue, setCapacityValue] = useState<number>(7);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [lastPushed, setLastPushed] = useState<StackElement | "-">("-");
  const [lastPopped, setLastPopped] = useState<StackElement | "-">("-");
  const [message, setMessage] = useState<string>(
    'Welcome: Use the controls to <span class="text-yellow-400 font-semibold">push</span>, <span class="text-yellow-400 font-semibold">pop</span>, <span class="text-yellow-400 font-semibold">peek</span>, or <span class="text-yellow-400 font-semibold">reset</span> the stack!'
  );
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Animation helpers
  const [activeStat, setActiveStat] = useState<"size" | "top" | null>(null);
  const [elementStates, setElementStates] = useState<string[]>([]);

  // For referencing stack container
  const stackRef = useRef<HTMLDivElement>(null);

  // Update stack array display
  const stackArrayString =
    stack.length === 0
      ? "[]"
      : "[" + stack.map((v) => formatValue(v)).join(", ") + "]";

  // Message update
  const updateMessage = (msg: string) => {
    setMessage(highlightWords(msg));
  };

  // Push operation
  const handlePush = async () => {
    if (isAnimating) return;
    const value = inputValue.trim();
    if (
      value === "" ||
      (!validSymbols.includes(value) && isNaN(Number(value)))
    ) {
      updateMessage(
        "Invalid Value: Enter a number or a valid symbol (e.g., 10, +, &&) to push onto the stack."
      );
      return;
    }
    if (stack.length >= stackMax) {
      updateMessage(
        "Stack Overflow: Stack is full! Increase capacity or pop elements to continue."
      );
      return;
    }
    setIsAnimating(true);
    updateMessage(
      `Pushing Element: Value ${formatValue(
        value
      )} is being added to the top of the stack!`
    );

    setElementStates(prev => [...prev, "pushing"]);
    setStack(prev => [...prev, value]);
    setLastPushed(value);
    setActiveStat("size");

    await sleep(animationSpeed);
    setElementStates(prev => prev.map((s, i) => (i === prev.length - 1 ? "" : s)));
    setActiveStat(null);
    setInputValue("");
    setIsAnimating(false);
  };

  // Pop operation
  const handlePop = async () => {
    if (isAnimating || stack.length === 0) {
      if (stack.length === 0) {
        updateMessage("Stack Underflow: The stack is empty! Nothing to pop.");
      }
      return;
    }
    setIsAnimating(true);
    updateMessage(
      `Popping Element: Value ${formatValue(
        stack[stack.length - 1]
      )} removed from the stack!`
    );

    setElementStates(prev =>
      prev.map((s, i) => (i === prev.length - 1 ? "popping" : s))
    );
    setActiveStat("size");

    await sleep(animationSpeed);
    setElementStates(prev => prev.slice(0, -1));
    setLastPopped(stack[stack.length - 1]);
    setStack(prev => prev.slice(0, -1));
    setActiveStat(null);
    setIsAnimating(false);
  };

  // Peek operation
  const handlePeek = async () => {
    if (isAnimating || stack.length === 0) {
      if (stack.length === 0) {
        updateMessage("Stack Empty: The stack is empty! No top element to peek at.");
      }
      return;
    }
    setIsAnimating(true);
    updateMessage(
      `Peeking Element: Checking top value ${formatValue(
        stack[stack.length - 1]
      )} without removing it.`
    );

    setElementStates(prev =>
      prev.map((s, i) => (i === prev.length - 1 ? "peek" : s))
    );
    setActiveStat("top");
    await sleep(animationSpeed * 1.2);
    setElementStates(prev =>
      prev.map((s, i) => (i === prev.length - 1 ? "" : s))
    );
    setActiveStat(null);
    setIsAnimating(false);
  };

  // Reset operation
  const handleReset = () => {
    if (isAnimating) return;
    updateMessage(
      "Resetting Stack: Clearing all elements! Stack size set to 0, capacity reset to 7, top value cleared."
    );
    setStack([]);
    setElementStates([]);
    setLastPushed("-");
    setLastPopped("-");
    setCapacityValue(7);
    setStackMax(7);
  };

  // Capacity change
  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCapacity = parseInt(e.target.value);
    setCapacityValue(newCapacity);
    if (isNaN(newCapacity) || newCapacity < 1) {
      updateMessage("Invalid Capacity: Enter a positive number for stack capacity.");
      return;
    }
    setStackMax(newCapacity);
    if (stack.length > newCapacity) {
      updateMessage(
        `Warning: Stack size (${stack.length}) exceeds new capacity (${newCapacity}). Consider popping elements or increasing capacity.`
      );
    } else {
      updateMessage(`Capacity Updated: Stack capacity set to ${newCapacity}.`);
    }
  };

  // Help modal
  const openHelp = () => setShowHelp(true);
  const closeHelp = () => setShowHelp(false);

  // Keyboard events for modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showHelp) closeHelp();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showHelp]);

  // Stack array string
  const topIndex = stack.length - 1;
  const topValue = stack.length > 0 ? stack[stack.length - 1] : "-";

  // Render stack elements (bottom to top)
  const renderStackElements = () =>
    stack.map((value, idx) => {
      const classNames = [
        "transition-all duration-500 w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center rounded-2xl font-bold text-lg md:text-xl shadow-xl border-2 border-white/20 mb-2",
      ];
      if (elementStates[idx] === "pushing")
        classNames.push("bg-gradient-to-br from-orange-400 to-pink-500 scale-110 ring-4 ring-orange-300/40 animate-bounce");
      else if (elementStates[idx] === "popping")
        classNames.push("bg-gradient-to-br from-red-500 to-rose-600 scale-105 ring-4 ring-red-400/40 animate-pulse opacity-60");
      else if (elementStates[idx] === "peek")
        classNames.push("bg-gradient-to-br from-green-400 to-emerald-500 scale-105 ring-4 ring-green-300/40 animate-glow");
      else
        classNames.push("bg-gradient-to-br from-purple-600 to-pink-600 hover:scale-105");

      return (
        <div className={classNames.join(" ")} key={idx}>
          <span className="value">{value}</span>
          <span className="index text-xs text-white/70">Index: {idx}</span>
        </div>
      );
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-center flex-1">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stack (LIFO)
            </span>
          </h1>
          <button
            onClick={openHelp}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-xl font-semibold transition-all duration-300 shadow-lg"
          >
            <HelpCircle className="h-5 w-5" />
            Help
          </button>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-700/30">
          <h2 className="text-2xl font-bold mb-4 text-purple-300 flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            How Stack (LIFO) Works
          </h2>
          <p className="text-gray-300 leading-relaxed">
            A stack is a linear data structure that follows the <span className="text-yellow-400 font-semibold">Last-In-First-Out (LIFO)</span> principle. Elements are added (<span className="text-yellow-400 font-semibold">push</span>) and removed (<span className="text-yellow-400 font-semibold">pop</span>) from the top of the stack. <span className="text-green-400 font-semibold">Peek</span> allows viewing the top element without removing it.
          </p>
          <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
            <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
              <strong className="text-orange-300">Push:</strong> O(1)
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
              <strong className="text-red-300">Pop:</strong> O(1)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Peek:</strong> O(1)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space:</strong> O(n)
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-700/30">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Value (e.g. 10, +, &&)"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isAnimating}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors w-48"
            />
            <input
              type="number"
              value={capacityValue}
              min={1}
              max={20}
              onChange={handleCapacityChange}
              disabled={isAnimating}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors w-32"
            />
            <button
              onClick={handlePush}
              disabled={isAnimating}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Push
            </button>
            <button
              onClick={handlePop}
              disabled={isAnimating}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Pop
            </button>
            <button
              onClick={handlePeek}
              disabled={isAnimating}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Peek
            </button>
            <button
              onClick={handleReset}
              disabled={isAnimating}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <RotateCcw className="h-5 w-5 inline-block mr-1" />
              Reset
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="bg-gray-700/50 rounded-xl px-6 py-3 flex flex-col items-center">
              <span className="text-gray-400 text-xs">Size</span>
              <span className={`font-bold text-lg ${activeStat === "size" ? "text-orange-400 scale-110" : ""}`}>{stack.length}</span>
            </div>
            <div className="bg-gray-700/50 rounded-xl px-6 py-3 flex flex-col items-center">
              <span className="text-gray-400 text-xs">Capacity</span>
              <span className="font-bold text-lg">{stackMax}</span>
            </div>
            <div className="bg-gray-700/50 rounded-xl px-6 py-3 flex flex-col items-center">
              <span className="text-gray-400 text-xs">Top Value</span>
              <span className={`font-bold text-lg ${activeStat === "top" ? "text-green-400 scale-110" : ""}`}>{topValue}</span>
            </div>
            <div className="bg-gray-700/50 rounded-xl px-6 py-3 flex flex-col items-center">
              <span className="text-gray-400 text-xs">Stack Array</span>
              <span className="font-mono text-sm text-purple-300">{stackArrayString}</span>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-purple-700/30">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Stack Visualization
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              <span dangerouslySetInnerHTML={{ __html: message }} />
            </p>
          </div>
          <div className="flex flex-col-reverse items-center justify-end min-h-[320px] md:min-h-[400px]">
            <div className="relative flex flex-col-reverse items-center w-full">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-xl font-bold shadow-lg border-2 border-yellow-300/40">
                Top: {topIndex}
              </div>
              {renderStackElements()}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-700/30">
          <h3 className="text-xl font-bold mb-4 text-pink-300">Stack Info</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-purple-700/20 rounded-xl p-4 flex flex-col items-center">
              <span className="text-gray-400 text-xs">Last Pushed</span>
              <span className="font-bold text-lg text-orange-400">{lastPushed}</span>
            </div>
            <div className="bg-purple-700/20 rounded-xl p-4 flex flex-col items-center">
              <span className="text-gray-400 text-xs">Last Popped</span>
              <span className="font-bold text-lg text-red-400">{lastPopped}</span>
            </div>
            <div className="bg-purple-700/20 rounded-xl p-4 flex flex-col items-center">
              <span className="text-gray-400 text-xs">Current Top</span>
              <span className="font-bold text-lg text-green-400">{topValue}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 flex-wrap text-sm mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded"></div>
            <span>Pushing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded"></div>
            <span>Popping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded"></div>
            <span>Peeking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded"></div>
            <span>Normal</span>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-200 dark:border-purple-800 relative">
            <button
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={closeHelp}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              How to Use
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 space-y-2 mb-4">
              <li><strong>Push</strong>: Enter a number or symbol (e.g., 10, +, &&) and click <span className="text-orange-500 font-semibold">Push</span> to add it to the stack.</li>
              <li><strong>Pop</strong>: Click <span className="text-red-500 font-semibold">Pop</span> to remove the top element.</li>
              <li><strong>Peek</strong>: Click <span className="text-green-500 font-semibold">Peek</span> to view the top element without removing it.</li>
              <li><strong>Reset</strong>: Click <span className="text-blue-500 font-semibold">Reset</span> to clear the stack and reset capacity.</li>
              <li><strong>Capacity</strong>: Adjust the stack's maximum size (1-20) using the number field.</li>
            </ul>
            <h4 className="text-lg font-bold mb-2 text-purple-500">Color Legend</h4>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 space-y-2">
              <li><span className="inline-block w-4 h-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded mr-2"></span>Pushing</li>
              <li><span className="inline-block w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded mr-2"></span>Popping</li>
              <li><span className="inline-block w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded mr-2"></span>Peeking</li>
              <li><span className="inline-block w-4 h-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded mr-2"></span>Normal</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stacklifo;