import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Home, ArrowLeft, ArrowRight } from "lucide-react";


const initialArray = [7, 6, 4, 3];

type Step = {
  columnId: string;
  step: string;
  compare: number[];
  swap: boolean;
  indicator?: string;
  nextStep?: string;
};

const steps: Step[] = [
  { columnId: "initial", step: "initial-array", compare: [], swap: false },
  { columnId: "build-heap", step: "build-heap-step", compare: [], swap: false },
  { columnId: "extract-pass1", step: "extract-pass1-step1", compare: [0, 3], swap: true, indicator: "swap-extract1", nextStep: "extract-pass1-step2" },
  { columnId: "heapify-pass1", step: "heapify-pass1-step1", compare: [0, 1, 2], swap: true, indicator: "swap-heapify1", nextStep: "heapify-pass1-step2" },
  { columnId: "extract-pass2", step: "extract-pass2-step1", compare: [0, 2], swap: true, indicator: "swap-extract2", nextStep: "extract-pass2-step2" },
  { columnId: "heapify-pass2", step: "heapify-pass2-step1", compare: [0, 1], swap: false },
  { columnId: "extract-pass3", step: "extract-pass3-step1", compare: [0, 1], swap: true, indicator: "swap-extract3", nextStep: "extract-pass3-step2" },
  { columnId: "heapify-pass3", step: "heapify-pass3-step1", compare: [0], swap: false },
  { columnId: "final", step: "final-array", compare: [], swap: false }
];

const stepDescriptions: { [key: string]: string } = {
  "initial-array": "Initial array - Heap Sort builds a max-heap, then repeatedly extracts the maximum element and heapifies the remaining elements.",
  "build-heap-step": "Build Max-Heap: The array is already a max-heap, so no swaps are needed.",
  "extract-pass1-step1": "Extract the maximum (root, 7) by swapping it with the last element (3).",
  "extract-pass1-step2": "After swapping, 7 is sorted. Heapify the remaining [3, 6, 4].",
  "heapify-pass1-step1": "Heapify [3, 6, 4]: Compare 3, 6, 4. 6 is largest, swap 3 and 6.",
  "heapify-pass1-step2": "Heap property restored for [6, 3, 4].",
  "extract-pass2-step1": "Extract the root (6) by swapping it with the last element (4).",
  "extract-pass2-step2": "After swapping, 6 is sorted. Heapify [4, 3].",
  "heapify-pass2-step1": "Heapify [4, 3]: Compare 4 and 3. No swap needed.",
  "extract-pass3-step1": "Extract the root (4) by swapping it with the last element (3).",
  "extract-pass3-step2": "After swapping, 4 is sorted. Heapify [3].",
  "heapify-pass3-step1": "The last element [3] is a heap by itself.",
  "final-array": "The array is now fully sorted: [3, 4, 6, 7]."
};

const stepSorted: { [key: string]: number[] } = {
  "initial-array": [],
  "build-heap-step": [],
  "extract-pass1-step1": [],
  "extract-pass1-step2": [3],
  "heapify-pass1-step1": [3],
  "heapify-pass1-step2": [3],
  "extract-pass2-step1": [3],
  "extract-pass2-step2": [2, 3],
  "heapify-pass2-step1": [2, 3],
  "extract-pass3-step1": [2, 3],
  "extract-pass3-step2": [1, 2, 3],
  "heapify-pass3-step1": [1, 2, 3],
  "final-array": [0, 1, 2, 3]
};

const stepHighlight: { [key: string]: number[] } = {
  "initial-array": [],
  "build-heap-step": [],
  "extract-pass1-step1": [0, 3],
  "extract-pass1-step2": [0],
  "heapify-pass1-step1": [0, 1, 2],
  "heapify-pass1-step2": [1, 2],
  "extract-pass2-step1": [0, 2],
  "extract-pass2-step2": [0],
  "heapify-pass2-step1": [0, 1],
  "extract-pass3-step1": [0, 1],
  "extract-pass3-step2": [0],
  "heapify-pass3-step1": [0],
  "final-array": []
};

const HeapSort: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);

  // Animation effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      timeout = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, currentStep, speed]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number(e.target.value));
  };

  const handleHome = () => {
    window.location.href = "SAV";
  };

  // Get current step info
  const step = steps[currentStep];
  const stepKey = step.step;
  const arr = {
    "initial-array": [7, 6, 4, 3],
    "build-heap-step": [7, 6, 4, 3],
    "extract-pass1-step1": [7, 6, 4, 3],
    "extract-pass1-step2": [3, 6, 4, 7],
    "heapify-pass1-step1": [3, 6, 4, 7],
    "heapify-pass1-step2": [6, 3, 4, 7],
    "extract-pass2-step1": [6, 3, 4, 7],
    "extract-pass2-step2": [4, 3, 6, 7],
    "heapify-pass2-step1": [4, 3, 6, 7],
    "extract-pass3-step1": [4, 3, 6, 7],
    "extract-pass3-step2": [3, 4, 6, 7],
    "heapify-pass3-step1": [3, 4, 6, 7],
    "final-array": [3, 4, 6, 7]
  }[stepKey];

  // Styling for array boxes
  const getBoxStyle = (idx: number) => {
    const base = "w-16 h-16 flex items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg";
    if (stepSorted[stepKey]?.includes(idx)) {
      return `${base} bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50`;
    }
    if (stepHighlight[stepKey]?.includes(idx)) {
      if (step.swap && step.compare.length === 2 && step.compare.includes(idx)) {
        return `${base} bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-500/50 animate-pulse`;
      }
      return `${base} bg-gradient-to-br from-yellow-400 to-orange-500 scale-110 shadow-yellow-400/50`;
    }
    if (stepKey.includes("heap-root") && idx === 0) {
      return `${base} bg-gradient-to-br from-pink-500 to-rose-500 scale-105 shadow-pink-500/50`;
    }
    if (stepKey.includes("heap-last") && idx === arr.length - 1) {
      return `${base} bg-gradient-to-br from-orange-400 to-yellow-300 scale-105 shadow-yellow-300/50`;
    }
    return `${base} bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30`;
  };

  // Swap indicator
  const showSwap = step.swap && step.compare.length === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleHome}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Heap Sort
            </span>
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">How Heap Sort Works</h2>
          <p className="text-gray-300 leading-relaxed">
            Heap Sort builds a max-heap from the array, then repeatedly extracts the maximum element (root) and places it at the end, shrinking the heap and restoring the heap property each time.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Time Complexity:</strong> O(n log n)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space Complexity:</strong> O(1)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Stability:</strong> Not Stable
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={handlePlayPause}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-xl transition-all duration-300"
            >
              Next
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </button>
          </div>
          <div className="flex items-center justify-center gap-4">
            <label className="text-gray-300">Speed:</label>
            <input
              type="range"
              min="400"
              max="2000"
              step="200"
              value={speed}
              onChange={handleSpeed}
              className="w-32"
            />
            <span className="text-gray-400 text-sm">{speed}ms</span>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Step {currentStep + 1} of {steps.length}
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto">
              {stepDescriptions[stepKey]}
            </p>
          </div>
          <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
            {arr.map((num, idx) => (
              <div key={idx} className={getBoxStyle(idx)} style={{ animationDelay: `${idx * 100}ms` }}>
                {num}
              </div>
            ))}
          </div>
          {/* Swap Indicator */}
          {showSwap && (
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-b-blue-400 border-l-transparent border-r-transparent mb-1"></div>
                <div className="w-1 h-8 bg-blue-400"></div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-t-blue-400 border-l-transparent border-r-transparent mt-1"></div>
              </div>
              <span className="text-blue-300 font-bold">Swap</span>
            </div>
          )}
          {/* Legend */}
          <div className="flex justify-center gap-6 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded"></div>
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded"></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded"></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
              <span>Sorted</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Progress</span>
            <span className="text-gray-300">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-600 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeapSort;