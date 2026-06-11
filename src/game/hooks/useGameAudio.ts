/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useCallback } from 'react';
import { DaylightStage } from '../../types';

export function useGameAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneOscsRef = useRef<OscillatorNode[]>([]);
  const droneGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const triggerChime = useCallback((f1: number, f2: number, duration: number = 0.4, isMuted: boolean = false) => {
    try {
      if (!audioContextRef.current || isMuted) return;
      const ctx = audioContextRef.current;
      const t = ctx.currentTime;

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
  }, []);

  const stopDroneAndChords = useCallback(() => {
    droneOscsRef.current.forEach(o => {
      try { o.stop(); } catch (e){}
    });
    droneOscsRef.current = [];
  }, []);

  const playSynthesizerDrone = useCallback((currentStage: DaylightStage, isMuted: boolean = false) => {
    try {
      if (!audioContextRef.current || isMuted) return;

      stopDroneAndChords();

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
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        
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
  }, [stopDroneAndChords]);

  return {
    initAudio,
    triggerChime,
    playSynthesizerDrone,
    stopDroneAndChords
  };
}
