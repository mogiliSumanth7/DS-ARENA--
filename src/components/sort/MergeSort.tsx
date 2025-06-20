import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Home, ArrowLeft, ArrowRight } from "lucide-react";

type StepType = "display" | "split" | "merge";

interface Step {
  type: StepType;
  level: number;
}

const initialSteps: Step[] = [
  { type: "display", level: 0 },
  { type: "split", level: 1 },
  { type: "split", level: 2 },
  { type: "merge", level: 3 },
  { type: "merge", level: 4 },
];

const arrays = {
  0: [[7, 6, 4, 3]],
  1: [
    [7, 6],
    [4, 3],
  ],
  2: [[7], [6], [4], [3]],
  3: [
    [7, 6],
    [4, 3],
    [6, 7],
    [3, 4],
  ],
  4: [
    [6, 7],
    [3, 4],
    [3, 4, 6, 7],
  ],
};

const explanations = [
  "The initial unsorted array [7, 6, 4, 3]. Merge Sort begins by dividing it into two halves.",
  "The array splits into [7, 6] and [4, 3]. Each subarray is further divided.",
  "Subarrays are split into single elements: [7], [6], [4], [3]. Merging begins.",
  "Merge [7] and [6] to [6, 7], and [4] and [3] to [3, 4].",
  "Merge [6, 7] and [3, 4] to form the sorted array [3, 4, 6, 7].",
];

const titles = [
  "Level 0: Initial Array",
  "Level 1: First Split",
  "Level 2: Further Split",
  "Level 3: First Merge",
  "Level 4: Final Merge",
];

const MergeSort: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation logic
  const nextStep = () => setStep((prev) => Math.min(prev + 1, initialSteps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    if (isPlaying && !isPaused && step < initialSteps.length - 1) {
      timeoutRef.current = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, speed);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, isPaused, step, speed]);

  useEffect(() => {
    if (step === initialSteps.length - 1) setIsPlaying(false);
  }, [step]);

  // Render array boxes
  const renderArray = (arr: number[], highlight?: boolean, sorted?: boolean) => (
    <div className="flex gap-2 bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded-lg shadow-inner">
      {arr.map((num, idx) => (
        <div
          key={idx}
          className={
            "w-14 h-14 flex items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 shadow-lg " +
            (sorted
              ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50"
              : highlight
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 scale-105 shadow-yellow-400/50"
              : "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30")
          }
        >
          {num}
        </div>
      ))}
    </div>
  );

  // Render tree levels
  const renderLevel = (level: number) => {
    switch (level) {
      case 0:
        return (
          <div className="bg-gray-800/30 rounded-2xl p-6 mb-6 border border-gray-700 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-cyan-300">{titles[0]}</h2>
            <div className="flex justify-center">{renderArray(arrays[0][0])}</div>
            <p className="text-gray-300 mt-4">{explanations[0]}</p>
          </div>
        );
      case 1:
        return (
          <div className="bg-gray-800/30 rounded-2xl p-6 mb-6 border border-gray-700 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-cyan-300">{titles[1]}</h2>
            <div className="flex gap-8 justify-center">
              {arrays[1].map((arr, i) => renderArray(arr, true))}
            </div>
            <p className="text-gray-300 mt-4">{explanations[1]}</p>
          </div>
        );
      case 2:
        return (
          <div className="bg-gray-800/30 rounded-2xl p-6 mb-6 border border-gray-700 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-cyan-300">{titles[2]}</h2>
            <div className="flex gap-8 justify-center flex-wrap">
              {arrays[2].map((arr, i) => renderArray(arr, true))}
            </div>
            <p className="text-gray-300 mt-4">{explanations[2]}</p>
          </div>
        );
      case 3:
        return (
          <div className="bg-gray-800/30 rounded-2xl p-6 mb-6 border border-gray-700 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-cyan-300">{titles[3]}</h2>
            <div className="flex gap-8 justify-center">
              {renderArray(arrays[3][0], true)}
              {renderArray(arrays[3][1], true)}
            </div>
            <div className="flex gap-8 justify-center mt-6">
              {renderArray(arrays[3][2], false, true)}
              {renderArray(arrays[3][3], false, true)}
            </div>
            <p className="text-gray-300 mt-4">{explanations[3]}</p>
          </div>
        );
      case 4:
        return (
          <div className="bg-gray-800/30 rounded-2xl p-6 mb-6 border border-gray-700 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-cyan-300">{titles[4]}</h2>
            <div className="flex gap-8 justify-center">
              {renderArray(arrays[4][0], true)}
              {renderArray(arrays[4][1], true)}
            </div>
            <div className="flex gap-8 justify-center mt-6">
              {renderArray(arrays[4][2], false, true)}
            </div>
            <p className="text-gray-300 mt-4">{explanations[4]}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-6 flex flex-col">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Merge Sort
            </span>
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">How Merge Sort Works</h2>
          <p className="text-gray-300 leading-relaxed">
            Merge Sort is a divide-and-conquer algorithm that splits the array into halves, recursively sorts them, and merges the sorted halves.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Time Complexity:</strong> O(n log n)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space Complexity:</strong> O(n)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Stability:</strong> Stable
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={() => {
                setStep(0);
                setIsPlaying(true);
                setIsPaused(false);
              }}
              disabled={isPlaying}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              <Play className="h-5 w-5" />
              Play
            </button>
            <button
              onClick={() => setIsPaused(true)}
              disabled={!isPlaying || isPaused}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300"
            >
              <Pause className="h-5 w-5" />
              Pause
            </button>
            <button
              onClick={() => setIsPaused(false)}
              disabled={!isPlaying || !isPaused}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300"
            >
              <Play className="h-5 w-5" />
              Continue
            </button>
            <button
              onClick={prevStep}
              disabled={step === 0 || isPlaying}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Previous
            </button>
            <button
              onClick={nextStep}
              disabled={step === initialSteps.length - 1 || isPlaying}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-xl transition-all duration-300"
            >
              Next
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setStep(0);
                setIsPlaying(false);
                setIsPaused(false);
              }}
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
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-gray-400 text-sm">{speed}ms</span>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex flex-col items-center">
          <div className="w-full">{renderLevel(step)}</div>
          {/* Legend */}
          <div className="flex justify-center gap-6 flex-wrap text-sm mb-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded"></div>
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded"></div>
              <span>Splitting/Merging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
              <span>Sorted</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Progress</span>
            <span className="text-gray-300">{Math.round(((step + 1) / initialSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / initialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeSort;