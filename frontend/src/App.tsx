import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api';
import { StructureResponse } from './types';
import KekuleEditor, { KekuleEditorRef } from './components/KekuleEditor';
import Viewer3D from './components/Viewer3D';
import InfoPanel from './components/InfoPanel';
import Tutorial from './components/Tutorial';
import {
  Search, Loader2, Sparkles, PenLine,
  FlaskConical, Layers, Box,
  HelpCircle, X, ChevronRight,
} from 'lucide-react';

const QUICK_EXAMPLES = ['Aspirin', 'Caffeine', 'Ethanol', 'Glucose', 'Dopamine', 'Benzene'];

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

  useEffect(() => {
    if (!localStorage.getItem('moleculeai_visited')) {
      setShowTutorial(true);
      localStorage.setItem('moleculeai_visited', 'true');
    }
  }, []);

  // Single analysis function — used by both the button and quick-example chips
  const performAnalysis = async (overrideName?: string) => {
    setLoading(true);
    setExplanation(null);
    setError(null);

    try {
      let data = '';
      let type: 'smiles' | 'name' = 'smiles';

      if (overrideName) {
        data = overrideName;
        type = 'name';
        setInputText(overrideName);
        if (inputMode !== 'name') setInputMode('name');
      } else if (inputMode === 'draw') {
        data = editorRef.current?.getSmiles() ?? '';
        if (!data) {
          setError('Please draw a molecule first using the toolbar on the left of the canvas.');
          setLoading(false);
          return;
        }
      } else {
        data = inputText.trim();
        type = 'name';
        if (!data) {
          setLoading(false);
          return;
        }
      }

      const result = await api.resolveStructure(data, type);

      if (result.error) {
        setError(result.error);
        setStructureData(null);
      } else {
        setStructureData(result);
        const exp = await api.explainStructure(result);
        setExplanation(exp.explanation);
        if (type === 'name' && result.mol_block_2d && editorRef.current) {
          editorRef.current.setMolBlock(result.mol_block_2d);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Connection error. Please check if the server is running.');
      setStructureData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      <div className="max-w-[1800px] mx-auto">

        {/* ── Header ─────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl px-5 py-3.5 mb-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-gradient leading-none">MoleculeAI</h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Organic Chemistry Analyzer</p>
            </div>
          </div>

          <button
            onClick={() => setShowTutorial(true)}
            className="btn-secondary"
            aria-label="Open tutorial"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>
        </motion.header>

        {/* ── Main Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-5">

          {/* ── Left Column ────────────────────────── */}
          <div className="space-y-5">

            {/* Control Panel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <div className="space-y-4">

                {/* Mode Toggle */}
                <div
                  data-tutorial="mode-toggle"
                  className="flex items-center p-1 bg-slate-100 rounded-xl w-fit gap-1"
                  role="tablist"
                  aria-label="Input mode"
                >
                  {(['name', 'draw'] as const).map((mode) => (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={inputMode === mode}
                      onClick={() => setInputMode(mode)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        inputMode === mode
                          ? 'bg-white shadow-sm text-indigo-600'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {mode === 'draw'
                        ? <PenLine className="w-3.5 h-3.5" />
                        : <Search className="w-3.5 h-3.5" />
                      }
                      {mode === 'draw' ? 'Draw' : 'Search by Name'}
                    </button>
                  ))}
                </div>

                {/* Name Search */}
                <AnimatePresence mode="wait">
                  {inputMode === 'name' && (
                    <motion.div
                      key="name-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="relative" data-tutorial="search-input">
                        <input
                          type="text"
                          placeholder="Type a molecule name (e.g. Aspirin, Caffeine, Dopamine)…"
                          className="input-field pr-10"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && performAnalysis()}
                          aria-label="Molecule name"
                        />
                        {inputText && (
                          <button
                            onClick={() => setInputText('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                            aria-label="Clear"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Quick Examples */}
                      <div className="flex flex-wrap items-center gap-2" data-tutorial="quick-examples">
                        <span className="text-xs text-slate-400 font-medium">Try:</span>
                        {QUICK_EXAMPLES.map((name) => (
                          <button
                            key={name}
                            onClick={() => performAnalysis(name)}
                            disabled={loading}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Draw mode hint */}
                <AnimatePresence mode="wait">
                  {inputMode === 'draw' && (
                    <motion.div
                      key="draw-hint"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-slate-500">
                        Use the toolbar on the left of the canvas to draw atoms, bonds, and rings.{' '}
                        <button
                          onClick={() => setShowTutorial(true)}
                          className="text-indigo-500 hover:text-indigo-700 font-medium underline underline-offset-2 transition-colors"
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
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                      role="alert"
                    >
                      <span className="mt-px flex-shrink-0 font-bold">!</span>
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze Button */}
                <button
                  data-tutorial="analyze-btn"
                  onClick={() => performAnalysis()}
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze Molecule
                      <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                    </>
                  )}
                </button>

              </div>
            </motion.div>

            {/* Canvas */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl overflow-hidden"
              data-tutorial="canvas"
            >
              {/* Canvas Header with view toggle */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div
                  className="flex items-center p-0.5 bg-slate-100 rounded-lg gap-0.5"
                  data-tutorial="view-toggle"
                  role="tablist"
                  aria-label="View mode"
                >
                  <button
                    role="tab"
                    aria-selected={activeTab === '2d'}
                    onClick={() => setActiveTab('2d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                      activeTab === '2d'
                        ? 'bg-white shadow-sm text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    2D Editor
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === '3d'}
                    onClick={() => setActiveTab('3d')}
                    disabled={!structureData?.mol_block_3d}
                    title={!structureData?.mol_block_3d ? 'Analyze a molecule first to enable 3D view' : '3D View'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                      activeTab === '3d'
                        ? 'bg-white shadow-sm text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    3D View
                  </button>
                </div>

                {structureData && (
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[220px] hidden sm:block">
                    {structureData.common_name ?? structureData.iupac_name}
                  </span>
                )}
              </div>

              {/* Canvas Content */}
              <div className="relative" style={{ height: '520px' }}>
                {/* 2D Editor */}
                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    activeTab === '2d' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <KekuleEditor ref={editorRef} />
                </div>

                {/* 3D Viewer */}
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

          {/* ── Right Column – Results ──────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl overflow-hidden flex flex-col lg:sticky lg:top-6"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
            data-tutorial="results-panel"
          >
            {/* Results Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
              <div className="p-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                <FlaskConical className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Analysis Results</h2>
                <p className="text-xs text-slate-400">IUPAC name & molecular properties</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <InfoPanel
                data={structureData}
                loading={loading}
                explanation={explanation}
              />
            </div>
          </motion.div>

        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-xs text-slate-400"
        >
          Powered by RDKit & PubChem · Built with React & FastAPI
        </motion.footer>

      </div>
    </div>
  );
}

export default App;
