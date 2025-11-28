import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, PenLine, Search, MousePointer, Circle, Hexagon, Atom } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MoleculeAI! 🧪',
    content: 'This interactive tutorial will guide you through all the features. You\'ll learn how to draw molecules, search by name, and analyze structures. Let\'s get started!',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: 'mode-toggle',
    title: 'Choose Your Input Mode',
    content: 'You can either DRAW a molecule structure or SEARCH by name. Click "Draw" to sketch molecules manually, or "Search by Name" to look up compounds like Aspirin or Caffeine.',
    icon: <MousePointer className="w-6 h-6" />,
    highlight: '[data-tutorial="mode-toggle"]',
  },
  {
    id: 'search',
    title: 'Search by Name',
    content: 'Type any molecule name (common or IUPAC) and press Enter or click "Analyze". Try: Aspirin, Caffeine, Ethanol, Glucose, Acetaminophen, or even complex names like "2-methylpropan-1-ol".',
    icon: <Search className="w-6 h-6" />,
    highlight: '[data-tutorial="search-input"]',
  },
  {
    id: 'quick-examples',
    title: 'Quick Examples',
    content: 'Click any of these buttons to instantly search for common molecules. Great for testing or learning!',
    icon: <Sparkles className="w-6 h-6" />,
    highlight: '[data-tutorial="quick-examples"]',
  },
  {
    id: 'canvas-intro',
    title: 'The Drawing Canvas',
    content: 'This is where you can draw molecular structures. The canvas uses Kekule.js, a professional chemistry editor. Let\'s learn how to use the tools!',
    icon: <PenLine className="w-6 h-6" />,
    highlight: '[data-tutorial="canvas"]',
  },
  {
    id: 'canvas-atoms',
    title: 'Adding Atoms',
    content: 'Click the "Atom" tool (looks like a circle with "C") in the left toolbar. Then click on the canvas to place Carbon atoms. To change elements, click an atom and select a different element from the popup.',
    icon: <Circle className="w-6 h-6" />,
  },
  {
    id: 'canvas-bonds',
    title: 'Drawing Bonds',
    content: 'Click the "Bond" tool in the toolbar. Click and drag between atoms to create bonds. Click on an existing bond to cycle through single → double → triple bonds.',
    icon: <PenLine className="w-6 h-6" />,
  },
  {
    id: 'canvas-rings',
    title: 'Adding Ring Structures',
    content: 'Click the "Ring" tool (hexagon icon) to add pre-made ring templates. You can add benzene rings, cyclopentane, cyclohexane, and more. Just click where you want to place them!',
    icon: <Hexagon className="w-6 h-6" />,
  },
  {
    id: 'canvas-elements',
    title: 'Changing Elements',
    content: 'To change an atom\'s element: 1) Select the "Atom" tool, 2) Click on an existing atom, 3) A popup appears - select the new element (O for Oxygen, N for Nitrogen, etc.)',
    icon: <Atom className="w-6 h-6" />,
  },
  {
    id: 'analyze',
    title: 'Analyze Your Structure',
    content: 'Once you\'ve drawn a molecule or searched by name, click the "Analyze Molecule" button. The AI will identify the compound, calculate properties, and show the IUPAC name!',
    icon: <Sparkles className="w-6 h-6" />,
    highlight: '[data-tutorial="analyze-btn"]',
  },
  {
    id: 'results',
    title: 'Understanding Results',
    content: 'The results panel shows: IUPAC name, molecular formula, weight, functional groups detected, and a detailed explanation. You can copy SMILES and InChI codes with one click!',
    icon: <Sparkles className="w-6 h-6" />,
    highlight: '[data-tutorial="results-panel"]',
  },
  {
    id: 'view-toggle',
    title: '2D and 3D Views',
    content: 'Toggle between 2D and 3D views using these buttons. The 3D view lets you rotate and explore the molecule\'s spatial structure!',
    icon: <Atom className="w-6 h-6" />,
    highlight: '[data-tutorial="view-toggle"]',
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    content: 'You now know how to use MoleculeAI! Try drawing a molecule or searching for your favorite compound. Have fun exploring organic chemistry!',
    icon: <Sparkles className="w-6 h-6" />,
  },
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const step = tutorialSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tutorialSteps.length - 1;

  useEffect(() => {
    if (isOpen && step.highlight) {
      const element = document.querySelector(step.highlight) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tutorial-highlight');
      }
    }
    
    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, isOpen, step.highlight]);

  const handleNext = () => {
    if (isLast) {
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />
        
        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-white/70">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </p>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 leading-relaxed text-base">
              {step.content}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip tutorial
            </button>
            
            <div className="flex items-center gap-3">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                {isLast ? 'Get Started' : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Tutorial;

