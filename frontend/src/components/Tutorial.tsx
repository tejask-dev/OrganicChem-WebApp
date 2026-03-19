import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft,
  Sparkles, PenLine, Search, MousePointer,
  Circle, Hexagon, Atom,
} from 'lucide-react';

// ─── Step definitions ────────────────────────────────────────────────────────

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector for the element to spotlight
}

const STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MoleculeAI',
    content: 'This quick tour walks you through everything in about 60 seconds. You can skip at any time or jump to any step using the dots below.',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'mode-toggle',
    title: 'Two input modes',
    content: 'Switch between Draw mode (sketch a structure by hand) and Search by Name (just type a compound name). Both give you the same full analysis.',
    icon: <MousePointer className="w-4 h-4" />,
    highlight: '[data-tutorial="mode-toggle"]',
  },
  {
    id: 'search',
    title: 'Search by name',
    content: 'Type any molecule name — common names like "Aspirin" or systematic IUPAC names like "2-acetoxybenzoic acid" both work. Press Enter or click Analyze.',
    icon: <Search className="w-4 h-4" />,
    highlight: '[data-tutorial="search-input"]',
  },
  {
    id: 'quick-examples',
    title: 'One-click examples',
    content: 'Click any of these chips to instantly fetch and analyze a common molecule. Great for exploring what the tool can do.',
    icon: <Sparkles className="w-4 h-4" />,
    highlight: '[data-tutorial="quick-examples"]',
  },
  {
    id: 'analyze',
    title: 'Analyze button',
    content: 'When you\'re ready, click this to run the full analysis — IUPAC name, molecular formula, weight, functional groups, and more.',
    icon: <Sparkles className="w-4 h-4" />,
    highlight: '[data-tutorial="analyze-btn"]',
  },
  {
    id: 'canvas',
    title: 'The drawing canvas',
    content: 'In Draw mode, this is your molecule editor. Use the toolbar on the left: Atom to place atoms, Bond to connect them, Ring to add pre-built ring templates.',
    icon: <PenLine className="w-4 h-4" />,
    highlight: '[data-tutorial="canvas"]',
  },
  {
    id: 'canvas-atoms',
    title: 'Adding atoms',
    content: 'Click the Atom tool (the C button in the toolbar), then click on the canvas to place a Carbon. Click any atom and pick a different element from the popup to change it.',
    icon: <Circle className="w-4 h-4" />,
  },
  {
    id: 'canvas-rings',
    title: 'Ring structures',
    content: 'Click the Ring tool (hexagon icon) to place pre-made ring templates — benzene, cyclopentane, cyclohexane, and more. Just click where you want them on the canvas.',
    icon: <Hexagon className="w-4 h-4" />,
  },
  {
    id: 'view-toggle',
    title: '2D and 3D views',
    content: 'After analyzing, toggle between the 2D editor and an interactive 3D ball-and-stick model. Drag to rotate, scroll to zoom in 3D view.',
    icon: <Atom className="w-4 h-4" />,
    highlight: '[data-tutorial="view-toggle"]',
  },
  {
    id: 'results',
    title: 'Analysis results',
    content: 'This panel shows the IUPAC name, molecular formula, weight, detected functional groups, and a detailed breakdown. Use the copy buttons to grab SMILES or InChI strings.',
    icon: <Sparkles className="w-4 h-4" />,
    highlight: '[data-tutorial="results-panel"]',
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    content: 'That\'s everything. Try searching for Caffeine or drawing a benzene ring to see MoleculeAI in action. Come back to this tour anytime via the Tutorial button.',
    icon: <Sparkles className="w-4 h-4" />,
  },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD_W = 380;
const CARD_H = 230; // approximate, for layout calculations
const PAD = 12;     // spotlight padding around the element
const GAP = 14;     // gap between spotlight and card
const EDGE = 16;    // min distance from viewport edge

// ─── Component ───────────────────────────────────────────────────────────────

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

type SpotlightRect = { top: number; left: number; width: number; height: number };

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({
    top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  });

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => { setStep(0); setSpotlight(null); }, 250);
  }, [onClose]);

  // Measure the target element and compute spotlight + card positions
  const updateLayout = useCallback(() => {
    if (!isOpen || !current.highlight) {
      setSpotlight(null);
      setCardStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const el = document.querySelector(current.highlight) as HTMLElement | null;
    if (!el) {
      setSpotlight(null);
      setCardStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const r = el.getBoundingClientRect();
    const sp: SpotlightRect = {
      top:    r.top    - PAD,
      left:   r.left   - PAD,
      width:  r.width  + PAD * 2,
      height: r.height + PAD * 2,
    };
    setSpotlight(sp);

    // ── Card positioning: center over element, prefer below ──
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: center on element, clamp to viewport
    let cl = r.left + r.width / 2 - CARD_W / 2;
    cl = Math.max(EDGE, Math.min(vw - CARD_W - EDGE, cl));

    const spaceBelow = vh - (r.bottom + PAD + GAP);
    const spaceAbove = r.top  - PAD - GAP;

    let ct: number;
    if (spaceBelow >= CARD_H) {
      ct = r.bottom + PAD + GAP;
    } else if (spaceAbove >= CARD_H) {
      ct = r.top - PAD - GAP - CARD_H;
    } else {
      // Not enough room above or below — slide card to the less-crowded side
      const moreSpaceOnRight = (vw - r.right) > r.left;
      cl = moreSpaceOnRight
        ? Math.min(r.right + PAD + GAP, vw - CARD_W - EDGE)
        : Math.max(EDGE, r.left - PAD - GAP - CARD_W);
      ct = Math.max(EDGE, Math.min(vh - CARD_H - EDGE, r.top + r.height / 2 - CARD_H / 2));
    }

    setCardStyle({ top: ct, left: cl, transform: 'none' });
  }, [isOpen, current.highlight]);

  // On step change: clear spotlight, scroll target into view, then measure
  useEffect(() => {
    if (!isOpen) return;
    setSpotlight(null);

    if (current.highlight) {
      const el = document.querySelector(current.highlight) as HTMLElement | null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const t = setTimeout(updateLayout, 380);
    return () => clearTimeout(t);
  }, [step, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        isLast ? handleClose() : setStep(s => s + 1);
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        setStep(s => s - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isFirst, isLast, handleClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200]"
      >
        {/* ── Overlay / Spotlight ─────────────────────────────────── */}
        {!spotlight ? (
          // No target: solid backdrop
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
        ) : (
          // Four dark panels that leave a hole over the target element
          <>
            {/* Top panel */}
            <div
              className="absolute bg-black/65"
              style={{ top: 0, left: 0, right: 0, height: Math.max(0, spotlight.top) }}
              onClick={handleClose}
            />
            {/* Bottom panel */}
            <div
              className="absolute bg-black/65"
              style={{
                top: spotlight.top + spotlight.height,
                left: 0, right: 0, bottom: 0,
              }}
              onClick={handleClose}
            />
            {/* Left panel */}
            <div
              className="absolute bg-black/65"
              style={{
                top: spotlight.top,
                left: 0,
                width: Math.max(0, spotlight.left),
                height: spotlight.height,
              }}
              onClick={handleClose}
            />
            {/* Right panel */}
            <div
              className="absolute bg-black/65"
              style={{
                top: spotlight.top,
                left: spotlight.left + spotlight.width,
                right: 0,
                height: spotlight.height,
              }}
              onClick={handleClose}
            />

            {/* Animated indigo ring around the highlighted element */}
            <motion.div
              key={`ring-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="absolute pointer-events-none"
              style={{
                top:    spotlight.top,
                left:   spotlight.left,
                width:  spotlight.width,
                height: spotlight.height,
                borderRadius: 16,
                boxShadow: '0 0 0 2px #4F46E5, 0 0 0 5px rgba(79,70,229,0.22)',
              }}
            />

            {/* Pulsing glow to attract the eye */}
            <motion.div
              key={`glow-${step}`}
              className="absolute pointer-events-none"
              style={{
                top:    spotlight.top,
                left:   spotlight.left,
                width:  spotlight.width,
                height: spotlight.height,
                borderRadius: 16,
              }}
              animate={{
                boxShadow: [
                  '0 0 0 4px rgba(79,70,229,0)',
                  '0 0 0 8px rgba(79,70,229,0.18)',
                  '0 0 0 4px rgba(79,70,229,0)',
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* "Look here" pointer badge — above spotlight if room, else below */}
            <motion.div
              key={`badge-${step}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute pointer-events-none"
              style={{
                ...(spotlight.top >= 36
                  ? {
                      top: spotlight.top - 34,
                      left: spotlight.left + spotlight.width / 2,
                      transform: 'translateX(-50%)',
                    }
                  : {
                      top: spotlight.top + spotlight.height + 8,
                      left: spotlight.left + spotlight.width / 2,
                      transform: 'translateX(-50%)',
                    }
                ),
              }}
            >
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-lg whitespace-nowrap">
                {spotlight.top >= 36 ? '▼' : '▲'} featured here
              </span>
            </motion.div>
          </>
        )}

        {/* ── Tutorial Card ────────────────────────────────────────── */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute bg-white rounded-2xl overflow-hidden"
          style={{
            width: CARD_W,
            boxShadow: '0 4px 8px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.18)',
            zIndex: 10,
            ...cardStyle,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card header */}
          <div className="bg-indigo-600 px-5 py-4 text-white">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 p-1.5 bg-white/15 rounded-lg mt-0.5">
                {current.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white/55 uppercase tracking-widest mb-0.5">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h3 className="text-sm font-bold leading-snug">{current.title}</h3>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 hover:bg-white/15 rounded-lg transition-colors -mt-0.5 -mr-0.5"
                aria-label="Close tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 py-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {current.content}
            </p>
          </div>

          {/* Card footer */}
          <div className="px-5 pb-5 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              Skip tutorial
            </button>

            <div className="flex items-center gap-2">
              {/* Step dots */}
              <div className="flex items-center gap-1 mr-1" role="tablist" aria-label="Steps">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === step}
                    aria-label={`Step ${i + 1}`}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === step
                        ? 'w-4 h-1.5 bg-indigo-500'
                        : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              {!isFirst && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <button
                onClick={isLast ? handleClose : () => setStep(s => s + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {isLast ? 'Get started' : 'Next'}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Tutorial;
