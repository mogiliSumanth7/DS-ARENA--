import React, { useState } from "react";

const binarySearch = (arr: number[], target: number): number => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
};

const BinarySearch: React.FC = () => {
  const [array, setArray] = useState<string>("1,3,5,7,9,11");
  const [target, setTarget] = useState<string>("7");
  const [result, setResult] = useState<number | null>(null);

  const handleSearch = () => {
    const arr = array.split(",").map(Number).sort((a, b) => a - b);
    const tgt = Number(target);
    const idx = binarySearch(arr, tgt);
    setResult(idx);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-32"></div>
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Binary Search
            </span>
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">
            How Binary Search Works
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Binary Search works on sorted arrays by repeatedly dividing the search
            interval in half. If the value of the search key is less than the item
            in the middle, it narrows the interval to the lower half. Otherwise,
            it narrows it to the upper half. The process continues until the value
            is found or the interval is empty.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Time Complexity:</strong> O(log
              n)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space Complexity:</strong> O(1)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Requirement:</strong> Sorted Array
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-cyan-300">
            Try Your Own Array
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={array}
              onChange={(e) => setArray(e.target.value)}
              placeholder="Enter numbers separated by commas (e.g., 1,3,5,7)"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Target"
              className="w-32 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Search
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 text-center">
          <h3 className="text-xl font-bold mb-4 text-blue-200">Result</h3>
          {result !== null && (
            <div>
              {result === -1 ? (
                <span className="text-red-400 font-semibold text-lg">
                  Target not found.
                </span>
              ) : (
                <span className="text-green-400 font-semibold text-lg">
                  Target found at index: {result}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BinarySearch;