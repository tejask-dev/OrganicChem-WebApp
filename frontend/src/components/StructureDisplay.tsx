import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';

interface StructureDisplayProps {
  svg: string;
  title?: string;
}

const StructureDisplay: React.FC<StructureDisplayProps> = ({ svg, title }) => {
  if (!svg) return null;

  // Clean up the SVG - remove any problematic attributes
  const cleanSvg = svg
    .replace(/width="[^"]*"/, 'width="100%"')
    .replace(/height="[^"]*"/, 'height="100%"')
    .replace(/<svg/, '<svg style="max-width:400px;max-height:300px;margin:auto;display:block"');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-lg"
    >
      {title && (
        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-green-700">{title}</p>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
            ✓ Found
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
