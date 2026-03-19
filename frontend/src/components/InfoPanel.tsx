import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StructureResponse } from '../types';
import { Hash, Beaker, BookOpen, Scale, FlaskConical, Copy, Check } from 'lucide-react';

interface InfoPanelProps {
  data: StructureResponse | null;
  loading: boolean;
  explanation: string | null;
}

// Safe inline markdown renderer — no dangerouslySetInnerHTML needed
const renderInline = (text: string) => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-slate-800">{part}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
};

const parseExplanation = (text: string) => {
  if (!text) return [];
  const sections: { title: string; content: string[] }[] = [];
  let current: { title: string; content: string[] } | null = null;

  text.split('\n').forEach(line => {
    if (line.startsWith('**') && line.endsWith('**')) {
      if (current) sections.push(current);
      current = { title: line.replace(/\*\*/g, ''), content: [] };
    } else if ((line.startsWith('•') || line.startsWith('- ')) && current) {
      current.content.push(line.replace(/^[•\-]\s*/, ''));
    } else if (line.trim() && current) {
      current.content.push(line);
    }
  });

  if (current) sections.push(current);
  return sections;
};

const InfoPanel: React.FC<InfoPanelProps> = ({ data, loading, explanation }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8">
        <div className="relative w-12 h-12 mb-5">
          <div className="absolute inset-0 border-2 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-indigo-500 rounded-full animate-spin" />
          <FlaskConical className="absolute inset-0 m-auto w-5 h-5 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Analyzing molecule…</p>
        <p className="text-xs text-slate-400 mt-1">Fetching data from PubChem</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
        <div className="p-5 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
          <Beaker className="w-9 h-9 text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-slate-600 mb-1.5">Ready to Analyze</h3>
        <p className="text-xs text-slate-400 max-w-[190px] leading-relaxed">
          Search for a molecule by name or draw a structure to see its IUPAC name and properties.
        </p>
      </div>
    );
  }

  const explanationSections = parseExplanation(explanation ?? '');

  const identifiers = [
    { label: 'SMILES', value: data.smiles, key: 'smiles' },
    { label: 'InChI', value: data.inchi, key: 'inchi' },
  ];

  return (
    <div className="p-5 space-y-5">

      {/* ── IUPAC Name ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-5 border-b border-slate-100"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">
          IUPAC Systematic Name
        </p>
        <h2 className="text-[17px] font-bold text-slate-900 leading-snug">
          {data.iupac_name}
        </h2>
        {data.common_name && data.common_name !== data.iupac_name && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-slate-400">Common name:</span>
            <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold border border-indigo-100">
              {data.common_name}
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Key Metrics ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Beaker className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Formula</span>
          </div>
          <div className="font-mono font-bold text-lg text-slate-900 leading-none">
            {data.molecular_formula.split(/(\d+)/).map((part, i) =>
              /\d+/.test(part)
                ? <sub key={i} className="text-sm">{part}</sub>
                : <span key={i}>{part}</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mol. Weight</span>
          </div>
          <div className="font-mono font-bold text-lg text-slate-900 leading-none">
            {data.molecular_weight}
            <span className="text-xs text-slate-400 ml-1 font-sans font-normal">g/mol</span>
          </div>
        </div>
      </motion.div>

      {/* ── Functional Groups ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
          Functional Groups
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.functional_groups.length > 0 ? (
            data.functional_groups.map((group, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 + i * 0.04 }}
                className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
              >
                {group}
              </motion.span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No specific functional groups detected</span>
          )}
        </div>
      </motion.div>

      {/* ── Detailed Analysis ────────────────────── */}
      <AnimatePresence>
        {explanationSections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2.5"
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis</p>
            </div>

            {explanationSections.map((section, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-bold text-slate-600 mb-2">{section.title}</p>
                <ul className="space-y-1.5">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-xs text-slate-600 leading-relaxed">
                      {renderInline(item)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chemical Identifiers ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chemical Identifiers</p>
        </div>

        {identifiers.map(({ label, value, key }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400 font-semibold">{label}</span>
              <button
                onClick={() => copyToClipboard(value, key)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-500 transition-colors"
                aria-label={`Copy ${label}`}
              >
                {copiedField === key ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-slate-600 break-all select-all cursor-text hover:bg-slate-100 transition-colors leading-relaxed">
              {value}
            </div>
          </div>
        ))}
      </motion.div>

    </div>
  );
};

export default InfoPanel;
