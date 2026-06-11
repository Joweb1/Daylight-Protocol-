/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterState } from '../types';

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

export interface MirrorData {
  id: number;
  x: number;
  y: number;
  rotation: number; // 0 - 360
  size: number;
}

export interface ActiveMiniPuzzle {
  nodeId: string;
  type: 'reflection' | 'logic';
  targetType: 'door' | 'meat' | 'fish' | 'pot';
  sunPos: { x: number; y: number };
  goalPos: { x: number; y: number };
  mirrors: MirrorData[];
  solved: boolean;
  viewBoxSize: number;
}

export interface LaserResult {
  path: { x: number; y: number }[];
  solved: boolean;
}

export interface PuzzleBlueprint {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  room_size: 'Small' | 'Medium' | 'Large';
  source_position: string;
  target_position: string;
  required_mirrors: string[];
  solution_path: string[];
  decoy_mirrors: string[];
  topology: string;
  estimated_moves: number;
  difficulty_score: number;
  design_notes: string[];
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  targetX: number;
  targetY: number;
  orbitAngle: number;
  eyeExpression: CharacterState;
}

export interface JoystickState {
  active: boolean;
  startX: number;
  startY: number;
  curX: number;
  curY: number;
  vx: number;
  vy: number;
}
