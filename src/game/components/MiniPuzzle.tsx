/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, MessageSquare, Sun, HelpCircle } from 'lucide-react';
import { ActiveMiniPuzzle, MirrorData } from '../types';
import { computeSunRayPath } from '../utils';

interface MiniPuzzleProps {
  activePuzzle: ActiveMiniPuzzle;
  handleUpdatePuzzle: (puzzle: ActiveMiniPuzzle) => void;
  onClaimKnowledge: () => void;
  isAudioMuted?: boolean;
}

export default function MiniPuzzle({ 
  activePuzzle, 
  handleUpdatePuzzle, 
  onClaimKnowledge,
  isAudioMuted 
}: MiniPuzzleProps) {
  const [showChat, setShowChat] = useState(true);
  const [dragMirrorId, setDragMirrorId] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isReflection = activePuzzle.type === 'reflection';
  
  // Memoize path calculation
  const sunPath = useMemo(() => {
    if (!isReflection) return { path: [], solved: false };
    return computeSunRayPath(
      activePuzzle.sunPos, 
      activePuzzle.goalPos, 
      activePuzzle.mirrors, 
      activePuzzle.viewBoxSize
    );
  }, [activePuzzle.sunPos, activePuzzle.goalPos, activePuzzle.mirrors, activePuzzle.viewBoxSize, isReflection]);

  // Sync solved state - locking when hit
  useEffect(() => {
    if (isReflection && sunPath.solved && !activePuzzle.solved) {
      handleUpdatePuzzle({ ...activePuzzle, solved: true });
    }
  }, [sunPath.solved, activePuzzle.solved, handleUpdatePuzzle, isReflection]);

  // DRAG ROTATION LOGIC
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    // LOCK ROTATION IF SOLVED
    if (activePuzzle.solved) return;
    
    if (e.cancelable) e.preventDefault();
    setDragMirrorId(id);
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (dragMirrorId === null || !svgRef.current || activePuzzle.solved) return;

    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPt = pt.matrixTransform(CTM.inverse());

    const mirror = activePuzzle.mirrors.find(m => m.id === dragMirrorId);
    if (!mirror) return;

    const dx = svgPt.x - mirror.x;
    const dy = svgPt.y - mirror.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const nextMirrors = activePuzzle.mirrors.map(m => 
      m.id === dragMirrorId ? { ...m, rotation: angle } : m
    );

    handleUpdatePuzzle({ ...activePuzzle, mirrors: nextMirrors });
  }, [dragMirrorId, activePuzzle.mirrors, activePuzzle.solved, handleUpdatePuzzle]);

  const handleMouseUp = useCallback(() => {
    setDragMirrorId(null);
  }, []);

  useEffect(() => {
    if (dragMirrorId !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragMirrorId, handleMouseMove, handleMouseUp]);

  const renderGoal = () => {
    const { x, y } = activePuzzle.goalPos;
    const solved = activePuzzle.solved;
    const type = activePuzzle.targetType;
    
    let emoji = '🚪';
    if (type === 'meat') emoji = '🍖';
    if (type === 'fish') emoji = '🐟';
    if (type === 'pot') emoji = '🍲';

    return (
      <g transform={`translate(${x}, ${y})`}>
        <circle cx="0" cy="0" r="30" fill={solved ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)"} className={solved ? "animate-pulse" : ""} />
        <text x="0" y="8" textAnchor="middle" fontSize="24">{emoji}</text>
        <rect x="-20" y="-20" width="40" height="40" fill="transparent" stroke={solved ? "#10b981" : "rgba(255,255,255,0.2)"} strokeWidth="2" rx="8" />
      </g>
    );
  };

  const sunRayPoints = useMemo(() => {
    if (!sunPath.path || sunPath.path.length < 2) return "";
    return sunPath.path
      .filter(pt => isFinite(pt.x) && isFinite(pt.y))
      .map(pt => `${pt.x},${pt.y}`)
      .join(' ');
  }, [sunPath.path]);

  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-center pointer-events-auto w-full max-w-4xl mx-auto">
      
      {/* 1. THE APPARATUS (CLEAN VIEW) */}
      <div className="w-full max-w-[380px] sm:max-w-[420px] bg-[#120502]/95 border-2 border-orange-500/20 rounded-3xl p-3 sm:p-4 flex flex-col items-center space-y-4 shadow-2xl backdrop-blur-xl shrink-0">
        {isReflection ? (
          <div className="relative w-full aspect-square">
            <svg 
              ref={svgRef}
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${activePuzzle.viewBoxSize} ${activePuzzle.viewBoxSize}`}
              className={`bg-black/90 border border-white/10 rounded-2xl overflow-hidden touch-none ${activePuzzle.solved ? 'opacity-80' : ''}`}
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                </pattern>
                <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* SUN RAY PATHWAY */}
              {sunRayPoints && (
                <g filter="url(#sunGlow)">
                  <polyline points={sunRayPoints} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={sunRayPoints} fill="none" stroke="#fffce0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={sunRayPoints} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}

              {/* EMITTER */}
              <g transform={`translate(${activePuzzle.sunPos.x}, ${activePuzzle.sunPos.y})`}>
                <circle r="22" fill="rgba(255, 200, 50, 0.2)" className="animate-pulse" />
                <Sun className="w-8 h-8 text-amber-400 -translate-x-4 -translate-y-4" />
              </g>

              {/* GOAL */}
              {renderGoal()}

              {/* MIRRORS */}
              {activePuzzle.mirrors.map((m) => (
                <g 
                  key={m.id} 
                  transform={`translate(${m.x}, ${m.y}) rotate(${m.rotation})`}
                  onMouseDown={(e) => handleMouseDown(e, m.id)}
                  onTouchStart={(e) => handleMouseDown(e, m.id)}
                  className={`${activePuzzle.solved ? 'cursor-default' : 'cursor-move group'}`}
                >
                  <circle r="45" fill="transparent" />
                  <line 
                    x1={-m.size/2} y1="0" x2={m.size/2} y2="0" 
                    stroke={activePuzzle.solved ? "rgba(74, 243, 255, 0.4)" : "#4af3ff"} strokeWidth="8" strokeLinecap="round" 
                    className="group-hover:stroke-white transition-colors"
                  />
                  <line 
                    x1={-m.size/2} y1="0" x2={m.size/2} y2="0" 
                    stroke={activePuzzle.solved ? "rgba(255,255,255,0.4)" : "white"} strokeWidth="2" strokeLinecap="round" 
                  />
                  <circle cx={m.size/2} cy="0" r="5" fill={activePuzzle.solved ? "rgba(245, 158, 11, 0.4)" : "#f59e0b"} />
                  <circle cx={-m.size/2} cy="0" r="5" fill={activePuzzle.solved ? "rgba(245, 158, 11, 0.4)" : "#f59e0b"} />
                </g>
              ))}
            </svg>
            
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded-lg text-[8px] sm:text-[9px] font-mono text-zinc-400 border border-white/5">
              <HelpCircle className="w-3 h-3 text-orange-400" />
              {activePuzzle.solved ? "CALIBRATION LOCKED" : "DRAG MIRRORS TO ROTATE"}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 w-full max-w-[280px]">
             <div className="flex justify-center gap-3 w-full">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  className="flex-1 py-4 rounded-2xl border bg-white/5 border-white/10 font-mono text-xs opacity-50"
                >
                  GATE_{idx+1}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePuzzle.solved && (
          <button
            onClick={onClaimKnowledge}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 rounded-2xl font-mono text-xs font-black shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse active:scale-95 cursor-pointer"
          >
            &gt;&gt; CLAIM SYNTHESIZED KNOWLEDGE
          </button>
        )}
      </div>

      {/* 2. THE DIRECTOR CHAT BOX */}
      {showChat && (
        <div className="mt-4 lg:mt-0 lg:ml-4 w-full max-w-[320px] lg:w-64 bg-slate-900/90 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-4 lg:slide-in-from-left-4 duration-300">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-mono font-black text-orange-200 uppercase">AI_DIRECTOR_COMMS</span>
            </div>
            <button onClick={() => setShowChat(false)} className="p-1 text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-slate-200 font-mono leading-relaxed">
                {activePuzzle.solved ? "Sync achieved. Harness the solar residue to expand your consciousness." : (
                  isReflection 
                  ? "SOL-0, the grid coordinates are shifting. Calibrate the reflective prisms to harness the sun rays. Sustain the meat-cores for sector stability."
                  : "Logic gates corrupted. Restore parity to sync with the grid."
                )}
              </p>
            </div>
            <div className="text-[9px] font-mono text-white/30 italic">
              Status: Comms Link Stable [98%]
            </div>
          </div>
        </div>
      )}
      
      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="mt-4 lg:mt-0 lg:absolute lg:-right-12 lg:top-0 p-3 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-300 hover:bg-orange-500/40 transition-all shadow-lg"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
