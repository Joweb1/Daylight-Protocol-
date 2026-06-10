/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Cpu, RotateCw, Send, Sliders, ChevronRight, Activity, MessageSquare, Terminal, HelpCircle } from 'lucide-react';
import { AiDirectorPreset, AiDirectorResponse, DaylightStage } from '../types';

export const DIRECTOR_PRESETS: AiDirectorPreset[] = [
  {
    id: 'preset-stuck',
    name: '[Telemetry 01]: Stuck Solver',
    description: 'Player has spent 3 action iterations consecutively on the exact same logic grid coordinate in the Morning stage, and requested an AI hint twice.',
    metrics: {
      daylightRemaining: 85,
      curiosityScore: 12,
      humanityScore: 10,
      freedomScore: 8,
      playerSpeed: 'stuck',
      recentAction: 'Grid loop coordinate 2,3, rotation mirror lock.',
      stage: 'Morning',
    }
  },
  {
    id: 'preset-speed',
    name: '[Telemetry 02]: Rogue Speedrunner',
    description: 'Player is moving ultra-fast through reflection grid sectors, prioritizing the short exit path, completely bypassing narrative Lux fragments.',
    metrics: {
      daylightRemaining: 74,
      curiosityScore: 4,
      humanityScore: 0,
      freedomScore: 45,
      playerSpeed: 'fast',
      recentAction: 'Bypassing Lux fragments, moving exclusively toward Sector exit triggers.',
      stage: 'Noon',
    }
  },
  {
    id: 'preset-human',
    name: '[Telemetry 03]: Solstice Empathetic',
    description: 'Player is progressing at moderate speed, reading Alastair diaries, and opting to help corrupted system processes with their limited energy resources.',
    metrics: {
      daylightRemaining: 42,
      curiosityScore: 65,
      humanityScore: 88,
      freedomScore: 48,
      playerSpeed: 'moderate',
      recentAction: 'Sharing Daylight charge unit with dying security firewall subprocess',
      stage: 'Afternoon',
    }
  },
  {
    id: 'preset-sunset',
    name: '[Telemetry 04]: Twilight Urgency',
    description: 'Player is entering Sunset with high curiosity scores but critically low daylight level, desperately scrambling at the final Gateway.',
    metrics: {
      daylightRemaining: 11,
      curiosityScore: 85,
      humanityScore: 60,
      freedomScore: 78,
      playerSpeed: 'stuck',
      recentAction: 'Scrambling on final Breach circuit connector, solar decay below 15%',
      stage: 'Sunset',
    }
  }
];

export default function AiDirectorSandbox() {
  const [selectedPreset, setSelectedPreset] = useState<AiDirectorPreset>(DIRECTOR_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [directorResponse, setDirectorResponse] = useState<AiDirectorResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInvokeDirector = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setDirectorResponse(null);

    try {
      const response = await fetch('/api/ai-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: selectedPreset.metrics,
          customPrompt: customPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to the Gemini Director server.');
      }

      setDirectorResponse(data);
    } catch (err: any) {
      console.error('AI Director error:', err);
      setErrorMessage(err.message || 'Error occurred querying the AI Director.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-director-sandbox" className="grid grid-cols-1 xl:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      
      {/* 1. LEFT COLUMN: PRESET SELECTOR & INPUT */}
      <div className="xl:col-span-5 space-y-5 border-b xl:border-b-0 xl:border-r border-slate-800 pb-6 xl:pb-0 xl:pr-6">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
            GDD Chapter 8: AI Director Simulation
          </span>
          <h4 className="text-md font-bold text-white flex items-center gap-1.5">
            Player Session Telemetry Dashboard
          </h4>
          <p className="text-xs text-slate-300 leading-normal mt-1.5 font-sans">
            Configure the simulated telemetry packets. The AI Director reads these values to dynamically adjust difficulty curves and write responsive dialogue.
          </p>
        </div>

        {/* Preset Cards Selectors */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase block select-none">
            Active Telemetry Presets
          </span>
          {DIRECTOR_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPreset(p);
                setDirectorResponse(null);
                setErrorMessage(null);
              }}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                selectedPreset.id === p.id
                  ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:bg-slate-950 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>{p.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                  {p.metrics.stage.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal mt-1 text-xs truncate">
                {p.description}
              </p>
            </button>
          ))}
        </div>

        {/* Metrics inspector card */}
        <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 space-y-2 text-[11px] font-mono">
          <div className="text-slate-500 font-bold border-b border-slate-900 pb-1 flex justify-between">
            <span>TELEMETRY REGISTER</span>
            <span>VALUE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Daylight Percentage</span>
            <span className="text-amber-400 font-bold">{selectedPreset.metrics.daylightRemaining}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Curiosity / Humanity Cores</span>
            <span className="text-slate-200">
              C:{selectedPreset.metrics.curiosityScore}% | H:{selectedPreset.metrics.humanityScore}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Freedom Desire Score</span>
            <span className="text-orange-400 font-bold">{selectedPreset.metrics.freedomScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Solve Pace Speed</span>
            <span className="text-slate-300">{selectedPreset.metrics.playerSpeed.toUpperCase()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400 flex-shrink-0">Active Incident</span>
            <span className="text-slate-300 text-right truncate">{selectedPreset.metrics.recentAction}</span>
          </div>
        </div>

        {/* Custom prompts additions */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-500 uppercase block select-none">
            Developer Directives Override (Optional prompt instructions)
          </label>
          <div className="relative">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Ask system Security to write a poem about code deletion..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleInvokeDirector}
              disabled={isLoading}
              className="absolute right-1 top-1 bottom-1 px-2.5 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Big CTA to Invoke AI model */}
        <button
          onClick={handleInvokeDirector}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 hover:text-black font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/10"
        >
          <Cpu className="w-4 h-4" />
          {isLoading ? 'ANALYZING TELEMETRY PIXELS...' : 'ENGAGE AI DIRECTOR ENGINE'}
        </button>
      </div>

      {/* 2. RIGHT COLUMN: DIRECTOR'S DECISION STREAM */}
      <div className="xl:col-span-7 flex flex-col justify-between h-full bg-slate-950 rounded-xl p-5 border border-slate-850 select-none">
        
        {isLoading ? (
          /* Loading states mapping */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-cyan-500 rounded-full animate-spin" />
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h5 className="text-xs font-mono font-bold text-slate-300">Observation Incident Active</h5>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-normal">
                Querying server-side model `@google/genai` gemini-3.5-flash with player telemetry variables...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          /* Graceful error diagnostics */
          <div className="bg-red-950/20 border border-red-500/30 p-5 rounded-lg text-slate-300 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
              <Terminal className="w-4 h-4" />
              <span>DIRECTOR TRANSMISSION FAILURE</span>
            </div>
            <p className="leading-relaxed text-slate-300 font-mono">
              {errorMessage}
            </p>
            <div className="mt-4 pt-4 border-t border-red-950 text-[10px] text-slate-500 font-sans space-y-1">
              <p className="font-semibold text-slate-400">How to solve this issue:</p>
              <p>• Make sure the Gemini API key is configured correctly in **Settings &gt; Secrets** panel in AI Studio.</p>
              <p>• Check that your internet connectivity is stable.</p>
              <p>• Alternatively, reload the page to check if the server-side dev container has started fully.</p>
            </div>
          </div>
        ) : directorResponse ? (
          /* Live formatted AI Output */
          <div className="space-y-5 animate-fade-in font-sans">
            {/* Observation header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>AI DIRECTOR SECTOR TRANSCRIPT</span>
              </div>
              <span className="text-[9px] font-mono text-slate-600">
                Response Mime: application/json
              </span>
            </div>

            {/* A. ATMOSPHERIC NARRATION */}
            <div className="space-y-1 bg-slate-900/40 p-3 border border-slate-900 rounded-lg">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">The Director's Voicelog</span>
              <p className="text-xs italic text-slate-200 leading-normal pl-2 border-l-2 border-cyan-500">
                "{directorResponse.narration}"
              </p>
            </div>

            {/* B. TAILORED NPC CONVERSATION */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[9px] font-mono text-slate-500 uppercase block">
                  Active NPC Dialogue Calibration
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-850 rounded-lg p-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold text-orange-400 mb-1">
                  <span>{directorResponse.npcDialogue.speaker}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400">
                    Emotion: {directorResponse.npcDialogue.expression}
                  </span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  "{directorResponse.npcDialogue.text}"
                </p>
              </div>
            </div>

            {/* C. MATHEMATICAL CALIBRATION ANALYSES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/30 p-3 border border-slate-900 rounded-lg text-xs">
              <div>
                <span className="text-slate-500 block text-[9px] font-mono uppercase">Cohesion Match</span>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-sm font-bold text-white">{directorResponse.metricsAnalysis.cohesionLevel}/100</span>
                  <span className="text-[10px] text-slate-500">harmony score</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] font-mono uppercase">Dynamic Challenge Adjustment</span>
                <p className="text-slate-300 font-mono text-[11px] mt-1">
                  {directorResponse.metricsAnalysis.difficultyAdjustment}
                </p>
              </div>
              <div className="sm:col-span-2 border-t border-slate-900 pt-2">
                <span className="text-slate-500 block text-[9px] font-mono uppercase">Target Narrative Arc</span>
                <p className="text-slate-300 mt-0.5 leading-normal">
                  {directorResponse.metricsAnalysis.narrativeArcProgress}
                </p>
              </div>
            </div>

            {/* D. RECOMMENDATIONS ITEMS */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">System Recommendations</span>
              <ul className="space-y-1 pl-1">
                {directorResponse.systemRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          /* Awaiting user click states */
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <Sliders className="w-10 h-10 text-slate-700 animate-pulse" />
            <div className="space-y-1 max-w-sm">
              <h5 className="text-xs font-mono font-bold text-slate-400">Telemetry Engine: Idle</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Select a telemetry register on the left panel, customize overrides if desired, and engage the terminal processor.
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
