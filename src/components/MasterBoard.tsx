import React from 'react';
import { GameState } from '../types/game';
import { SubBoard } from './SubBoard';

interface MasterBoardProps {
  state: GameState;
  onCellClick: (bR: number, bC: number, cR: number, cC: number) => void;
}

export const MasterBoard: React.FC<MasterBoardProps> = ({ state, onCellClick }) => {
  const {
    subBoards,
    activeBoard,
    currentPlayer,
    winner,
    isThinking,
    moveHistory,
    winningMasterLine,
  } = state;

  const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

  return (
    <div className="relative w-full max-w-2xl aspect-square p-3 sm:p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-md">
      {/* 3x3 SubBoards Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full h-full">
        {subBoards.map((row, bR) =>
          row.map((subBoard, bC) => {
            const isActive =
              winner === null &&
              (activeBoard === null ||
                (activeBoard.row === bR && activeBoard.col === bC));

            return (
              <SubBoard
                key={`${bR}-${bC}`}
                boardRow={bR}
                boardCol={bC}
                subBoard={subBoard}
                isActive={isActive}
                currentPlayer={currentPlayer}
                disabled={winner !== null || isThinking}
                lastMove={lastMove}
                onCellClick={(cR, cC) => onCellClick(bR, bC, cR, cC)}
              />
            );
          })
        )}
      </div>

      {/* SVG Line Overlay for Master Game Win */}
      {winningMasterLine && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <line
            x1={`${(winningMasterLine[0][1] * 2 + 1) * 16.666}%`}
            y1={`${(winningMasterLine[0][0] * 2 + 1) * 16.666}%`}
            x2={`${(winningMasterLine[2][1] * 2 + 1) * 16.666}%`}
            y2={`${(winningMasterLine[2][0] * 2 + 1) * 16.666}%`}
            stroke={winner === 'X' ? '#3b82f6' : '#ef4444'}
            strokeWidth="10"
            strokeLinecap="round"
            className="drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-pop-in"
          />
        </svg>
      )}
    </div>
  );
};
