/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LaserResult, GameChallengeNode, GameNPC } from './types';

// Visual Laser beam mirror reflection tracing algorithm
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

// Generate random coordinates within game bounds (80 to 920) ensuring no overlap with existing entities
export function getRandomNonOverlappingPosition(
  existingNodes: GameChallengeNode[],
  npcs: GameNPC[],
  player: { x: number, y: number },
  minDist: number = 150
) {
  let attempts = 0;
  const gameMin = 150; // Keep away from walls
  const gameMax = 850;

  while (attempts < 50) {
    const rx = gameMin + Math.random() * (gameMax - gameMin);
    const ry = gameMin + Math.random() * (gameMax - gameMin);
    
    let tooClose = false;
    
    // Check player
    if (Math.hypot(rx - player.x, ry - player.y) < minDist) tooClose = true;
    
    // Check nodes
    if (!tooClose) {
      for (const node of existingNodes) {
        if (Math.hypot(rx - node.x, ry - node.y) < minDist) {
          tooClose = true;
          break;
        }
      }
    }
    
    // Check NPCs
    if (!tooClose) {
      for (const npc of npcs) {
        if (Math.hypot(rx - npc.x, ry - npc.y) < minDist) {
          tooClose = true;
          break;
        }
      }
    }

    if (!tooClose) return { x: rx, y: ry };
    attempts++;
  }
  
  // Fallback to random if 50 attempts fail (unlikely)
  return { x: gameMin + Math.random() * (gameMax - gameMin), y: gameMin + Math.random() * (gameMax - gameMin) };
}
