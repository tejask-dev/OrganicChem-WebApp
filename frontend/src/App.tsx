import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api';
import { StructureResponse } from './types';
import KekuleEditor, { KekuleEditorRef } from './components/KekuleEditor';
import Viewer3D from './components/Viewer3D';
import InfoPanel from './components/InfoPanel';
import Tutorial from './components/Tutorial';
import StructureDisplay from './components/StructureDisplay';
import { 
  Search, Loader2, Sparkles, PenLine, 
  FlaskConical, Download, Layers, Box, 
  Beaker, ArrowRight, HelpCircle, X
} from 'lucide-react';

function App() {
  const [inputMode, setInputMode] = useState<'draw' | 'name'>('name');
  const [inputText, setInputText] = useState('');
  const [structureData, setStructureData] = useState<StructureResponse | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const editorRef = useRef<KekuleEditorRef>(null);

  // Check first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('moleculeai_visited');
    if (!hasVisited) {
      setShowTutorial(true);
      localStorage.setItem('moleculeai_visited', 'true');
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setExplanation(null);
    setError(null);
    
    try {
      let data = '';
      let type: 'smiles' | 'name' = 'smiles';

      if (inputMode === 'draw') {
        if (editorRef.current) {
          data = editorRef.current.getSmiles();
        }
        if (!data) {
          setError("Please draw a molecule first. Use the tools on the left side of the canvas.");
          setLoading(false);
          return;
        }
      } else {
        data = inputText.trim();
        type = 'name';
        if (!data) {
          setLoading(false);
          return; // Just don't do anything if empty - no error message
        }
      }

      const result = await api.resolveStructure(data, type);
      
      if (result.error) {
        setError(result.error);
        setStructureData(null);
      } else {
        setStructureData(result);
        setError(null);
        
        const exp = await api.explainStructure(result);
        setExplanation(exp.explanation);

        // Load into editor
        if (inputMode === 'name' && result.mol_block_2d && editorRef.current) {
          editorRef.current.setMolBlock(result.mol_block_2d);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Connection error. Check if server is running.");
      setStructureData(null);
    } finally {
      setLoading(false);
    }
  };

  const quickExamples = [
    { name: 'Aspirin', emoji: '💊' },
    { name: 'Caffeine', emoji: '☕' },
    { name: 'Ethanol', emoji: '🍷' },
    { name: 'Glucose', emoji: '🍬' },
    { name: 'Dopamine', emoji: '🧠' },
    { name: 'Benzene', emoji: '⬡' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      <div className="max-w-[1800px] mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl px-6 py-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">MoleculeAI</h1>
              <p className="text-xs text-gray-500 font-medium">Structure Analysis Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Online</span>
            </div>
            <button 
              onClick={() => setShowTutorial(true)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tutorial</span>
            </button>
            <button className="btn-secondary text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </motion.header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Control Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex flex-col gap-4">
                
                {/* Mode Toggle */}
                <div className="flex items-center gap-3 p-1 bg-gray-100 rounded-xl w-fit">
                  <button
                    onClick={() => setInputMode('draw')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      inputMode === 'draw' 
                        ? 'bg-white shadow-md text-indigo-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <PenLine className="w-4 h-4" />
                    Draw
                  </button>
                  <button
                    onClick={() => setInputMode('name')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      inputMode === 'name' 
                        ? 'bg-white shadow-md text-indigo-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Search by Name
                  </button>
                </div>

                {/* Search Input */}
                <AnimatePresence mode="wait">
                  {inputMode === 'name' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type a molecule name (e.g., Aspirin, Caffeine, Dopamine)..."
                          className="input-field pl-4 pr-12 text-lg"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        />
                        {inputText && (
                          <button
                            onClick={() => setInputText('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      
                      {/* Quick Examples */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-400">Quick try:</span>
                        {quickExamples.map((ex) => (
                          <button
                            key={ex.name}
                            onClick={async () => {
                              setInputText(ex.name);
                              // Directly analyze with the name
                              setLoading(true);
                              setError(null);
                              try {
                                const result = await api.resolveStructure(ex.name, 'name');
                                if (result.error) {
                                  setError(result.error);
                                  setStructureData(null);
                                } else {
                                  setStructureData(result);
                                  setError(null);
                                  const exp = await api.explainStructure(result);
                                  setExplanation(exp.explanation);
                                  if (result.mol_block_2d && editorRef.current) {
                                    editorRef.current.setMolBlock(result.mol_block_2d);
                                  }
                                }
                              } catch (err: any) {
                                setError(err.response?.data?.detail || "Connection error.");
                                setStructureData(null);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-3 py-1.5 text-sm font-medium bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center gap-1.5"
                          >
                            <span>{ex.emoji}</span>
                            <span>{ex.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Draw Mode Instructions */}
                <AnimatePresence mode="wait">
                  {inputMode === 'draw' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-xl"
                    >
                      <p className="text-sm text-indigo-700 font-medium">
                        <strong>How to draw:</strong> Use the toolbar on the left. Click "Atom" to add atoms, "Bond" to connect them, "Ring" for benzene. 
                        <button 
                          onClick={() => setShowTutorial(true)} 
                          className="underline ml-1 hover:text-indigo-900"
                        >
                          View tutorial
                        </button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-start gap-3"
                    >
                      <span>⚠️</span>
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-3 text-lg py-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Analyze Molecule</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Structure Preview */}
            <AnimatePresence>
              {inputMode === 'name' && structureData?.svg_2d && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <StructureDisplay 
                    svg={structureData.svg_2d} 
                    title={`Structure: ${structureData.iupac_name}`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl overflow-hidden relative"
              style={{ minHeight: '500px' }}
            >
              {/* View Toggle */}
              <div className="absolute top-4 right-4 z-20 flex bg-white/90 backdrop-blur p-1 rounded-xl shadow-lg border border-gray-200">
                <button
                  onClick={() => setActiveTab('2d')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === '2d' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  2D Editor
                </button>
                <button
                  onClick={() => setActiveTab('3d')}
                  disabled={!structureData?.mol_block_3d}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === '3d' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <Box className="w-4 h-4" />
                  3D View
                </button>
              </div>

              {/* Canvas Content - Keep both mounted, just hide one */}
              <div className="h-[500px] relative">
                {/* 2D Editor - Always mounted */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    activeTab === '2d' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <KekuleEditor ref={editorRef} />
                </div>
                
                {/* 3D Viewer - Only render when needed */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    activeTab === '3d' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {structureData?.mol_block_3d && activeTab === '3d' && (
                    <Viewer3D molBlock={structureData.mol_block_3d} />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Results */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl overflow-hidden flex flex-col h-fit lg:h-[calc(100vh-140px)] lg:sticky lg:top-6"
          >
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Beaker className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Analysis Results</h2>
                  <p className="text-xs text-gray-500">Molecular properties & IUPAC name</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <InfoPanel 
                data={structureData} 
                loading={loading} 
                explanation={explanation} 
              />
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-white/60"
        >
          <p>Powered by RDKit & PubChem • Built with React & FastAPI</p>
        </motion.footer>
      </div>

      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 50;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3);
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}

export default App;
