import React from 'react';
import { Undo2, History } from 'lucide-react';
import { Move } from '../types/game';

interface MoveHistoryProps {
  moveHistory: Move[];
  isThinking: boolean;
  onUndo: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moveHistory,
  isThinking,
  onUndo,
}) => {
  const boardNames = [
    ['TL', 'TC', 'TR'],
    ['ML', 'C', 'MR'],
    ['BL', 'BC', 'BR'],
  ];

  return (
    <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg mt-4 sm:mt-6">
      <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
          <History className="w-4 h-4 text-indigo-400" />
          <span>Move History ({moveHistory.length})</span>
        </div>

        <button
          onClick={onUndo}
          disabled={moveHistory.length === 0 || isThinking}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Undo2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Undo Move</span>
        </button>
      </div>

      {moveHistory.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-1.5 text-center">
          No moves played yet. Make your first move!
        </p>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-700">
          {moveHistory.map((m, idx) => {
            const bName = boardNames[m.boardRow][m.boardCol];
            const cName = boardNames[m.cellRow][m.cellCol];
            return (
              <div
                key={idx}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                  m.player === 'X'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <span className="font-extrabold">{m.player}</span>
                <span className="text-slate-400">
                  {bName} → {cName}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
