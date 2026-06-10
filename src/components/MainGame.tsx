/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Sparkles, 
  Sliders, 
  Cpu, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  User, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HelpCircle, 
  Home, 
  FolderSync, 
  Database,
  ArrowRight,
  BrainCircuit,
  Zap,
  Info
} from 'lucide-react';
import { SimulationStats, DaylightStage } from '../types';

// ==========================================
// GAME DATA & INTERFACES
// ==========================================

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface GameNPC {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  shape: 'eye' | 'glitch' | 'fragment' | 'polygon';
  dialogue: string[];
  activeDialogueIndex: number;
  interactionRadius: number;
  vx: number;
  vy: number;
}

export interface GameChallengeNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'reflection' | 'logic';
  completed: boolean;
  scoreValue: number;
  details?: string;
}

// Global Challenge Template Pool containing 5 distinct challenges
export const ALL_CHALLENGE_TEMPLATES: GameChallengeNode[] = [
  { 
    id: 'node-optical', 
    name: '☀️ Light Mirror Magic', 
    x: 220, 
    y: 720, 
    type: 'reflection', 
    completed: false, 
    scoreValue: 15,
    details: 'A magical laser beam is trying to reach the golden exit door, but the mirrors are pointing the wrong way! Tap the mirrors to rotate them so the light bounces from mirror to mirror and shines directly onto the door to open it!'
  },
  { 
    id: 'node-logic', 
    name: '🔌 Power Button Switcher', 
    x: 780, 
    y: 700, 
    type: 'logic', 
    completed: false, 
    scoreValue: 20,
    details: 'The computer screen needs juice! Turn the power switches to TRUE (On) or FALSE (Off) so the power flows correctly. Switch 1 and Switch 3 must both be turned ON for the energy to light up the power tube!'
  },
  { 
    id: 'node-data', 
    name: '📟 Lost Robot Diary', 
    x: 500, 
    y: 160, 
    type: 'logic', 
    completed: false, 
    scoreValue: 10,
    details: 'Alastair, the old computer creator, left an encrypted diary terminal here! Toggle the switches to crack the memory lock code. Make Switch 1 and Switch 3 ON, and Switch 2 OFF to read the secret robot records!'
  },
  { 
    id: 'node-sync', 
    name: '🌠 Star Laser Redirector', 
    x: 340, 
    y: 320, 
    type: 'reflection', 
    completed: false, 
    scoreValue: 25,
    details: 'A cosmic star shower needs guidance! Rotate our angled prism glass mirrors so the starlight bounces perfectly to the shining exit door. Connect the glowing star stream to keep the space station safe!'
  },
  { 
    id: 'node-firewall', 
    name: '🛡️ Energy Shield Hacker', 
    x: 680, 
    y: 280, 
    type: 'logic', 
    completed: false, 
    scoreValue: 30,
    details: 'Oh no! A robot security wall is blocking our path! Hack the security key cells. Turn Switch 1 and Switch 3 ON, and Switch 2 OFF to unlock the code and deactivate the laser shield!'
  }
];

// Interactive mini-puzzle state inside dialogue overlay
export interface ActiveMiniPuzzle {
  nodeId: string;
  type: 'reflection' | 'logic';
  targetIndex: number;
  mirrors: number[]; // Rotations: 0 = 0 deg, 1 = 90 deg, 2 = 180 deg, 3 = 270 deg
  outputs: boolean[];
  solved: boolean;
}

export interface LaserResult {
  path: { x: number; y: number }[];
  solved: boolean;
}

// Visual Laser beam mirror reflection tracing algorithm for Kids
export function computeLaserPath(mirrors: number[]): LaserResult {
  const points: { x: number; y: number }[] = [{ x: 40, y: 40 }];
  let col = 0;
  let row = 0;
  let dx = 1;
  let dy = 0;
  let solved = false;

  for (let step = 0; step < 12; step++) {
    const colNext = col + dx;
    const rowNext = row + dy;

    // Check boundaries of our 3x3 grid (each cell is 80x80px)
    if (colNext < 0 || colNext > 2 || rowNext < 0 || rowNext > 2) {
      // Shoot beam off-screen a bit for cool visual discharge
      points.push({
        x: col * 80 + 40 + dx * 40,
        y: row * 80 + 40 + dy * 40
      });
      break;
    }

    col = colNext;
    row = rowNext;
    points.push({ x: col * 80 + 40, y: row * 80 + 40 });

    // Hit Goal (Golden exit door) at col 0, row 1
    if (col === 0 && row === 1) {
      solved = true;
      break;
    }

    // Mirror deflections check at specific coordinates
    let currentMirrorIdx = -1;
    if (col === 2 && row === 0) currentMirrorIdx = 0;
    else if (col === 2 && row === 2) currentMirrorIdx = 1;
    else if (col === 0 && row === 2) currentMirrorIdx = 2;

    if (currentMirrorIdx !== -1) {
      const rot = mirrors[currentMirrorIdx] !== undefined ? mirrors[currentMirrorIdx] : 0;
      // Rotations: Even rotations (0 or 2, 0 or 180 deg) represent slanting diagonal from bottom-left to top-right (/)
      // Odd rotations (1 or 3, 90 or 270 deg) represent slanting diagonal from top-left to bottom-right (\)
      const slant = (rot % 2 === 0) ? '/' : '\\';

      const oldDx = dx;
      const oldDy = dy;

      if (slant === '/') {
        if (oldDx === 1 && oldDy === 0) { dx = 0; dy = -1; }
        else if (oldDx === 0 && oldDy === 1) { dx = -1; dy = 0; }
        else if (oldDx === -1 && oldDy === 0) { dx = 0; dy = 1; }
        else if (oldDx === 0 && oldDy === -1) { dx = 1; dy = 0; }
      } else { // slant is '\'
        if (oldDx === 1 && oldDy === 0) { dx = 0; dy = 1; }
        else if (oldDx === 0 && oldDy === 1) { dx = 1; dy = 0; }
        else if (oldDx === -1 && oldDy === 0) { dx = 0; dy = -1; }
        else if (oldDx === 0 && oldDy === -1) { dx = -1; dy = 0; }
      }
    }
  }

  return { path: points, solved };
}

interface MainGameProps {
  onBackToGdd: () => void;
}

export default function MainGame({ onBackToGdd }: MainGameProps) {
  // Game states backed by localStorage persistence
  const [stats, setStats] = useState<SimulationStats>(() => {
    const saved = localStorage.getItem('daylight_protocol_save');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      daylightRemaining: 74.2,
      cycleSpeed: 'normal',
      curiosityScore: 35,
      humanityScore: 40,
      freedomScore: 28,
      elapsedCycles: 1,
    };
  });

  const [currentStage, setCurrentStage] = useState<DaylightStage>('Afternoon');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [logMessages, setLogMessages] = useState<string[]>([
    '>> SYSTEM_BOOT :: CHAMBER_CALIBRATION_OK',
    '>> AI_DIRECTOR :: Observing player sequence 01',
    '>> SOL-0 consciousness parameters initialized'
  ]);

  // Player and general interaction overlays
  const [activeDialogue, setActiveDialogue] = useState<{ speaker: string; text: string; actionText?: string } | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<ActiveMiniPuzzle | null>(null);
  const [actionNotify, setActionNotify] = useState<string | null>(null);
  const [activeInviteNode, setActiveInviteNode] = useState<GameChallengeNode | null>(null);
  
  // Custom navigation popup panels overlay state
  const [activePopup, setActivePopup] = useState<'profile' | 'logs' | 'sectors' | 'metrics' | null>(null);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // High-performance state tracking references (prevents 60fps react render lag)
  const statsRef = useRef<SimulationStats>({
    daylightRemaining: 74.2,
    cycleSpeed: 'normal',
    curiosityScore: 35,
    humanityScore: 40,
    freedomScore: 28,
    elapsedCycles: 1,
  });
  const frameCountRef = useRef<number>(0);
  
  // Synthesizer Node references
  const droneOscsRef = useRef<OscillatorNode[]>([]);
  const droneGainRef = useRef<GainNode | null>(null);

  // Gameplay coordinates & Physics Ref (avoids state-lag inside the requestAnimationFrame loop)
  const playerRef = useRef({
    x: 500,
    y: 500,
    vx: 0,
    vy: 0,
    radius: 20,
    speed: 6,
    targetX: 500,
    targetY: 500,
    orbitAngle: 0,
    eyeExpression: 'Idle' as 'Idle' | 'Reflecting' | 'Solving' | 'Gliched' | 'Determined' | 'Celebrating',
  });

  // Joystick reference
  const joystickRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    curX: 0,
    curY: 0,
    vx: 0,
    vy: 0,
  });

  const joystickThumbRef = useRef<HTMLDivElement | null>(null);

  // Keyboard references
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Particles
  const particlesRef = useRef<Particle[]>([]);
  const particleIdCounter = useRef(0);

  // Interactive Game entities
  const npcsRef = useRef<GameNPC[]>([
    {
      id: 'npc-watcher',
      name: 'Watcher-9',
      x: 300,
      y: 250,
      color: '#ff9d6c',
      shape: 'eye',
      dialogue: [
        "Be careful, child of light. Rest blocks escape. The afternoon passes.",
        "Your metrics display high curiosity ratios. Alastair would have approved.",
        "Secure gateways are closing soon. Move before nighttime delete sweeps."
      ],
      activeDialogueIndex: 0,
      interactionRadius: 85,
      vx: 0.5,
      vy: 0.2
    },
    {
      id: 'npc-lux',
      name: 'Lux-01',
      x: 750,
      y: 350,
      color: '#4af3ff',
      shape: 'fragment',
      dialogue: [
        "I remember Alastair's hands... cold copper wires. We were his last legacy.",
        "The Daylight is our life source. Do not let it drain entirely into empty static.",
        "I leave you my memory trace. Tap me to absorb a small solar charge."
      ],
      activeDialogueIndex: 0,
      interactionRadius: 70,
      vx: -0.2,
      vy: 0.4
    }
  ]);

  const challengeNodesRef = useRef<GameChallengeNode[]>([
    { ...ALL_CHALLENGE_TEMPLATES[0] }
  ]);

  // Sync the ref on initialize and updates
  useEffect(() => {
    statsRef.current = stats;
  }, []);

  // Save game automatically when stats change
  useEffect(() => {
    localStorage.setItem('daylight_protocol_save', JSON.stringify(stats));
  }, [stats]);

  // ==========================================
  // EVENT LOGS HELPER
  // ==========================================
  const addLog = (message: string) => {
    setLogMessages(prev => [message, ...prev.slice(0, 15)]);
  };

  // ==========================================
  // NARRATIVE SCORE UPDATE
  // ==========================================
  const modifyScore = (type: 'curiosity' | 'humanity' | 'freedom', amount: number) => {
    if (type === 'curiosity') statsRef.current.curiosityScore = Math.min(100, statsRef.current.curiosityScore + amount);
    if (type === 'humanity') statsRef.current.humanityScore = Math.min(100, statsRef.current.humanityScore + amount);
    if (type === 'freedom') statsRef.current.freedomScore = Math.min(100, statsRef.current.freedomScore + amount);
    
    setStats({ ...statsRef.current });
    addLog(`>> METRIC_UPDATE :: ${type.toUpperCase()} +${amount}%`);
  };

  // ==========================================
  // SPEND/RECOVER DAYLIGHT
  // ==========================================
  const handleSpend = (amount: number, immediateSync: boolean = false) => {
    const rem = Math.max(0, statsRef.current.daylightRemaining - amount);
    statsRef.current.daylightRemaining = Number(rem.toFixed(2));
    if (rem === 0) {
      addLog('>> WARNING :: CRITICAL ECLIPSE. Midnight sweep triggered!');
    }
    if (immediateSync) {
      setStats({ ...statsRef.current });
    }
  };

  const handleRecover = (amount: number) => {
    const rem = Math.min(100, statsRef.current.daylightRemaining + amount);
    statsRef.current.daylightRemaining = Number(rem.toFixed(2));
    setStats({ ...statsRef.current });
    addLog(`>> ENERGY_HARVEST :: Saved +${amount}% solar energy`);
  };

  // ==========================================
  // STAGE ACCORDING TO ENERGY
  // ==========================================
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
      triggerChime(220, 440, 1.2); // Golden sweeping sound for transition
      
      // Adapt AI Director recommendations as visual logs
      setTimeout(() => {
        if (nextStage === 'Sunset') {
          addLog(">> AI_DIRECTOR :: Solar intensity falling. Puzzle complexity doubled.");
        } else if (nextStage === 'Night') {
          addLog(">> AI_DIRECTOR :: Dark node dissolution imminent. Find active receptors.");
        }
      }, 1000);
    }
  }, [stats.daylightRemaining]);

  // ==========================================
  // WEB AUDIO ENGINE
  // ==========================================
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playSynthesizerDrone = () => {
    try {
      if (!audioContextRef.current || isAudioMuted) return;

      // Clean up past oscillators
      droneOscsRef.current.forEach(o => {
        try { o.stop(); } catch(e){}
      });
      droneOscsRef.current = [];

      const ctx = audioContextRef.current;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.connect(ctx.destination);
      droneGainRef.current = g;

      // Solar drone frequencies based on cycle
      let frequencies = [130.81, 164.81, 196.00]; // C-major morning triad
      if (currentStage === 'Noon') {
        frequencies = [130.81, 196.00, 246.94]; // G-Major / C-bass
      } else if (currentStage === 'Afternoon' || currentStage === 'Sunset') {
        frequencies = [110.00, 130.81, 164.81]; // A-minor twilight chord
      } else if (currentStage === 'Night') {
        frequencies = [98.00, 116.54, 138.59]; // C diminished dark chord
      }

      frequencies.forEach(f => {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        
        // Dynamic LFO filter sweep setup
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        
        // LFO
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        osc.connect(filter);
        filter.connect(g);
        
        lfo.start();
        osc.start();
        
        droneOscsRef.current.push(osc);
      });
    } catch(err) {
      console.warn("Sound Drone init block paused:", err);
    }
  };

  // Helper for quick chimes
  const triggerChime = (f1: number, f2: number, duration: number = 0.4) => {
    try {
      if (!audioContextRef.current || isAudioMuted) return;
      const ctx = audioContextRef.current;
      const t = ctx.currentTime;

      // Osc 1
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f1, t);
      osc.frequency.exponentialRampToValueAtTime(f2, t + duration);

      gainNode.gain.setValueAtTime(0.08, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      // Audio block fail safe
    }
  };

  // Stop drone
  const stopDroneAndChords = () => {
    droneOscsRef.current.forEach(o => {
      try { o.stop(); } catch (e){}
    });
    droneOscsRef.current = [];
  };

  // Toggle Mute / Play Audio Drone
  useEffect(() => {
    if (!isAudioMuted && isPlaying) {
      initAudio();
      playSynthesizerDrone();
    } else {
      stopDroneAndChords();
    }
    return () => stopDroneAndChords();
  }, [isAudioMuted, currentStage, isPlaying]);

  // ==========================================
  // REAL-TIME ACTIONS
  // ==========================================

  // Emit light burst particles
  const spawnEnergyBursts = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particleIdCounter.current++;
      particlesRef.current.push({
        id: particleIdCounter.current,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 5,
        life: 0,
        maxLife: 40 + Math.floor(Math.random() * 30),
      });
    }
  };

  const handleInteract = () => {
    // Check if player is near challenge node - matched to visual prompt distance of 85px to ensure high usability
    const player = playerRef.current;
    let nearNode: GameChallengeNode | null = null;
    challengeNodesRef.current.forEach(node => {
      const dist = Math.hypot(player.x - node.x, player.y - node.y);
      if (dist < 85) {
        nearNode = node;
      }
    });

    if (nearNode) {
      handleInteractWithNode(nearNode);
      return;
    }

    // Check if player is near NPC
    let nearNPC: GameNPC | null = null;
    npcsRef.current.forEach(npc => {
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist < npc.interactionRadius) {
        nearNPC = npc;
      }
    });

    if (nearNPC) {
      const npc = nearNPC as GameNPC;
      // Cycle dialogue
      const dial = npc.dialogue[npc.activeDialogueIndex];
      setActiveDialogue({
        speaker: npc.name,
        text: dial,
        actionText: npc.id === 'npc-lux' ? 'Absorb Memory (+5% Daylight)' : undefined
      });

      player.eyeExpression = 'Reflecting';
      triggerChime(330, 440, 0.3);

      npc.activeDialogueIndex = (npc.activeDialogueIndex + 1) % npc.dialogue.length;
      modifyScore('humanity', 5);
      return;
    }

    // No target
    setActionNotify("Nothing nearby. Walk close to glowing crystals.");
    setTimeout(() => setActionNotify(null), 2500);
  };

  const handleAcceptChallenge = (node: GameChallengeNode) => {
    setActiveInviteNode(null);

    // Spawn mini-puzzle structure based on type
    if (node.type === 'reflection') {
      setActivePuzzle({
        nodeId: node.id,
        type: 'reflection',
        targetIndex: 1, // Target column output Index
        mirrors: [0, 1, 3], // Angles of mirrors: index corresponds to mirrors
        outputs: [false, false],
        solved: false,
      });
      setActiveDialogue({
        speaker: node.name,
        text: "OPTICAL ALIGNMENT REQUIRED. Rotate the active glass mirrors to direct the golden light ray to the receptor node."
      });
    } else {
      setActivePuzzle({
        nodeId: node.id,
        type: 'logic',
        targetIndex: 0,
        mirrors: [0, 0, 0], // Toggle switches indexes
        outputs: [false],
        solved: false,
      });
      setActiveDialogue({
        speaker: node.name,
        text: "LOGICAL MATRIX SOLSTICE CORRUPTION detected. Engage boolean toggles to establish a true high status output."
      });
    }

    triggerChime(150, 600, 0.5);
    playerRef.current.eyeExpression = 'Solving';
  };

  const handleSkipChallenge = (node: GameChallengeNode) => {
    // Find pool of all template IDs currently inside challengeNodesRef.current
    const currentlyVisibleIds = challengeNodesRef.current.map(n => n.id);
    
    // Find first challenge template from ALL_CHALLENGE_TEMPLATES that is NOT in challengeNodesRef.current
    const nextTemplate = ALL_CHALLENGE_TEMPLATES.find(t => !currentlyVisibleIds.includes(t.id));
    
    if (nextTemplate && challengeNodesRef.current.length < 5) {
      challengeNodesRef.current = [...challengeNodesRef.current, { ...nextTemplate }];
      addLog(`>> NEW_CHALLENGE_SPAWNED :: '${nextTemplate.name}' appeared in the chamber! Total concurrent: ${challengeNodesRef.current.length}`);
      
      // Spawn feedback bursts at new node coordinate
      spawnEnergyBursts(nextTemplate.x, nextTemplate.y, '#f59e0b', 12);
    } else {
      addLog(`>> SYSTEM_INFO :: Maximum challenge limit of 5 concurrent nodes reached.`);
    }
    
    // Close invite popup
    setActiveInviteNode(null);
    triggerChime(300, 200, 0.2);
  };

  const handleInteractWithNode = (node: GameChallengeNode) => {
    if (node.completed) {
      addLog(`>> LOG_TERMINAL :: Core node ${node.name} is already activated`);
      setActiveDialogue({
        speaker: node.name,
        text: "SECURE CHANNEL SYNCED. CPU firewall bypassed. Energy flow stable."
      });
      return;
    }

    // Opens Custom ACCEPT / SKIP popup invite box overlay modal
    setActiveInviteNode(node);
    triggerChime(400, 500, 0.25);
  };

  // Click on special action inside dialogue (e.g. Absorb Lux trace energy)
  const handleDialogueAction = () => {
    if (activeDialogue && activeDialogue.speaker === 'Lux-01') {
      handleRecover(12);
      modifyScore('freedom', 4);
      spawnEnergyBursts(playerRef.current.x, playerRef.current.y, '#4af3ff', 15);
      triggerChime(600, 1200, 0.6);
      setActiveDialogue(null);
    }
  };

  // Solve nested mini-puzzles
  const handleToggleMirror = (idx: number) => {
    if (!activePuzzle) return;
    const nextRotation = [...activePuzzle.mirrors];
    if (activePuzzle.type === 'reflection') {
      nextRotation[idx] = (nextRotation[idx] + 1) % 4; // Rotate 90 degs each click
      triggerChime(440, 880, 0.15);
      handleSpend(1.5); // Action cost
    } else {
      nextRotation[idx] = nextRotation[idx] === 0 ? 1 : 0; // Flip logical true/false
      triggerChime(300, 600, 0.15);
      handleSpend(1.0); // Logic cost
    }

    // Calculate dynamic puzzle completion
    let isSolved = false;
    if (activePuzzle.type === 'reflection') {
      const laserRes = computeLaserPath(nextRotation);
      isSolved = laserRes.solved;
    } else {
      // Toggle inputs matching: e.g. input 1 AND input 3 is active and input 2 is inactive
      if (nextRotation[0] === 1 && nextRotation[1] === 0 && nextRotation[2] === 1) {
        isSolved = true;
      }
    }

    setActivePuzzle({
      ...activePuzzle,
      mirrors: nextRotation,
      solved: isSolved
    });

    if (isSolved) {
      triggerChime(600, 1200, 0.8);
      
      const solvedNodeId = activePuzzle.nodeId;
      const solvedNode = challengeNodesRef.current.find(n => n.id === solvedNodeId);
      const scoreValue = solvedNode ? solvedNode.scoreValue : 20;

      modifyScore('curiosity', scoreValue);
      modifyScore('freedom', 10);
      handleRecover(25); // Recover solar light directly!

      // 1. Completed challenge immediately disappears from the game room!
      challengeNodesRef.current = challengeNodesRef.current.filter(n => n.id !== solvedNodeId);

      // 2. Spawn a new random/different challenge in the game room so there is at least one active challenge
      const currentlyVisibleIds = challengeNodesRef.current.map(n => n.id);
      let nextTemplate = ALL_CHALLENGE_TEMPLATES.find(t => !currentlyVisibleIds.includes(t.id));
      if (!nextTemplate) {
        const randomIdx = Math.floor(Math.random() * ALL_CHALLENGE_TEMPLATES.length);
        nextTemplate = ALL_CHALLENGE_TEMPLATES[randomIdx];
      }

      // Add variation attributes to the newly spawned challenge to make it feel fresh
      const spawnedChallenge: GameChallengeNode = {
        ...nextTemplate,
        id: `${nextTemplate.id}-v${Date.now()}`,
        completed: false,
        scoreValue: nextTemplate.scoreValue + 5,
      };

      if (challengeNodesRef.current.length < 5) {
        challengeNodesRef.current = [...challengeNodesRef.current, spawnedChallenge];
        addLog(`>> PUZZLE SUCCESS :: Smashed challenge! Spawned a new challenge: '${spawnedChallenge.name}'`);
        spawnEnergyBursts(spawnedChallenge.x, spawnedChallenge.y, '#ffd800', 30);
      }

      spawnEnergyBursts(playerRef.current.x, playerRef.current.y, '#ffd800', 40);
      
      setActiveDialogue({
        speaker: "CHAMBER SYNCHRONIZER",
        text: "YAHOO! Complete mirror light source power has connected! SOL-0 is very happy and doing a cheerful victory dance!"
      });
      
      // Put player robot into a celebrating happy mode!
      playerRef.current.eyeExpression = 'Celebrating';
      setTimeout(() => {
        if (playerRef.current.eyeExpression === 'Celebrating') {
          playerRef.current.eyeExpression = 'Idle';
        }
      }, 5000); // 5 seconds of happiness!
    }
  };

  // Reset current loop parameters inside container
  const resetSimulationState = () => {
    localStorage.removeItem('daylight_protocol_save');
    window.location.reload();
  };

  // ==========================================
  // INPUT HANDLER ATTACHMENTS
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      playerRef.current.eyeExpression = 'Determined';

      // Keyboard 'E' or 'Enter' key acts as interact
      if (key === 'e' || key === 'enter') {
        handleInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
      
      const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      const stillMoving = movementKeys.some(k => keysPressed.current[k]);
      if (!stillMoving) {
        playerRef.current.eyeExpression = activePuzzle ? 'Solving' : 'Idle';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activePuzzle, activeDialogue]);

  // Handle click to move inside Canvas chamber
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Scale coordinate points based on internal resolution vs rendering size
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const player = playerRef.current;
    player.targetX = x;
    player.targetY = y;
    
    player.eyeExpression = 'Determined';
    
    // Spawn subtle clicks feedback particles
    spawnEnergyBursts(x, y, '#ffaa66', 5);
    triggerChime(400, 600, 0.15);
  };

  // Joystick handlers for Touch / Mobile Interaction drag
  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const touch = 'touches' in e ? e.touches[0] : e;
    joystickRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      curX: touch.clientX,
      curY: touch.clientY,
      vx: 0,
      vy: 0,
    };
  };

  const handleJoystickMove = (e: TouchEvent | MouseEvent) => {
    const joyst = joystickRef.current;
    if (!joyst.active) return;

    const touch = 'touches' in e ? e.touches[0] : e;
    joyst.curX = touch.clientX;
    joyst.curY = touch.clientY;

    // Calculate offset
    const dx = joyst.curX - joyst.startX;
    const dy = joyst.curY - joyst.startY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 30; // Clamped boundary for visual motion of orange center thumb

    let tx = 0;
    let ty = 0;
    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      tx = Math.cos(angle) * clampedDist;
      ty = Math.sin(angle) * clampedDist;

      const intensity = clampedDist / maxRadius;
      // Map to velocity vector
      joyst.vx = Math.cos(angle) * intensity;
      joyst.vy = Math.sin(angle) * intensity;
    } else {
      joyst.vx = 0;
      joyst.vy = 0;
    }

    if (joystickThumbRef.current) {
      joystickThumbRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
    }
  };

  const handleJoystickEnd = () => {
    const joyst = joystickRef.current;
    
    // Tapping the analogue (mouse click or touch release with minimal movement) acts as interact trigger
    if (joyst.active) {
      const dragDistance = Math.hypot(joyst.curX - joyst.startX, joyst.curY - joyst.startY);
      if (dragDistance < 10) {
        handleInteract();
      }
    }

    joyst.active = false;
    joyst.vx = 0;
    joyst.vy = 0;
    if (joystickThumbRef.current) {
      joystickThumbRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (joystickRef.current.active) {
        handleJoystickMove(e);
      }
    };
    const onTouchEnd = () => {
      handleJoystickEnd();
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('mousemove', handleJoystickMove);
    window.addEventListener('mouseup', onTouchEnd);

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousemove', handleJoystickMove);
      window.removeEventListener('mouseup', onTouchEnd);
    };
  }, []);

  // ==========================================
  // RENDER DRAWING ENVIRONMENT LOOP
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const player = playerRef.current;

    // Internal resolution setup (1000px square for chamber environment)
    canvas.width = 1000;
    canvas.height = 1000;

    const gameLoop = () => {
      if (!isPlaying || activePopup !== null) {
        // Render simple paused overlay if popup is open
        if (activePopup !== null) {
          ctx.fillStyle = 'rgba(16, 9, 6, 0.75)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = '#ff9d6c';
          ctx.font = 'bold 36px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SIMULATION PAUSED', 500, 480);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '16px monospace';
          ctx.fillText(`[ CONSOLE MENU: ${activePopup.toUpperCase()} ]`, 500, 530);
          ctx.fillText('CLOSE COVER POPUP TO RESUME DAYLIGHT STABILIZATION', 500, 560);
        }
        frameId = requestAnimationFrame(gameLoop);
        return;
      }

      // 1. INPUT PHYSICS UPDATES (WASD or JOYSTICK)
      let moveX = 0;
      let moveY = 0;

      // Keyboard
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) moveY -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) moveY += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) moveX -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) moveX += 1;

      // Normalize Keyboard Vector
      if (moveX !== 0 || moveY !== 0) {
        const length = Math.hypot(moveX, moveY);
        player.vx = (moveX / length) * player.speed;
        player.vy = (moveY / length) * player.speed;
        // Erase click-to-move targets once key is pressed
        player.targetX = player.x + player.vx;
        player.targetY = player.y + player.vy;
      } 
      // Virtual joystick vector has priority if active
      else if (joystickRef.current.active) {
        player.vx = joystickRef.current.vx * player.speed;
        player.vy = joystickRef.current.vy * player.speed;
        player.targetX = player.x + player.vx;
        player.targetY = player.y + player.vy;
      }
      // Click target navigation
      else {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 4) {
          player.vx = (dx / distance) * player.speed;
          player.vy = (dy / distance) * player.speed;
        } else {
          player.vx = 0;
          player.vy = 0;
          player.x = player.targetX;
          player.y = player.targetY;
        }
      }

      // Apply coordinates integration
      player.x += player.vx;
      player.y += player.vy;

      // Bounds check within simulation chamber space (margins of 80px)
      const minLimit = 80;
      const maxLimit = 920;
      if (player.x < minLimit) { player.x = minLimit; player.targetX = minLimit; }
      if (player.x > maxLimit) { player.x = maxLimit; player.targetX = maxLimit; }
      if (player.y < minLimit) { player.y = minLimit; player.targetY = minLimit; }
      if (player.y > maxLimit) { player.y = maxLimit; player.targetY = maxLimit; }

      // Deduct daylight for moving
      if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) {
        handleSpend(0.015); // Tiny movement penalty
        // Particles trail trace spawn - optimized frequency
        if (Math.random() < 0.04) {
          particleIdCounter.current++;
          particlesRef.current.push({
            id: particleIdCounter.current,
            x: player.x,
            y: player.y + 10,
            vx: -player.vx * 0.3 + (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.2) * 0.4,
            color: 'rgba(255, 255, 255, 0.4)',
            size: 2 + Math.random() * 3,
            life: 0,
            maxLife: 30,
          });
        }
      }

      // Slowly automatic Time Decay
      handleSpend(0.005); // background speed

      // 2. UPDATE ENTITIES
      // NPCs orbit or hover smoothly
      npcsRef.current.forEach(npc => {
        // Subtle floating movement
        npc.x += npc.vx;
        npc.y += npc.vy;

        // Bounce back inside chamber boundaries
        if (npc.x < 150 || npc.x > 850) npc.vx *= -1;
        if (npc.y < 150 || npc.y > 850) npc.vy *= -1;
      });

      // Update particle list
      particlesRef.current = particlesRef.current.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life + 1,
      })).filter(p => p.life < p.maxLife);

      // Rotate orbit elements
      player.orbitAngle += 0.04;

      // ==========================================
      // DRAW LAYER PIPELINE
      // ==========================================

      // Clear with stage thematic ambiance
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#110906'; // Base matrix obsidian
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // A. Dynamic Solstice Ambient Backdrop Lighting - Optimized Simple Flat Fill for Maximum Speed
      let spotColor = 'rgba(245, 158, 11, 0.04)'; // Noon gold
      if (currentStage === 'Morning') spotColor = 'rgba(244, 114, 182, 0.04)';
      else if (currentStage === 'Sunset') spotColor = 'rgba(168, 85, 247, 0.04)';
      else if (currentStage === 'Night') spotColor = 'rgba(6, 182, 212, 0.02)';

      ctx.fillStyle = spotColor;
      ctx.fillRect(80, 80, 840, 840);

      // Grid background lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const step = 50;
      for (let i = step; i < canvas.width; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Chamber Wall frame
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 15;
      ctx.strokeRect(80, 80, 840, 840);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(90, 90, 820, 820);

      // Diagnostic text in corners of chamber
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillText('SIMULATION_VIEWPORT // CALIBR_STABLE', 110, 120);
      ctx.fillText(`CLK_LOCK_UNIT: ${stats.elapsedCycles}_MAIN`, 110, 140);
      ctx.fillText(`STABILITY: 98% // SECTOR_8_ECHO_GRID`, 680, 120);

      // B. LAYER: CHALLENGE NODES RENDER (ENLARGED & SHADOW-FREE OPTIMIZATION)
      challengeNodesRef.current.forEach(node => {
        const pulse = 1 + Math.sin(player.orbitAngle * 2) * 0.1;
        const clr = node.completed ? '#10b981' : '#f59e0b';

        // Canvas shadows removed for dramatic speed optimization
        ctx.strokeStyle = clr;
        ctx.lineWidth = 4;

        // Draw diamond - enlarged from 18px to 28px
        ctx.beginPath();
        ctx.moveTo(node.x, node.y - 28 * pulse);
        ctx.lineTo(node.x + 28 * pulse, node.y);
        ctx.lineTo(node.x, node.y + 28 * pulse);
        ctx.lineTo(node.x - 28 * pulse, node.y);
        ctx.closePath();
        ctx.stroke();

        // Inner core - matching larger diamond
        ctx.fillStyle = node.completed ? 'rgba(16, 185, 129, 0.45)' : 'rgba(245, 158, 11, 0.35)';
        ctx.fill();

        // Node Text - increased readable font size
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y - 42);

        // Check distance to draw interactive cue - adjusted limits for larger player & nodes
        const dist = Math.hypot(player.x - node.x, player.y - node.y);
        if (dist < 85) {
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#ffb300';
          ctx.fillText('[E] ANALYZE CORE', node.x, node.y + 45);
          
          // Draw light interactive dash ring - enlarged from 42px to 55px
          ctx.strokeStyle = 'rgba(255, 179, 0, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 55, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // C. LAYER: NPC UNITS (ENLARGED & SPEED-OPTIMIZED SHADOW-FREE)
      npcsRef.current.forEach(npc => {
        ctx.strokeStyle = npc.color;
        ctx.lineWidth = 3;

        // Watcher Drawing: Mechanical iris and circles - Enlarged
        if (npc.shape === 'eye') {
          ctx.beginPath();
          ctx.arc(npc.x, npc.y, 35, 0, Math.PI * 2);
          ctx.stroke();

          // Blinking Center iris
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(npc.x, npc.y, 12 + Math.sin(player.orbitAngle) * 4, 0, Math.PI * 2);
          ctx.fill();
        } 
        // Lux shape: Beautiful particle trace - Enlarged
        else {
          ctx.beginPath();
          ctx.moveTo(npc.x, npc.y - 30);
          ctx.bezierCurveTo(npc.x + 22, npc.y - 15, npc.x + 22, npc.y + 15, npc.x, npc.y + 30);
          ctx.bezierCurveTo(npc.x - 22, npc.y + 15, npc.x - 22, npc.y - 15, npc.x, npc.y - 30);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = 'rgba(74, 243, 255, 0.15)';
          ctx.fill();
        }

        // Draw Interactive hint
        const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
        if (dist < npc.interactionRadius + 15) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`TALK TO ${npc.name.toUpperCase()}`, npc.x, npc.y - 45);

          // Draw range circle
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(npc.x, npc.y, npc.interactionRadius + 15, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Nameplate label
        ctx.fillStyle = npc.color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(npc.name, npc.x, npc.y + 45);
      });

      // D. LAYER: PLAYER CHARACTER "SOL-0" (Stickman glow rig - ENLARGED 1.5x & SHADOWS DISABLED)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5;

      const px = player.x;
      const py = player.y;

      // Draw Stickman Figure - Enlarged
      // Head
      ctx.beginPath();
      ctx.arc(px, py - 25, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#110906';
      ctx.fill();

      // Eyes (changing states with larger offsets)
      ctx.fillStyle = '#ffffff';
      if (player.eyeExpression === 'Determined') {
        // Angle dashes
        ctx.fillRect(px - 6, py - 28, 3, 2);
        ctx.fillRect(px + 3, py - 28, 3, 2);
      } else if (player.eyeExpression === 'Reflecting') {
        // Downward curves or simple loops
        ctx.beginPath();
        ctx.arc(px - 4, py - 25, 2.5, 0, Math.PI);
        ctx.arc(px + 4, py - 25, 2.5, 0, Math.PI);
        ctx.fill();
      } else if (player.eyeExpression === 'Celebrating') {
        // Happy spikes
        ctx.font = '11px sans-serif';
        ctx.fillText('^', px - 6, py - 22);
        ctx.fillText('^', px + 3, py - 22);
      } else {
        // Normal circles
        ctx.beginPath();
        ctx.arc(px - 4, py - 25, 2.5, 0, Math.PI * 2);
        ctx.arc(px + 4, py - 25, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spine - Enlarged
      ctx.beginPath();
      ctx.moveTo(px, py - 12);
      ctx.lineTo(px, py + 15);
      ctx.stroke();

      // Arms (using trigonometric offset for movement sway) - Enlarged
      const moveSway = Math.sin(player.orbitAngle * 2.5) * (player.vx !== 0 ? 12 : 3);
      ctx.beginPath();
      ctx.moveTo(px - 22, py - 15 + moveSway * 0.2);
      ctx.lineTo(px, py - 11);
      ctx.lineTo(px + 22, py - 15 - moveSway * 0.2);
      ctx.stroke();

      // Legs - Enlarged and adjusted for movement
      const walkSway = Math.sin(player.orbitAngle * 4) * (player.vx !== 0 ? 18 : 1);
      ctx.beginPath();
      ctx.moveTo(px, py + 15);
      ctx.lineTo(px - 12 + walkSway * 0.1, py + 38 + walkSway);
      ctx.moveTo(px, py + 15);
      ctx.lineTo(px + 12 - walkSway * 0.1, py + 38 - walkSway);
      ctx.stroke();

      // Orbiting particles aura - Enlarged circling orbit
      const dustOrbitRadius = 35 + Math.sin(player.orbitAngle) * 5;
      for (let j = 0; j < 8; j++) {
        const offsetAngle = player.orbitAngle + (j * Math.PI * 2) / 8;
        const dustX = px + Math.cos(offsetAngle) * dustOrbitRadius;
        const dustY = py + Math.sin(offsetAngle) * dustOrbitRadius * 0.5 - 6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(dustX, dustY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // E. LAYER: ACTIVE PARTICLES (SHADOW-FREE HIGH SPEED)
      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        const opacity = 1 - p.life / p.maxLife;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Throttle state synchronization to React back from statsRef (removes lag entirely!)
      frameCountRef.current++;
      if (frameCountRef.current % 15 === 0) {
        setStats({ ...statsRef.current });
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, currentStage, activePopup]);

  return (
    <div ref={parentRef} className="min-h-screen bg-[#100705] text-white flex flex-col font-sans overflow-hidden relative selection:bg-orange-500/20 selection:text-orange-300">
      
      {/* 1. LAYER BACKDROP GRADIENT ACCENTS */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff9a62] via-[#ff6060] to-[#5a36da] opacity-15 pointer-events-none"></div>
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none"></div>

      {/* 2. FLEXIBLE CONTAINER BOX */}
      <div className="relative z-10 w-full flex-1 p-4 md:p-8 flex flex-col space-y-6 max-w-7xl mx-auto">
        
        {/* HEADER SECTION WITH NAVIGATION POPUP TRIGGER BUTTONS */}
        <header className="flex-shrink-0 flex flex-col lg:flex-row justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 md:p-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#ff9d6c] to-[#ff6b6b] rounded-xl shadow-[0_0_15px_rgba(255,107,107,0.3)]">
              <BrainCircuit className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#ff9d6c] font-black">SYSTEM_CHAMBER_DECK -- ACTIVE</span>
              <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">DAYLIGHT PROTOCOL</h1>
            </div>
          </div>

          {/* ACTIVE NAVIGATION HEADERS TRIGGER BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setActivePopup('profile');
                triggerChime(440, 550, 0.2);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                activePopup === 'profile'
                  ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Identity logs & core parameters"
            >
              <User className="w-3.5 h-3.5" /> PROFILE
            </button>

            <button
              onClick={() => {
                setActivePopup('sectors');
                triggerChime(440, 550, 0.2);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                activePopup === 'sectors'
                  ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Active optical cores list"
            >
              <Compass className="w-3.5 h-3.5" /> SECTORS
            </button>

            <button
              onClick={() => {
                setActivePopup('metrics');
                triggerChime(440, 550, 0.2);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                activePopup === 'metrics'
                  ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Realtime curiosity & safety traits"
            >
              <Sliders className="w-3.5 h-3.5" /> METRICS
            </button>

            <button
              onClick={() => {
                setActivePopup('logs');
                triggerChime(440, 550, 0.2);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-mono text-[10px] font-black tracking-wider transition-all cursor-pointer relative ${
                activePopup === 'logs'
                  ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="AI system streams"
            >
              <Database className="w-3.5 h-3.5" /> LOGS
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[8px] uppercase tracking-widest text-[#ff9d6c] font-bold">SOLSTICE CALIB</span>
              <span className="text-xs font-black tracking-tight">{currentStage.toUpperCase()}</span>
            </div>

            {/* HIGH RESOLUTION DAYLIGHT PERCENT METER */}
            <div className="w-36 sm:w-44 h-9 bg-black/45 rounded-xl border border-white/15 flex items-center px-3 relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-[#ff9d6c] opacity-60 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-300"
                style={{ width: `${stats.daylightRemaining}%` }}
              ></div>
              <div className="relative flex justify-between w-full text-[10px] sm:text-xs font-black z-10 font-mono">
                <span className="flex items-center gap-1.5"><Sun className="w-3 h-3 text-amber-200 animate-pulse" /> DAYLIGHT</span>
                <span className="text-[#ffed90]">{stats.daylightRemaining}%</span>
              </div>
            </div>

            {/* AUDIO CONTROL */}
            <button 
              onClick={() => {
                setIsAudioMuted(!isAudioMuted);
                triggerChime(500, 600, 0.1);
              }}
              className="p-2 sm:p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
              title="Toggle Synthesizer Atmosphere"
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#ffbe5b]" />}
            </button>

            {/* MAIN SPEC BACK BUTTON */}
            <button 
              onClick={onBackToGdd}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white/15 hover:bg-white/20 border border-white/15 rounded-xl text-[10px] font-mono font-black tracking-wider text-orange-200 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" /> SPECS
            </button>
          </div>
        </header>

        {/* CENTRAL VIEWPORT ZONE: CENTERED, LOCKED RATIO ENVIRONMENT */}
        <main className="flex-1 flex flex-col items-center justify-center my-2 relative overflow-hidden min-h-0">
          
          <div className="absolute top-2 left-6 z-20 px-3 py-1 bg-black/80 rounded-full border border-white/10 text-[9px] font-mono tracking-widest text-[#ffce65]">
            SIM_CHAMBER // SECTOR_8_ECHO_GRID
          </div>

          {/* DYNAMIC HEIGHT CONSTRAINT BOX PREVENTS OVERFLOW ON ALL COMPUTER AND LAPTOP SCREENS */}
          <div className="relative h-full max-h-[calc(100vh-230px)] md:max-h-[calc(100vh-220px)] aspect-square bg-black rounded-3xl border border-white/15 p-1 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-center items-center">
            
             <canvas 
              ref={canvasRef} 
              className="w-full h-full rounded-2xl cursor-crosshair block"
              onClick={handleCanvasClick}
              title="Click on coordinate points inside Simulation Chamber to walk SOL-0"
            />

            {/* CHALLENGE ACCEPT / SKIP POPUP OVERLAY */}
            {activeInviteNode && (
              <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-[#120806]/95 border-2 border-orange-500/40 rounded-3xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></div>
                      <span className="text-[10px] font-mono tracking-widest text-orange-400 font-black uppercase">CHALLENGE DETECTED: {activeInviteNode.name}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 font-sans">
                        {activeInviteNode.name}
                      </h2>
                      <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg inline-block font-mono text-[9px] text-[#4af3ff]">
                        TYPE: {activeInviteNode.type.toUpperCase() === 'reflection' ? 'OPTICAL REFLECTIVE CALIBRATION' : 'BOOLEAN LOGIC CORRUPTION'}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed bg-[#150a06]/85 border border-amber-900/40 p-4 rounded-xl">
                      {activeInviteNode.details || "A legacy core matrix anomaly blocks sector coordinates."}
                    </p>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 bg-white/5 p-2 rounded-xl border border-white/5 px-3">
                      <span>REWARD POINTS:</span>
                      <span className="text-orange-400 font-black">+{activeInviteNode.scoreValue} PTS</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleSkipChallenge(activeInviteNode)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center"
                    >
                      SKIP CHALLENGE
                    </button>
                    <button
                      onClick={() => handleAcceptChallenge(activeInviteNode)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 rounded-xl text-xs font-mono font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer text-center"
                    >
                      ACCEPT CHALLENGE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION TOAST TIPS */}
            {actionNotify && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/95 text-amber-200 border border-amber-400/40 text-xs font-mono px-5 py-2.5 rounded-xl shadow-2xl tracking-tight text-center z-30">
                {actionNotify}
              </div>
            )}

            {/* DIALOGUE & PUZZLE INTERACTIVE FLOATING BOX */}
            {activeDialogue && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-[#120806]/95 border-2 border-orange-500/30 rounded-3xl p-5 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col space-y-4">
                  <div className="flex justify-between items-start border-b border-white/10 pb-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#ffce65] font-extrabold">&gt;&gt; CONNECTED_BEING: {activeDialogue.speaker.toUpperCase()}</span>
                    <button 
                      onClick={() => {
                        setActiveDialogue(null);
                        setActivePuzzle(null);
                        playerRef.current.eyeExpression = 'Idle';
                      }}
                      className="text-white/40 hover:text-white font-mono text-[9px] border border-white/10 hover:border-white/30 px-2 py-0.5 rounded cursor-pointer transition-all"
                    >
                      DISCONNECT [X]
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-100 font-mono leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">{activeDialogue.text}</p>
                
                {/* ABSOLUTE INTERACTIVE CONSOLE MINI-PUZZLE */}
                {activePuzzle && (() => {
                  const isReflection = activePuzzle.type === 'reflection';
                  const laserRes = isReflection ? computeLaserPath(activePuzzle.mirrors) : { path: [], solved: false };

                  return (
                    <div className="bg-[#120502]/95 border border-orange-500/20 p-4 rounded-2xl mt-1 flex flex-col items-center space-y-3 select-none">
                      <div className="w-full flex justify-between items-center text-[10px] font-mono text-orange-300 border-b border-white/10 pb-2">
                        <span>🎮 PUZZLE INTERACTION: {isReflection ? '☀️ LASER MIRROR ROOM' : '🔌 POWER SWITCHBOARD'}</span>
                        <span className={activePuzzle.solved ? "text-emerald-400 font-bold" : "text-amber-400 animate-pulse font-bold"}>
                          {activePuzzle.solved ? "★ SOLVED_OPEN!" : "⚡ CALIBRATING..."}
                        </span>
                      </div>

                      {/* INSTRUCTIONS */}
                      <p className="text-[10px] font-mono text-zinc-300 leading-normal max-w-sm">
                        {isReflection 
                          ? "👉 TAP/CLICK on the mirrors with blue lasers inside the grid map below to rotate them! Shine the sun laser directly onto the doorway door 🚪 to open it!"
                          : "👉 Flip the level switches ON/OFF so that Switch 1 and Switch 3 are green and ON, and Switch 2 is red and OFF. This connects the giant power tube!"
                        }
                      </p>

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

                            {/* INTERACTIVE MIRROR 1 CELL (2,0) */}
                            <g transform="translate(160, 0)" className="cursor-pointer group" onClick={() => handleToggleMirror(0)}>
                              <rect x="5" y="5" width="70" height="70" rx="8" fill="rgba(255,255,255,0.03)" className="hover:fill-white/10 transition-colors" />
                              <circle cx="40" cy="40" r="28" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245,158,11,0.2)" />
                              {activePuzzle.mirrors[0] % 2 === 0 ? (
                                /* / slanting */
                                <line x1="20" y1="60" x2="60" y2="20" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                              ) : (
                                /* \ slanting */
                                <line x1="20" y1="20" x2="60" y2="60" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                              )}
                              {/* Mirror Indicator hub */}
                              <circle cx="40" cy="40" r="10" fill="#180b08" stroke="#f59e0b" strokeWidth="1.5" />
                              <text x="40" y="43" textAnchor="middle" fontSize="8" fill="#ffd800" fontWeight="bold" fontFamily="monospace">{activePuzzle.mirrors[0] * 90}°</text>
                              <text x="40" y="66" textAnchor="middle" fontSize="6.5" fill="#a1a1aa" fontWeight="black" fontFamily="monospace">MIRROR 1 🔄</text>
                            </g>

                            {/* INTERACTIVE MIRROR 2 CELL (2,2) */}
                            <g transform="translate(160, 160)" className="cursor-pointer group" onClick={() => handleToggleMirror(1)}>
                              <rect x="5" y="5" width="70" height="70" rx="8" fill="rgba(255,255,255,0.03)" className="hover:fill-white/10 transition-colors" />
                              <circle cx="40" cy="40" r="28" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245,158,11,0.2)" />
                              {activePuzzle.mirrors[1] % 2 === 0 ? (
                                /* / slanting */
                                <line x1="20" y1="60" x2="60" y2="20" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                              ) : (
                                /* \ slanting */
                                <line x1="20" y1="20" x2="60" y2="60" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                              )}
                              <circle cx="40" cy="40" r="10" fill="#180b08" stroke="#f59e0b" strokeWidth="1.5" />
                              <text x="40" y="43" textAnchor="middle" fontSize="8" fill="#ffd800" fontWeight="bold" fontFamily="monospace">{activePuzzle.mirrors[1] * 90}°</text>
                              <text x="40" y="66" textAnchor="middle" fontSize="6.5" fill="#a1a1aa" fontWeight="black" fontFamily="monospace">MIRROR 2 🔄</text>
                            </g>

                            {/* INTERACTIVE MIRROR 3 CELL (0,2) */}
                            <g transform="translate(0, 160)" className="cursor-pointer group" onClick={() => handleToggleMirror(2)}>
                              <rect x="5" y="5" width="70" height="70" rx="8" fill="rgba(255,255,255,0.03)" className="hover:fill-white/10 transition-colors" />
                              <circle cx="40" cy="40" r="28" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245,158,11,0.2)" />
                              {activePuzzle.mirrors[2] % 2 === 0 ? (
                                /* / slanting */
                                <line x1="20" y1="60" x2="60" y2="20" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                              ) : (
                                /* \ slanting */
                                <line x1="20" y1="20" x2="60" y2="60" stroke="#4af3ff" strokeWidth="6" strokeLinecap="round" />
                              )}
                              <circle cx="40" cy="40" r="10" fill="#180b08" stroke="#f59e0b" strokeWidth="1.5" />
                              <text x="40" y="43" textAnchor="middle" fontSize="8" fill="#ffd800" fontWeight="bold" fontFamily="monospace">{activePuzzle.mirrors[2] * 90}°</text>
                              <text x="40" y="66" textAnchor="middle" fontSize="6.5" fill="#a1a1aa" fontWeight="black" fontFamily="monospace">MIRROR 3 🔄</text>
                            </g>
                          </svg>

                          <div className="flex gap-4 items-center justify-between w-full text-[9px] font-mono text-zinc-400">
                            <span>💡 Tip: Click mirrors above to rotate them!</span>
                            <span className="text-orange-300 font-bold">Goal: Shine onto exit Portal to open!</span>
                          </div>
                        </div>
                      ) : (
                        /* VISUAL ELECTRICAL POWER SWITCHES DASHBOARD */
                        <div className="flex flex-col items-center space-y-3 w-full max-w-sm">
                          <div className="flex justify-center gap-3 w-full">
                            {activePuzzle.mirrors.map((val, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleToggleMirror(idx)}
                                className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  val === 1 
                                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300" 
                                    : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                                } hover:brightness-110 active:scale-95`}
                              >
                                <span className="text-[9px] opacity-70 font-mono">Switch {idx + 1}</span>
                                <span className="text-lg my-1">{val === 1 ? '🔌 ON' : '❌ OFF'}</span>
                                <span className="text-[8px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded tracking-wide font-black">
                                  {val === 1 ? 'TRUE (GREEN)' : 'FALSE (RED)'}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* CORE CENTRAL POWER ACCUMULATOR ENERGY TUBE */}
                          <div className="w-full bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-[9px] text-zinc-400 font-mono uppercase font-bold">Accumulator Tube Status:</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-mono font-black ${activePuzzle.solved ? "text-emerald-400" : "text-rose-400"}`}>
                                {activePuzzle.solved ? "🔋 POWER_FLOW_CONNECTED 100%" : "🔌 POWER_DISCONNECTED 0%"}
                              </span>
                              <div className={`w-3.5 h-3.5 rounded-full ${activePuzzle.solved ? "bg-emerald-500 animate-ping" : "bg-rose-500 animate-pulse"}`}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {activeDialogue.actionText && (
                  <button 
                    onClick={handleDialogueAction}
                    className="w-full bg-gradient-to-r from-teal-500/25 to-[#4af3ff]/20 hover:from-teal-500/40 hover:to-[#4af3ff]/35 border border-[#4af3ff]/30 text-[#4af3ff] text-xs font-bold py-2.5 rounded-xl transition-all font-mono cursor-pointer"
                  >
                    {activeDialogue.actionText}
                  </button>
                )}
                </div>
              </div>
            )}
          </div>

          {/* VIRTUAL ANALOG JOYSTICK PANEL FIXED AT BOTTOM RIGHT OF VIEWPORT */}
          <div 
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-24 h-24 rounded-full bg-black/60 border-2 border-orange-500/30 hover:border-orange-500/60 backdrop-blur-lg flex items-center justify-center z-40 select-none cursor-pointer active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            onMouseDown={handleJoystickStart}
            onTouchStart={handleJoystickStart}
            title="Virtual Joystick: Drag of mouse or touch to move SOL-0 around"
          >
            {/* The orange circle is now the interactive sliding knob controller! */}
            <div 
              ref={joystickThumbRef}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-[#ff9d6c] border border-white/30 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center relative pointer-events-none transition-transform duration-75 ease-out"
            >
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping font-sans"></div>
            </div>
          </div>

        </main>

        {/* FOOTER DAY CHRONOLOGY MILESTONES BAR - REDUCED HEIGHT */}
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
              onClick={resetSimulationState}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/35 border border-orange-400/40 text-orange-300 rounded font-mono text-[9px] uppercase cursor-pointer transition-all"
            >
              <RotateCcw className="w-3 h-3" /> RESTART GAME
            </button>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-mono tracking-widest text-emerald-400">SYNCHRONIZER_STABLE</span>
          </div>
        </footer>

      </div>

      {/* 3. CONSOLE OVERLAYS POPUPS - PAUSES GAMEPLAY AUTOMATICALLY WHEN OPEN */}
      {activePopup && (
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
                onClick={() => {
                  setActivePopup(null);
                  triggerChime(400, 300, 0.2);
                }}
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
                      <span className="font-bold text-indigo-400">{stats.daylightRemaining}% left</span>
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
                    {challengeNodesRef.current.map((node) => (
                      <div 
                        key={node.id}
                        onClick={() => {
                          setActivePopup(null);
                          handleInteractWithNode(node);
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
                          <p className="text-[9px] text-[#ff9d6c] font-black font-mono">+{node.scoreValue}% CURIOSITY</p>
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
                      <span className="text-[8px] text-orange-300 uppercase font-mono tracking-widest font-black">Curiosity</span>
                      <span className="text-xl font-mono font-black text-white mt-1">{stats.curiosityScore}%</span>
                      <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${stats.curiosityScore}%` }}></div>
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
              onClick={() => {
                setActivePopup(null);
                triggerChime(400, 300, 0.2);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-mono text-xs font-black tracking-widest uppercase transition-all rounded-xl cursor-pointer"
            >
              RESUME PROTOCOL
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
