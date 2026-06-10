/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Eye, Play, Sparkles, AlertCircle, Heart, Shield } from 'lucide-react';
import { CharacterState, NpcConcept } from '../types';

export const SYSTEM_NPCS: NpcConcept[] = [
  {
    id: 'watcher',
    name: 'Watcher Unit v4.1',
    type: 'Security Guardian Program',
    description: 'A massive floating cybernetic core surrounded by rotating scanner rings. Sweeps coordinates with a volumetric laser red sweep. SOL-0 contact results in immediate critical cache damage.',
    identityColor: 'text-red-500 bg-red-950/15 border-red-900',
    shapeType: 'eye',
  },
  {
    id: 'lux',
    name: 'Lux Memory Fragment',
    type: 'Orphaned System Log',
    description: 'Floating high-density raw logic deposits that emit pearlescent ray bursts. SOL-0 contact triggers memories about Alastair-the creator-unveiling secret endings and restoring Daylight.',
    identityColor: 'text-purple-400 bg-purple-950/15 border-purple-900',
    shapeType: 'fragment',
  },
  {
    id: 'drifter',
    name: 'Corrupted Bit-Drifter',
    type: 'Anomalous Memory Leak',
    description: 'Floating cluster blocks made of volatile glitch data. They nestle along active logic gate wiring routes, creating signal resistance and short-circuiting puzzles until cleared manually.',
    identityColor: 'text-amber-500 bg-amber-950/15 border-amber-900',
    shapeType: 'glitch',
  }
];

export default function CharacterVisualizer() {
  const [activeState, setActiveState] = useState<CharacterState>('Idle');
  const [orbitalOffset, setOrbitalOffset] = useState(0);
  const [selectedNpc, setSelectedNpc] = useState<NpcConcept>(SYSTEM_NPCS[0]);

  // Frame animation loop for orbital dust particles using requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    const tick = () => {
      setOrbitalOffset((prev) => (prev + 0.05) % (Math.PI * 2));
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Compute specific coordinates for orbital particles based on state
  const getParticleRadius = () => {
    if (activeState === 'Reflecting') return 25;
    if (activeState === 'Solving') return 38;
    if (activeState === 'Celebrating') return 48;
    return 32; // standard
  };

  const getExpressiveEyes = () => {
    switch (activeState) {
      case 'Idle':
        return (
          <>
            <ellipse cx="44" cy="42" rx="2.5" ry="3.5" fill="#FFFFFF" />
            <ellipse cx="56" cy="42" rx="2.5" ry="3.5" fill="#FFFFFF" />
          </>
        );
      case 'Reflecting':
        return (
          <>
            <circle cx="44" cy="42" r="2.5" fill="#FFFFFF" />
            <circle cx="56" cy="42" r="2.5" fill="#FFFFFF" />
            <path d="M 42,34 Q 45,33 46,35" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
            <path d="M 58,34 Q 55,33 54,35" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
          </>
        );
      case 'Solving':
        return (
          <>
            <rect x="42" y="41" width="5" height="2" rx="0.5" fill="#FFF" />
            <rect x="53" y="41" width="5" height="2" rx="0.5" fill="#FFF" />
          </>
        );
      case 'Gliched':
        return (
          <>
            <rect x="42" y="40" width="4" height="4" fill="#FF2a85" />
            <rect x="54" y="43" width="3" height="3" fill="#00ffff" />
          </>
        );
      case 'Determined':
        return (
          <>
            <path d="M 41,44 L 46,40 L 46,44 Z" fill="#FFC72C" />
            <path d="M 59,44 L 54,40 L 54,44 Z" fill="#FFC72C" />
          </>
        );
      case 'Celebrating':
        return (
          <>
            {/* Happy curves! */}
            <path d="M 41,43 Q 44,40 47,43" stroke="#FFFFFF" strokeWidth="2.0" fill="none" strokeLinecap="round" />
            <path d="M 53,43 Q 56,40 59,43" stroke="#FFFFFF" strokeWidth="2.0" fill="none" strokeLinecap="round" />
            <path d="M 47,49 Q 50,52 53,49" stroke="#FF5E7E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <div id="character-visualizer-workstation" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      
      {/* 1. LEFT COLUMN: PORTRAIT CANVAS */}
      <div className="lg:col-span-6 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
        <span className="text-[10px] font-mono text-slate-500 mb-3 uppercase tracking-wider">
          SOL-0 Glowing Particle Silhouette Rendering
        </span>

        {/* Character view frame */}
        <div id="character-svg-container" className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 w-full aspect-square max-w-[280px] sm:max-w-[320px] shadow-inner flex items-center justify-center relative overflow-hidden">
          {/* Neon Bloom dynamic grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* SVG Stickman layout */}
          <svg className="w-full h-full relative z-10 select-none" viewBox="0 0 100 100">
            {/* Defs block for beautiful neon filters */}
            <defs>
              <filter id="vector-bloom" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="cyan-bloom" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.0" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Aura backplanes */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />

            {/* Orbit paths */}
            <ellipse
              cx="50"
              cy="52"
              rx={getParticleRadius() + 10}
              ry={getParticleRadius() - 10}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.8"
              transform="rotate(-15 50 50)"
            />

            {/* Draw Character Lines */}
            <g filter="url(#vector-bloom)">
              {/* Head Shell */}
              <circle
                cx="50"
                cy="44"
                r="11"
                fill="none"
                stroke={activeState === 'Gliched' ? '#FF2a85' : '#FFFFFF'}
                strokeWidth="2.5"
              />

              {/* Expressive Eyes */}
              {getExpressiveEyes()}

              {/* Spine Body */}
              <line
                x1="50"
                y1="55"
                x2="50"
                y2="72"
                stroke={activeState === 'Gliched' ? '#FF2a85' : '#FFFFFF'}
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Left Arm connection based on behavior */}
              <path
                d={
                  activeState === 'Reflecting'
                    ? 'M 50,59 Q 40,62 46,47 L 46,45' // hand to head!
                    : activeState === 'Celebrating'
                    ? 'M 50,59 Q 34,51 28,42' // hands high in sky!
                    : 'M 50,59 Q 38,62 34,70' // resting arm
                }
                fill="none"
                stroke={activeState === 'Gliched' ? '#FF2a85' : '#FFFFFF'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Right Arm */}
              <path
                d={
                  activeState === 'Celebrating'
                    ? 'M 50,59 Q 66,51 72,42'
                    : 'M 50,59 Q 62,62 66,70'
                }
                fill="none"
                stroke={activeState === 'Gliched' ? '#FF2a85' : '#FFFFFF'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Left Leg */}
              <line
                x1="50"
                y1="72"
                x2="40"
                y2="89"
                stroke={activeState === 'Gliched' ? '#FF2a85' : '#FFFFFF'}
                strokeWidth="2.3"
                strokeLinecap="round"
              />

              {/* Right Leg */}
              <line
                x1="50"
                y1="72"
                x2="60"
                y2="89"
                stroke={activeState === 'Gliched' ? '#FF2a85' : '#FFFFFF'}
                strokeWidth="2.3"
                strokeLinecap="round"
              />
            </g>

            {/* Draw Floating Ring Orbital Particles */}
            {Array.from({ length: 8 }).map((_, i) => {
              const theta = (orbitalOffset + (i * Math.PI * 2) / 8);
              const radiusX = getParticleRadius() + 10;
              const radiusY = getParticleRadius() - 10;
              const angleDeg = -15 * (Math.PI / 180);

              // Standard ellipse equations rotated
              const rawX = radiusX * Math.cos(theta);
              const rawY = radiusY * Math.sin(theta);

              const rotatedX = 50 + (rawX * Math.cos(angleDeg) - rawY * Math.sin(angleDeg));
              const rotatedY = 52 + (rawX * Math.sin(angleDeg) + rawY * Math.cos(angleDeg));

              let pColor = '#FFFFFF';
              if (activeState === 'Determined') pColor = '#FFC72C';
              else if (activeState === 'Gliched') pColor = i % 2 === 0 ? '#00ffff' : '#FF2a85';

              return (
                <circle
                  key={i}
                  cx={rotatedX}
                  cy={rotatedY}
                  r="1.4"
                  fill={pColor}
                  className="animate-pulse"
                  style={{ opacity: 0.8 }}
                />
              );
            })}
          </svg>

          {/* Core watermark */}
          <span className="absolute bottom-2 left-3 text-[9px] font-mono text-slate-700 pointer-events-none uppercase">
            SOL-0.gdd_model_node
          </span>
        </div>

        {/* Custom state trigger row */}
        <div className="mt-5 w-full">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2 text-center select-none">
            Emotional Core Emulator (Toggles SVG Vector Rig)
          </span>
          <div className="grid grid-cols-3 gap-1.5 w-full">
            {(['Idle', 'Reflecting', 'Solving', 'Gliched', 'Determined', 'Celebrating'] as CharacterState[]).map((state) => (
              <button
                key={state}
                onClick={() => setActiveState(state)}
                className={`py-1 rounded border text-[10px] uppercase font-mono transition-all ${
                  activeState === state
                    ? 'bg-slate-800 border-white text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. RIGHT COLUMN: NPC REPOSITORY STUDIO */}
      <div className="lg:col-span-6 flex flex-col justify-between h-full font-sans gap-5">
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
            GDD Appendix B: System NPC Design
          </span>
          <h4 className="text-md font-bold text-white flex items-center gap-2">
            System Subprocess Diagnostics
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
            NPCs are abstract, code-driven entities representing firewalls, logs, or memories. They have a strict visual guidelines designed to distinguish security blockers from interactive helpful caches.
          </p>

          {/* Mini NPC Cards rows */}
          <div className="space-y-3 mt-4">
            {SYSTEM_NPCS.map((npc) => (
              <button
                key={npc.id}
                onClick={() => setSelectedNpc(npc)}
                className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                  selectedNpc.id === npc.id
                    ? `${npc.identityColor} border`
                    : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:bg-slate-950 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {npc.shapeType === 'eye' && <Eye className="w-3.5 h-3.5 text-red-500" />}
                    {npc.shapeType === 'fragment' && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    {npc.shapeType === 'glitch' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    {npc.name}
                  </h5>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {npc.type.substring(0, 15)}...
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal mt-2 line-clamp-2">
                  {npc.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom NPC Anatomy Panel */}
        <div className="bg-slate-950 p-4 border border-slate-800\/80 rounded-xl flex items-start gap-4 text-xs font-sans">
          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 flex-shrink-0 flex items-center justify-center">
            {selectedNpc.shapeType === 'eye' ? (
              /* Drawn security lens */
              <div className="w-9 h-9 border-2 border-red-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-3.5 h-3.5 bg-red-500 rounded-full" />
              </div>
            ) : selectedNpc.shapeType === 'fragment' ? (
              /* Diamond fragment */
              <div className="w-9 h-9 border-2 border-purple-400 transform rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-400" />
              </div>
            ) : (
              /* Corrupted blocks */
              <div className="w-9 h-9 flex flex-wrap gap-1 items-center justify-center animate-bounce">
                <div className="w-2.5 h-2.5 bg-amber-500" />
                <div className="w-2.5 h-2.5 bg-transparent" />
                <div className="w-2.5 h-2.5 bg-amber-500" />
                <div className="w-2.5 h-2.5 bg-amber-500" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Anatomy Schematic</span>
            <h5 className="font-bold text-white text-xs">{selectedNpc.name}</h5>
            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              {selectedNpc.description}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
