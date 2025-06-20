// This file contains the BubbleSort component, which implements the visualization of the Bubble Sort algorithm. 
// It includes the modal structure, control buttons, and the logic for animating the sorting process using React hooks.

import React, { useState } from 'react';

const BAR_COLORS = {
    default: 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30',
    comparing: 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110 shadow-yellow-400/50',
    swapping: 'bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-500/50 animate-pulse',
    sorted: 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50',
};

interface BarState {
    value: number;
    status: 'default' | 'comparing' | 'swapping' | 'sorted';
}

const BubbleSort: React.FC = () => {
    const [array, setArray] = useState<BarState[]>([]);
    const [isSorting, setIsSorting] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(100);
    const [progress, setProgress] = useState(0);

    const generateArray = () => {
        const newArray = Array.from({ length: 20 }, (_, i) => ({
            value: Math.floor(Math.random() * 100),
            status: 'default' as const,
        }));
        setArray(newArray);
        setProgress(0);
    };

    const bubbleSort = async () => {
        setIsSorting(true);
        let arr = [...array];
        let n = arr.length;
        let totalSteps = ((n - 1) * n) / 2;
        let step = 0;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                arr = arr.map((bar, idx) => ({
                    ...bar,
                    status:
                        idx === j || idx === j + 1
                            ? 'comparing'
                            : idx >= n - i
                            ? 'sorted'
                            : 'default',
                }));
                setArray([...arr]);
                await new Promise((resolve) => setTimeout(resolve, animationSpeed));

                if (arr[j].value > arr[j + 1].value) {
                    arr[j].status = arr[j + 1].status = 'swapping';
                    setArray([...arr]);
                    await new Promise((resolve) => setTimeout(resolve, animationSpeed));

                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
                step++;
                setProgress(Math.round((step / totalSteps) * 100));
            }
            arr = arr.map((bar, idx) => ({
                ...bar,
                status: idx >= n - i - 1 ? 'sorted' : 'default',
            }));
            setArray([...arr]);
        }
        arr = arr.map((bar) => ({ ...bar, status: 'sorted' }));
        setArray([...arr]);
        setIsSorting(false);
        setProgress(100);
    };

    const getBarClass = (status: BarState['status']) => {
        return `w-6 mx-1 rounded-xl transition-all duration-300 shadow-lg ${BAR_COLORS[status]}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900/20 to-gray-900 text-white p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="w-32"></div>
                    <h1 className="text-4xl md:text-6xl font-bold text-center">
                        <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            Bubble Sort
                        </span>
                    </h1>
                    <div className="w-32"></div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-teal-300">How Bubble Sort Works</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. This process is repeated until the array is sorted.
                    </p>
                    <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                            <strong className="text-yellow-300">Time Complexity:</strong> O(n²)
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                            <strong className="text-blue-300">Space Complexity:</strong> O(1)
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
                            onClick={generateArray}
                            disabled={isSorting}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                        >
                            Generate Array
                        </button>
                        <button
                            onClick={bubbleSort}
                            disabled={isSorting || array.length === 0}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                        >
                            Start Sorting
                        </button>
                        <div className="flex items-center gap-2">
                            <label className="text-gray-300">Speed:</label>
                            <input
                                type="range"
                                min="20"
                                max="1000"
                                step="20"
                                value={animationSpeed}
                                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                                disabled={isSorting}
                                className="w-32"
                            />
                            <span className="text-gray-400 text-sm">{animationSpeed}ms</span>
                        </div>
                    </div>
                </div>

                {/* Visualization */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
                    <div className="flex justify-center items-end h-72 gap-1 mb-8">
                        {array.map((bar, idx) => (
                            <div
                                key={idx}
                                className={getBarClass(bar.status)}
                                style={{
                                    height: `${bar.value * 2.5 + 20}px`,
                                    transition: 'height 0.3s, background 0.3s, transform 0.3s',
                                }}
                                title={bar.value.toString()}
                            ></div>
                        ))}
                    </div>
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
                        <span className="text-gray-300">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BubbleSort;