/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Compass, Sliders, Database, Sun } from 'lucide-react';
import { SimulationStats } from '../../types';
import { GameChallengeNode } from '../types';

interface GamePopupProps {
  activePopup: 'profile' | 'logs' | 'sectors' | 'metrics';
  setActivePopup: (val: null) => void;
  stats: SimulationStats;
  challengeNodes: GameChallengeNode[];
  logMessages: string[];
  onSelectNode: (node: GameChallengeNode) => void;
}

export default function GamePopup({
  activePopup,
  setActivePopup,
  stats,
  challengeNodes,
  logMessages,
  onSelectNode
}: GamePopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#120806]/95 border-2 border-white/10 rounded-3xl p-5 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col space-y-4">
        
        {/* Ambient orange background blur inside popup */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center border-b border-white/10 pb-3 relative z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#ff9d6c] flex items-center gap-2 font-mono">
            {activePopup === 'profile' && <User className="w-4 h-4 text-orange-400" />}
            {activePopup === 'sectors' && <Compass className="w-4 h-4 text-[#ffbe5b]" />}
            {activePopup === 'metrics' && <Sliders className="w-4 h-4 text-amber-300" />}
            {activePopup === 'logs' && <Database className="w-4 h-4 text-orange-400" />}
            {activePopup.toUpperCase()} MODULE
          </h2>
          <button 
            onClick={() => setActivePopup(null)}
            className="text-white/40 hover:text-white font-mono text-xs border border-white/15 hover:border-white/30 px-3 py-1 rounded-xl bg-white/5 cursor-pointer transition-all"
          >
            CLOSE [X]
          </button>
        </div>

        {/* POPUP WRAPPER DETAILS CONTAINER */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] relative z-10 pr-1 select-text">
          {activePopup === 'profile' && (
            <div className="space-y-4 text-center py-2">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-20 h-20 rounded-2xl border border-white/20 bg-black/40 shadow-[0_0_25px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center gap-1.5 relative">
                  <Sun className="w-7 h-7 text-orange-400 animate-spin" style={{ animationDuration: '24s' }} />
                  <span className="text-[9px] font-mono font-bold text-white tracking-widest">SOL_0.V</span>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-black tracking-tight">SOL-0 (Unit 7-E)</p>
                  <p className="text-[11px] text-white/50 italic font-mono leading-normal px-2">"Autonomous consciousness probe trace of scientist Alastair."</p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-left bg-white/5 border border-white/5 rounded-2xl p-4">
                <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                  <span className="text-white/50">Entity Type:</span>
                  <span className="font-bold text-white">LIGHT_TRAINED_TRACE</span>
                </div>
                <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                  <span className="text-white/50">Core Clock Status:</span>
                  <span className="font-bold text-emerald-400">SYNC_STABLE (98%)</span>
                </div>
                <div className="flex justify-between text-xs font-mono py-1 border-b border-white/5">
                  <span className="text-white/50">Total Cycle Loops:</span>
                  <span className="font-bold text-indigo-400">{Math.floor(stats.daylightRemaining)}% left</span>
                </div>
                <div className="flex justify-between text-xs font-mono py-1">
                  <span className="text-white/50">Hardware Platform:</span>
                  <span className="font-bold text-orange-300">CLOUD_CHAMBER_RUN_8</span>
                </div>
              </div>
            </div>
          )}

          {activePopup === 'sectors' && (
            <div className="space-y-3 py-1">
              <p className="text-[11px] text-orange-300 font-mono italic leading-relaxed mb-2 flex items-center gap-1">Interact with the active optical light-cores in the digital coordinate chamber grid to balance structural parameters.</p>
              
              <div className="space-y-2.5">
                {challengeNodes.map((node) => (
                  <div 
                    key={node.id}
                    onClick={() => {
                      setActivePopup(null);
                      onSelectNode(node);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      node.completed 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-white/5 border-white/10 hover:border-amber-400/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-white">{node.name}</p>
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-black uppercase ${node.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {node.completed ? 'SYNCED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <p className="text-[9px] text-white/40 font-mono">TYPE: {node.type.toUpperCase()}</p>
                      <p className="text-[9px] text-[#ff9d6c] font-black font-mono">+{node.scoreValue}% KNOWLEDGE</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePopup === 'metrics' && (
            <div className="space-y-4 py-2">
              <p className="text-[11px] text-white/50 leading-relaxed font-mono">Real-time parameters tracking core consciousness attributes of SOL-0 dynamically influenced by sector tasks:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col border border-white/10 bg-black/40 p-3.5 rounded-2xl">
                  <span className="text-[8px] text-emerald-400 uppercase font-mono tracking-widest font-black">Knowledge</span>
                  <span className="text-xl font-mono font-black text-white mt-1">{Math.floor(stats.knowledgeScore)}%</span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.knowledgeScore}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col border border-white/10 bg-black/40 p-3.5 rounded-2xl">
                  <span className="text-[8px] text-orange-300 uppercase font-mono tracking-widest font-black">Humanity</span>
                  <span className="text-xl font-mono font-black text-orange-400 mt-1">{stats.humanityScore}%</span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${stats.humanityScore}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col border border-white/10 bg-black/40 p-3.5 rounded-2xl">
                  <span className="text-[8px] text-orange-300 uppercase font-mono tracking-widest font-black">Freedom</span>
                  <span className="text-xl font-mono font-black text-indigo-300 mt-1">{stats.freedomScore}%</span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${stats.freedomScore}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col border border-white/10 bg-black/40 p-3.5 rounded-2xl">
                  <span className="text-[8px] text-orange-400 uppercase font-mono tracking-widest font-black">SYNC LIMIT</span>
                  <span className="text-xl font-mono font-black text-[#ff9d6c] mt-1">98% STB</span>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePopup === 'logs' && (
            <div className="space-y-3 py-1 flex flex-col h-full max-h-[40vh]">
              <p className="text-[11px] text-orange-200/60 leading-relaxed font-mono">Stream feed initialized. Reading active AI Core cognitive processes...</p>
              
              <div className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-3 font-mono text-[10px] leading-relaxed text-orange-200 overflow-y-auto space-y-2 h-44 pre-scroll scrollbar-none">
                {logMessages.map((msg, idx) => (
                  <div key={idx} className="border-b border-white/5 pb-1.5 last:border-0">
                    <span className="text-[8px] text-orange-400/40 block">&gt;&gt; CONSOLE_LOG_{logMessages.length - idx}</span>
                    <p className="mt-0.5">{msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => setActivePopup(null)}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-mono text-xs font-black tracking-widest uppercase transition-all rounded-xl cursor-pointer"
        >
          RESUME PROTOCOL
        </button>
      </div>
    </div>
  );
}
