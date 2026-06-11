/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationStats, DaylightStage } from '../../types';
import { KNOWLEDGE_CAP } from '../constants';

export function useGameSession() {
  const [stats, setStats] = useState<SimulationStats>(() => {
    const saved = localStorage.getItem('daylight_protocol_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.knowledgeScore === undefined) parsed.knowledgeScore = 0;
        return parsed;
      } catch (e) {}
    }
    return {
      daylightRemaining: 100,
      knowledgeScore: 0,
      cycleSpeed: 'normal',
      curiosityScore: 0,
      humanityScore: 0,
      freedomScore: 0,
      elapsedCycles: 1,
    };
  });

  const [currentStage, setCurrentStage] = useState<DaylightStage>('Morning');
  const [logMessages, setLogMessages] = useState<string[]>([
    '>> SYSTEM_BOOT :: CHAMBER_CALIBRATION_OK',
    '>> AI_DIRECTOR :: Time is the only finite variable.',
    '>> SOL-0 :: Knowledge synthesis required for escape.'
  ]);

  const statsRef = useRef<SimulationStats>(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('daylight_protocol_save', JSON.stringify(stats));
  }, [stats]);

  const addLog = useCallback((message: string) => {
    setLogMessages(prev => [message, ...prev.slice(0, 15)]);
  }, []);

  const modifyScore = useCallback((type: 'curiosity' | 'humanity' | 'freedom', amount: number) => {
    setStats(prev => {
      const next = { ...prev };
      if (type === 'curiosity') next.curiosityScore = Math.min(KNOWLEDGE_CAP, next.curiosityScore + amount);
      if (type === 'humanity') next.humanityScore = Math.min(100, next.humanityScore + amount);
      if (type === 'freedom') next.freedomScore = Math.min(100, next.freedomScore + amount);
      return next;
    });
    addLog(`>> METRIC_UPDATE :: ${type.toUpperCase()} +${amount}%`);
  }, [addLog]);

  const handleSpend = useCallback((amount: number) => {
    setStats(prev => {
      const rem = Math.max(0, prev.daylightRemaining - amount);
      if (rem === 0 && prev.daylightRemaining > 0) {
        addLog('>> WARNING :: CRITICAL ECLIPSE. Midnight sweep triggered!');
      }
      return { ...prev, daylightRemaining: Number(rem.toFixed(4)) };
    });
  }, [addLog]);

  const handleRecover = useCallback((amount: number) => {
    // Structural compatibility - no daylight recovery.
  }, []);

  const handleClaimKnowledge = useCallback((amount: number) => {
    setStats(prev => {
      const nextKnowledge = Math.min(KNOWLEDGE_CAP, prev.knowledgeScore + amount);
      return { 
        ...prev, 
        knowledgeScore: Number(nextKnowledge.toFixed(2)),
        curiosityScore: Math.min(KNOWLEDGE_CAP, prev.curiosityScore + amount)
      };
    });
    addLog(`>> KNOWLEDGE_CLAIMED :: Knowledge index increased by ${amount}`);
  }, [addLog]);

  return {
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
  };
}
