import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Viewer3DProps {
  molBlock: string;
}

const Viewer3D: React.FC<Viewer3DProps> = ({ molBlock }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Don't do anything if no molBlock or no container
    if (!containerRef.current || !molBlock || molBlock.trim() === '') {
      setIsLoading(false);
      setError("No 3D structure available");
      return;
    }

    const initViewer = async () => {
      setIsLoading(true);
      setError(null);

      // Dynamically import NGL to avoid SSR issues
      const NGL = await import('ngl');

      // Clean up previous stage safely
      if (stageRef.current) {
        try {
          stageRef.current.dispose();
        } catch (e) {
          // Ignore disposal errors
        }
        stageRef.current = null;
      }

      // Small delay to ensure container is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!containerRef.current) return;

      try {
        // Create stage
        const stage = new NGL.Stage(containerRef.current, {
          backgroundColor: 'white',
          quality: 'medium',
          antialias: true,
          impostor: true,
        });

        stageRef.current = stage;
        setIsInitialized(true);

        // Create blob from molBlock
        const blob = new Blob([molBlock], { type: 'chemical/x-mdl-molfile' });

        // Load the structure
        const component = await stage.loadFile(blob, { ext: 'mol' });
        
        if (component) {
          // Add ball+stick representation
          component.addRepresentation('ball+stick', {
            multipleBond: 'symmetric',
            colorScheme: 'element',
            aspectRatio: 1.8,
            bondScale: 0.25,
            radiusScale: 0.35,
          });

          // Center view
          stage.autoView(500);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error("3D Viewer error:", err);
        setError("Could not render 3D view");
        setIsLoading(false);
      }
    };

    initViewer();

    // Cleanup
    return () => {
      if (stageRef.current) {
        try {
          stageRef.current.dispose();
        } catch (e) {
          // Ignore
        }
        stageRef.current = null;
      }
    };
  }, [molBlock]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current && isInitialized) {
        try {
          stageRef.current.handleResize();
        } catch (e) {
          // Ignore
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);

  const handleReset = () => {
    if (stageRef.current) {
      try {
        stageRef.current.autoView(300);
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleZoomIn = () => {
    if (stageRef.current && stageRef.current.viewer) {
      try {
        const cam = stageRef.current.viewer.camera;
        cam.position.z *= 0.85;
        stageRef.current.viewer.requestRender();
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleZoomOut = () => {
    if (stageRef.current && stageRef.current.viewer) {
      try {
        const cam = stageRef.current.viewer.camera;
        cam.position.z *= 1.15;
        stageRef.current.viewer.requestRender();
      } catch (e) {
        // Ignore
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-white">
      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading 3D view...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center text-gray-500">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Try analyzing a molecule first</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {!isLoading && !error && isInitialized && (
        <>
          <div className="absolute bottom-4 left-4 z-20 flex gap-2">
            <button
              onClick={handleReset}
              className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-all"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="absolute bottom-4 right-4 z-20 text-xs text-gray-400 bg-white/90 px-3 py-2 rounded-lg shadow">
            Drag to rotate • Scroll to zoom
          </div>
        </>
      )}

      {/* NGL Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '450px' }}
      />
    </div>
  );
};

export default Viewer3D;
