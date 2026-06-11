/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LaserResult, GameChallengeNode, GameNPC, MirrorData, PuzzleBlueprint } from './types';

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
  let dir = { x: 1, y: 0 }; 
  let solved = false;
  const maxBounces = Math.min(30, mirrors.length + 10);

  for (let bounce = 0; bounce < maxBounces; bounce++) {
    let closestU = Infinity;
    let closestMirror: MirrorData | null = null;
    let hitPoint = { x: 0, y: 0 };

    for (const m of mirrors) {
      const angleRad = (m.rotation * Math.PI) / 180;
      const dx = Math.cos(angleRad) * (m.size / 2);
      const dy = Math.sin(angleRad) * (m.size / 2);
      
      const p1 = { x: m.x - dx, y: m.y - dy };
      const p2 = { x: m.x + dx, y: m.y + dy };

      const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
      const x3 = currentPos.x, y3 = currentPos.y;
      const dxRay = dir.x, dyRay = dir.y;

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

    const toGoal = { x: goalPos.x - currentPos.x, y: goalPos.y - currentPos.y };
    const distToGoal = Math.hypot(toGoal.x, toGoal.y);
    const goalDir = { x: toGoal.x / distToGoal, y: toGoal.y / distToGoal };
    const dot = dir.x * goalDir.x + dir.y * goalDir.y;

    if (dot > 0.9995 && distToGoal < closestU) {
      points.push({ ...goalPos });
      solved = true;
      break;
    }

    if (closestMirror) {
      points.push(hitPoint);
      currentPos = hitPoint;

      const angleRad = (closestMirror.rotation * Math.PI) / 180;
      const nx = -Math.sin(angleRad);
      const ny = Math.cos(angleRad);
      
      const dotProd = dir.x * nx + dir.y * ny;
      dir.x = dir.x - 2 * dotProd * nx;
      dir.y = dir.y - 2 * dotProd * ny;

      const len = Math.hypot(dir.x, dir.y);
      dir.x /= len;
      dir.y /= len;
    } else {
      points.push({
        x: currentPos.x + dir.x * viewBoxSize * 2,
        y: currentPos.y + dir.y * viewBoxSize * 2
      });
      break;
    }
  }

  return { path: points, solved };
}

/**
 * STAGE 1: Puzzle Generation Orchestrator (Async API call)
 */
export async function generatePuzzleBlueprint(knowledgeLevel: number): Promise<PuzzleBlueprint> {
  try {
    const response = await fetch('/api/puzzle-architect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knowledgeLevel })
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch blueprint, using local fallback:', error);
    return generateLocalFallbackBlueprint(knowledgeLevel);
  }
}

/**
 * Local Fallback Blueprint Generator
 */
export function generateLocalFallbackBlueprint(knowledgeLevel: number): PuzzleBlueprint {
  let difficulty: PuzzleBlueprint['difficulty'] = 'Easy';
  if (knowledgeLevel > 30) difficulty = 'Medium';
  if (knowledgeLevel > 60) difficulty = 'Hard';
  if (knowledgeLevel > 85) difficulty = 'Expert';

  const room_size = knowledgeLevel > 50 ? 'Large' : 'Medium';
  
  const requiredCount = {
    'Easy': 2,
    'Medium': 4,
    'Hard': 7,
    'Expert': 11
  }[difficulty];

  const decoyCount = {
    'Easy': 0,
    'Medium': 1,
    'Hard': 3,
    'Expert': 5
  }[difficulty];

  const required_mirrors = Array.from({ length: requiredCount }, (_, i) => `M${i + 1}`);
  const decoy_mirrors = Array.from({ length: decoyCount }, (_, i) => `D${i + 1}`);
  const solution_path = [...required_mirrors];

  return {
    difficulty,
    room_size,
    source_position: 'Left Wall',
    target_position: 'Variable',
    required_mirrors,
    solution_path,
    decoy_mirrors,
    topology: difficulty === 'Easy' ? 'Direct' : 'Zigzag',
    estimated_moves: requiredCount * 2,
    difficulty_score: Math.floor(knowledgeLevel),
    design_notes: [
      `Local Fallback Blueprint (Knowledge: ${Math.floor(knowledgeLevel)})`,
      `Requires ${requiredCount} reflections`
    ]
  };
}

/**
 * STAGE 2: Physics Layout Generator
 */
export function realizeBlueprint(
  blueprint: PuzzleBlueprint,
  viewBoxSize: number
): { sunPos: {x:number, y:number}, goalPos: {x:number, y:number}, mirrors: MirrorData[] } {
  const margin = 80;
  const usableSize = viewBoxSize - margin * 2;
  
  const sunPos = { 
    x: margin, 
    y: margin + Math.random() * usableSize 
  };

  const mirrors: MirrorData[] = [];
  let currentPos = { ...sunPos };
  let currentDir = { x: 1, y: 0 }; 
  
  blueprint.solution_path.forEach((id, index) => {
    const segmentDist = (usableSize / (blueprint.solution_path.length + 1)) * (0.7 + Math.random() * 0.6);
    
    let nextX = currentPos.x + currentDir.x * segmentDist;
    let nextY = currentPos.y + currentDir.y * segmentDist;
    
    if (nextX < margin || nextX > viewBoxSize - margin) {
       currentDir.x *= -1;
       nextX = currentPos.x + currentDir.x * segmentDist;
    }
    if (nextY < margin || nextY > viewBoxSize - margin) {
       currentDir.y *= -1;
       nextY = currentPos.y + currentDir.y * segmentDist;
    }

    const mirrorPos = { x: nextX, y: nextY };
    
    const angle = (Math.random() - 0.5) * Math.PI * 1.3;
    const nextDir = { x: Math.cos(angle), y: Math.sin(angle) };
    if (mirrorPos.x < viewBoxSize / 2) nextDir.x = Math.abs(nextDir.x);

    mirrors.push({
      id: parseInt(id.substring(1)) || index,
      x: mirrorPos.x,
      y: mirrorPos.y,
      rotation: Math.random() * 360,
      size: 50
    });

    currentPos = mirrorPos;
    currentDir = nextDir;
  });

  const goalDist = 80;
  const goalPos = {
    x: Math.max(margin, Math.min(viewBoxSize - margin, currentPos.x + currentDir.x * goalDist)),
    y: Math.max(margin, Math.min(viewBoxSize - margin, currentPos.y + currentDir.y * goalDist))
  };

  blueprint.decoy_mirrors.forEach((id, index) => {
    let rx, ry, tooClose;
    let attempts = 0;
    do {
      rx = margin + Math.random() * usableSize;
      ry = margin + Math.random() * usableSize;
      tooClose = mirrors.some(m => Math.hypot(rx - m.x, ry - m.y) < 70);
      attempts++;
    } while (tooClose && attempts < 20);

    if (!tooClose) {
      mirrors.push({
        id: (blueprint.solution_path.length + index + 100),
        x: rx,
        y: ry,
        rotation: Math.random() * 360,
        size: 50
      });
    }
  });

  return { sunPos, goalPos, mirrors };
}

/**
 * Deprecated wrapper for backwards compatibility
 */
export async function generateSolvableMirrorChain(
  viewBoxSize: number,
  requiredMirrors: number,
  distractorCount: number = 0
) {
  const blueprint = await generatePuzzleBlueprint((requiredMirrors + distractorCount) * 10);
  return realizeBlueprint(blueprint, viewBoxSize);
}

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
