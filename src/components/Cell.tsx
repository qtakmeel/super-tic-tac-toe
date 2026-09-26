import React from 'react';
import { CellValue, Player } from '../types/game';

interface CellProps {
  value: CellValue;
  isValidMove: boolean;
  isLastMove: boolean;
  currentPlayer: Player;
  disabled: boolean;
  onClick: () => void;
}

export const Cell: React.FC<CellProps> = ({
  value,
  isValidMove,
  isLastMove,
  currentPlayer,
  disabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !isValidMove || value !== null}
      className={`relative aspect-square w-full rounded-lg sm:rounded-xl flex items-center justify-center font-black transition-all duration-150 select-none ${
        value === 'X'
          ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
          : value === 'O'
          ? 'bg-red-500/15 border border-red-500/30 text-red-400'
          : isValidMove && !disabled
          ? 'bg-slate-800/40 border border-slate-700/50 hover:bg-indigo-500/20 hover:border-indigo-500/50 cursor-pointer group'
          : 'bg-slate-900/40 border border-slate-800/30 cursor-not-allowed opacity-60'
      } ${isLastMove ? 'ring-2 ring-amber-400 shadow-md shadow-amber-400/20' : ''}`}
    >
      {/* Played Symbols */}
      {value === 'X' && (
        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pop-in">
          X
        </span>
      )}
      {value === 'O' && (
        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pop-in">
          O
        </span>
      )}

      {/* Hover preview for next move */}
      {value === null && isValidMove && !disabled && (
        <span
          className={`text-xl sm:text-2xl opacity-0 group-hover:opacity-40 transition-opacity font-extrabold ${
            currentPlayer === 'X' ? 'text-blue-400' : 'text-red-400'
          }`}
        >
          {currentPlayer}
        </span>
      )}
    </button>
  );
};
