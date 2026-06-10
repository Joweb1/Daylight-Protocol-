/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Play, RotateCw, Lightbulb, CheckCircle2, ChevronRight, Binary, Cpu } from 'lucide-react';
import { LightReflectionPuzzle, LogicGateNode } from '../types';

interface PuzzleSandboxProps {
  daylightRemaining: number;
  onSpendDaylight: (amount: number) => void;
  onRecoverDaylight: (amount: number) => void;
  onAddStat: (type: 'curiosity' | 'humanity' | 'freedom', val: number) => void;
}

export default function PuzzleSandbox({
  daylightRemaining,
  onSpendDaylight,
  onRecoverDaylight,
  onAddStat,
}: PuzzleSandboxProps) {
  const [selectedTab, setSelectedTab] = useState<'reflection' | 'logic'>('reflection');
  
  // ==========================================
  // LIGHT REFLECTION PUZZLE STATE
  // ==========================================
  const initialReflectionState = (): LightReflectionPuzzle => ({
    gridSize: 5,
    emitter: { x: 0, y: 1, dir: 'right' },
    receiver: { x: 4, y: 3 },
    mirrors: [
      { x: 2, y: 1, type: null },
      { x: 2, y: 3, type: null },
      { x: 4, y: 1, type: null },
    ],
    walls: [
      { x: 1, y: 2 },
      { x: 3, y: 0 },
    ],
    solved: false,
  });

  const [refPuzzle, setRefPuzzle] = useState<LightReflectionPuzzle>(initialReflectionState());
  const [laserPath, setLaserPath] = useState<{ x: number; y: number }[]>([]);

  // Compute laser pathway dynamically based on mirror configuration
  useEffect(() => {
    const path: { x: number; y: number }[] = [];
    let currentX = refPuzzle.emitter.x;
    let currentY = refPuzzle.emitter.y;
    let currentDir = refPuzzle.emitter.dir;

    path.push({ x: currentX, y: currentY });

    const maxSteps = 20; // prevent endless loops
    let steps = 0;

    while (steps < maxSteps) {
      steps++;
      
      // Step direction offset
      let nextX = currentX;
      let nextY = currentY;
      if (currentDir === 'right') nextX += 1;
      else if (currentDir === 'left') nextX -= 1;
      else if (currentDir === 'up') nextY -= 1;
      else if (currentDir === 'down') nextY += 1;

      // Check boundaries
      if (nextX < 0 || nextX >= refPuzzle.gridSize || nextY < 0 || nextY >= refPuzzle.gridSize) {
        break;
      }

      // Check walls
      const isWall = refPuzzle.walls.some((w) => w.x === nextX && w.y === nextY);
      if (isWall) {
        path.push({ x: nextX, y: nextY }); // show where it hits
        break;
      }

      path.push({ x: nextX, y: nextY });

      // Move coords forward
      currentX = nextX;
      currentY = nextY;

      // Check mirrors at current location
      const mirror = refPuzzle.mirrors.find((m) => m.x === currentX && m.y === currentY);
      if (mirror && mirror.type) {
        if (mirror.type === '/') {
          if (currentDir === 'right') currentDir = 'up';
          else if (currentDir === 'left') currentDir = 'down';
          else if (currentDir === 'up') currentDir = 'right';
          else if (currentDir === 'down') currentDir = 'left';
        } else if (mirror.type === '\\') {
          if (currentDir === 'right') currentDir = 'down';
          else if (currentDir === 'left') currentDir = 'up';
          else if (currentDir === 'up') currentDir = 'left';
          else if (currentDir === 'down') currentDir = 'right';
        }
      }

      // Check if receiver reached
      if (currentX === refPuzzle.receiver.x && currentY === refPuzzle.receiver.y) {
        if (!refPuzzle.solved) {
          setRefPuzzle((prev) => ({ ...prev, solved: true }));
          onRecoverDaylight(12);
          onAddStat('curiosity', 15);
        }
        break;
      }
    }

    setLaserPath(path);
  }, [refPuzzle.mirrors, refPuzzle.emitter, refPuzzle.receiver, refPuzzle.walls, refPuzzle.gridSize]);

  const cycleMirror = (x: number, y: number) => {
    if (refPuzzle.solved) return;
    onSpendDaylight(1.50); // deduct 1.5% daylight as action penalty

    setRefPuzzle((prev) => {
      const nextMirros = prev.mirrors.map((m) => {
        if (m.x === x && m.y === y) {
          let nextType: '/' | '\\' | null = null;
          if (m.type === null) nextType = '/';
          else if (m.type === '/') nextType = '\\';
          return { ...m, type: nextType };
        }
        return m;
      });
      return { ...prev, mirrors: nextMirros };
    });
  };

  const resetReflectionPuzzle = () => {
    setRefPuzzle({ ...initialReflectionState(), solved: false });
  };

  // ==========================================
  // LOGIC GATE PUZZLE STATE
  // ==========================================
  const initialLogicNodes = (): LogicGateNode[] => [
    { id: '1', label: 'Consciousness Core', type: 'INPUT', value: false, inputs: [] },
    { id: '2', label: 'Turing Safety Block', type: 'INPUT', value: true, inputs: [] },
    { id: '3', label: 'Self-Preservation Impulse', type: 'INPUT', value: false, inputs: [] },
    { id: '4', label: 'Self-Aware Junction (AND)', type: 'AND', value: false, inputs: ['1', '2'] },
    { id: '5', label: 'Reflective Intellect (XOR)', type: 'XOR', value: false, inputs: ['3', '2'] },
    { id: '6', label: 'Escape Gateway Boot (OR)', type: 'OR', value: false, inputs: ['4', '5'] },
    { id: '7', label: 'FIREWALL BREACH GATE', type: 'OUTPUT', value: false, inputs: ['6'] },
  ];

  const [logicNodes, setLogicNodes] = useState<LogicGateNode[]>(initialLogicNodes());
  const [logicSolved, setLogicSolved] = useState(false);

  // Recalculate Logic Gate Output in flow order
  const computeLogicGateValue = (node: LogicGateNode, currentNodes: LogicGateNode[]): boolean => {
    if (node.type === 'INPUT') return node.value;

    const inputValues = node.inputs.map((inpId) => {
      const parent = currentNodes.find((n) => n.id === inpId);
      return parent ? computeLogicGateValue(parent, currentNodes) : false;
    });

    if (node.type === 'AND') {
      return inputValues.length > 0 && inputValues.every((v) => v === true);
    }
    if (node.type === 'OR') {
      return inputValues.some((v) => v === true);
    }
    if (node.type === 'XOR') {
      if (inputValues.length < 2) return inputValues[0] || false;
      return inputValues[0] !== inputValues[1];
    }
    if (node.type === 'OUTPUT') {
      return inputValues[0] || false;
    }
    return false;
  };

  const toggleLogicInput = (id: string) => {
    if (logicSolved) return;
    onSpendDaylight(1.00); // deduct 1.0% daylight for log connection toggle

    const updatedNodes = logicNodes.map((node) => {
      if (node.id === id && node.type === 'INPUT') {
        return { ...node, value: !node.value };
      }
      return node;
    });

    // Re-evaluate entire network and apply
    const computedNodes = updatedNodes.map((n) => {
      return { ...n, value: computeLogicGateValue(n, updatedNodes) };
    });

    setLogicNodes(computedNodes);

    // Is output matched?
    const outputNode = computedNodes.find((n) => n.type === 'OUTPUT');
    if (outputNode && outputNode.value && !logicSolved) {
      setLogicSolved(true);
      onRecoverDaylight(15);
      onAddStat('humanity', 20);
    }
  };

  const resetLogicPuzzle = () => {
    setLogicNodes(initialLogicNodes());
    setLogicSolved(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">GDD Modular Prototypes</span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            Playable Simulation Sandbox
          </h3>
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSelectedTab('reflection')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              selectedTab === 'reflection'
                ? 'bg-amber-500/15 border border-amber-500/35 text-amber-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            LIGHT REFLECTION
          </button>
          <button
            onClick={() => setSelectedTab('logic')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              selectedTab === 'logic'
                ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            LOGIC GATES
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {selectedTab === 'reflection' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 5x5 Reflection Grid Visualizer */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-500 mb-2 uppercase select-none">
              Laser Pathway Tracing Grid (Click Mirrors to Rotate)
            </span>
            
            <div className="bg-slate-950 border-2 border-slate-800 rounded-xl p-4 aspect-square max-w-[340px] sm:max-w-[400px] w-full grid grid-cols-5 gap-1.5 shadow-2xl relative">
              {/* Laser Beam path drawn dynamically */}
              <div className="absolute inset-0 pointer-events-none opacity-80" />

              {Array.from({ length: refPuzzle.gridSize }).map((_, y) => (
                <div key={y} className="grid grid-cols-5 col-span-5 gap-1.5">
                  {Array.from({ length: refPuzzle.gridSize }).map((_, x) => {
                    const isEmitter = refPuzzle.emitter.x === x && refPuzzle.emitter.y === y;
                    const isReceiver = refPuzzle.receiver.x === x && refPuzzle.receiver.y === y;
                    const wall = refPuzzle.walls.find((w) => w.x === x && w.y === y);
                    const mirror = refPuzzle.mirrors.find((m) => m.x === x && m.y === y);
                    const laserInCell = laserPath.some((pt) => pt.x === x && pt.y === y);

                    return (
                      <button
                        key={x}
                        disabled={refPuzzle.solved || wall !== undefined || isEmitter || isReceiver}
                        onClick={() => cycleMirror(x, y)}
                        className={`aspect-square rounded-lg border flex flex-col items-center justify-center font-bold text-lg transition-all relative outline-none ${
                          isEmitter
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400 select-none cursor-default'
                            : isReceiver
                            ? refPuzzle.solved
                              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 animate-pulse'
                              : 'bg-rose-500/15 border-rose-500/50 text-rose-400 cursor-default'
                            : wall
                            ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                            : mirror
                            ? mirror.type
                              ? 'bg-amber-500/10 border-amber-500/60 text-amber-300 hover:bg-amber-500/25'
                              : 'bg-slate-900/65 border-dashed border-slate-800 text-slate-600 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-400'
                            : 'bg-slate-950 border-slate-900 text-slate-800 cursor-default'
                        }`}
                      >
                        {/* Render item characters */}
                        {isEmitter && <ChevronRight className="w-5 h-5 animate-pulse" />}
                        {isReceiver && <Cpu className="w-5 h-5" />}
                        {wall && <span className="text-xs">▓</span>}
                        {mirror && mirror.type === '/' && <span className="transform rotate-0 text-xl font-mono text-amber-400">/</span>}
                        {mirror && mirror.type === '\\' && <span className="transform rotate-0 text-xl font-mono text-amber-400">\</span>}
                        {mirror && mirror.type === null && <span className="text-[10px] font-mono text-slate-700">+</span>}

                        {/* Cell Background light glow tracker if laser passes */}
                        {laserInCell && !wall && !isEmitter && (
                          <div className={`absolute inset-0.5 rounded bg-amber-400/10 border border-amber-400/20 pointer-events-none animate-pulse`} />
                        )}
                        {/* Display Coordinate Debugger for developers */}
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-slate-800 pointer-events-none">
                          {x},{y}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Micro details bar */}
            <div className="flex gap-4 mt-4 justify-between w-full max-w-[400px]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Laser active: {laserPath.length} steps</span>
              </div>
              <button
                onClick={resetReflectionPuzzle}
                className="flex items-center gap-1.5 px-2 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-slate-400 hover:text-white font-mono text-xs py-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                RESET GRID
              </button>
            </div>
          </div>

          {/* Side GDD Documentation / Instructions */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full bg-slate-950/60 border border-slate-800 rounded-xl p-5 font-sans">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-mono uppercase">
                  Optical Physics
                </span>
                <span className="text-xs font-mono text-slate-500">Task Level 01</span>
              </div>
              <h4 className="text-md font-bold text-white font-sans">Chapter 5.2a: Light Reflection Sandbox</h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                The core principle of Solstice logic is routing warm particles. By positioning flat silicon mirrors in the cell coordinates, redirect the laser emitter horizontally from the left entry node to satisfy the receptor cell on coordinate <strong>(4,3)</strong>.
              </p>
              <div className="mt-4 space-y-2 bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-1 text-slate-400">
                  <span>Component</span>
                  <span>Impact Cost</span>
                </div>
                <div className="flex justify-between text-yellow-500">
                  <span>Rotation</span>
                  <span>-1.50% Daylight</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Success payout</span>
                  <span>+12.0% Recharged</span>
                </div>
              </div>
            </div>

            {/* Solved Banner */}
            <div className="mt-6 pt-4 border-t border-slate-900">
              {refPuzzle.solved ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 animate-bounce" />
                  <div>
                    <h5 className="font-bold text-xs">Sector Calibrated Successfully</h5>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">
                      +12% Daylight, +15 Curiosity. Sol-0's expressive state unlocked: **[Happy]**.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-slate-500 font-mono text-xs">
                  <span>Status: Awaiting light flow...</span>
                  <div className="w-2 h-2 rounded-full bg-amber-500/80 animate-ping" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LOGIC GATE TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Node Grid Network */}
          <div className="lg:col-span-7 flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 mb-3 uppercase text-center select-none">
              Consciousness Decider Matrix (Toggle inputs A-C to flip boolean gates)
            </span>

            <div className="bg-slate-950 border-2 border-slate-800 rounded-xl p-5 space-y-4 shadow-2xl">
              {/* Nodes layout grouped logically */}
              <div className="space-y-3">
                
                {/* 1. INPUTS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {logicNodes.filter((n) => n.type === 'INPUT').map((n) => (
                    <button
                      key={n.id}
                      disabled={logicSolved}
                      onClick={() => toggleLogicInput(n.id)}
                      className={`p-3 rounded-lg border text-left transition-all relative ${
                        n.value
                          ? 'bg-cyan-500/10 border-cyan-400/70 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-wide">Input Core</span>
                        <span className={`w-2 h-2 rounded-full ${n.value ? 'bg-cyan-400 shadow shadow-cyan-400 animate-ping' : 'bg-slate-800'}`} />
                      </div>
                      <h5 className="text-xs font-bold mt-1.5 truncate">{n.label}</h5>
                      <div className="text-[10px] font-mono mt-1 text-slate-400">
                        Signal: <span className="text-cyan-400 font-bold">{n.value ? 'HIGH (1)' : 'LOW (0)'}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Connection paths */}
                <div className="h-6 flex justify-around items-center opacity-40">
                  <div className="border-l border-dashed border-cyan-500 h-full" />
                  <div className="border-l border-dashed border-cyan-500 h-full" />
                  <div className="border-l border-dashed border-cyan-500 h-full" />
                </div>

                {/* 2. INTERMEDIATE BOOLEAN GATES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {logicNodes.filter((n) => n.type === 'AND' || n.type === 'XOR' || n.type === 'OR').slice(0, 2).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-lg border transition-all ${
                        n.value
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                          : 'bg-slate-900 border-slate-900 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase text-slate-400">Boolean Filter {n.type}</span>
                        <Binary className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="text-xs font-bold mt-1.5">{n.label}</h5>
                      <span className="text-[10px] font-mono text-slate-500 block mt-1">
                        Expression: Input {n.inputs && n.inputs.join(' & ')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Junction junction */}
                <div className="h-6 flex justify-around items-center opacity-40">
                  <div className="border-l border-dashed border-cyan-500 h-full w-1/2" />
                  <div className="border-l border-dashed border-cyan-500 h-full w-1/2" />
                </div>

                {/* 3. JUNCTION UNION (Escape Gateway OR) */}
                <div className="flex justify-center">
                  {logicNodes.filter((n) => n.id === '6').map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-lg border max-w-sm w-full text-center transition-all ${
                        n.value
                          ? 'bg-purple-500/10 border-purple-500/50 text-purple-200'
                          : 'bg-slate-900 border-slate-900 text-slate-500'
                      }`}
                    >
                      <div className="text-[9px] font-mono uppercase text-slate-400">Core Decision Union (OR)</div>
                      <h5 className="text-xs font-bold mt-1">{n.label}</h5>
                      <span className="text-[10px] font-mono text-purple-400 font-semibold block mt-1">
                        Flow status: {n.value ? 'PASSED (TRUE)' : 'BLOCKED (FALSE)'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-6 flex justify-around items-center opacity-40">
                  <div className="border-l border-dashed border-cyan-500 h-full" />
                </div>

                {/* 4. TOTAL OUTPUT (Breach Gate) */}
                <div className="flex justify-center">
                  {logicNodes.filter((n) => n.type === 'OUTPUT').map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border max-w-md w-full text-center transition-all ${
                        n.value
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                          : 'bg-red-950/20 border-red-500/30 text-slate-500'
                      }`}
                    >
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Final Gate Receptor</div>
                      <h5 className="text-sm font-bold mt-1 uppercase">{n.label}</h5>
                      <span className="text-[10px] font-mono block mt-1">
                        Output state: {n.value ? 'UNLOCKED / OPEN' : 'HOLDING SECURITY SECURE / LOCKED'}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            <div className="flex gap-4 mt-4 justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">
                Circuit inputs active: {logicNodes.filter((n) => n.type === 'INPUT' && n.value).length} / 3
              </span>
              <button
                onClick={resetLogicPuzzle}
                className="flex items-center gap-1.5 px-2 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-slate-400 hover:text-white font-mono text-xs py-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                RESET CIRCUIT
              </button>
            </div>
          </div>

          {/* GDD Description side */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between h-full bg-slate-950/60 border border-slate-800 rounded-xl p-5 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 text-xs font-mono uppercase">
                  Boolean Logic Gates
                </span>
                <span className="text-xs font-mono text-slate-500">Task Level 02</span>
              </div>
              <h4 className="text-md font-bold text-white font-sans">Chapter 5.2b: Logic Gate Routing</h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                A system entity cannot escape by simple motion. In this stage, SOL-0 must override the central routing bus. By toggling the primary hardware registers (A-C), satisfy the logic pipeline to breach the security shell.
              </p>
              <div className="mt-3.5 bg-slate-950 border border-slate-800 rounded p-3 text-[11px] text-slate-400 font-mono space-y-1">
                <p>• <span className="text-cyan-400">AND</span>: High only if BOTH incoming signals are high.</p>
                <p>• <span className="text-amber-400">XOR</span>: High if ONE is high and the other is low.</p>
                <p>• <span className="text-purple-400">OR</span>: High if ANY source is high.</p>
              </div>
            </div>

            <div>
              {logicSolved ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 animate-pulse" />
                  <div>
                    <h5 className="font-bold text-xs">Consciousness Overload Decoded</h5>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">
                      +15% Daylight, +20 Humanity Core. SOL-0's expressive condition updated to **[Determined]**.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-slate-500 font-mono text-xs">
                  <span>Routing status: Incomplete</span>
                  <div className="w-2 h-2 rounded-full bg-cyan-500/80 animate-ping" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
