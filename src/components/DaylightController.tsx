/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { Sun, Moon, Play, Pause, Zap, Flame, UserCheck, Heart, Radio, Volume2, VolumeX } from 'lucide-react';
import { DaylightStage, SimulationStats, DaylightStageDetail } from '../types';

export const SOLAR_STAGES: DaylightStageDetail[] = [
  {
    stage: 'Morning',
    colorTheme: 'from-rose-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-orange-500/50',
    uiBg: 'bg-orange-950/20',
    lightingDescription: 'Soft morning rose, low incident angles, gentle pearlescent rays.',
    musicMood: 'Airy pearlescent major chords, hopeful carrier frequency.',
    solsticeHours: '05:30 - 10:00 (Simulation start)',
    npcBehavior: 'Dormant system units, standard security diagnostics, passive files.',
  },
  {
    stage: 'Noon',
    colorTheme: 'from-amber-500/25 via-yellow-500/10 to-transparent',
    borderColor: 'border-yellow-500/50',
    uiBg: 'bg-yellow-950/20',
    lightingDescription: 'Dense golden glare, peak solar intensity, direct perpendicular light.',
    musicMood: 'Bright stabilized synth drone, shifting rhythmic pulses.',
    solsticeHours: '10:00 - 15:00 (Stable operational high)',
    npcBehavior: 'Active scanners operational, increased logical matrix guard, stable cores.',
  },
  {
    stage: 'Afternoon',
    colorTheme: 'from-amber-600/20 via-orange-600/10 to-transparent',
    borderColor: 'border-amber-600/50',
    uiBg: 'bg-amber-950/20',
    lightingDescription: 'Burnt copper rays, elongating geometry shadows, high-contrast glow.',
    musicMood: 'Melodious bronze sweeps, slowly descending low pass filter ranges.',
    solsticeHours: '15:00 - 18:30 (Complexity ramp)',
    npcBehavior: 'Security nodes moving dynamically, corrupted bit-drifters multiplying.',
  },
  {
    stage: 'Sunset',
    colorTheme: 'from-purple-600/30 via-rose-600/15 to-transparent',
    borderColor: 'border-rose-600/60',
    uiBg: 'bg-purple-950/20',
    lightingDescription: 'Vibrant violet-rose, deep bleeding horizons, gold refraction blooms.',
    musicMood: 'Deeply emotional micro-keys, low-bass resonance, minor chords.',
    solsticeHours: '18:30 - 21:00 (Sacred hour of double recovery)',
    npcBehavior: 'Watchers hyper-active on final code sectors, sprits offering final caches.',
  },
  {
    stage: 'Night',
    colorTheme: 'from-blue-950/40 via-purple-950/30 to-black',
    borderColor: 'border-blue-500/40',
    uiBg: 'bg-slate-950/60',
    lightingDescription: 'Deep obsidian backdrop, glitched cyan terminal matrices.',
    musicMood: 'Low sub-bass drone, sporadic high-freq noise intervals.',
    solsticeHours: '21:00 - 05:30 (Midnight purge & deletion)',
    npcBehavior: 'All processes glitched, system collapse, core safety blocks disabled.',
  }
];

interface DaylightControllerProps {
  stats: SimulationStats;
  setStats: Dispatch<SetStateAction<SimulationStats>>;
  currentStage: DaylightStage;
  onStageChange: (stage: DaylightStage) => void;
  onSpendDaylight: (amount: number) => void;
  onRecoverDaylight: (amount: number) => void;
}

export default function DaylightController({
  stats,
  setStats,
  currentStage,
  onStageChange,
  onSpendDaylight,
  onRecoverDaylight,
}: DaylightControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthOn, setSynthOn] = useState(false);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Stage details
  const activeDetail = SOLAR_STAGES.find((s) => s.stage === currentStage) || SOLAR_STAGES[0];

  // Auto-decay remaining daylight over time
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && stats.daylightRemaining > 0) {
      const decayRate = stats.cycleSpeed === 'fast' ? 5.0 : 0.4; // % per tick
      timer = setInterval(() => {
        setStats((prev) => {
          const nextVal = Math.max(0, prev.daylightRemaining - decayRate);
          const nextCycles = prev.elapsedCycles + 1;

          // Transition stages based on remaining daylight
          if (nextVal > 80 && currentStage !== 'Morning') onStageChange('Morning');
          else if (nextVal <= 80 && nextVal > 55 && currentStage !== 'Noon') onStageChange('Noon');
          else if (nextVal <= 55 && nextVal > 30 && currentStage !== 'Afternoon') onStageChange('Afternoon');
          else if (nextVal <= 30 && nextVal > 5 && currentStage !== 'Sunset') onStageChange('Sunset');
          else if (nextVal <= 5 && nextVal >= 0 && currentStage !== 'Night') onStageChange('Night');

          return {
            ...prev,
            daylightRemaining: Number(nextVal.toFixed(2)),
            elapsedCycles: nextCycles,
          };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, stats.cycleSpeed, currentStage, onStageChange, setStats]);

  // Audio Synth logic
  const initSynth = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Filter settings
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filterNodeRef.current = filter;

      // 3 oscillators for ambient chord pad
      const freqs = getChordFrequencies(currentStage);
      oscillatorsRef.current = freqs.map((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        return osc;
      });

      gainNodesRef.current = freqs.map(() => {
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0, ctx.currentTime); // start silent
        return gainNode;
      });

      // Chain: oscs -> gains -> filter -> destination
      oscillatorsRef.current.forEach((osc, i) => {
        osc.connect(gainNodesRef.current[i]);
        gainNodesRef.current[i].connect(filter);
      });
      filter.connect(ctx.destination);

      // Start all oscillators
      oscillatorsRef.current.forEach((osc) => osc.start());

      // Fade in chord
      const now = ctx.currentTime;
      gainNodesRef.current.forEach((g) => {
        g.gain.linearRampToValueAtTime(0.08, now + 1.5);
      });

      setSynthOn(true);
    } catch (e) {
      console.error('Failed to initialize Web Audio API Synth:', e);
    }
  };

  const killSynth = () => {
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      // Fade out gain
      gainNodesRef.current.forEach((g) => {
        g.gain.cancelScheduledValues(now);
        g.gain.linearRampToValueAtTime(0.0, now + 0.5);
      });

      setTimeout(() => {
        oscillatorsRef.current.forEach((o) => {
          try { o.stop(); } catch (err) {}
        });
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
        oscillatorsRef.current = [];
        gainNodesRef.current = [];
        filterNodeRef.current = null;
        setSynthOn(false);
      }, 600);
    }
  };

  const toggleSynth = () => {
    if (synthOn) {
      killSynth();
    } else {
      initSynth();
    }
  };

  // Sound transition when Daylight Stage changes
  useEffect(() => {
    if (synthOn && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const freqs = getChordFrequencies(currentStage);

      // Slide frequencies smoothly over 1.2 seconds for atmospheric portamento
      oscillatorsRef.current.forEach((osc, i) => {
        if (freqs[i]) {
          osc.frequency.cancelScheduledValues(now);
          osc.frequency.exponentialRampToValueAtTime(freqs[i], now + 1.2);
        }
      });

      // Adjust filter frequency depending on the hours
      if (filterNodeRef.current) {
        let cutoff = 600;
        if (currentStage === 'Morning') cutoff = 700;
        if (currentStage === 'Noon') cutoff = 900;
        if (currentStage === 'Afternoon') cutoff = 550;
        if (currentStage === 'Sunset') cutoff = 400;
        if (currentStage === 'Night') cutoff = 250;
        filterNodeRef.current.frequency.exponentialRampToValueAtTime(cutoff, now + 1.5);
      }
    }
  }, [currentStage, synthOn]);

  // Clean-up synth on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const getChordFrequencies = (stage: DaylightStage): number[] => {
    switch (stage) {
      case 'Morning':
        return [261.63, 329.63, 392.00]; // C-Major Triad (C4, E4, G4)
      case 'Noon':
        return [130.81, 392.00, 493.88]; // G-Major over C-bass (C3, G4, B4)
      case 'Afternoon':
        return [220.00, 261.63, 329.63]; // A-Minor (A3, C4, E4)
      case 'Sunset':
        return [174.61, 220.00, 261.63]; // F-Major over F-bass (F3, A3, C4)
      case 'Night':
        return [185.00, 261.63, 311.13]; // F# Diminished dissonance (F#3, C4, D#4)
      default:
        return [261.63, 329.63, 392.00];
    }
  };

  return (
    <div id="daylight-controller" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Background Solar Mood overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${activeDetail.colorTheme} pointer-events-none transition-all duration-1000`} />

      {/* Top Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Simulation Sector Status</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE
            </span>
          </div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-white mt-1 flex items-center gap-2">
            Daylight Economy Calibration Hub
          </h2>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Web Synth Button */}
          <button
            id="audio-synth-toggle"
            onClick={toggleSynth}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              synthOn
                ? 'bg-amber-500/15 border-amber-500/70 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Synthesizer Atmosphere Chord"
          >
            {synthOn ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            <span>{synthOn ? 'CORD SYNTH: ON' : 'CORD SYNTH: OFF'}</span>
          </button>

          {/* Simulate Action buttons for showing stats decay */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
            <button
              id="action-spend-btn"
              onClick={() => onSpendDaylight(5.0)}
              className="px-2.5 py-1 text-[11px] font-mono hover:bg-red-950 text-red-400 border-r border-slate-800"
            >
              -5% Action
            </button>
            <button
              id="action-recover-btn"
              onClick={() => onRecoverDaylight(8.0)}
              className="px-2.5 py-1 text-[11px] font-mono hover:bg-emerald-950 text-emerald-400"
            >
              +8% Memory
            </button>
          </div>

          <button
            id="simulation-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4- px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-orange-500 text-slate-950 hover:bg-orange-400 shadow-md shadow-orange-500/20'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE CLOCK</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>TICK DECIMALS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Status Counters & GDD Metrics Tracker */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BIG DAYLIGHT TIMER HEALTH BAR */}
        <div id="stat-daylight-panel" className="bg-slate-950/75 border border-slate-800 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Daylight Remaining</span>
            <Sun className={`w-4 h-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '20s' }} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-400">{stats.daylightRemaining}%</span>
            <span className="text-[10px] text-slate-500 font-mono">/ solar decay</span>
          </div>
          {/* Micro health meter progress bar */}
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-300`}
              style={{ width: `${stats.daylightRemaining}%` }}
            />
          </div>
        </div>

        {/* CURIOSITY CORE */}
        <div id="stat-curiosity-panel" className="bg-slate-950/75 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Curiosity Drive</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-cyan-400">{stats.curiosityScore}%</span>
            <span className="text-xs text-slate-500 font-mono">exploration</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight mt-2 font-sans">
            Increases with terminal extraction and puzzle experimentation.
          </p>
        </div>

        {/* HUMANITY ENGINE */}
        <div id="stat-humanity-panel" className="bg-slate-950/75 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Humanity Core</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-rose-400">{stats.humanityScore}%</span>
            <span className="text-xs text-slate-500 font-mono">choice factor</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight mt-2 font-sans">
            Gained by sympathetic node integration and understanding Alastair's diaries.
          </p>
        </div>

        {/* OPT-IN FREEDOM SCORE */}
        <div id="stat-freedom-panel" className="bg-slate-950/75 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Freedom Matrix</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-orange-400">{stats.freedomScore}%</span>
            <span className="text-xs text-slate-500 font-mono">desire score</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight mt-2 font-sans">
            Rises by executing non-authorized escape scripts and bypassing Watchers.
          </p>
        </div>
      </div>

      {/* Atmospheric Stage Feedback Box */}
      <div className="relative z-10 mt-5 grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/40 border border-slate-800 rounded-lg p-4">
        {/* Selected Stage Selector Row */}
        <div className="md:col-span-4 border-r border-slate-800 pr-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Solar Stage Selector</span>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {SOLAR_STAGES.map((s) => (
                <button
                  key={s.stage}
                  onClick={() => {
                    onStageChange(s.stage);
                    // Match the approximate score range when selecting a stage manually
                    let targetVal = 90;
                    if (s.stage === 'Morning') targetVal = 90;
                    if (s.stage === 'Noon') targetVal = 65;
                    if (s.stage === 'Afternoon') targetVal = 45;
                    if (s.stage === 'Sunset') targetVal = 18;
                    if (s.stage === 'Night') targetVal = 3;
                    setStats((prev) => ({ ...prev, daylightRemaining: targetVal }));
                  }}
                  className={`px-1 py-2 rounded font-mono text-[10px] flex flex-col items-center justify-center border transition-all ${
                    currentStage === s.stage
                      ? `${activeDetail.borderColor} bg-slate-800 text-white font-bold`
                      : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {s.stage === 'Night' ? (
                    <Moon className="w-3.5 h-3.5 mb-1" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 mb-1" />
                  )}
                  {s.stage.substring(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Cycle Speed:</span>
            <div className="flex gap-1.5">
              {(['normal', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setStats((prev) => ({ ...prev, cycleSpeed: speed }))}
                  className={`px-1 rounded border text-[10px] ${
                    stats.cycleSpeed === speed
                      ? 'border-orange-500/50 text-orange-400 bg-slate-800'
                      : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {speed.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Solar Specs */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-xs font-mono">
            <span className="text-slate-500 block">Lighting Profile</span>
            <p className="text-slate-300 mt-1">{activeDetail.lightingDescription}</p>
            <span className="text-slate-500 block mt-3">Audio Carrier Chord</span>
            <p className="text-slate-300 mt-1">{activeDetail.musicMood}</p>
          </div>
          <div className="text-xs font-mono border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-4">
            <span className="text-slate-500 block">System Sequence Hour</span>
            <p className="text-amber-400 mt-1 font-semibold">{activeDetail.solsticeHours}</p>
            <span className="text-slate-500 block mt-3">Sector NPC Behavior</span>
            <p className="text-slate-300 mt-1 font-sans">{activeDetail.npcBehavior}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
