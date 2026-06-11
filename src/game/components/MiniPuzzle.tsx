/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveMiniPuzzle } from '../types';
import { computeLaserPath } from '../utils';

interface MiniPuzzleProps {
  activePuzzle: ActiveMiniPuzzle;
  handleToggleMirror: (idx: number) => void;
  onClaimKnowledge: () => void;
}

export default function MiniPuzzle({ activePuzzle, handleToggleMirror, onClaimKnowledge }: MiniPuzzleProps) {
  const isReflection = activePuzzle.type === 'reflection';
  const laserRes = isReflection ? computeLaserPath(activePuzzle.mirrors) : { path: [], solved: false };

  // Precise coordinates for mirrors to match logical indices in utils.ts
  const getMirrorTransform = (idx: number) => {
    if (idx === 0) return "translate(160, 0)";   // Col 2, Row 0
    if (idx === 1) return "translate(160, 160)"; // Col 2, Row 2
    if (idx === 2) return "translate(0, 160)";   // Col 0, Row 2
    return "translate(0, 0)";
  };

  return (
    <div className="bg-[#120502]/95 border border-orange-500/20 p-4 rounded-2xl mt-1 flex flex-col items-center space-y-3 select-none shadow-[0_0_50px_rgba(0,0,0,0.95)]">
      <div className="w-full flex justify-between items-center text-[10px] font-mono text-orange-300 border-b border-white/10 pb-2">
        <span>🎮 PUZZLE INTERACTION: {isReflection ? '☀️ LASER MIRROR ROOM' : '🔌 POWER SWITCHBOARD'}</span>
        <span className={activePuzzle.solved ? "text-emerald-400 font-bold" : "text-amber-400 animate-pulse font-bold"}>
          {activePuzzle.solved ? "★ CALIBRATION_STABLE" : "⚡ CALIBRATING..."}
        </span>
      </div>

      {/* INSTRUCTIONS */}
      {!activePuzzle.solved && (
        <p className="text-[10px] font-mono text-zinc-400 leading-normal max-w-sm text-center">
          {isReflection 
            ? "👉 Rotate mirrors to direct the sun laser to the EXIT Portal door."
            : "👉 Toggle switches until Switch 1 & 3 are ON and Switch 2 is OFF."
          }
        </p>
      )}

      {isReflection ? (
        /* VISUAL SVG REFLECTIVE SCREEN */
        <div className="relative flex flex-col items-center space-y-2">
          <svg 
            width="240" 
            height="240" 
            className="bg-black/90 border-2 border-orange-950/60 rounded-xl shadow-xl"
            style={{ imageRendering: 'pixelated' }}
          >
            {/* Grid Cell lines */}
            <line x1="80" y1="0" x2="80" y2="240" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="160" y1="0" x2="160" y2="240" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1="80" x2="240" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1="160" x2="240" y2="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />

            {/* SUN EMITTER CELL (0,0) */}
            <g transform="translate(0, 0)">
              <circle cx="40" cy="40" r="16" fill="rgba(245, 158, 11, 0.2)" className="animate-pulse" />
              <circle cx="40" cy="40" r="12" fill="#f59e0b" />
              <text x="40" y="44" textAnchor="middle" fontSize="12" fill="#000">☀️</text>
            </g>

            {/* PORTAL DOOR CELL (0,1) */}
            <g transform="translate(0, 80)">
              <rect x="22" y="10" width="36" height="50" rx="6" fill={laserRes.solved ? "rgba(16, 185, 129, 0.25)" : "rgba(220, 38, 38, 0.1)"} stroke={laserRes.solved ? "#10b981" : "#7f1d1d"} strokeWidth="2" />
              <text x="40" y="42" textAnchor="middle" fontSize="18" fill="#fff">{laserRes.solved ? "🚪" : "🔒"}</text>
              <text x="40" y="52" textAnchor="middle" fontSize="6" fontWeight="bold" fill={laserRes.solved ? "#34d399" : "#ef4444"} fontFamily="monospace">EXIT PORTAL</text>
            </g>

            {/* LASER BEAM PATHWAY */}
            {laserRes.path.length > 1 && (() => {
              const polyPoints = laserRes.path.map(pt => `${pt.x},${pt.y}`).join(' ');
              return (
                <g>
                  <polyline points={polyPoints} fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse opacity-85" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
                  <polyline points={polyPoints} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              );
            })()}

            {/* INTERACTIVE MIRRORS */}
            {[0, 1, 2].map(mIdx => (
              <g 
                key={mIdx} 
                transform={getMirrorTransform(mIdx)} 
                className={activePuzzle.solved ? "opacity-50" : "cursor-pointer group"} 
                onClick={() => !activePuzzle.solved && handleToggleMirror(mIdx)}
              >
                <rect x="5" y="5" width="70" height="70" rx="8" fill="rgba(255,255,255,0.03)" className="hover:fill-white/10 transition-colors" />
                <circle cx="40" cy="40" r="28" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245,158,11,0.2)" />
                {activePuzzle.mirrors[mIdx] % 2 === 0 ? (
                  <line x1="20" y1="60" x2="60" y2="20" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                ) : (
                  <line x1="20" y1="20" x2="60" y2="60" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                )}
                <circle cx="40" cy="40" r="10" fill="#180b08" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="40" y="43" textAnchor="middle" fontSize="8" fill="#ffd800" fontWeight="bold" fontFamily="monospace">{activePuzzle.mirrors[mIdx] * 90}°</text>
                {!activePuzzle.solved && <text x="40" y="66" textAnchor="middle" fontSize="6.5" fill="#a1a1aa" fontWeight="black" fontFamily="monospace">MIRROR {mIdx + 1} 🔄</text>}
              </g>
            ))}
          </svg>
        </div>
      ) : (
        /* VISUAL ELECTRICAL POWER SWITCHES DASHBOARD */
        <div className="flex flex-col items-center space-y-3 w-full max-w-sm">
          <div className="flex justify-center gap-3 w-full">
            {activePuzzle.mirrors.map((val, idx) => (
              <button
                key={idx}
                disabled={activePuzzle.solved}
                onClick={() => handleToggleMirror(idx)}
                className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  activePuzzle.solved ? "opacity-50" : "cursor-pointer hover:brightness-110 active:scale-95"
                } ${
                  val === 1 
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300" 
                    : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                }`}
              >
                <span className="text-[9px] opacity-70 font-mono">Switch {idx + 1}</span>
                <span className="text-lg my-1">{val === 1 ? '🔌 ON' : '❌ OFF'}</span>
                <span className="text-[8px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded tracking-wide font-black">
                  {val === 1 ? 'TRUE' : 'FALSE'}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between">
            <span className="text-[9px] text-zinc-400 font-mono uppercase font-bold">Tube Status:</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono font-black ${activePuzzle.solved ? "text-emerald-400" : "text-rose-400"}`}>
                {activePuzzle.solved ? "🔋 SYNC_COMPLETE" : "🔌 OFFLINE"}
              </span>
              <div className={`w-3.5 h-3.5 rounded-full ${activePuzzle.solved ? "bg-emerald-500 animate-ping" : "bg-rose-500 animate-pulse"}`}></div>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM KNOWLEDGE BUTTON - ONLY SHOWN WHEN SOLVED */}
      {activePuzzle.solved && (
        <button
          onClick={onClaimKnowledge}
          className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl font-mono text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all animate-pulse active:scale-95 cursor-pointer"
        >
          &gt;&gt; CLAIM KNOWLEDGE POINTS
        </button>
      )}
    </div>
  );
}
