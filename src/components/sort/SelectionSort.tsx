import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Home, ArrowLeft, ArrowRight } from 'lucide-react';

interface ArrayElement {
  value: number;
  id: string;
  status: 'default' | 'comparing' | 'minimum' | 'sorted' | 'swapping';
}

interface SortStep {
  array: ArrayElement[];
  currentIndex: number;
  minIndex: number;
  description: string;
  isSwapping: boolean;
}

const SelectionSort: React.FC = () => {
  const [originalArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [customArray, setCustomArray] = useState('64, 34, 25, 12, 22, 11, 90');

  const generateSteps = useCallback((arr: number[]) => {
    const steps: SortStep[] = [];
    const workingArray = arr.map((value, index) => ({
      value,
      id: `${value}-${index}`,
      status: 'default' as const
    }));

    // Initial state
    steps.push({
      array: [...workingArray],
      currentIndex: -1,
      minIndex: -1,
      description: 'Initial array - Selection Sort finds the minimum element and places it at the beginning',
      isSwapping: false
    });

    for (let i = 0; i < arr.length - 1; i++) {
      let minIndex = i;
      
      // Mark current position
      const currentArray = workingArray.map((el, idx) => ({
        ...el,
        status: idx < i ? 'sorted' : idx === i ? 'comparing' : 'default'
      }));
      
      steps.push({
        array: [...currentArray],
        currentIndex: i,
        minIndex: i,
        description: `Pass ${i + 1}: Looking for minimum element in unsorted portion starting from index ${i}`,
        isSwapping: false
      });

      // Find minimum element
      for (let j = i + 1; j < arr.length; j++) {
        const searchArray = workingArray.map((el, idx) => ({
          ...el,
          status: idx < i ? 'sorted' : 
                 idx === i ? 'comparing' : 
                 idx === minIndex ? 'minimum' : 
                 idx === j ? 'comparing' : 'default'
        }));

        steps.push({
          array: [...searchArray],
          currentIndex: i,
          minIndex: minIndex,
          description: `Comparing element at index ${j} (${workingArray[j].value}) with current minimum (${workingArray[minIndex].value})`,
          isSwapping: false
        });

        if (workingArray[j].value < workingArray[minIndex].value) {
          minIndex = j;
          const newMinArray = workingArray.map((el, idx) => ({
            ...el,
            status: idx < i ? 'sorted' : 
                   idx === i ? 'comparing' : 
                   idx === minIndex ? 'minimum' : 
                   idx === j ? 'comparing' : 'default'
          }));

          steps.push({
            array: [...newMinArray],
            currentIndex: i,
            minIndex: minIndex,
            description: `New minimum found! Element ${workingArray[minIndex].value} at index ${minIndex}`,
            isSwapping: false
          });
        }
      }

      // Swap if needed
      if (minIndex !== i) {
        const swapArray = workingArray.map((el, idx) => ({
          ...el,
          status: idx < i ? 'sorted' : 
                 idx === i || idx === minIndex ? 'swapping' : 'default'
        }));

        steps.push({
          array: [...swapArray],
          currentIndex: i,
          minIndex: minIndex,
          description: `Swapping ${workingArray[i].value} with ${workingArray[minIndex].value}`,
          isSwapping: true
        });

        // Perform the swap
        [workingArray[i], workingArray[minIndex]] = [workingArray[minIndex], workingArray[i]];
      }

      // Mark as sorted
      const sortedArray = workingArray.map((el, idx) => ({
        ...el,
        status: idx <= i ? 'sorted' : 'default'
      }));

      steps.push({
        array: [...sortedArray],
        currentIndex: i,
        minIndex: -1,
        description: `Element ${workingArray[i].value} is now in its correct position`,
        isSwapping: false
      });
    }

    // Final sorted array
    const finalArray = workingArray.map(el => ({ ...el, status: 'sorted' as const }));
    steps.push({
      array: finalArray,
      currentIndex: -1,
      minIndex: -1,
      description: 'Array is now completely sorted!',
      isSwapping: false
    });

    return steps;
  }, []);

  useEffect(() => {
    const steps = generateSteps(originalArray);
    setSteps(steps);
    setCurrentStep(0);
  }, [originalArray, generateSteps]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handleCustomArray = () => {
    try {
      const newArray = customArray
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num) && num >= 0 && num <= 999)
        .slice(0, 10);
      
      if (newArray.length > 0) {
        const steps = generateSteps(newArray);
        setSteps(steps);
        setCurrentStep(0);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Invalid array format');
    }
  };

  const getElementStyle = (status: string) => {
    const baseStyle = "w-16 h-16 flex items-center justify-center rounded-xl font-bold text-white text-lg transition-all duration-500 transform shadow-lg";
    
    switch (status) {
      case 'comparing':
        return `${baseStyle} bg-gradient-to-br from-yellow-400 to-orange-500 scale-110 shadow-yellow-400/50`;
      case 'minimum':
        return `${baseStyle} bg-gradient-to-br from-purple-500 to-pink-600 scale-105 shadow-purple-500/50`;
      case 'sorted':
        return `${baseStyle} bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50`;
      case 'swapping':
        return `${baseStyle} bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-500/50 animate-pulse`;
      default:
        return `${baseStyle} bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30`;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </button>
          
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Selection Sort
            </span>
          </h1>
          
          <div className="w-32"></div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">How Selection Sort Works</h2>
          <p className="text-gray-300 leading-relaxed">
            Selection Sort divides the array into sorted and unsorted portions. It repeatedly finds the minimum element 
            from the unsorted portion and swaps it with the first element of the unsorted portion, gradually building 
            the sorted portion from left to right.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
              <strong className="text-yellow-300">Time Complexity:</strong> O(n²)
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
              <strong className="text-blue-300">Space Complexity:</strong> O(1)
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
              <strong className="text-green-300">Stability:</strong> Not Stable
            </div>
          </div>
        </div>

        {/* Custom Array Input */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-cyan-300">Try Your Own Array</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={customArray}
              onChange={(e) => setCustomArray(e.target.value)}
              placeholder="Enter numbers separated by commas (e.g., 64, 34, 25, 12)"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleCustomArray}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Visualize
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Previous
            </button>

            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep >= steps.length - 1}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-xl transition-all duration-300"
            >
              Next
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
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
              min="200"
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
        {currentStepData && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Step {currentStep + 1} of {steps.length}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto">
                {currentStepData.description}
              </p>
            </div>

            <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
              {currentStepData.array.map((element, index) => (
                <div
                  key={element.id}
                  className={getElementStyle(element.status)}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {element.value}
                </div>
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
                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded"></div>
                <span>Current Minimum</span>
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
        )}

        {/* Progress Bar */}
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
      </div>
    </div>
  );
};

export default SelectionSort;