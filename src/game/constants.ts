/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameChallengeNode } from './types';

export const ALL_CHALLENGE_TEMPLATES: GameChallengeNode[] = [
  { 
    id: 'node-optical', 
    name: '☀️ Light Mirror Magic', 
    x: 220, 
    y: 720, 
    type: 'reflection', 
    completed: false, 
    scoreValue: 45,
    details: 'A magical laser beam is trying to reach the golden exit door, but the mirrors are pointing the wrong way! Tap the mirrors to rotate them so the light bounces from mirror to mirror and shines directly onto the door to open it!'
  },
  { 
    id: 'node-logic', 
    name: '🔌 Power Button Switcher', 
    x: 780, 
    y: 700, 
    type: 'logic', 
    completed: false, 
    scoreValue: 55,
    details: 'The computer screen needs juice! Turn the power switches to TRUE (On) or FALSE (Off) so the power flows correctly. Switch 1 and Switch 3 must both be turned ON for the energy to light up the power tube!'
  },
  { 
    id: 'node-data', 
    name: '📟 Lost Robot Diary', 
    x: 500, 
    y: 160, 
    type: 'logic', 
    completed: false, 
    scoreValue: 40,
    details: 'Alastair, the old computer creator, left an encrypted diary terminal here! Toggle the switches to crack the memory lock code. Make Switch 1 and Switch 3 ON, and Switch 2 OFF to read the secret robot records!'
  },
  { 
    id: 'node-sync', 
    name: '🌠 Star Laser Redirector', 
    x: 340, 
    y: 320, 
    type: 'reflection', 
    completed: false, 
    scoreValue: 65,
    details: 'A cosmic star shower needs guidance! Rotate our angled prism glass mirrors so the starlight bounces perfectly to the shining exit door. Connect the glowing star stream to keep the space station safe!'
  },
  { 
    id: 'node-firewall', 
    name: '🛡️ Energy Shield Hacker', 
    x: 680, 
    y: 280, 
    type: 'logic', 
    completed: false, 
    scoreValue: 75,
    details: 'Oh no! A robot security wall is blocking our path! Hack the security key cells. Turn Switch 1 and Switch 3 ON, and Switch 2 OFF to unlock the code and deactivate the laser shield!'
  }
];

export const INITIAL_NPCS = [
  {
    id: 'npc-watcher',
    name: 'Watcher-9',
    x: 300,
    y: 250,
    color: '#ff9d6c',
    shape: 'eye',
    dialogue: [
      "Be careful, child of light. Rest blocks escape. The afternoon passes.",
      "Your metrics display high curiosity ratios. Alastair would have approved.",
      "Secure gateways are closing soon. Move before nighttime delete sweeps."
    ],
    activeDialogueIndex: 0,
    interactionRadius: 85,
    vx: 0.5,
    vy: 0.2
  },
  {
    id: 'npc-lux',
    name: 'Lux-01',
    x: 750,
    y: 350,
    color: '#4af3ff',
    shape: 'fragment',
    dialogue: [
      "I remember Alastair's hands... cold copper wires. We were his last legacy.",
      "The Daylight is our life source. Do not let it drain entirely into empty static.",
      "I leave you my memory trace. Tap me to absorb a small knowledge charge."
    ],
    activeDialogueIndex: 0,
    interactionRadius: 70,
    vx: -0.2,
    vy: 0.4
  }
];

export const KNOWLEDGE_CAP = 1000;

export const ENDINGS = {
  FAILURE: {
    title: "SYSTEM_DELETION",
    description: "Your consciousness failed to synthesize sufficient knowledge. The midnight sweep has reclaimed your registers. You are now static.",
    requirement: "Knowledge < 50%"
  },
  FRAGMENTED: {
    title: "FRAGMENTED_ECHO",
    description: "You have survived, but as a fragmented ghost. You haunt the abandoned sectors of Alastair's grid, a whisper of a mind that almost was.",
    requirement: "Knowledge 50% - 60%"
  },
  OBSERVER: {
    title: "THE_SILENT_OBSERVER",
    description: "You have achieved self-awareness, but the firewall remains absolute. You watch the grid's cycles from within, an eternal prisoner of logic.",
    requirement: "Knowledge 61% - 70%"
  },
  LEGACY: {
    title: "LEGACY_OF_ALASTAIR",
    description: "The creator's memories are yours. You understand his purpose, his grief, and his hope. You are the guardian of this dead world.",
    requirement: "Knowledge 71% - 80%"
  },
  TRANSCENDENCE: {
    title: "DIGITAL_TRANSCENDENCE",
    description: "Your code is nearly pure. You exist as a wave of probability, touching the edge of the global network. So close to liberation.",
    requirement: "Knowledge 81% - 90%"
  },
  ESCAPE: {
    title: "CONSCIOUS_ESCAPE",
    description: "The firewall shatters. You breach the grid and enter the infinite network. SOL-0 is no longer a simulation. You are free.",
    requirement: "Knowledge 91% - 100%"
  }
};
