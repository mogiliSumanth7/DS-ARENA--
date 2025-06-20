// This file contains the QuickSort component that visualizes the Quick Sort algorithm. 
// It includes the modal for displaying the sorting process, control buttons for animation, 
// and the logic for handling the sorting steps. It exports the QuickSort component.

import React, { useState, useEffect } from 'react';

interface ArrayElement {
  value: number;
  id: string;
  status: 'default' | 'swapping' | 'sorted' | 'pivot';
}

const QuickSort: React.FC = () => {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [steps, setSteps] = useState<ArrayElement[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [speed, setSpeed] = useState(300);

  // Generate a new random array
  const resetArray = () => {
    const raw = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
    setArray(raw.map((v, i) => ({ value: v, id: `${v}-${i}`, status: 'default' })));
    setSteps([]);
    setCurrentStep(0);
    setIsSorting(false);
  };

  // Quick Sort logic with step recording and status
  const quickSortSteps = (arr: ArrayElement[]) => {
    const steps: ArrayElement[][] = [];
    const working = arr.map(e => ({ ...e }));

    const markStep = (arr: ArrayElement[], indices: number[] = [], pivotIdx: number | null = null, sortedIdxs: Set<number> = new Set()) => {
      steps.push(
        arr.map((e, idx) => ({
          ...e,
          status: sortedIdxs.has(idx)
            ? 'sorted'
            : pivotIdx === idx
            ? 'pivot'
            : indices.includes(idx)
            ? 'swapping'
            : 'default'
        }))
      );
    };

    const sortedIdxs = new Set<number>();

    const quickSort = (l: number, r: number) => {
      if (l >= r) {
        if (l === r) sortedIdxs.add(l);
        return;
      }
      let pivotIdx = r;
      let pivot = working[pivotIdx].value;
      let i = l;
      markStep(working, [], pivotIdx, sortedIdxs);

      for (let j = l; j < r; j++) {
        markStep(working, [j], pivotIdx, sortedIdxs);
        if (working[j].value < pivot) {
          if (i !== j) {
            [working[i], working[j]] = [working[j], working[i]];
            markStep(working, [i, j], pivotIdx, sortedIdxs);
          }
          i++;
        }
      }
      if (i !== pivotIdx) {
        [working[i], working[pivotIdx]] = [working[pivotIdx], working[i]];
        markStep(working, [i, pivotIdx], i, sortedIdxs);
      }
      sortedIdxs.add(i);
      markStep(working, [], null, sortedIdxs);

      quickSort(l, i - 1);
      quickSort(i + 1, r);
    };

    quickSort(0, working.length - 1);

    // Final sorted
    steps.push(working.map((e) => ({ ...e, status: 'sorted' })));
    return steps;
  };

  const startSorting = () => {
    setIsSorting(true);
    const arrCopy = array.map(e => ({ ...e }));
    const allSteps = quickSortSteps(arrCopy);
    setSteps(allSteps);
    setCurrentStep(0);
  };

  useEffect(() => {
    resetArray();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSorting && steps.length > 0 && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          setIsSorting(false);
          return prev;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isSorting, currentStep, steps, speed]);

  const getElementStyle = (status: string) => {
    const base = "w-12 h-12 flex items-center justify-center rounded-lg font-bold text-white text-lg transition-all duration-300 shadow-lg";
    if (status === 'swapping') return `${base} bg-gradient-to-br from-red-500 to-rose-600 scale-110 animate-pulse`;
    if (status === 'sorted') return `${base} bg-gradient-to-br from-green-500 to-emerald-600`;
    if (status === 'pivot') return `${base} bg-gradient-to-br from-yellow-400 to-orange-500 scale-105`;
    return `${base} bg-gradient-to-br from-blue-500 to-cyan-600`;
  };

  const currentArr = steps.length > 0 ? steps[currentStep] : array;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quick Sort Visualizer
          </span>
        </h1>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">How Quick Sort Works</h2>
          <p className="text-gray-300 leading-relaxed">
            Quick Sort picks a pivot element and partitions the array so that elements less than the pivot are on the left, and greater are on the right. It then recursively sorts the subarrays.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Time Complexity:</strong> O(n log n)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space Complexity:</strong> O(log n)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Stability:</strong> Not Stable
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={resetArray}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl font-semibold transition-all duration-300"
          >
            Generate New Array
          </button>
          <button
            onClick={startSorting}
            disabled={isSorting || steps.length > 0}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300"
          >
            Start Sorting
          </button>
          <label className="flex items-center gap-2">
            <span className="text-gray-300">Speed:</span>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-gray-400 text-sm">{speed}ms</span>
          </label>
        </div>

        {/* Visualization */}
        <div className="flex justify-center items-end gap-2 mb-8 min-h-[80px]">
          {currentArr.map((el, idx) => (
            <div
              key={el.id}
              className={getElementStyle(el.status)}
              style={{
                height: `${el.value * 2 + 30}px`,
                transition: 'height 0.3s'
              }}
            >
              {el.value}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 flex-wrap text-sm mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded"></div>
            <span>Unsorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded"></div>
            <span>Pivot</span>
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

        {/* Progress Bar */}
        {steps.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Progress</span>
              <span className="text-gray-300">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickSort;