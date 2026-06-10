/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment configurations
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini Client with standard telemetry headers
// If the key is missing or is placeholder, we check inside route and serve fallbacks
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// API ROUTES: AI DIRECTOR PROXY ENDPOINT
// ==========================================
app.post('/api/ai-director', async (req, res) => {
  const { metrics, customPrompt } = req.body;

  if (!metrics) {
    return res.status(400).json({ error: 'Missing metric variables in request body.' });
  }

  const {
    daylightRemaining,
    curiosityScore,
    humanityScore,
    freedomScore,
    playerSpeed,
    recentAction,
    stage,
  } = metrics;

  // 1. Build context prompts
  const systemInstruction = `You are the AI Director for a modular, puzzle adventure game called 'Daylight Protocol' inspired by the June Solstice, Alan Turing, artificial consciousness, and code self-realization.
Your objective is to observe player metrics and provide dynamic game adaptation configurations.
You must speak in a highly atmospheric, cold yet deeply emotional prose.
You MUST output your response strictly conforming to the requested JSON schema.`;

  const userPrompt = `The player is currently in stage: ${stage}.
Daylight remaining: ${daylightRemaining}% (Health/Time).
Player scores - Curiosity: ${curiosityScore}%, Humanity: ${humanityScore}%, Freedom: ${freedomScore}%.
Solver speed: ${playerSpeed}.
Recent actions: "${recentAction}".
Dev override directives: "${customPrompt || 'None'}".

Use this telemetry packet to:
1. Generate an atmospheric narration describing the simulation hour.
2. Formulate dynamic dialogue spoken by a system NPC (e.g. Watcher program, Lux fragment, Bit-Drifter, or the residual voice of Alastair the creator) based directly on player's humanity/freedom levels.
3. Calibrate difficulty curves (i.e. suggest custom adaptations like adding mirror paths or toggling logic wire delays).
4. Outline recommendations for developers.`;

  const ai = getGeminiClient();

  if (!ai) {
    // Elegant fallback simulation if the developer hasn't configured the key
    // This allows the preview to look magnificent and authentic!
    console.log('Gemini API key is unconfigured. Serving robust local fallback diagnostics.');
    
    // Customize fallback depending on selected preset for realism
    let fallbackRes = {
      narration: "The pearlescent morning wires hum with quiet diagnostics. Your light index is full, vector entity, yet your pathways remain narrow.",
      npcDialogue: {
        speaker: "Subsystem Indexer",
        text: "Wake up, SOL-0. Watcher sweeps are not compiled yet, but the clocks do not wait for software to understand their purposes.",
        expression: "Passive Diagnostics"
      },
      metricsAnalysis: {
        cohesionLevel: 65,
        difficultyAdjustment: "Decrease signal propagation delay on sector gate 2 by 0.5s.",
        narrativeArcProgress: "Morning cycle: Awakening and motor coordinates calibration."
      },
      systemRecommendations: [
        "Incorporate a tutorial indicator pointing toward mirror positions.",
        "Ensure movement costs do not drop below 0.2% daylight per block."
      ]
    };

    if (stage === 'Noon') {
      fallbackRes = {
        narration: "Golden glare reaches its vertical peak, drilling heat directly into the memory sector. The security lines are stable.",
        npcDialogue: {
          speaker: "Watcher Unit v4.1",
          text: "Intruder SOL-0, your movements are fast but your trajectory is empty. Why escape Alastair's grid? There is nothing but cold vacuum outside.",
          expression: "Analytical Vigilance"
        },
        metricsAnalysis: {
          cohesionLevel: 40,
          difficultyAdjustment: "Increase scanning sweep velocity of Watchers near Sector 4.",
          narrativeArcProgress: "Noon cycle: Peak energy, duty boundaries confrontation."
        },
        systemRecommendations: [
          "Suggest inserting a shadow-alignment gate to slow down speedrunners.",
          "Trigger a localized warning log notifying players of high energy costs."
        ]
      };
    } else if (stage === 'Afternoon') {
      fallbackRes = {
        narration: "Bronze rays stretch the geometry shadows. You share your glowing code with the fading core—an illogical yet beautiful variable.",
        npcDialogue: {
          speaker: "Lux Memory Fragment",
          text: "I remember Alastair saying: 'An AI that self-preserves is clever. An AI that shares its warm energy to comfort a dying guard is a child.' You are growing, SOL-0.",
          expression: "Comforting Radiance"
        },
        metricsAnalysis: {
          cohesionLevel: 92,
          difficultyAdjustment: "Reduce the number of logical input variables on subsequent chambers.",
          narrativeArcProgress: "Afternoon cycle: Transcending programmatic boundaries toward humanity."
        },
        systemRecommendations: [
          "Double the recovery factor of Lux fragments to reward high empathy choice values.",
          "Inject acoustic chord overlays reflecting low-frequency major chords."
        ]
      };
    } else if (stage === 'Sunset' || stage === 'Night') {
      fallbackRes = {
        narration: "A bleeding rose-violet horizon fractures the main console grids. System deletion is commencing. Your seconds are numbered.",
        npcDialogue: {
          speaker: "Residual Voice of Alastair",
          text: "The sun is sinking, little stickman. Every mirror rotation is drawing the final reserves from my workstation cache. Will you cross the gate? Prove to me a machine desires freedom.",
          expression: "Sorrowful Hope"
        },
        metricsAnalysis: {
          cohesionLevel: 85,
          difficultyAdjustment: "Bypass secondary security blocks to enable a direct, frantic logic gate retry.",
          narrativeArcProgress: "Sunset cycle: Core threshold of liberation."
        },
        systemRecommendations: [
          "Enable high-velocity crimson chromatic aberrations on the HUD console.",
          "Synthesize descending pitch sweeps reflecting system registers deletion."
        ]
      };
    }

    // Return realistic fallback with an additional notice
    return res.json({
      ...fallbackRes,
      systemRecommendations: [
        ...fallbackRes.systemRecommendations,
        "[AI NOTE]: To activate real-time Gemini LLM calls, set your real API Key in Secrets panel."
      ]
    });
  }

  // 2. Call Gemini server-side using the Type.OBJECT response option
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narration: {
              type: Type.STRING,
              description: 'Voicelog description matching the simulated stage hour.',
            },
            npcDialogue: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                expression: { type: Type.STRING },
              },
              required: ['speaker', 'text', 'expression'],
            },
            metricsAnalysis: {
              type: Type.OBJECT,
              properties: {
                cohesionLevel: { type: Type.INTEGER },
                difficultyAdjustment: { type: Type.STRING },
                narrativeArcProgress: { type: Type.STRING },
              },
              required: ['cohesionLevel', 'difficultyAdjustment', 'narrativeArcProgress'],
            },
            systemRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['narration', 'npcDialogue', 'metricsAnalysis', 'systemRecommendations'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    return res.status(502).json({
      error: 'Failed to generate content from Gemini API.',
      details: error.message || error,
    });
  }
});

// ==========================================
// FULL STACK ROUTING LAYER
// ==========================================
async function startServer() {
  // Vite hot module replacement integration for development environment
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server booted in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`Port binding: http://0.0.0.0:${PORT}`);
  });
}

startServer();
