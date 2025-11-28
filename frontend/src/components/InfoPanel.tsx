import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StructureResponse } from '../types';
import { Hash, Beaker, BookOpen, Scale, Zap, Atom, Copy, Check, FlaskConical, Info } from 'lucide-react';

interface InfoPanelProps {
  data: StructureResponse | null;
  loading: boolean;
  explanation: string | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ data, loading, explanation }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Parse explanation into sections
  const parseExplanation = (text: string) => {
    if (!text) return [];
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;
    
    text.split('\n').forEach(line => {
      if (line.startsWith('**') && line.endsWith('**')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: line.replace(/\*\*/g, ''), content: [] };
      } else if (line.startsWith('•') || line.startsWith('- ')) {
        if (currentSection) {
          currentSection.content.push(line.replace(/^[•\-]\s*/, ''));
        }
      } else if (line.trim() && currentSection) {
        currentSection.content.push(line);
      }
    });
    
    if (currentSection) sections.push(currentSection);
    return sections;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 border-r-purple-500 rounded-full animate-spin" />
          <FlaskConical className="absolute inset-0 m-auto w-8 h-8 text-indigo-500" />
        </div>
        <p className="font-semibold text-gray-700">Analyzing molecule...</p>
        <p className="text-sm text-gray-400 mt-1">Fetching IUPAC name from PubChem</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl mb-6">
          <Beaker className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-bold text-gray-700 mb-2">Ready to Analyze</h3>
        <p className="text-sm text-gray-500 max-w-[220px]">
          Search for a molecule by name or draw a structure to see the IUPAC name and detailed analysis
        </p>
      </div>
    );
  }

  const explanationSections = parseExplanation(explanation || '');

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      
      {/* Molecule Name - Primary Focus */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-5 border-b border-gray-100"
      >
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-indigo-500" />
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">IUPAC Systematic Name</p>
        </div>
        <h2 className="text-xl font-bold text-gray-800 leading-tight mb-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border-2 border-indigo-100">
          {data.iupac_name}
        </h2>
        {data.common_name && data.common_name !== data.iupac_name && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Common name:</span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg">
              <Zap className="w-3.5 h-3.5" />
              {data.common_name}
            </span>
          </div>
        )}
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2 mb-2 text-indigo-600">
            <Beaker className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Formula</span>
          </div>
          <div className="font-mono font-bold text-xl text-gray-800">
            {data.molecular_formula.split(/(\d+)/).map((part, i) => 
              /\d+/.test(part) ? <sub key={i} className="text-base">{part}</sub> : <span key={i}>{part}</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2 mb-2 text-purple-600">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
          </div>
          <div className="font-mono font-bold text-xl text-gray-800">
            {data.molecular_weight}
            <span className="text-sm text-gray-500 ml-1 font-sans">g/mol</span>
          </div>
        </div>
      </motion.div>

      {/* Functional Groups */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100"
      >
        <div className="flex items-center gap-2 mb-3 text-amber-600">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Functional Groups Detected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.functional_groups.length > 0 ? (
            data.functional_groups.map((group, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="px-3 py-1.5 bg-white border-2 border-amber-200 rounded-lg text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50 transition-colors"
              >
                {group}
              </motion.span>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No specific functional groups detected</span>
          )}
        </div>
      </motion.div>

      {/* Detailed Explanation */}
      <AnimatePresence>
        {explanationSections.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-blue-600">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Detailed Analysis</span>
            </div>
            
            {explanationSections.map((section, idx) => (
              <div 
                key={idx}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
              >
                <h4 className="font-bold text-gray-700 text-sm mb-2">{section.title}</h4>
                <ul className="space-y-1">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 leading-relaxed">
                      {item.startsWith('**') ? (
                        <span dangerouslySetInnerHTML={{ 
                          __html: item.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-800">$1</strong>') 
                        }} />
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Technical Identifiers */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 pt-2"
      >
        <div className="flex items-center gap-2 text-gray-400">
          <Hash className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Chemical Identifiers</span>
        </div>
        
        {/* SMILES */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400 font-semibold">SMILES Notation</label>
            <button 
              onClick={() => copyToClipboard(data.smiles, 'smiles')}
              className="text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1 text-xs"
            >
              {copiedField === 'smiles' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-xs text-gray-600 break-all select-all cursor-text hover:bg-gray-100 transition-colors">
            {data.smiles}
          </div>
        </div>

        {/* InChI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400 font-semibold">InChI</label>
            <button 
              onClick={() => copyToClipboard(data.inchi, 'inchi')}
              className="text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1 text-xs"
            >
              {copiedField === 'inchi' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-xs text-gray-600 break-all select-all cursor-text hover:bg-gray-100 transition-colors">
            {data.inchi}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InfoPanel;
