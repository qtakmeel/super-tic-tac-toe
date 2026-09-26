import React from 'react';
import { SubBoard as SubBoardType, Move, Player } from '../types/game';
import { Cell } from './Cell';

interface SubBoardProps {
  boardRow: number;
  boardCol: number;
  subBoard: SubBoardType;
  isActive: boolean;
  currentPlayer: Player;
  disabled: boolean;
  lastMove: Move | null;
  onCellClick: (cR: number, cC: number) => void;
}

export const SubBoard: React.FC<SubBoardProps> = ({
  boardRow,
  boardCol,
  subBoard,
  isActive,
  currentPlayer,
  disabled,
  lastMove,
  onCellClick,
}) => {
  const { cells, winner } = subBoard;

  return (
    <div
      className={`relative p-2 sm:p-3 rounded-2xl transition-all duration-300 border ${
        isActive && !winner && !disabled
          ? 'bg-slate-900/90 border-indigo-500 ring-2 ring-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-pulse-subtle'
          : winner === 'X'
          ? 'bg-blue-950/30 border-blue-800/50 shadow-md'
          : winner === 'O'
          ? 'bg-red-950/30 border-red-800/50 shadow-md'
          : winner === 'TIE'
          ? 'bg-slate-950/40 border-slate-800/50'
          : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60'
      }`}
    >
      {/* 3x3 Cells Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {cells.map((row, cR) =>
          row.map((cellVal, cC) => {
            const isLast =
              lastMove !== null &&
              lastMove.boardRow === boardRow &&
              lastMove.boardCol === boardCol &&
              lastMove.cellRow === cR &&
              lastMove.cellCol === cC;

            return (
              <Cell
                key={`${cR}-${cC}`}
                value={cellVal}
                isValidMove={isActive && winner === null}
                isLastMove={isLast}
                currentPlayer={currentPlayer}
                disabled={disabled || winner !== null}
                onClick={() => onCellClick(cR, cC)}
              />
            );
          })
        )}
      </div>

      {/* Completed Sub-Board Overlay */}
      {winner && (
        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-[2px] transition-all duration-300 z-10 animate-pop-in">
          {winner === 'X' && (
            <div className="flex flex-col items-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-blue-400 drop-shadow-[0_0_16px_rgba(59,130,246,0.8)]">
                X
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-300 mt-1">
                Board Won
              </span>
            </div>
          )}

          {winner === 'O' && (
            <div className="flex flex-col items-center">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black text-red-400 drop-shadow-[0_0_16px_rgba(239,68,68,0.8)]">
                O
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-300 mt-1">
                Board Won
              </span>
            </div>
          )}

          {winner === 'TIE' && (
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-400 tracking-wider">
                TIE
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                No Winner
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
