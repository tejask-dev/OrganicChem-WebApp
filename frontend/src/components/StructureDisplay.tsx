import React from 'react';
import { motion } from 'framer-motion';

interface StructureDisplayProps {
  svg: string;
  title?: string;
}

const StructureDisplay: React.FC<StructureDisplayProps> = ({ svg, title }) => {
  if (!svg) return null;

  const cleanSvg = svg
    .replace(/width="[^"]*"/, 'width="100%"')
    .replace(/height="[^"]*"/, 'height="100%"')
    .replace(/<svg/, '<svg style="max-width:400px;max-height:300px;margin:auto;display:block"');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
    >
      {title && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 truncate">{title}</p>
          <span className="flex-shrink-0 ml-3 text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-semibold border border-indigo-100">
            Found
          </span>
        </div>
      )}
      <div
        className="p-6 flex items-center justify-center bg-white"
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
        style={{ minHeight: '200px' }}
      />
    </motion.div>
  );
};

export default StructureDisplay;
