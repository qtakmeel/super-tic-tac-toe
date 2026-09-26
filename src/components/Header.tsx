import React from 'react';
import { Volume2, VolumeX, Sun, Moon, HelpCircle, BarChart2, RotateCcw } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  soundEnabled,
  onToggleTheme,
  onToggleSound,
  onOpenRules,
  onOpenStats,
  onResetGame,
}) => {
  return (
    <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl mb-6">
      {/* Title Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-red-600 shadow-lg shadow-indigo-500/20">
          <span className="font-extrabold text-white text-xl tracking-tighter">#</span>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-red-400 bg-clip-text text-transparent">
            SUPER TIC TAC TOE
          </h1>
          <p className="text-xs font-medium text-slate-400">Ultimate Strategy Board Game</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetGame}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all duration-200"
          title="Restart Current Game"
        >
          <RotateCcw className="w-4 h-4 text-indigo-400" />
          <span>New Game</span>
        </button>

        <button
          onClick={onOpenRules}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all duration-200"
          title="How to Play / Rules"
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          onClick={onOpenStats}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all duration-200"
          title="Game Statistics"
        >
          <BarChart2 className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all duration-200"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-blue-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all duration-200"
          title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>
      </div>
    </header>
  );
};
