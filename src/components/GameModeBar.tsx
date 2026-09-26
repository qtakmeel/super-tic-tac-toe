import React from 'react';
import { User, Users, Bot } from 'lucide-react';
import { GameMode, AIDifficulty } from '../types/game';
import { AI_DIFFICULTY_INFOS } from '../ai/aiEngine';

interface GameModeBarProps {
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  onSetGameMode: (mode: GameMode) => void;
  onSetDifficulty: (diff: AIDifficulty) => void;
  isThinking: boolean;
}

export const GameModeBar: React.FC<GameModeBarProps> = ({
  gameMode,
  aiDifficulty,
  onSetGameMode,
  onSetDifficulty,
  isThinking,
}) => {
  return (
    <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-md mb-6">
      {/* Game Mode Selector */}
      <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onSetGameMode('1P')}
          disabled={isThinking}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
            gameMode === '1P'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>1 Player (vs AI)</span>
        </button>

        <button
          onClick={() => onSetGameMode('2P')}
          disabled={isThinking}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
            gameMode === '2P'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2 Players (Local)</span>
        </button>
      </div>

      {/* 5-Level AI Difficulty Selector (Visible in 1P mode) */}
      {gameMode === '1P' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Difficulty:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {([1, 2, 3, 4, 5] as AIDifficulty[]).map((level) => {
              const info = AI_DIFFICULTY_INFOS[level];
              const isSelected = aiDifficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => onSetDifficulty(level)}
                  disabled={isThinking}
                  title={`${info.name}: ${info.description}`}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-500/40 shadow-md shadow-indigo-500/30'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border-slate-700/60'
                  }`}
                >
                  <span className="mr-1 opacity-70">L{level}</span>
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
