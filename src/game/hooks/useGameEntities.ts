/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useCallback } from 'react';
import { GameNPC, GameChallengeNode } from '../types';
import { INITIAL_NPCS } from '../constants';

export function useGameEntities() {
  const npcsRef = useRef<GameNPC[]>(INITIAL_NPCS);
  const challengeNodesRef = useRef<GameChallengeNode[]>([]);

  const updateNpcs = useCallback(() => {
    npcsRef.current.forEach(npc => {
      npc.x += npc.vx;
      npc.y += npc.vy;

      if (npc.x < 150 || npc.x > 850) npc.vx *= -1;
      if (npc.y < 150 || npc.y > 850) npc.vy *= -1;
    });
  }, []);

  return {
    npcsRef,
    challengeNodesRef,
    updateNpcs
  };
}
