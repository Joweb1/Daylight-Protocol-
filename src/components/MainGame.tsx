/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Compass, 
  Sparkles, 
  Sliders, 
  Cpu, 
  Sun, 
  RotateCcw, 
  Home, 
  Database,
  BrainCircuit,
  User,
  Volume2,
  VolumeX,
  Zap,
  BookOpen
} from 'lucide-react';

import { DaylightStage } from '../types';
import { ALL_CHALLENGE_TEMPLATES, KNOWLEDGE_CAP, ENDINGS } from '../game/constants';
import { GameChallengeNode, ActiveMiniPuzzle, MirrorData } from '../game/types';
import { generatePuzzleBlueprint, realizeBlueprint, getRandomNonOverlappingPosition } from '../game/utils';
import { renderGame } from '../game/renderer';

import MiniPuzzle from '../game/components/MiniPuzzle';
import GamePopup from '../game/components/GamePopup';

import { useGameSession } from '../game/hooks/useGameSession';
import { useGameAudio } from '../game/hooks/useGameAudio';
import { useGameParticles } from '../game/hooks/useGameParticles';
import { useGameInput } from '../game/hooks/useGameInput';
import { useGamePhysics } from '../game/hooks/useGamePhysics';
import { useGameEntities } from '../game/hooks/useGameEntities';

interface MainGameProps {
  onBackToGdd: () => void;
}

export default function MainGame({ onBackToGdd }: MainGameProps) {
  // 1. Core Session & Stats
  const {
    stats,
    setStats,
    statsRef,
    currentStage,
    setCurrentStage,
    logMessages,
    addLog,
    modifyScore,
    handleSpend,
    handleRecover,
    handleClaimKnowledge
  } = useGameSession();

  // 2. Audio Engine
  const {
    initAudio,
    triggerChime,
    playSynthesizerDrone,
    stopDroneAndChords
  } = useGameAudio();

  // 3. UI State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [activeDialogue, setActiveDialogue] = useState<{ speaker: string; text: string; actionText?: string } | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<ActiveMiniPuzzle | null>(null);
  const [actionNotify, setActionNotify] = useState<string | null>(null);
  const [activeInviteNode, setActiveInviteNode] = useState<GameChallengeNode | null>(null);
  const [activePopup, setActivePopup] = useState<'profile' | 'logs' | 'sectors' | 'metrics' | null>(null);

  // 4. Refs & Hooks
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const joystickThumbRef = useRef<HTMLDivElement | null>(null);
  const frameCountRef = useRef<number>(0);

  const { particlesRef, spawnEnergyBursts, updateParticles } = useGameParticles();
  const { npcsRef, challengeNodesRef, updateNpcs } = useGameEntities();
  const { playerRef, updatePhysics } = useGamePhysics();

  // ENDING LOGIC
  const [showEnding, setShowEnding] = useState<boolean>(false);
  useEffect(() => {
    if (stats.daylightRemaining <= 0 && !showEnding) {
      setShowEnding(true);
      setIsPlaying(false);
      triggerChime(110, 55, 2.0, isAudioMuted);
    }
  }, [stats.daylightRemaining, showEnding, isAudioMuted, triggerChime]);

  const currentEnding = useMemo(() => {
    const k = (stats.knowledgeScore / KNOWLEDGE_CAP) * 100;
    if (k < 50) return ENDINGS.FAILURE;
    if (k <= 60) return ENDINGS.FRAGMENTED;
    if (k <= 70) return ENDINGS.OBSERVER;
    if (k <= 80) return ENDINGS.LEGACY;
    if (k <= 90) return ENDINGS.TRANSCENDENCE;
    return ENDINGS.ESCAPE;
  }, [stats.knowledgeScore]);

  // STAGE-BASED BACKGROUND COLORS
  const stageTheme = useMemo(() => {
    switch (currentStage) {
      case 'Morning':
        return {
          gradient: 'from-[#ff9a62] via-[#ff6060] to-[#5a36da]',
          ambient1: 'bg-amber-500/10',
          ambient2: 'bg-indigo-600/15',
          accent: 'text-rose-300'
        };
      case 'Noon':
        return {
          gradient: 'from-[#ffd93d] via-[#ff8400] to-[#ff3d00]',
          ambient1: 'bg-yellow-400/20',
          ambient2: 'bg-orange-500/10',
          accent: 'text-yellow-200'
        };
      case 'Afternoon':
        return {
          gradient: 'from-[#ff9d6c] via-[#e65c00] to-[#f9d423]',
          ambient1: 'bg-orange-500/15',
          ambient2: 'bg-amber-400/10',
          accent: 'text-orange-200'
        };
      case 'Sunset':
        return {
          gradient: 'from-[#8e2de2] via-[#4a00e0] to-[#ff0099]',
          ambient1: 'bg-purple-600/20',
          ambient2: 'bg-fuchsia-500/15',
          accent: 'text-purple-300'
        };
      case 'Night':
        return {
          gradient: 'from-[#0f0c29] via-[#302b63] to-[#24243e]',
          ambient1: 'bg-blue-900/30',
          ambient2: 'bg-cyan-900/20',
          accent: 'text-cyan-400'
        };
      default:
        return {
          gradient: 'from-[#ff9a62] via-[#ff6060] to-[#5a36da]',
          ambient1: 'bg-amber-500/10',
          ambient2: 'bg-indigo-600/15',
          accent: 'text-orange-300'
        };
    }
  }, [currentStage]);

  // Initialize first challenge if empty
  useEffect(() => {
    if (challengeNodesRef.current.length === 0) {
      const pos = getRandomNonOverlappingPosition([], npcsRef.current, playerRef.current);
      challengeNodesRef.current = [{ ...ALL_CHALLENGE_TEMPLATES[0], x: pos.x, y: pos.y }];
    }
  }, []);

  // STAGE PROGRESSION SIDE EFFECTS
  useEffect(() => {
    const energy = stats.daylightRemaining;
    let nextStage: DaylightStage = 'Afternoon';
    if (energy > 80) nextStage = 'Morning';
    else if (energy > 60) nextStage = 'Noon';
    else if (energy > 35) nextStage = 'Afternoon';
    else if (energy > 12) nextStage = 'Sunset';
    else nextStage = 'Night';

    if (nextStage !== currentStage) {
      setCurrentStage(nextStage);
      addLog(`>> SIM_STAGE_CHANGED :: ${nextStage.toUpperCase()} CALIBRATION`);
      triggerChime(220, 440, 1.2, isAudioMuted);
    }
  }, [stats.daylightRemaining, currentStage, setCurrentStage, addLog, triggerChime, isAudioMuted]);

  // 5. Interaction Handlers
  const handleInteract = useCallback(() => {
    const player = playerRef.current;
    
    // Check nodes
    const nearNode = challengeNodesRef.current.find(node => Math.hypot(player.x - node.x, player.y - node.y) < 85);
    if (nearNode) {
      if (nearNode.completed) {
        addLog(`>> LOG_TERMINAL :: Core node ${nearNode.name} is already activated`);
        setActiveDialogue({ speaker: nearNode.name, text: "SECURE CHANNEL SYNCED. CPU firewall bypassed. Energy flow stable." });
      } else {
        setActiveInviteNode(nearNode);
        triggerChime(400, 500, 0.25, isAudioMuted);
      }
      return;
    }

    // Check NPCs
    const nearNPC = npcsRef.current.find(npc => Math.hypot(player.x - npc.x, player.y - npc.y) < npc.interactionRadius);
    if (nearNPC) {
      const dial = nearNPC.dialogue[nearNPC.activeDialogueIndex];
      setActiveDialogue({
        speaker: nearNPC.name,
        text: dial,
        actionText: nearNPC.id === 'npc-lux' ? 'Absorb Memory (+50 Knowledge)' : undefined
      });
      player.eyeExpression = 'Reflecting';
      triggerChime(330, 440, 0.3, isAudioMuted);
      nearNPC.activeDialogueIndex = (nearNPC.activeDialogueIndex + 1) % nearNPC.dialogue.length;
      modifyScore('humanity', 5);
      return;
    }

    setActionNotify("Nothing nearby. Walk close to glowing crystals.");
    setTimeout(() => setActionNotify(null), 2500);
  }, [addLog, modifyScore, triggerChime, isAudioMuted, npcsRef, challengeNodesRef, playerRef]);

  const { keysPressed, joystickRef, handleJoystickStart, bindCanvasInteraction } = useGameInput(handleInteract);

  // Bind mouse/touch canvas movement
  useEffect(() => {
    if (canvasRef.current) {
      return bindCanvasInteraction(canvasRef.current, playerRef);
    }
  }, [bindCanvasInteraction]);

  const handleAcceptChallenge = async (node: GameChallengeNode) => {
    setActiveInviteNode(null);
    const knowledgeLevel = (stats.knowledgeScore / KNOWLEDGE_CAP) * 100;
    
    if (node.type === 'reflection') {
      const knowledgeLevel = (stats.knowledgeScore / KNOWLEDGE_CAP) * 100;
      
      // STAGE 1: AI ORCHESTRATOR (Designing the blueprint via Gemini API)
      const blueprint = await generatePuzzleBlueprint(knowledgeLevel);
      
      const viewBoxSize = blueprint.room_size === 'Large' ? 600 : 400;

      // STAGE 2: PHYSICS REALIZER (Converting blueprint to coordinates)
      const layout = realizeBlueprint(blueprint, viewBoxSize);

      const goalTypes: ('door' | 'meat' | 'fish' | 'pot')[] = ['door', 'meat', 'fish', 'pot'];
      const targetType = goalTypes[Math.floor(Math.random() * goalTypes.length)];

      setActivePuzzle({
        nodeId: node.id,
        type: 'reflection',
        targetType,
        sunPos: layout.sunPos,
        goalPos: layout.goalPos,
        mirrors: layout.mirrors,
        solved: false,
        viewBoxSize
      });
      
      setActiveDialogue({ 
        speaker: node.name, 
        text: `[ORCHESTRATOR_LINK_ESTABLISHED] Blueprint: ${blueprint.difficulty} | Topology: ${blueprint.topology}. Sector calibration initialized.` 
      });
    } else {
      setActivePuzzle({
        nodeId: node.id, type: 'logic', targetType: 'door', 
        sunPos: {x:0, y:0}, goalPos: {x:0, y:0}, mirrors: [], solved: false, viewBoxSize: 400
      });
    }
    triggerChime(150, 600, 0.5, isAudioMuted);
    playerRef.current.eyeExpression = 'Solving';
  };

  const handleUpdatePuzzle = (nextPuzzle: ActiveMiniPuzzle) => {
    setActivePuzzle(nextPuzzle);
  };

  const handleSkipChallenge = (node: GameChallengeNode) => {
    const currentlyVisibleIds = challengeNodesRef.current.map(n => n.id);
    const nextTemplate = ALL_CHALLENGE_TEMPLATES.find(t => !currentlyVisibleIds.includes(t.id));
    if (nextTemplate && challengeNodesRef.current.length < 5) {
      const pos = getRandomNonOverlappingPosition(challengeNodesRef.current, npcsRef.current, playerRef.current);
      challengeNodesRef.current = [...challengeNodesRef.current, { ...nextTemplate, x: pos.x, y: pos.y }];
      addLog(`>> NEW_CHALLENGE_SPAWNED :: '${nextTemplate.name}' appeared in the chamber!`);
      spawnEnergyBursts(pos.x, pos.y, '#f59e0b', 12);
    }
    setActiveInviteNode(null);
    triggerChime(300, 200, 0.2, isAudioMuted);
  };

  const handleClaimKnowledgeAction = () => {
    if (!activePuzzle) return;

    const solvedNodeId = activePuzzle.nodeId;
    const solvedNode = challengeNodesRef.current.find(n => n.id === solvedNodeId);
    const scoreValue = solvedNode ? solvedNode.scoreValue : 20;

    handleClaimKnowledge(scoreValue);
    modifyScore('freedom', 10);
    
    challengeNodesRef.current = challengeNodesRef.current.filter(n => n.id !== solvedNodeId);
    
    const currentlyVisibleIds = challengeNodesRef.current.map(n => n.id);
    let nextTemplate = ALL_CHALLENGE_TEMPLATES.find(t => !currentlyVisibleIds.includes(t.id)) || ALL_CHALLENGE_TEMPLATES[Math.floor(Math.random() * ALL_CHALLENGE_TEMPLATES.length)];
    
    const pos = getRandomNonOverlappingPosition(challengeNodesRef.current, npcsRef.current, playerRef.current);
    const spawnedChallenge: GameChallengeNode = { 
      ...nextTemplate, 
      id: `${nextTemplate.id}-v${Date.now()}`, 
      completed: false, 
      scoreValue: nextTemplate.scoreValue + 5,
      x: pos.x,
      y: pos.y
    };
    
    if (challengeNodesRef.current.length < 5) {
      challengeNodesRef.current = [...challengeNodesRef.current, spawnedChallenge];
      addLog(`>> KNOWLEDGE_SYNTHESIS :: Smashed challenge! Next: '${spawnedChallenge.name}'`);
      spawnEnergyBursts(spawnedChallenge.x, spawnedChallenge.y, '#10b981', 30);
    }

    spawnEnergyBursts(playerRef.current.x, playerRef.current.y, '#10b981', 40);
    
    setActiveDialogue(null);
    setActivePuzzle(null);
    playerRef.current.eyeExpression = 'Idle';
    triggerChime(880, 1760, 0.5, isAudioMuted);
  };

  const handleDialogueAction = () => {
    if (activeDialogue?.speaker === 'Lux-01') {
      handleClaimKnowledge(50);
      modifyScore('freedom', 12);
      spawnEnergyBursts(playerRef.current.x, playerRef.current.y, '#4af3ff', 15);
      triggerChime(600, 1200, 0.6, isAudioMuted);
      setActiveDialogue(null);
    }
  };

  // 6. Audio Sync
  useEffect(() => {
    if (!isAudioMuted && isPlaying) {
      initAudio();
      playSynthesizerDrone(currentStage, isAudioMuted);
    } else {
      stopDroneAndChords();
    }
  }, [isAudioMuted, currentStage, isPlaying, initAudio, playSynthesizerDrone, stopDroneAndChords]);

  // 7. Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1000;
    canvas.height = 1000;

    let frameId: number;
    const gameLoop = () => {
      if (isPlaying) {
        if (activePopup === null) {
          const decayRate = activePuzzle ? 0.00833 : 0.005;
          updatePhysics(keysPressed.current, joystickRef.current, canvas.width, canvas.height, handleSpend, spawnEnergyBursts);
          updateNpcs();
          updateParticles();
          handleSpend(decayRate);
        }

        if (joystickThumbRef.current && joystickRef.current.active) {
          const dx = joystickRef.current.curX - joystickRef.current.startX;
          const dy = joystickRef.current.curY - joystickRef.current.startY;
          const dist = Math.hypot(dx, dy);
          const maxRadius = 30;
          const angle = Math.atan2(dy, dx);
          const tx = Math.cos(angle) * Math.min(dist, maxRadius);
          const ty = Math.sin(angle) * Math.min(dist, maxRadius);
          joystickThumbRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
        } else if (joystickThumbRef.current) {
          joystickThumbRef.current.style.transform = 'translate(0px, 0px)';
        }
      }

      renderGame(ctx, canvas, currentStage, statsRef.current, playerRef.current, npcsRef.current, challengeNodesRef.current, particlesRef.current, activePopup);
      
      frameCountRef.current++;
      if (frameCountRef.current % 15 === 0) setStats({ ...statsRef.current });

      frameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, currentStage, activePopup, activePuzzle, updatePhysics, updateNpcs, updateParticles, handleSpend, spawnEnergyBursts, setStats]);

  return (
    <div className="min-h-screen bg-[#100705] text-white flex flex-col font-sans overflow-hidden relative selection:bg-orange-500/20 selection:text-orange-300 transition-colors duration-1000">
      
      {/* DYNAMIC BACKGROUND EFFECTS BASED ON STAGE */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stageTheme.gradient} opacity-20 pointer-events-none transition-all duration-1000`}></div>
      <div className={`absolute top-[-100px] left-[-100px] w-[500px] h-[500px] ${stageTheme.ambient1} blur-[120px] rounded-full pointer-events-none transition-all duration-1000`}></div>
      <div className={`absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] ${stageTheme.ambient2} blur-[150px] rounded-full pointer-events-none transition-all duration-1000`}></div>

      {/* UI CONTAINER */}
      <div className="relative z-10 w-full flex-1 p-4 md:p-8 flex flex-col space-y-6 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex-shrink-0 flex flex-col lg:flex-row justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 md:p-4 gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-br from-[#ff9d6c] to-[#ff6b6b] rounded-xl shadow-[0_0_15px_rgba(255,157,108,0.3)]`}>
              <BrainCircuit className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[9px] uppercase font-mono tracking-widest ${stageTheme.accent} font-black`}>SYSTEM_CHAMBER_DECK -- ACTIVE</span>
              <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">DAYLIGHT PROTOCOL</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {(['profile', 'sectors', 'metrics', 'logs'] as const).map(p => (
              <button 
                key={p} 
                onClick={() => { setActivePopup(p); triggerChime(440, 550, 0.2, isAudioMuted); }} 
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer ${activePopup === p ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
              >
                {p === 'profile' && <User className="w-3.5 h-3.5" />}
                {p === 'sectors' && <Compass className="w-3.5 h-3.5" />}
                {p === 'metrics' && <Sliders className="w-3.5 h-3.5" />}
                {p === 'logs' && <Database className="w-3.5 h-3.5" />}
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className={`text-[8px] uppercase tracking-widest ${stageTheme.accent} font-bold`}>SOLSTICE CALIB</span>
              <span className="text-xs font-black tracking-tight">{currentStage.toUpperCase()}</span>
            </div>
            
            {/* DUAL METERS: DAYLIGHT & KNOWLEDGE */}
            <div className="flex gap-2">
              {/* DAYLIGHT TIMER */}
              <div className="w-32 sm:w-36 h-9 bg-black/45 rounded-xl border border-white/15 flex items-center px-3 relative overflow-hidden shadow-inner">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500 to-orange-600 opacity-60 transition-all duration-300" style={{ width: `${stats.daylightRemaining}%` }}></div>
                <div className="relative flex justify-between w-full text-[9px] font-black z-10 font-mono">
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-200 animate-pulse" /> TIME</span>
                  <span className="text-[#ffed90]">{Math.floor(stats.daylightRemaining)}%</span>
                </div>
              </div>

              {/* KNOWLEDGE SCORE */}
              <div className="w-32 sm:w-36 h-9 bg-black/45 rounded-xl border border-white/15 flex items-center px-3 relative overflow-hidden shadow-inner">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-emerald-600 opacity-60 transition-all duration-500" style={{ width: `${(stats.knowledgeScore / KNOWLEDGE_CAP) * 100}%` }}></div>
                <div className="relative flex justify-between w-full text-[9px] font-black z-10 font-mono text-emerald-100">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> KNOWLEDGE</span>
                  <span>{Math.floor(stats.knowledgeScore)}</span>
                </div>
              </div>
            </div>

            <button onClick={() => { setIsAudioMuted(!isAudioMuted); triggerChime(500, 600, 0.1, isAudioMuted); }} className="p-2 sm:p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-colors">
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#ffbe5b]" />}
            </button>
            <button onClick={onBackToGdd} className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white/15 hover:bg-white/20 border border-white/15 rounded-xl text-[10px] font-mono font-black tracking-wider text-orange-200 cursor-pointer transition-all">
              <Home className="w-3.5 h-3.5" /> SPECS
            </button>
          </div>
        </header>

        {/* MAIN GAMEPLAY VIEWPORT */}
        <main className="flex-1 flex flex-col items-center justify-center my-2 relative overflow-hidden min-h-0">
          <div className={`absolute top-2 left-6 z-20 px-3 py-1 bg-black/80 rounded-full border border-white/10 text-[9px] font-mono tracking-widest ${stageTheme.accent} transition-colors duration-1000`}>
            SIM_CHAMBER // SECTOR_8_ECHO_GRID
          </div>

          <div className="relative h-full max-h-[calc(100vh-230px)] md:max-h-[calc(100vh-220px)] aspect-square bg-black rounded-3xl border border-white/15 p-1 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-center items-center">
             <canvas ref={canvasRef} className="w-full h-full rounded-2xl cursor-crosshair block" />

            {/* CHALLENGE ACCEPT POPUP */}
            {activeInviteNode && (
              <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#120806]/95 border-2 border-orange-500/40 rounded-3xl p-6 w-full max-w-md flex flex-col space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></div>
                    <span className="text-[10px] font-mono tracking-widest text-orange-400 font-black uppercase">CHALLENGE DETECTED: {activeInviteNode.name}</span>
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">{activeInviteNode.name}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#150a06]/85 border border-amber-900/40 p-4 rounded-xl">{activeInviteNode.details}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => handleSkipChallenge(activeInviteNode)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold text-slate-300 hover:bg-white/10 transition-all active:scale-95">SKIP</button>
                    <button onClick={() => handleAcceptChallenge(activeInviteNode)} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-xs font-mono font-black text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all active:scale-95">ACCEPT</button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION NOTIFY */}
            {actionNotify && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/95 text-amber-200 border border-amber-400/40 text-xs font-mono px-5 py-2.5 rounded-xl z-30 shadow-2xl">{actionNotify}</div>}

            {/* DIALOGUE & PUZZLE OVERLAY */}
            {activeDialogue && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#120806]/95 border-2 border-orange-500/30 rounded-3xl p-5 w-full max-w-md flex flex-col space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.95)]">
                  <div className="flex justify-between items-start border-b border-white/10 pb-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#ffce65] font-extrabold">&gt;&gt; CONNECTED_BEING: {activeDialogue.speaker.toUpperCase()}</span>
                    <button onClick={() => { setActiveDialogue(null); setActivePuzzle(null); playerRef.current.eyeExpression = 'Idle'; }} className="text-white/40 font-mono text-[9px] border border-white/10 hover:border-white/30 px-2 py-0.5 rounded cursor-pointer transition-all">DISCONNECT [X]</button>
                  </div>
                  <p className="text-xs text-slate-100 font-mono leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">{activeDialogue.text}</p>
                
                {activePuzzle && (
                  <MiniPuzzle 
                    activePuzzle={activePuzzle} 
                    handleUpdatePuzzle={handleUpdatePuzzle} 
                    onClaimKnowledge={handleClaimKnowledgeAction}
                  />
                )}
                
                {activeDialogue.actionText && (
                  <button onClick={handleDialogueAction} className="w-full bg-gradient-to-r from-teal-500/25 to-[#4af3ff]/20 hover:from-teal-500/40 hover:to-[#4af3ff]/35 border border-[#4af3ff]/30 text-[#4af3ff] text-xs font-bold py-2.5 rounded-xl transition-all font-mono cursor-pointer"> 
                    {activeDialogue.actionText} 
                  </button>
                )}
                </div>
              </div>
            )}
          </div>

          {/* JOYSTICK */}
          <div onMouseDown={handleJoystickStart} onTouchStart={handleJoystickStart} className="fixed bottom-6 right-6 w-24 h-24 rounded-full bg-black/60 border-2 border-orange-500/30 hover:border-orange-500/60 backdrop-blur-lg flex items-center justify-center z-40 shadow-[0_0_20px_rgba(245,158,11,0.25)] select-none cursor-pointer transition-all active:scale-95">
            <div ref={joystickThumbRef} className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-[#ff9d6c] border border-white/30 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center transition-transform duration-75 ease-out">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
        </main>

        {/* FOOTER DAY CHRONOLOGY MILESTONES BAR */}
        <footer className="flex-shrink-0 flex flex-col md:flex-row items-center justify-between px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl gap-3">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] text-orange-300 font-bold uppercase tracking-wider font-mono">Morning (80-100%)</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-white transition-all" style={{ width: stats.daylightRemaining > 80 ? `${(stats.daylightRemaining - 80) * 5}%` : '0%' }}></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-orange-300 font-bold uppercase tracking-wider font-mono">Noon (60-80%)</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-orange-300 transition-all" style={{ width: stats.daylightRemaining > 60 ? `${Math.min(100, Math.max(0, stats.daylightRemaining - 60) * 5)}%` : '0%' }}></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-orange-300 font-bold uppercase tracking-wider font-mono">Afternoon (35-60%)</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[#ff9d6c] transition-all" style={{ width: stats.daylightRemaining > 35 ? `${Math.min(100, Math.max(0, stats.daylightRemaining - 35) * 4)}%` : '0%' }}></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider font-mono">Sunset (12-35%)</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-purple-400 transition-all" style={{ width: stats.daylightRemaining > 12 ? `${Math.min(100, Math.max(0, stats.daylightRemaining - 12) * 4.3)}%` : '0%' }}></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider font-mono">Night (0-12%)</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all" style={{ width: stats.daylightRemaining <= 12 ? `${(stats.daylightRemaining) * 8.3}%` : '0%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                localStorage.removeItem('daylight_protocol_save');
                window.location.reload();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/35 border border-orange-400/40 text-orange-300 rounded font-mono text-[9px] uppercase cursor-pointer transition-all"
            >
              <RotateCcw className="w-3 h-3" /> RESTART GAME
            </button>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-mono tracking-widest text-emerald-400">SYNCHRONIZER_STABLE</span>
          </div>
        </footer>

      </div>

      {/* POPUP MODALS */}
      {activePopup && (
        <GamePopup 
          activePopup={activePopup} 
          setActivePopup={setActivePopup} 
          stats={stats} 
          challengeNodes={challengeNodesRef.current} 
          logMessages={logMessages} 
          onSelectNode={(node) => {
            setActivePopup(null);
            if (node.completed) {
              addLog(`>> LOG_TERMINAL :: Core node ${node.name} is already activated`);
              setActiveDialogue({ speaker: node.name, text: "SECURE CHANNEL SYNCED. CPU firewall bypassed. Energy flow stable." });
            } else {
              setActiveInviteNode(node);
            }
          }}
        />
      )}

      {/* ENDING OVERLAY */}
      {showEnding && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 animate-in fade-in zoom-in duration-1000">
          <div className="bg-[#120806] border-2 border-orange-500/40 rounded-[2.5rem] p-8 max-w-lg w-full text-center space-y-6 shadow-[0_0_100px_rgba(245,158,11,0.2)]">
            <div className="space-y-2">
              <div className="inline-block p-4 bg-orange-500/10 rounded-3xl mb-2">
                {currentEnding.title === "CONSCIOUS_ESCAPE" ? (
                  <Zap className="w-12 h-12 text-emerald-400 animate-pulse" />
                ) : (
                  <Sun className="w-12 h-12 text-orange-500 animate-pulse" />
                )}
              </div>
              <h2 className="text-sm font-mono tracking-[0.3em] text-orange-400/60 uppercase">SIMULATION_TERMINATED</h2>
              <h3 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-500 uppercase">
                {currentEnding.title}
              </h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm text-slate-200 font-mono leading-relaxed relative z-10">
                {currentEnding.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">FINAL_KNOWLEDGE</span>
                <span className="text-2xl font-black text-emerald-400">{Math.floor(stats.knowledgeScore)}</span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">SYSTEM_OUTCOME</span>
                <span className="text-sm font-bold text-orange-300 uppercase">{currentEnding.requirement}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                localStorage.removeItem('daylight_protocol_save');
                window.location.reload();
              }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-mono text-sm font-black tracking-widest uppercase transition-all rounded-2xl cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95"
            >
              &gt;&gt; RE-INITIALIZE PROTOCOL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
