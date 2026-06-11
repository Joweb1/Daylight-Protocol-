/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LaserResult, GameChallengeNode, GameNPC, MirrorData } from './types';

/**
 * 360-Degree Continuous Vector Raycasting for Sun Rays
 */
export function computeSunRayPath(
  sunPos: { x: number, y: number },
  goalPos: { x: number, y: number },
  mirrors: MirrorData[],
  viewBoxSize: number
): LaserResult {
  const points: { x: number; y: number }[] = [{ ...sunPos }];
  let currentPos = { ...sunPos };
  let dir = { x: 1, y: 0 }; // Initial ray direction: Right
  let solved = false;
  const maxBounces = Math.min(20, mirrors.length + 5);

  for (let bounce = 0; bounce < maxBounces; bounce++) {
    let closestU = Infinity;
    let closestMirror: MirrorData | null = null;
    let hitPoint = { x: 0, y: 0 };

    // 1. Check Intersection with all mirrors
    for (const m of mirrors) {
      const angleRad = (m.rotation * Math.PI) / 180;
      const dx = Math.cos(angleRad) * (m.size / 2);
      const dy = Math.sin(angleRad) * (m.size / 2);
      
      const p1 = { x: m.x - dx, y: m.y - dy };
      const p2 = { x: m.x + dx, y: m.y + dy };

      // Ray-Segment Intersection Math
      const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
      const x3 = currentPos.x, y3 = currentPos.y;
      const dxRay = dir.x, dyRay = dir.y;

      // Determinant
      const det = (x2 - x1) * dyRay - (y2 - y1) * dxRay;
      if (Math.abs(det) < 0.0001) continue;

      const t = ((x3 - x1) * dyRay - (y3 - y1) * dxRay) / det;
      const u = ((x1 - x3) * (y2 - y1) - (y1 - y3) * (x2 - x1)) / -det;

      if (t >= 0 && t <= 1 && u > 0.01) {
        if (u < closestU) {
          closestU = u;
          closestMirror = m;
          hitPoint = { x: x3 + dxRay * u, y: y3 + dyRay * u };
        }
      }
    }

    // 2. Check if Goal is hit BEFORE any mirror
    const toGoal = { x: goalPos.x - currentPos.x, y: goalPos.y - currentPos.y };
    const distToGoal = Math.hypot(toGoal.x, toGoal.y);
    const goalDir = { x: toGoal.x / distToGoal, y: toGoal.y / distToGoal };
    const dot = dir.x * goalDir.x + dir.y * goalDir.y;

    // If pointing at goal and nothing is blocking
    if (dot > 0.9995 && distToGoal < closestU) {
      points.push({ ...goalPos });
      solved = true;
      break;
    }

    // 3. Process Mirror Hit
    if (closestMirror) {
      points.push(hitPoint);
      currentPos = hitPoint;

      // Calculate Reflection Vector
      const angleRad = (closestMirror.rotation * Math.PI) / 180;
      // Normal vector is perpendicular to the mirror surface
      const nx = -Math.sin(angleRad);
      const ny = Math.cos(angleRad);
      
      const dotProd = dir.x * nx + dir.y * ny;
      dir.x = dir.x - 2 * dotProd * nx;
      dir.y = dir.y - 2 * dotProd * ny;

      // Normalize new direction
      const len = Math.hypot(dir.x, dir.y);
      dir.x /= len;
      dir.y /= len;
    } else {
      // Ray shoots into boundary
      points.push({
        x: currentPos.x + dir.x * viewBoxSize * 2,
        y: currentPos.y + dir.y * viewBoxSize * 2
      });
      break;
    }
  }

  return { path: points, solved };
}

// Generate random coordinates within game bounds (150 to 850) ensuring no overlap
export function getRandomNonOverlappingPosition(
  existingNodes: GameChallengeNode[],
  npcs: GameNPC[],
  player: { x: number, y: number },
  minDist: number = 150
) {
  let attempts = 0;
  const gameMin = 150;
  const gameMax = 850;

  while (attempts < 50) {
    const rx = gameMin + Math.random() * (gameMax - gameMin);
    const ry = gameMin + Math.random() * (gameMax - gameMin);
    
    let tooClose = false;
    if (Math.hypot(rx - player.x, ry - player.y) < minDist) tooClose = true;
    
    if (!tooClose) {
      for (const node of existingNodes) {
        if (Math.hypot(rx - node.x, ry - node.y) < minDist) {
          tooClose = true;
          break;
        }
      }
    }
    
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
  
  return { x: gameMin + Math.random() * (gameMax - gameMin), y: gameMin + Math.random() * (gameMax - gameMin) };
}
