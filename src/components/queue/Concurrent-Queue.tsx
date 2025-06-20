import React, { useEffect, useRef, useState } from "react";

// --- Types ---
type Producer = "Producer-1" | "Producer-2" | "Producer-3";
type QueueValue = string | number | "_";

// --- Constants ---
const CONFIG = {
    animationSpeed: 1200,
    defaultCapacity: 5,
    validSymbols: [
        "+", "/", "%", "<", "<=", "=", "==", "!=", "&&", "||", "!", "&", "|", "^", "~", "<<",
        "+=", "-=", "*=", "/=", "%=", "(", ")", "[", "]", "{", "}", ";", ",", ":", ".", "'", '"'
    ]
};

// --- Helper Functions ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const formatValue = (value: QueueValue) =>
    value === "_" ? "_" : (isNaN(Number(value)) || CONFIG.validSymbols.includes(String(value)) ? `'${value}'` : value);

// --- Main Component ---
const ConcurrentQueue: React.FC = () => {
    // --- State ---
    const [queue, setQueue] = useState<QueueValue[]>(Array(CONFIG.defaultCapacity).fill("_"));
    const [queueMax, setQueueMax] = useState(CONFIG.defaultCapacity);
    const [front, setFront] = useState(-1);
    const [rear, setRear] = useState(-1);
    const [lastEnqueued, setLastEnqueued] = useState<QueueValue>("-");
    const [lastDequeued, setLastDequeued] = useState<QueueValue>("-");
    const [isAnimating, setIsAnimating] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [delay, setDelay] = useState<number>(0);
    const [producer, setProducer] = useState<Producer>("Producer-1");
    const [capacityInput, setCapacityInput] = useState(CONFIG.defaultCapacity);
    const [modeDark, setModeDark] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [messages, setMessages] = useState<string[]>([
        "Welcome: Use the controls to <span class=\"highlight-word\">enqueue</span>, <span class=\"highlight-word\">dequeue</span>, <span class=\"highlight-word\">peek</span>, or <span class=\"highlight-word\">reset</span> the queue!"
    ]);
    const [codeContent, setCodeContent] = useState<string>("// Concurrent Queue Implementation\nlet queue = ['_', '_', '_', '_', '_'];\nlet queueMax = 5;\nlet front = -1;\nlet rear = -1;\n// Ready for concurrent operations...\n");

    // --- Refs for animation ---
    const queueContainerRef = useRef<HTMLDivElement>(null);

    // --- Derived ---
    const size = front === -1 ? 0 : rear - front + 1;
    const frontValue = front !== -1 ? queue[front] : "-";
    const formattedQueue = "[" + queue.map(formatValue).join(", ") + "]";

    // --- Logger ---
    const log = (message: string) => {
        const time = new Date().toLocaleTimeString();
        const keywords = [
            "Enqueuing", "Dequeuing", "Peeking", "Resetting", "Value", "Size", "Capacity", "Invalid", "Queue Full", "Queue Empty", "Warning",
            "enqueue", "dequeue", "peek", "reset", "Help", "Concurrent Queue", "Producer", "Delay"
        ];
        let highlightedMessage = message;
        keywords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, "g");
            highlightedMessage = highlightedMessage.replace(regex, `<span class="highlight-word">${word}</span>`);
        });
        setMessages(prev => [`[${time}] ${highlightedMessage}`, ...prev]);
    };

    // --- Code Display ---
    const updateCodeContent = (operation: string, value: any = null, producer: any = null, delayVal: number = 0) => {
        let code = `// Concurrent Queue Implementation\n`;
        code += `let queue = [${queue.map(formatValue).join(", ")}];\n`;
        code += `let queueMax = ${queueMax};\n`;
        code += `let front = ${front};\n`;
        code += `let rear = ${rear};\n\n`;
        switch (operation) {
            case "init":
                code += "// Ready for concurrent operations...\n";
                break;
            case "capacity":
                code += `// Updating Capacity\nqueueMax = ${value};\n`;
                break;
            case "enqueue":
                code += `// Enqueue Operation (${producer})\nsetTimeout(() => {\n    if (rear < queueMax - 1) {\n        rear++;\n        queue[rear] = ${formatValue(value)};\n        if (front === -1) front = 0;\n    }\n}, ${delayVal});\n`;
                break;
            case "dequeue":
                code += `// Dequeue Operation\nsetTimeout(() => {\n    if (front !== -1) {\n        let value = queue[front];\n        queue[front] = '_';\n        front++;\n        if (front > rear) {\n            front = -1;\n            rear = -1;\n        }\n    }\n}, ${delayVal});\n`;
                code += `// Dequeue Operation\nsetTimeout(() => {\n    if (front !== -1) {\n        let value = queue[front];\n        queue[front] = '_';\n        front++;\n        if (front > rear) {\n            front = -1;\n            rear = -1;\n        }\n    }\n}, ${delayVal});\n`;
                break;
            case "peek":
                code += `// Peek Operation\nif (front !== -1) {\n    let value = queue[front];\n}\n`;
                break;
            case "reset":
                code += `// Reset Operation\nqueue = Array(5).fill('_');\nqueueMax = 5;\nfront = -1;\nrear = -1;\n`;
                break;
        }
        setCodeContent(code);
    };

    // --- UI/Animation Helpers ---
    const toggleControls = (disabled: boolean) => {
        // No-op: handled by disabling buttons/inputs in JSX
    };

    // --- Queue Operations ---
    const handleEnqueue = async () => {
        if (isAnimating) return;
        if (
            inputValue.trim() === "" ||
            (!CONFIG.validSymbols.includes(inputValue.trim()) && isNaN(Number(inputValue.trim())))
        ) {
            log("Invalid Value: Enter a valid number or symbol (e.g., A1, +, &&) to enqueue.");
            updateCodeContent("init");
            return;
        }
        if (rear >= queueMax - 1) {
            log("Queue Full: Cannot enqueue to the Concurrent Queue.");
            updateCodeContent("enqueue", inputValue, producer, delay);
            return;
        }
        log(`${producer} will enqueue '${inputValue}' after ${delay}ms...`);
        updateCodeContent("enqueue", inputValue, producer, delay);

        setIsAnimating(true);
        toggleControls(true);

        await sleep(delay);

        // Check again after delay
        if (rear >= queueMax - 1) {
            log(`${producer} failed to enqueue '${inputValue}': Queue Full!`);
            setIsAnimating(false);
            toggleControls(false);
            return;
        }

        const newRear = rear + 1;
        const newQueue = [...queue];
        newQueue[newRear] = inputValue;
        setQueue(newQueue);
        setRear(newRear);
        if (front === -1) setFront(0);
        setLastEnqueued(inputValue);

        // Animation: handled by CSS class
        log(`${producer} enqueued: ${inputValue}`);
        setInputValue("");
        setIsAnimating(false);
        toggleControls(false);
    };

    const handleDequeue = async () => {
        if (isAnimating) return;
        log(`Consumer will attempt dequeue after ${delay}ms...`);
        updateCodeContent("dequeue", null, null, delay);

        setIsAnimating(true);
        toggleControls(true);

        await sleep(delay);

        if (front === -1) {
            log("Queue Empty: The Concurrent Queue is empty! Nothing to dequeue.");
            setIsAnimating(false);
            toggleControls(false);
            return;
        }

        const value = queue[front];
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

        log(`Consumer dequeued: ${value}`);
        setIsAnimating(false);
        toggleControls(false);
    };

    const handlePeek = async () => {
        if (isAnimating || front === -1) {
            log("Queue Empty: The Concurrent Queue is empty! Nothing to peek.");
            updateCodeContent("peek");
            return;
        }
        setIsAnimating(true);
        toggleControls(true);

        log(`Peeking Front Element: Value ${formatValue(queue[front])} at index ${front}.`);
        updateCodeContent("peek");

        // Animation: handled by CSS class
        await sleep(CONFIG.animationSpeed);

        setIsAnimating(false);
        toggleControls(false);
    };

    const handleReset = async () => {
        if (isAnimating) return;
        setIsAnimating(true);
        toggleControls(true);

        log("Resetting Queue: The Concurrent Queue is being cleared and capacity set to 5.");
        updateCodeContent("reset");

        setQueue(Array(CONFIG.defaultCapacity).fill("_"));
        setQueueMax(CONFIG.defaultCapacity);
        setFront(-1);
        setRear(-1);
        setLastEnqueued("-");
        setLastDequeued("-");
        setCapacityInput(CONFIG.defaultCapacity);

        await sleep(CONFIG.animationSpeed);

        setIsAnimating(false);
        toggleControls(false);
    };

    const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCapacity = parseInt(e.target.value);
        setCapacityInput(newCapacity);
        updateCodeContent("capacity", newCapacity);
    };

    const handleCapacityCommit = () => {
        if (isNaN(capacityInput) || capacityInput < 1) {
            log("Invalid Capacity: Enter a positive number for queue capacity.");
            setCapacityInput(queueMax);
            updateCodeContent("capacity", queueMax);
            return;
        }
        const oldQueue = queue;
        const newQueue = Array(capacityInput).fill("_");
        let newFront = front;
        let newRear = rear;
        if (rear !== -1) {
            for (let i = front; i <= Math.min(rear, capacityInput - 1); i++) {
                newQueue[i] = oldQueue[i];
            }
            if (rear >= capacityInput) {
                newRear = capacityInput - 1;
                log(`Warning: Queue truncated to fit new capacity (${capacityInput}).`);
            }
        }
        setQueueMax(capacityInput);
        setQueue(newQueue);
        setFront(newFront);
        setRear(newRear);
        log(`Capacity Updated: Queue capacity set to ${capacityInput}.`);
        updateCodeContent("capacity", capacityInput);
    };

    // --- Mode Toggle ---
    useEffect(() => {
        if (modeDark) {
            document.body.classList.remove("light-mode");
        } else {
            document.body.classList.add("light-mode");
        }
        log(`Mode Switched: ${modeDark ? "Dark mode enabled!" : "Light mode enabled!"}`);
        updateCodeContent("init");
        // eslint-disable-next-line
    }, [modeDark]);

    // --- Help Modal ---
    const handleHelpOpen = () => {
        setShowHelp(true);
        log("Help Opened: View instructions and color types for using the Concurrent Queue Visualizer.");
    };
    const handleHelpClose = () => {
        setShowHelp(false);
        log("Help Closed: Continue exploring the Concurrent Queue Visualizer!");
    };

    // --- Keyboard Escape for Modal ---
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && showHelp) handleHelpClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
        // eslint-disable-next-line
    }, [showHelp]);

    // --- Render ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl md:text-6xl font-bold text-center">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Concurrent Queue Visualizer
                        </span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">Dark Mode</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={modeDark}
                                onChange={() => setModeDark(v => !v)}
                                className="sr-only peer"
                                id="modeToggle"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-600 transition-all"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                        </label>
                    </div>
                </div>

                {/* Subtitle */}
                <div className="text-lg text-gray-300 mb-8 text-center">
                    An interactive tool to understand a concurrent First-In-First-Out (FIFO) queue with multiple producers and delayed operations.
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Visualization & Controls */}
                    <div className="md:col-span-2 flex flex-col gap-8">
                        {/* Controls */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 flex flex-wrap gap-4 items-center justify-center">
                            <input
                                type="text"
                                id="queueInput"
                                placeholder="e.g. A1, +, &&"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                disabled={isAnimating}
                                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors w-32"
                            />
                            <input
                                type="number"
                                id="delayInput"
                                placeholder="Delay"
                                min={0}
                                value={delay}
                                onChange={e => setDelay(Number(e.target.value))}
                                disabled={isAnimating}
                                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors w-28"
                            />
                            <select
                                id="producerSelect"
                                value={producer}
                                onChange={e => setProducer(e.target.value as Producer)}
                                disabled={isAnimating}
                                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors w-36"
                            >
                                <option value="Producer-1">Producer 1</option>
                                <option value="Producer-2">Producer 2</option>
                                <option value="Producer-3">Producer 3</option>
                            </select>
                            <input
                                type="number"
                                id="queueCapacity"
                                value={capacityInput}
                                min={1}
                                max={100}
                                onChange={handleCapacityChange}
                                onBlur={handleCapacityCommit}
                                disabled={isAnimating}
                                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors w-24"
                            />
                            <button
                                id="enqueueBtn"
                                onClick={handleEnqueue}
                                disabled={isAnimating}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                            >
                                Enqueue
                            </button>
                            <button
                                id="dequeueBtn"
                                onClick={handleDequeue}
                                disabled={isAnimating}
                                className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                            >
                                Dequeue
                            </button>
                            <button
                                id="peekQueueBtn"
                                onClick={handlePeek}
                                disabled={isAnimating}
                                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                            >
                                Peek
                            </button>
                            <button
                                id="resetQueueBtn"
                                onClick={handleReset}
                                disabled={isAnimating}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                            >
                                Reset
                            </button>
                            <button
                                id="helpBtn"
                                onClick={handleHelpOpen}
                                disabled={isAnimating}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                            >
                                Help
                            </button>
                        </div>

                        {/* Queue Visualization */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-4 text-purple-300">Concurrent Queue (FIFO)</h2>
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex gap-2 items-end mb-4">
                                    <div className="text-sm text-cyan-400 font-semibold">Front: {front}</div>
                                    <div className="text-sm text-pink-400 font-semibold">Rear: {rear}</div>
                                </div>
                                <div className="flex gap-4 justify-center mb-4">
                                    {queue.map((val, idx) =>
                                        val !== "_" ? (
                                            <div
                                                key={idx}
                                                className={
                                                    [
                                                        "w-16 h-16 flex flex-col items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg",
                                                        lastEnqueued === val && rear === idx
                                                            ? "bg-gradient-to-br from-orange-400 to-yellow-500 scale-110 shadow-orange-400/50"
                                                            : lastDequeued === val && front - 1 === idx
                                                            ? "bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-500/50 animate-pulse"
                                                            : front === idx && !isAnimating
                                                            ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50"
                                                            : "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30"
                                                    ].join(" ")
                                                }
                                            >
                                                <span>{val}</span>
                                                <span className="text-xs text-gray-300">Idx: {idx}</span>
                                            </div>
                                        ) : (
                                            <div
                                                key={idx}
                                                className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-700/40 border border-gray-600 text-gray-500 text-lg"
                                            >
                                                _
                                            </div>
                                        )
                                    )}
                                </div>
                                {/* Stats */}
                                <div className="flex gap-8 justify-center mt-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-400">Size</span>
                                        <span className="font-bold text-lg text-cyan-300">{size}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-400">Capacity</span>
                                        <span className="font-bold text-lg text-pink-300">{queueMax}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-400">Front Value</span>
                                        <span className="font-bold text-lg text-green-300">{frontValue}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Box */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-purple-300 mb-2">Queue Info</h2>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Front Element</span>
                                <span className="font-bold text-green-300">{frontValue}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Last Enqueued</span>
                                <span className="font-bold text-orange-300">{lastEnqueued}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Last Dequeued</span>
                                <span className="font-bold text-red-300">{lastDequeued}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Queue Size</span>
                                <span className="font-bold text-cyan-300">{size}</span>
                            </div>
                            <div className="flex flex-col mt-2">
                                <span className="text-gray-400">Queue Array</span>
                                <span className="font-mono text-xs text-pink-200">{formattedQueue}</span>
                            </div>
                        </div>
                        <div className="bg-gray-900/60 rounded-xl p-3 mt-4 border border-gray-700">
                            <div dangerouslySetInnerHTML={{ __html: messages[0] }} />
                        </div>
                        <div className="bg-gray-900/60 rounded-xl p-3 mt-4 border border-gray-700 overflow-x-auto">
                            <pre className="text-xs text-purple-200">{codeContent}</pre>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-bold text-cyan-300 mb-2">Concurrent Queue Notes</h3>
                            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                <li>A <span className="text-purple-300 font-semibold">Concurrent Queue</span> follows the FIFO principle.</li>
                                <li>Supports <span className="text-pink-300 font-semibold">multiple producers</span> with delays.</li>
                                <li>Fixed size; full queue blocks enqueue.</li>
                                <li>Empty slots: <span className="text-gray-400 font-mono">'_'</span>; pointers track state.</li>
                                <li>Used in task scheduling, message passing, etc.</li>
                                <li>Key ops: <span className="text-green-300 font-semibold">enqueue</span>, <span className="text-red-300 font-semibold">dequeue</span>, <span className="text-yellow-300 font-semibold">peek</span>.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-8 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-yellow-500 rounded"></div>
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
                </div>

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) handleHelpClose(); }}>
                        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-purple-700 max-w-lg w-full relative">
                            <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-pink-400" onClick={handleHelpClose}>×</button>
                            <h3 className="text-2xl font-bold mb-4 text-purple-300">How to Use</h3>
                            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">
                                <li><strong>Enqueue</strong>: Enter a value, select a producer, set a delay, and click "Enqueue".</li>
                                <li><strong>Dequeue</strong>: Set a delay and click "Dequeue".</li>
                                <li><strong>Peek</strong>: Click "Peek" to view the front element.</li>
                                <li><strong>Reset</strong>: Click "Reset" to clear the queue.</li>
                                <li><strong>Capacity</strong>: Adjust the queue's maximum size.</li>
                                <li><strong>Dark/Light Mode</strong>: Toggle with the switch.</li>
                            </ul>
                            <h3 className="text-xl font-bold mb-2 text-cyan-300">Color Types</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                <li><span className="inline-block w-4 h-4 bg-gradient-to-br from-orange-400 to-yellow-500 rounded mr-2"></span> <strong>Enqueuing</strong></li>
                                <li><span className="inline-block w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded mr-2"></span> <strong>Dequeuing</strong></li>
                                <li><span className="inline-block w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded mr-2"></span> <strong>Peeking</strong></li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConcurrentQueue;