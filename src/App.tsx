import React, { useState, useEffect } from 'react';
import { Moon, Sun, Linkedin, Github, Mail, MessageCircle, ArrowRight, Sparkles, Code, Search, BarChart3, List, Network, FileStack } from 'lucide-react';
import SelectionSort from './components/sort/SelectionSort';
import MergeSort from './components/sort/MergeSort';
import QuickSort from './components/sort/QuickSort';
import BubbleSort from './components/sort/BubbleSort';
import HeapSort from './components/sort/HeapSort';
import LinearSearch from './components/search/Linear-Search';
import BinarySearch from './components/search/Binary-Search';
import SingleLinkedList from './components/linear/Single-Linkedlist';
import DoubleLinkedList from './components/linear/Double-Linkedlist';
import CircularSingleLinkedList from './components/linear/Circular-Single-Linked-List';
import CircularDoubleLinkedList from './components/linear/Circular-Double-Linked-List';
import Stacklifo from './components/stack/stack-lifo';
import LinearQueueVisualizer from './components/queue/LinearQueueVisualizer';
import DoubleEndedQueue from './components/queue/Double-Ended-Queue';
import PriorityQueue from './components/queue/Priority-Queue';
import CircularQueue from './components/queue/Circular-Queue';
import ConcurrentQueue from './components/queue/Concurrent-Queue';
import BinaryTree from './components/trees/Binary-Trees';
import BinarySearchTreeVisualizer from './components/trees/Binary-Search-Tree';
import AVLTreeVisualizer from './components/trees/AVL-Tree';
import GraphVisualizer from './components/graphs/Graph-Visualizer';


interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-200 dark:border-purple-800">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-12 w-12 text-purple-500" />
            <h2 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">DS-ARENA🎮</span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Dive into the mesmerizing world of algorithms and data structures with interactive visualizations and stunning animations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
              <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                <Code className="h-6 w-6" />
                Why Choose This Platform?
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-purple-600 dark:text-purple-400">Immersive Visualizations:</strong> Watch algorithms unfold through dynamic, high-definition animations</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-cyan-600 dark:text-cyan-400">Hands-On Learning:</strong> Interact with algorithms using custom inputs and step-by-step guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-pink-600 dark:text-pink-400">Real-Time Results:</strong> Input your data and see the process animated with clear outputs</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-2xl">
              <h3 className="text-2xl font-bold text-cyan-800 dark:text-cyan-300 mb-4">Key Concepts</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Linear Structures</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Linked Lists</li>
                    <li>• Stacks</li>
                    <li>• Queues</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-600 dark:text-cyan-400 mb-2">Non-Linear</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Binary Trees</li>
                    <li>• Graphs</li>
                    <li>• Hash Tables</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-600 dark:text-pink-400 mb-2">Sorting</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Quick Sort</li>
                    <li>• Merge Sort</li>
                    <li>• Heap Sort</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Searching</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Binary Search</li>
                    <li>• DFS/BFS</li>
                    <li>• A* Algorithm</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Sparkles className="h-5 w-5" />
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

interface DataStructureCardProps {
  title: string;
  description: string; 
  icon: React.ReactNode;
  gradient: string;
  buttons: Array<{
    label: string;
    onClick: () => void;
    color: string;
  }>;
}

const DataStructureCard: React.FC<DataStructureCardProps> = ({ title, description, icon, gradient, buttons }) => {
  return (
    <div className={`${gradient} p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-white/20 rounded-2xl">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`w-full ${button.color} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-102 transition-all duration-200 flex items-center justify-between`}
          >
            {button.label}
            <ArrowRight className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'selection-sort' | 'merge-sort' | 'quick-sort' | 'bubble-sort' | 'heap-sort'| 'linear-search' | 'binary-search' | 'single-linked-list' |'double-linked-list' | 'circular-single-linked-list'| 'circular-double-linked-list' | 'stack-lifo' | 'linear-queue-visualizer' | 'double-ended-queue' | 'priority-queue' | 'circular-queue' | 'concurrent-queue' | 'binary-tree' | 'binary-search-tree' | 'AVL-tree' | 'graph-visualizer'> ('home');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (currentView === 'selection-sort') { return <SelectionSort />;}
  if (currentView === 'merge-sort') { return <MergeSort />; }
  if (currentView === 'quick-sort') { return <QuickSort />; }
  if (currentView === 'bubble-sort') { return <BubbleSort />; }
  if (currentView === 'heap-sort') { return <HeapSort />; }
  if (currentView === 'linear-search') { return <LinearSearch/>}
  if (currentView === 'binary-search') { return <BinarySearch/>; }
  if (currentView === 'single-linked-list') { return <SingleLinkedList/>; }
  if (currentView === 'double-linked-list') { return <DoubleLinkedList/>; } 
  if (currentView === 'circular-single-linked-list') { return <CircularSingleLinkedList/>}
  if (currentView === 'circular-double-linked-list') { return <CircularDoubleLinkedList/>; }
  if (currentView === 'stack-lifo') { return <Stacklifo/>;}
  if (currentView === 'linear-queue-visualizer') { return <LinearQueueVisualizer/>; }
  if (currentView === 'double-ended-queue') { return <DoubleEndedQueue/>; }
  if (currentView === 'priority-queue') { return <PriorityQueue/>; }
  if (currentView === 'circular-queue') { return <CircularQueue/>; }
  if (currentView === 'concurrent-queue') { return <ConcurrentQueue/>; }
  if (currentView === 'binary-tree') { return <BinaryTree/>; }
  if (currentView === 'binary-search-tree') { return <BinarySearchTreeVisualizer/>; }
  if (currentView === 'AVL-tree') { return <AVLTreeVisualizer/>; }
  if (currentView === 'graph-visualizer') { return <GraphVisualizer/>; }

  const dataStructures = [
    {
      title: "Searching Techniques",
      description: "Master linear and binary search algorithms",
      icon: <Search className="h-8 w-8 text-white" />,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      buttons: [
        {
          label: "Linear Search",
          onClick: () => setCurrentView('linear-search'),
          color: "bg-emerald-600 hover:bg-emerald-700"
        },
        {
          label: "Binary Search",
          onClick: () => setCurrentView('binary-search'),
          color: "bg-teal-600 hover:bg-teal-700"
        }
      ]
    },
    {
      title: "Sorting Algorithms", 
      description: "Explore 6 powerful sorting techniques",
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      gradient: "bg-gradient-to-br from-orange-500 to-red-600",
      buttons: [
        {
          label: "Selection Sort",
          onClick: () => setCurrentView('selection-sort'),
          color: "bg-orange-600 hover:bg-orange-700"
        },
        {
          label:"Merge Sort",
          onClick:() => setCurrentView('merge-sort'),
          color: "bg-yellow-600 hover:bg-yellow-700"
        },
        {
          label: "Quick Sort",
          onClick: () => setCurrentView('quick-sort'), 
          color: "bg-green-600 hover:bg-green-700"
        },
        {
          label: "Bubble Sort",
          onClick: () => setCurrentView('bubble-sort'), 
          color: "bg-teal-600 hover:bg-teal-700"
        },
        {
          label: "Heap Sort",
          onClick: () => setCurrentView('heap-sort'),
          color: "bg-red-600 hover:bg-red-700"
        }
      ]
    },
    {
      title: "Linear Data Structures in Linked List",
      description: "Understand sequential data organization",
      icon: <List className="h-8 w-8 text-white" />,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
      buttons: [
        {
          label: "Single Linked List",
          onClick: () => setCurrentView('single-linked-list'),
          color: "bg-purple-600 hover:bg-purple-700",
        },
        {
          label: "Double Linked List",
          onClick: () => setCurrentView('double-linked-list'),
          color: "bg-pink-600 hover:bg-pink-700"
        },
        {
          label: "Circular Single Linked List",
          onClick: () => setCurrentView('circular-single-linked-list'), // Placeholder for circular single linked list
          color: "bg-indigo-600 hover:bg-indigo-700"
        },
        {
          label:"Circular Double Linked List",
          onClick:() => setCurrentView('circular-double-linked-list'),
          color:"bg-red-200 hover:bg-red-300"
        }

      ]
    },
     {
      title: "Linear Data Structures in Stack",
      description: "Understand sequential data organization",
      icon: <FileStack className="h-8 w-8 text-white" />,
      gradient: "bg-gradient-to-br from-red-500 to-white-600",
      buttons: [
        {
          label: "Stack in LIFO",
          onClick: () => setCurrentView('stack-lifo'), // Placeholder for stack in LIFO
          color: "bg-purple-600 hover:bg-purple-700",
        },
       

      ],
      
    },
     {
      title: "Linear Data Structures in Queue",
      description: "Understand Sequential To Where To Inser",
      icon: <List className="h-8 w-8 text-white" />,
      gradient: "bg-gradient-to-br from-blue-500 to-green-600",
      buttons: [
        {
          label: "Linear Queue Visualizer",
          onClick: () => setCurrentView('linear-queue-visualizer'), // Placeholder for stack in LIFO
          color: "bg-purple-600 hover:bg-purple-700",
        },
        {
          label: "Double Ended Queue",
          onClick: () => setCurrentView('double-ended-queue'), // Placeholder for stack in LIFO
          color: "bg-blue-600 hover:bg-blue-700",
        },
        {
          label: "Priority Queue",
          onClick: () => setCurrentView('priority-queue'), // Placeholder for stack in LIFO
          color: "bg-green-600 hover:bg-green-700",
        },
        {
          label: "Circular Queue",
          onClick: () => setCurrentView('circular-queue'), // Placeholder for stack in LIFO
          color: "bg-red-600 hover:bg-red-700",
        },
        {
          label: "Concurrent Queue",
          onClick: () => setCurrentView('concurrent-queue'), // Placeholder for stack in LIFO
          color: "bg-yellow-600 hover:bg-yellow-700",
        }
      ],
      
    },
    {
      title: "Non-Linear Structures in Trees & Graphs",
      description: "Explore hierarchical data relationships", 
      icon: <Network className="h-8 w-8 text-white" />,
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
      buttons: [
        {
          label: "Binary Tree",
          onClick: () => setCurrentView ('binary-tree'), // Placeholder for binary tree
          color: "bg-cyan-600 hover:bg-cyan-700"  
        },
        {
          label: "Binary Search Tree",
          onClick: () => setCurrentView('binary-search-tree'), // Placeholder for binary search tree
          color: "bg-blue-600 hover:bg-blue-700"
        },
        {
          label: "AVL Tree",
          onClick: () => setCurrentView('AVL-tree'), // Placeholder for AVL tree
          color: "bg-purple-600 hover:bg-purple-700"
        },
        {
          label: "Graph Visualizer",
          onClick: () => setCurrentView('graph-visualizer'), // Placeholder for graph visualizer
          color: "bg-pink-600 hover:bg-pink-700"
        }
        
      ]
    }
  ];

  const socialLinks = [
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://www.linkedin.com/in/bala-chandrudu-devarakonda-33a39732b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      label: "LinkedIn",
      color: "text-blue-600 hover:text-blue-700"
    },
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/Bala-Chandrudu", 
      label: "GitHub",
      color: "text-gray-800 dark:text-gray-200 hover:text-gray-600"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      href: "mailto:balachandrududevarakonda3@gmail.com",
      label: "Gmail",
      color: "text-red-600 hover:text-red-700"
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      href: "https://wa.me/7396734672",
      label: "WhatsApp", 
      color: "text-green-600 hover:text-green-700"
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
      
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-40">
        <button
          onClick={() => setIsDark(!isDark)}
          className="bg-white/20 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 dark:border-gray-700"
        >
          {isDark ? (
            <Sun className="h-6 w-6 text-yellow-400" />
          ) : (
            <Moon className="h-6 w-6 text-purple-600" />
          )}
        </button>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">DS-ARENA🎮</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-light">
            See Your Data Structures in <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Visual Action</span>
          </p>
        </div>

        {/* Data Structure Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {dataStructures.map((ds, index) => (
            <DataStructureCard key={index} {...ds} />
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center space-y-6">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <span className="text-gray-600 dark:text-white-400 font-medium">Created by BALA CHANDRUDU</span>
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link.color} hover:scale-110 transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800/50`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            © 2025 All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;