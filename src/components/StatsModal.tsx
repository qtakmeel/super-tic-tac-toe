import React from 'react';
import { X, Trophy, BarChart2, Zap } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  stats: { xWins: number; oWins: number; ties: number };
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, stats, onClose }) => {
  if (!isOpen) return null;

  const total = stats.xWins + stats.oWins + stats.ties;
  const xWinRate = total > 0 ? Math.round((stats.xWins / total) * 100) : 0;
  const oWinRate = total > 0 ? Math.round((stats.oWins / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Game Statistics</h2>
              <p className="text-xs text-slate-400">Track your performance across sessions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
            <span className="block text-2xl font-black text-blue-400">{stats.xWins}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Player X Wins</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
            <span className="block text-2xl font-black text-red-400">{stats.oWins}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-300">Player O Wins</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700 text-center">
            <span className="block text-2xl font-black text-slate-300">{stats.ties}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Draws</span>
          </div>
        </div>

        {/* Total & Win rates */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex justify-between items-center text-slate-300 font-semibold">
            <span>Total Games Played:</span>
            <span className="font-extrabold text-white text-sm">{total}</span>
          </div>
          <div className="flex justify-between items-center text-blue-300 font-semibold">
            <span>Player X Win Rate:</span>
            <span className="font-extrabold text-blue-400">{xWinRate}%</span>
          </div>
          <div className="flex justify-between items-center text-red-300 font-semibold">
            <span>Player O Win Rate:</span>
            <span className="font-extrabold text-red-400">{oWinRate}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
