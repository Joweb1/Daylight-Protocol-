/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useCallback } from 'react';
import { Particle } from '../types';

export function useGameParticles() {
  const particlesRef = useRef<Particle[]>([]);
  const particleIdCounter = useRef(0);

  const spawnEnergyBursts = useCallback((x: number, y: number, color: string, count: number = 8) => {
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
  }, []);

  const updateParticles = useCallback(() => {
    particlesRef.current = particlesRef.current.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life + 1,
    })).filter(p => p.life < p.maxLife);
  }, []);

  return {
    particlesRef,
    spawnEnergyBursts,
    updateParticles,
    particleIdCounter
  };
}
