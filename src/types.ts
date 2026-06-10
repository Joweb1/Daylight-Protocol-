/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Time stages matching the progression of the game
export type DaylightStage = 'Morning' | 'Noon' | 'Afternoon' | 'Sunset' | 'Night';

export interface DaylightStageDetail {
  stage: DaylightStage;
  colorTheme: string; // Tailwind bg gradient or accent colors
  borderColor: string;
  uiBg: string;
  lightingDescription: string;
  musicMood: string;
  solsticeHours: string;
  npcBehavior: string;
}

// Technical specs and narrative parameters
export interface SimulationStats {
  daylightRemaining: number; // 0 - 100
  cycleSpeed: 'pause' | 'normal' | 'fast';
  curiosityScore: number; // 0 - 100
  humanityScore: number; // 0 - 100
  freedomScore: number; // 0 - 100
  elapsedCycles: number;
}

// Main Character / NPC states
export type CharacterState = 'Idle' | 'Reflecting' | 'Solving' | 'Gliched' | 'Determined' | 'Celebrating';

export interface NpcConcept {
  id: string;
  name: string;
  type: string;
  description: string;
  identityColor: string;
  shapeType: 'eye' | 'glitch' | 'fragment' | 'polygon' | 'security';
}

// Modular puzzle structures
export interface LightReflectionPuzzle {
  gridSize: number;
  emitter: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' };
  receiver: { x: number; y: number };
  mirrors: { x: number; y: number; type: '/' | '\\' | null }[];
  walls: { x: number; y: number }[];
  solved: boolean;
}

export interface LogicGateNode {
  id: string;
  label: string;
  type: 'INPUT' | 'AND' | 'OR' | 'XOR' | 'OUTPUT';
  value: boolean;
  inputs: string[]; // input node IDs
}

export interface PuzzleState {
  lightReflection: LightReflectionPuzzle;
  logicGateNodes: LogicGateNode[];
  selectedCategory: 'reflection' | 'logic';
}

// Game Design Document Chapters
export interface GddChapter {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  contentMarkdown: string;
}

// AI Director Request and Response
export interface AiDirectorPreset {
  id: string;
  name: string;
  description: string;
  metrics: {
    daylightRemaining: number;
    curiosityScore: number;
    humanityScore: number;
    freedomScore: number;
    playerSpeed: 'fast' | 'moderate' | 'stuck';
    recentAction: string;
    stage: DaylightStage;
  };
}

export interface AiDirectorResponse {
  narration: string;
  npcDialogue: {
    speaker: string;
    text: string;
    expression: string;
  };
  metricsAnalysis: {
    cohesionLevel: number;
    difficultyAdjustment: string;
    narrativeArcProgress: string;
  };
  systemRecommendations: string[];
}
