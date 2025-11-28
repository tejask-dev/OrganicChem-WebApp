import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    Kekule: any;
  }
}

interface KekuleEditorProps {
  onChange?: (smiles: string) => void;
}

export interface KekuleEditorRef {
  getSmiles: () => string;
  setSmiles: (smiles: string) => void;
  setMolBlock: (molBlock: string) => void;
  clear: () => void;
}

const KekuleEditor = forwardRef<KekuleEditorRef, KekuleEditorProps>((props, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<any>(null);

  useEffect(() => {
    const initEditor = () => {
      if (editorRef.current && !composerRef.current && window.Kekule) {
        const Kekule = window.Kekule;
        
        try {
          const composer = new Kekule.Editor.Composer(editorRef.current);
          composer.setDimension('100%', '100%');
          
          composer.setCommonToolButtons([
            'newDoc', 'undo', 'redo', 'zoomIn', 'zoomOut'
          ]);
          
          composer.setChemToolButtons([
            'manipulate', 'erase', 'bond', 'atom', 'ring', 'charge'
          ]);

          composerRef.current = composer;
        } catch (e) {
          console.error("Kekule init error:", e);
        }
      }
    };

    if (window.Kekule) {
      initEditor();
    } else {
      const timer = setTimeout(initEditor, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    getSmiles: () => {
      if (composerRef.current && window.Kekule) {
        try {
          const chemObj = composerRef.current.getChemObj();
          if (chemObj) {
            return window.Kekule.IO.saveFormatData(chemObj, 'smi') || '';
          }
        } catch (e) {
          console.error("Error getting SMILES:", e);
        }
      }
      return '';
    },
    
    setSmiles: (smiles: string) => {
      // Don't try to load invalid or complex SMILES that Kekule can't handle
      if (!smiles || !composerRef.current || !window.Kekule) return;
      
      // Kekule has trouble with some SMILES formats, so we'll skip loading
      // and let the user see the SVG preview instead
      console.log("SMILES available:", smiles);
    },
    
    setMolBlock: (molBlock: string) => {
      if (!molBlock || !composerRef.current || !window.Kekule) return;
      
      try {
        const Kekule = window.Kekule;
        const chemObj = Kekule.IO.loadFormatData(molBlock, 'mol');
        if (chemObj) {
          composerRef.current.setChemObj(chemObj);
        }
      } catch (e) {
        console.error("Error loading MOL:", e);
      }
    },
    
    clear: () => {
      if (composerRef.current && window.Kekule) {
        try {
          composerRef.current.newDoc();
        } catch (e) {
          console.error("Error clearing:", e);
        }
      }
    }
  }));

  return (
    <div 
      ref={editorRef} 
      className="w-full h-full bg-white"
      style={{ minHeight: '500px' }}
    />
  );
});

KekuleEditor.displayName = 'KekuleEditor';

export default KekuleEditor;
