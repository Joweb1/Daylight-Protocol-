/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Compass, Palette, User, Sun, Hash, BookOpen, Award, Cpu, Search, FileText, ChevronRight } from 'lucide-react';
import { GddChapter } from '../types';
import { GDD_CHAPTERS } from '../data/gddContent';

// Helper to render matching symbolic icons
const renderChapterIcon = (iconName: string, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'Compass': return <Compass className={`${className} text-orange-400`} />;
    case 'Palette': return <Palette className={`${className} text-indigo-400`} />;
    case 'User': return <User className={`${className} text-pink-400`} />;
    case 'Sun': return <Sun className={`${className} text-yellow-400`} />;
    case 'Hash': return <Hash className={`${className} text-amber-500`} />;
    case 'BookOpen': return <BookOpen className={`${className} text-rose-400`} />;
    case 'Award': return <Award className={`${className} text-purple-400`} />;
    case 'Cpu': return <Cpu className={`${className} text-cyan-400`} />;
    default: return <FileText className={className} />;
  }
};

interface GddViewerProps {
  onPlayGame: () => void;
}

export default function GddViewer({ onPlayGame }: GddViewerProps) {
  const [activeChapterId, setActiveChapterId] = useState<string>(GDD_CHAPTERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  // Search filter across GDD chapters
  const filteredChapters = GDD_CHAPTERS.filter((ch) => {
    const query = searchQuery.toLowerCase();
    return (
      ch.title.toLowerCase().includes(query) ||
      ch.subtitle.toLowerCase().includes(query) ||
      ch.contentMarkdown.toLowerCase().includes(query)
    );
  });

  const activeChapter = GDD_CHAPTERS.find((ch) => ch.id === activeChapterId) || GDD_CHAPTERS[0];

  // A sleek, highly refined, lightweight custom parser for GDD markdown structure
  const parseMarkdownLineByLine = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    
    return lines.map((line, index) => {
      // 1. Code block wrapping logic
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeText = codeBlockLines.join('\n');
          codeBlockLines = [];
          return (
            <pre key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-[11px] text-cyan-300 overflow-x-auto shadow-inner my-4 select-text leading-relaxed">
              <code>{codeText}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return null;
      }

      // 2. Headings parser
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-bold text-white border-l-2 border-orange-500 pl-3 mt-8 mb-4 tracking-tight">
            {line.substring(3)}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-sm font-semibold text-slate-200 mt-6 mb-3 tracking-wide">
            {line.substring(4)}
          </h4>
        );
      }

      // 3. Horizontal Rule
      if (line.trim() === '---') {
        return <hr key={index} className="border-slate-800 my-6" />;
      }

      // 4. Tables parsing structure
      if (line.startsWith('|') && lines[index - 1]?.startsWith('|') || line.startsWith('|') && lines[index + 1]?.startsWith('|')) {
        // Skip separator row
        if (line.includes(':---') || line.includes('---:')) return null;

        const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
        
        // Treat as headers if index - 2 is missing, or separator row follows
        const isHeaderIdx = lines[index + 1]?.includes('---');
        return (
          <div key={index} className={`grid grid-cols-12 gap-4 py-2 border-b border-slate-900 text-xs font-mono font-sans ${isHeaderIdx ? 'text-slate-400 border-slate-800 uppercase font-bold text-[10px]' : 'text-slate-300'}`}>
            {cells.map((cell, cIdx) => {
              // Distribute layout columns based on cells length
              const colSpan = cells.length === 5 
                ? 'col-span-2'
                : cells.length === 4
                ? 'col-span-3'
                : 'col-span-4';
              return (
                <div key={cIdx} className={`${colSpan} flex items-center`}>
                  {formatInlineModifiers(cell)}
                </div>
              );
            })}
          </div>
        );
      }

      // 5. Normal paragraphs standard formatting
      if (line.trim() === '') return <div key={index} className="h-3" />;

      return (
        <p key={index} className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
          {formatInlineModifiers(line)}
        </p>
      );
    });
  };

  // Helper to parse inline bold and other decorators
  const formatInlineModifiers = (text: string) => {
    // Basic regex solver for bold **items**
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-slate-950 px-1 py-0.5 rounded text-cyan-400 font-mono text-[10px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div id="gdd-document-workbench" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* LEFT COLUMN: CHAPTERS LIST SELECTOR */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-[640px] shadow-lg">
        <div className="space-y-4">
          
          {/* PLAY MAIN GAME CALL-TO-ACTION BANNER */}
          <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/30 p-4 rounded-xl shadow-lg relative overflow-hidden group select-none">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
            <div className="relative">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-orange-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SIMULATOR_CORE_READY</span>
              </div>
              <h3 className="text-xs font-black text-white mt-1 leading-tight tracking-tight">Daylight Simulation Chamber</h3>
              <p className="text-[10px] text-slate-400 leading-normal mt-1 mb-3">
                Explore, talk to security programs, collect memory tracks, and solve logical puzzles physically on canvas.
              </p>
              <button
                onClick={onPlayGame}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-slate-950 font-mono font-black text-xs rounded-lg transition-all shadow-[0_4px_15px_rgba(242,139,11,0.3)] cursor-pointer"
              >
                PLAY MAIN GAME &rarr;
              </button>
            </div>
          </div>

          {/* Search Header */}
          <div>
            <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest block mb-1 select-none">
              TECHNICAL GDD EXPLORER
            </span>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search specs, rules, ending variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Core Navigation Tree */}
          <div className="space-y-1.5 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 select-none">
              Document Chapters
            </span>
            {filteredChapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  activeChapterId === ch.id
                    ? 'bg-slate-800/80 border-slate-700 text-white font-semibold'
                    : 'bg-slate-950/45 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{renderChapterIcon(ch.iconName)}</div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{ch.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5 line-clamp-1 font-sans font-normal">
                      {ch.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {filteredChapters.length === 0 && (
              <div className="text-center py-10 text-slate-600 text-xs font-mono">
                No specifications found answering "{searchQuery}".
              </div>
            )}
          </div>

        </div>

        {/* Footer info segment */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-slate-500" />
          <div className="text-[10px] font-mono text-slate-500">
            <span>Author: Alastair v1.0</span>
            <span className="block text-[9px] text-slate-600">Sim Sector: Complete Blueprints</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: DETAILED DOCUMENT CONTENT VIEW */}
      <div id="gdd-chapters-viewport" className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between h-[640px]">
        {/* Viewport Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 select-none">
          <div className="flex items-center gap-2.5">
            {renderChapterIcon(activeChapter.iconName, 'w-5 h-5')}
            <div>
              <h2 className="text-md font-bold text-white leading-tight font-sans">
                {activeChapter.title}
              </h2>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {activeChapter.subtitle}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
            SEC_{activeChapter.id.toUpperCase()}_v1.0
          </span>
        </div>

        {/* Scrollable text container */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin select-text text-slate-300">
          {parseMarkdownLineByLine(activeChapter.contentMarkdown)}
        </div>

        {/* Dynamic page navigator */}
        <div className="mt-4 pt-3 border-t border-slate-800 select-none flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Daylight Protocol Framework Specs</span>
          <div className="flex gap-2.5">
            <button
              disabled={GDD_CHAPTERS.indexOf(activeChapter) === 0}
              onClick={() => {
                const prevIdx = GDD_CHAPTERS.indexOf(activeChapter) - 1;
                if (prevIdx >= 0) setActiveChapterId(GDD_CHAPTERS[prevIdx].id);
              }}
              className="px-2 py-0.5 rounded border border-slate-800 bg-slate-950 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              PREV
            </button>
            <span className="text-slate-400">
              {GDD_CHAPTERS.indexOf(activeChapter) + 1} / {GDD_CHAPTERS.length}
            </span>
            <button
              disabled={GDD_CHAPTERS.indexOf(activeChapter) === GDD_CHAPTERS.length - 1}
              onClick={() => {
                const nextIdx = GDD_CHAPTERS.indexOf(activeChapter) + 1;
                if (nextIdx < GDD_CHAPTERS.length) setActiveChapterId(GDD_CHAPTERS[nextIdx].id);
              }}
              className="px-2 py-0.5 rounded border border-slate-800 bg-slate-950 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              NEXT
            </button>
          </div>
        </div>

      </div>
      
    </div>
  );
}
