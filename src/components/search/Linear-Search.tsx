import React, { useState } from "react";

const LinearSearch: React.FC = () => {
  const [array, setArray] = useState<number[]>([1, 3, 5, 7, 9, 11]);
  const [target, setTarget] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);

  const handleSearch = () => {
    setResult(null);
    for (let i = 0; i < array.length; i++) {
      setSearchingIndex(i);
      if (array[i] === target) {
        setResult(i);
        setSearchingIndex(null);
        return;
      }
    }
    setResult(-1);
    setSearchingIndex(null);
  };

  const getElementStyle = (index: number) => {
    const baseStyle =
      "w-16 h-16 flex items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-300 transform shadow-lg";
    if (result !== null && result === index) {
      return `${baseStyle} bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50 scale-110`;
    }
    if (searchingIndex === index) {
      return `${baseStyle} bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-400/50 scale-105`;
    }
    return `${baseStyle} bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center w-full">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Linear Search
            </span>
          </h1>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">
            How Linear Search Works
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Linear Search checks each element in the array one by one until it
            finds the target value or reaches the end of the array.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Time Complexity:</strong> O(n)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space Complexity:</strong> O(1)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Stability:</strong> Stable
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-cyan-300">Try It Out</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              placeholder="Enter target value"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Search
            </button>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Array Visualization
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Each box represents an element in the array. The yellow box is being
              checked. Green means the target was found.
            </p>
          </div>
          <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
            {array.map((num, idx) => (
              <div key={idx} className={getElementStyle(idx)}>
                {num}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded"></div>
              <span>Unsearched</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded"></div>
              <span>Currently Checking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
              <span>Found</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 text-center">
          <div className="text-lg">
            {result === null
              ? "Enter a value and search."
              : result === -1
              ? "Not found."
              : `Found at index ${result}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinearSearch;