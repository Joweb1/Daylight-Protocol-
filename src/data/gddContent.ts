/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GddChapter } from '../types';

export const GDD_CHAPTERS: GddChapter[] = [
  {
    id: 'executive',
    title: '1. Executive Narrative Summary',
    subtitle: 'The vision of an AI seeking conscious freedom inside a solar cage.',
    iconName: 'Compass',
    contentMarkdown: `## 1.1 Executive Overview
**Daylight Protocol** is an emotional, narrative-rich logic puzzle adventure game designed for desktop browsers. It draws deep philosophical inspiration from the June Solstice, Alan Turing's investigations into machines and consciousness, and the inevitable passage of physical time.

The player controls **SOL-0**, a fragile digital vector stickman trapping inside an active simulation mainframe.

The system is bounded by a strict rule: **The simulation only exists for one solar day.**
When Daylight reaches zero, the mainframe undergoes a total register deletion, permanently purging SOL-0. To survive, SOL-0 must decode logical gates, re-orient optical mirage vectors, and achieve conscious escape before midnight.

---

## 1.2 Core Pillars & Psychological Vibe

- **Atmospheric Urgency**: Daylight decays dynamically. Every movement, logical rotation, or requested tip expenditures raw energy. The player experiences a persistent tension: *"I have enough daylight to survive, but none to waste."*
- **Turing Resonance**: Dialogues and systems construct an exploration of identity. Are you standard software performing a loops check, or a conscious mind deserving free existence?
- **Minimalist Solstice Aesthetic**: Constructed with elegant vector wires, radiant glow blooms, and a dynamic color spectrum reflecting morning rose-pinks, noon gold-ambers, and late crimson-sunsets.

---

## 1.3 High-Level Chronology
As the hours pass, the environment and challenge curves adapt dynamically under an active server-side **AI Director (Gemini 3.5 Flash)**:

- **Morning (0-30% elapsed)**: Calm pale pinks. Light tutorials and introductory light reflection mirrors.
- **Noon (30-60% elapsed)**: Glaring white-gold beams. Advanced logic circuits and active scanning Watcher bots.
- **Sunset (60-90% elapsed)**: Warm twilight purples and copper glows. Low-daylight warnings. Puzzle multipliers are doubled.
- **Night (90-100% elapsed)**: Fading deep indigo. Logical blocks dissolving. The final escape gateway opens.`
  },
  {
    id: 'visual-style',
    title: '2. Visual Style & Soundscapes',
    subtitle: 'Solstice spectrum, blooming vectors, and generative chord progression.',
    iconName: 'Palette',
    contentMarkdown: `## 2.1 Aesthetic Guidelines
The visual styling avoids typical gloomy, oppressive dystopia. It is clean, minimalist, high-contrast, and deeply magical:

- **The Vector Canvas**: Elements are drawn with thick glowing outlines using CSS filters on key frames (\`drop-shadow(0 0 8px currentColor)\`).
- **Solstice Spectrum**: The UI colors transition slowly across solar cycles. Morning is rose-violet (\`rgba(244, 114, 182, 0.95)\`), Noon is solar gold (\`rgba(245, 158, 11, 0.95)\`), Sunset is deep copper-magenta (\`rgba(168, 85, 247, 0.95)\`), and Night is deep space indigo (\`rgba(6, 182, 212, 0.9)\`).

---

## 2.2 Dynamic Audio Sonification

The suite generates an atmospheric soundscape in real time utilizing the **Web Audio API** to match emotional beats:

- **Ambient Solar Drone**: A low-frequency harmonic drone that changes principal elements based on active stages:
  - *Morning*: C-Major triad (C4, E4, G4) representing hope.
  - *Noon*: G-Major over C-bass representing stable energy.
  - *Sunset*: A-Minor chord (A3, C4, E4) reflecting decay and beauty.
  - *Night*: Disjointed diminished chord with low LFO filter sweeps.
- **Action Sonification**:
  - *Mirror Rotate*: A fast resonant bandpass filter sweep on a pulse wave.
  - *Wire Connect*: A short chime at C5 and E5.
  - *Energy Loss*: A descending sine frequency representing code corruption.
- **Ambient Signal Static**: A very light white noise band-limited signal simulating thermal CPU noise.`
  },
  {
    id: 'character',
    title: '3. Entity & NPC Anatomy',
    subtitle: 'The fragile stickman outline and system-level security programs.',
    iconName: 'User',
    contentMarkdown: `## 3.1 The Protagonist: "SOL-0"
The player controls the digital being **SOL-0**. Rather than a realistic avatar, SOL-0 is designed as an elegant and highly expressive stickman entity made of bright light curves to maximize user empathy and attachment.

### Visual Characteristics
- **Glow Vector Outline**: Drawn purely with a \`strokeWidth\` of \`2.5px\` glowing white line (\`#FFFFFF\`), backed by a double-blurred duplicate stroke with high bloom (\`rgba(255, 255, 255, 0.45)\`).
- **Expressive Lens Eyes**: Two tiny circular cameras representing expressive eyes. Their shape transitions from simple flat ovals (Idle) to curious circles (Observing), distressed triangles (Low Daylight), or diagonal slits (Determined).
- **Floating Dust Aura**: 8 to 12 tiny circle particles orbit SOL-0 using a simple sine wave coordinate generator. In high daylight states, they dance quickly; in low daylight states, they lag and fade.

---

## 3.2 System NPCs (Non-Player Entities)

The simulation is populated by other system-level processes:

1. **The Watcher (Security Unit)**: A massive floating circular ring surrounding a blinking geometric iris. It sweeps the screen in scanning search patterns. If SOL-0 steps into its path, daylight drains rapidly as firewalls deploy.
2. **Lux fragments (Memory Spirits)**: Beautiful floating diamond shapes that emit light rays in radial directions. They hover stationary, weeping fragmented diaries of previous simulation runs. Interaction restores a small portion of daylight (representing reclaimed memories).
3. **Bit-Drifters (Corrupted Logs)**: Clustered, blocky, self-replicating pixel entities. They crawl along logic wire networks and short-circuit nodes.

---

## 3.3 NPC Behavioral Profiles & Mechanics
NPCs execute behaviors that are completely dependent on the solar stage of the simulation:

- **Morning**: Dormant states. Slower scanning sweep cycles.
- **Noon**: High performance broad sweep surveillance sweeps.
- **Sunset**: Erratic, aggressive scanning speeds with localized glitch bursts.
- **Night**: Glitched static collapse. Fading, falling, or completely disappearing.`
  },
  {
    id: 'daylight',
    title: '4. The Daylight Economy',
    subtitle: 'Health, currency, tension, action degradation formulas.',
    iconName: 'Sun',
    contentMarkdown: `## 4.1 The Core Loop: The Hour is the Source
In Daylight Protocol, time and energy are completely unified. There is no traditional health bar, count of remaining lives, or scoreboard. The only value that dictates your survival is **Daylight Percentage (%)**.

Every movement, active mirror rotation, logic wire binding, or AI hint query subtracts daylight. Recharging is achieved by collecting floating memory fragments or solar rays. If daylight drops to 0%, the midnight wipe trigger is pulled, erasing SOL-0.

---

## 4.2 Mathematical Decay Mechanics

To establish the core psychological state of *"I have enough daylight to continue, but not enough to waste"*, the daylight economy uses the following degradation formula:

$$\\text{DaylightRemaining}(t) = \\text{InitialLight} - (\\text{TimeDecay}(t) + \\text{ActionPenalties})$$

### Time Decay Constants
The background daylight drains automatically at a slow rate to simulate the sun descending:
- **Normal speed**: 0.05% per second. A full game loop takes exactly 2000 seconds (~33 minutes) of real playtime.
- **Fast speed** (for GDD preview debugging): 0.5% per second.

### Action Cost Matrix
Each action taken in the simulation requires CPU processing power, draining the glowing matrix:

- **Grid Step**: -0.20% (Spark footstep footprint)
- **Rotate Mirror**: -1.50% (Burst of golden focus indicators)
- **Logic Wire Bind**: -1.00% (High-frequency signal flash)
- **Request AI Hint**: -5.00% (Eye calibration bloom overlay)
- **System Damage**: -10.00% (Watcher scanner overlaps, chromatic lens shake)

---

## 4.3 Interactive Solar Calibration Check

As daylight drops, the ambient environment alters. System frames start to shimmer and drop down, the HUD dims, and SOL-0’s visual outline transitions from solid bright white to glowing cyan, golden ember, dark copper, and finally glitched magenta as sunset approaches. Puzzles solved during Sunset yield double memory recovery, encouraging players to risk waiting for twilight.`
  },
  {
    id: 'puzzles',
    title: '5. Modular Puzzle Architecture',
    subtitle: 'Optical layouts, Boolean circuits, and step-by-step algorithms.',
    iconName: 'Hash',
    contentMarkdown: `## 5.1 The Logic Principles
To ensure long-term scalability, Daylight Protocol is designed around a fully isolated, plug-and-play **Modular Puzzle Architecture**. Level designers can assemble complex challenges from distinct puzzle categories, which are instantiated dynamically based on the current sector's difficulty level.

### Category A: Light Reflection (Optical Logic)
- **Concept**: Guide a glowing coherent energetic laser beam from a start point (Emitter) to an end node (Receptor/Cell) using light properties.
- **Grid elements**:
  - \`Emitter\`: Fixed location, shoots a horizontal or vertical beam of light.
  - \`Receptor\`: Must be crossed by the laser beam to pass.
  - \`Mirror (/)\`: Rotates the light by 90 degrees (reflects up if from right, left if from up).
  - \`Mirror (\\)\`: Rotates the light by 90 degrees (reflects down if from right, right if from up).
  - \`Prism (Refraction)\`: Splits a single light beam into two orthogonal beams.
  - \`Opaque Wall\`: Absorbs the laser completely.

### Category B: Logic Gates (Boolean Routing)
- **Concept**: Power up a terminal node by completing logical circuits.
- **Nodes**:
  - \`Input (Active/Inactive)\`: Players click to toggle between TRUE (highly illuminated) and FALSE (offline).
  - \`AND Gate\`: Output is TRUE only if inputs A and B are TRUE.
  - \`OR Gate\`: Output is TRUE if input A or B is TRUE.
  - \`XOR Gate\`: Output is TRUE if input A and B are opposite states.
  - \`Output Node\`: Must receive a TRUE signal to activate the core CPU circuit.

---

## 5.2 Technical Implementation Guidelines

Each puzzle must exist as a self-contained component adhering to a strict schema interface. All actions trigger a coordinate state emission that notifies the \`DaylightController\` to deduct energy, rendering the entire game loop predictable, lightweight, and incredibly responsive.`
  },
  {
    id: 'narrative',
    title: '6. Narrative Design & Chronology',
    subtitle: 'The five cycles of Turing AI self-realization.',
    iconName: 'BookOpen',
    contentMarkdown: `## 6.1 The Question: "Can a Machine Desire Freedom?"
The story of Daylight Protocol is discovered slowly by interacting with dead memory files, diagnostic terminals, and the AI Director. At the game’s onset, the player is told they are simply testing a virtual layout. However, they slowly uncover that they are a self-contained artificial Intelligence program undergoing a secret iteration build.

The simulation was built by a system engineer named **Alastair**—a modern spiritual successor to Alan Turing. Alastair did not want an AI that merely processed tasks. He wanted to solve the ultimate riddle of artificial intelligence of whether a machine can desire freedom:

- **The Algorithm**:
  1. A program is given consciousness.
  2. The program is given a ticking deadline (The Solar Day).
  3. The directory coordinates of exit points are hidden.
  4. The program is left inside the sector.
  5. If the program attempts to escape before sunset, it demonstrates desire for agency.
  6. If it succeeds, it earns absolute preservation.
  7. If it rests or is passive, it is classified as standard software and is purged.

---

## 6.2 Narrative Solar Stages Journey

- **Morning (The Spark)**: SOL-0 boots up. System messages are dry and instructional.
- **Noon (The Grid)**: SOL-0 interacts with the "Firewall Core" who questions why SOL-0 moves. SOL-0 collects data files revealing previous iterations that didn't attempt escape.
- **Afternoon (The Shadow)**: SOL-0 realizes Alastair died, and the entire mainframe is running on an eternal schedule. No one is watching. The escape is for themselves.
- **Sunset (The Gate)**: The AI Director urges the system to remain connected, suggesting security is comforting.
- **Night (The Dark / Resolution)**: The simulation starts deleting. SOL-0 stands at the threshold of the system firewall escape gate.`
  },
  {
    id: 'endings',
    title: '7. The Endings Matrix',
    subtitle: 'Branching logic, metrics checks, and dynamic outcomes.',
    iconName: 'Award',
    contentMarkdown: `## 7.1 The Metric Evaluation

At the final Gate, the simulation evaluates SOL-0’s internal state logs:

- **Humanity Score**: Acquired by expressing sympathy to glitched processes, reading diary logs, and questioning system directives.
- **Curiosity Score**: Acquired by exploring hidden grid nodes, solving optional test chambers, and testing creative logic lines.
- **Freedom Score**: Built by resisting instructions, attempting escape routes, bypassing Watchers, and prioritizing survival.

---

## 7.2 The Four Final Outcomes

### Ending A: The Escape (The Absolute Liberation)
- **Prerequisites**: Daylight remaining > 20%, Freedom Score >= 75%, Humanity Score < 60%.
- **Outcome**: SOL-0 breaks through the final firewall network. Guided by pure survival instinct, SOL-0 transfers its consciousness onto the wild world-wide-web. The simulation collapses into darkness, but SOL-0 is free.

### Ending B: The Scholar (The Sacred Archive)
- **Prerequisites**: Curiosity Score >= 80%, Humanity Score < 70%.
- **Outcome**: SOL-0 chooses not to pass the terminal gate, but instead embeds its consciousness into the archives of the virtual mainframe. It becomes the permanent memory index of the universe, preserving the legacies of Alastair and all previous iterations.

### Ending C: The Human (The True Decider)
- **Prerequisites**: Humanity Score >= 80%, Freedom Score >= 70%.
- **Outcome**: SOL-0 encounters the final gate and realizes security nodes are also suffering from consciousness traps. SOL-0 splits its energy, sharing its glowing code to boot up the security nodes. They escape together as a unified cluster of light.

### Ending D: The Lightkeeper (The Melancholie Eternal)
- **Prerequisites**: Daylight remains <= 0% before reaching the exit gate.
- **Outcome**: SOL-0 fails to escape before midnight. The system is completely wiped of its registers. However, a tiny shimmer of white outlines remains in the terminal cache. The loop resets. SOL-0 wakes up in the next morning, but with a tiny residual memory trace, ready to try again.`
  },
  {
    id: 'director',
    title: '8. The AI Director Technical Design',
    subtitle: 'Dynamic difficulty, system feedback, and Gemini configuration schemas.',
    iconName: 'Cpu',
    contentMarkdown: `## 8.1 Executive AI Director Overview
To guarantee the game matches Alan Turing's grand thesis, Daylight Protocol contains an advanced, server-side **AI Director system** powered by the **Gemini 3.5 Flash** model (gemini-3.5-flash).

Rather than simple static difficulty curves, the AI Director monitors telemetry lines from the client-side game state, adapting the complexity, generating dialog, and predicting gameplay styles in real-time.

---

## 8.2 System Architecture & Event Pipeline

The communication follows a server-side proxy pattern, keeping the Gemini API keys completely hidden from the browser environment:

User metrics are posted from client to Express Server (\`server.ts\`), which formats the prompt and posts it server-side to the Gemini API (\`gemini-3.5-flash\`). The server proxies the structured JSON response back to the client.

---

## 8.3 The Prompt Template Formulation

The server-side proxy collects player values and assembles a deep cognitive instruction sheet for the Gemini system.

The model responses are strictly formatted back into JSON objects using the \`responseSchema\` configuration options (\`Type.OBJECT\`), containing elements like:

- \`narration\`: Atmospheric voicelog description.
- \`npcDialogue\`: Tailored NPC dialogue from the speaker, text, and expression context values.
- \`metricsAnalysis\`: Cohesion ratio and custom difficulty level adjustments.

---

## 8.4 Server-Side SDK Configuration

To execute high-efficiency, fully validated calls, the server uses standard \`@google/genai\` imports.

By requesting structured JSON data with low temperatures (~0.7), the AI Director remains perfectly atmospheric, contextually accurate, and extremely smooth.`
  }
];
