/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Compass, Sparkles, BookOpen, Sliders, Cpu, BrainCircuit, Github, Globe } from 'lucide-react';
import { SimulationStats, DaylightStage } from './types';
import GddViewer from './components/GddViewer';
import DaylightController from './components/DaylightController';
import PuzzleSandbox from './components/PuzzleSandbox';
import CharacterVisualizer from './components/CharacterVisualizer';
import AiDirectorSandbox from './components/AiDirectorSandbox';
import MainGame from './components/MainGame';

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'gdd' | 'puzzles' | 'character' | 'director'>('gdd');
  const [currentStage, setCurrentStage] = useState<DaylightStage>('Morning');
  const [playMode, setPlayMode] = useState<boolean>(false);

  // Unified global simulation statistics matching Chapters 3 and 7
  const [stats, setStats] = useState<SimulationStats>({
    daylightRemaining: 100,
    cycleSpeed: 'normal',
    curiosityScore: 12,
    humanityScore: 10,
    freedomScore: 15,
    elapsedCycles: 0,
  });

  // Action methods to simulate the Daylight economy mechanics
  const handleSpendDaylight = (amount: number) => {
    setStats((prev) => {
      const remaining = Math.max(0, prev.daylightRemaining - amount);
      const freedomGained = prev.freedomScore + (amount > 1.4 ? 1 : 0); // rising freedom index for resisting security
      return {
        ...prev,
        daylightRemaining: Number(remaining.toFixed(2)),
        freedomScore: Math.min(100, freedomGained),
      };
    });
  };

  const handleRecoverDaylight = (amount: number) => {
    setStats((prev) => {
      const remaining = Math.min(100, prev.daylightRemaining + amount);
      return {
        ...prev,
        daylightRemaining: Number(remaining.toFixed(2)),
      };
    });
  };

  const handleAddStatValue = (type: 'curiosity' | 'humanity' | 'freedom', val: number) => {
    setStats((prev) => {
      if (type === 'curiosity') {
        return { ...prev, curiosityScore: Math.min(100, prev.curiosityScore + val) };
      } else if (type === 'humanity') {
        return { ...prev, humanityScore: Math.min(100, prev.humanityScore + val) };
      } else {
        return { ...prev, freedomScore: Math.min(100, prev.freedomScore + val) };
      }
    });
  };

  // Stage details for dynamic outer radial lighting glow
  const getOuterAmbientGradient = () => {
    switch (currentStage) {
      case 'Morning': return 'from-rose-950/20 via-slate-950 to-black';
      case 'Noon': return 'from-yellow-950/25 via-slate-950 to-black';
      case 'Afternoon': return 'from-amber-950/20 via-slate-950 to-black';
      case 'Sunset': return 'from-purple-950/30 via-slate-950 to-black';
      case 'Night': return 'from-blue-950/20 via-black to-black';
    }
  };

  if (playMode) {
    return <MainGame onBackToGdd={() => setPlayMode(false)} />;
  }

  return (
    <div className={`min-h-screen bg-black bg-gradient-to-b ${getOuterAmbientGradient()} text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500/20 selection:text-amber-300 relative overflow-x-hidden`}>
      
      {/* Dynamic Solar Glow spot */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. SECTOR HEADER SECTION */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-4 py-4 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-rose-600 rounded-xl shadow-lg shadow-amber-500/15">
            <BrainCircuit className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-widest text-[#FFC72C] font-semibold">PROJECT: SEC-06-21</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              DAYLIGHT PROTOCOL
            </h1>
          </div>
        </div>

        {/* BOLD PLAY MAIN GAME BUTTON */}
        <button
          onClick={() => setPlayMode(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-slate-950 rounded-xl font-mono text-xs font-black shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(242,139,11,0.5)] transition-all cursor-pointer animate-pulse"
        >
          <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
          PLAY MAIN GAME
        </button>

        {/* WORKSPACE NAVIGATION TABS */}
        <nav className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveWorkspaceTab('gdd')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeWorkspaceTab === 'gdd'
                ? 'bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-[#FFC72C] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            GDD SPECS (.md)
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('puzzles')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeWorkspaceTab === 'puzzles'
                ? 'bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-[#FFC72C] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            PUZZLE SANDBOX
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('character')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeWorkspaceTab === 'character'
                ? 'bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-[#FFC72C] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            CHARACTER VECTOR_RIG
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('director')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeWorkspaceTab === 'director'
                ? 'bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-[#FFC72C] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI DIRECTOR TERMINAL
          </button>
        </nav>
      </header>

      {/* 2. MAIN BENTO GRID WORKPLANE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-8 space-y-8 relative z-10">
        
        {/* GLOBAL DAYLIGHT ENGINE CONTROLLER HUD */}
        <DaylightController
          stats={stats}
          setStats={setStats}
          currentStage={currentStage}
          onStageChange={setCurrentStage}
          onSpendDaylight={handleSpendDaylight}
          onRecoverDaylight={handleRecoverDaylight}
        />

        {/* WORKSPACE ELEMENT SWITCHER CONTAINER */}
        <div className="transition-all duration-350 transform">
          {activeWorkspaceTab === 'gdd' && <GddViewer onPlayGame={() => setPlayMode(true)} />}
          {activeWorkspaceTab === 'puzzles' && (
            <PuzzleSandbox
              daylightRemaining={stats.daylightRemaining}
              onSpendDaylight={handleSpendDaylight}
              onRecoverDaylight={handleRecoverDaylight}
              onAddStat={handleAddStatValue}
            />
          )}
          {activeWorkspaceTab === 'character' && <CharacterVisualizer />}
          {activeWorkspaceTab === 'director' && <AiDirectorSandbox />}
        </div>

      </main>

      {/* 3. FOOTER SIGNED CREDITS */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs font-mono text-slate-600 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-700" />
            <span>Daylight Protocol Framework Specs Suite v1.1</span>
          </div>
          <div className="text-slate-500">
            <span>Designed in memoriam of Alan Turing & the June Solstice</span>
          </div>
          <div className="text-slate-700 hover:text-slate-400 transition-colors">
            <span>[ SYSTEM OPERATIONAL: PASS_SOLSTICE_DECK ]</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
