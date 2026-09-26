import React from 'react';
import { Sparkles, Trophy, Loader2, Compass } from 'lucide-react';
import { GameState } from '../types/game';
import { AI_DIFFICULTY_INFOS } from '../ai/aiEngine';

interface GameStatusProps {
  state: GameState;
}

export const GameStatus: React.FC<GameStatusProps> = ({ state }) => {
  const {
    currentPlayer,
    winner,
    activeBoard,
    isThinking,
    gameMode,
    aiDifficulty,
    humanPlayer,
  } = state;

  const isAITurn =
    gameMode === '1P' && currentPlayer !== humanPlayer && winner === null;

  // Winner status banner
  if (winner) {
    return (
      <div className="w-full max-w-5xl flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-amber-500/40 shadow-xl mb-6 animate-pop-in">
        <div className="flex items-center gap-3 text-center">
          <Trophy className="w-7 h-7 text-amber-400 animate-bounce-subtle" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white">
              {winner === 'TIE' ? (
                <span className="text-slate-200">GAME TIED! EVENLY MATCHED!</span>
              ) : (
                <span>
                  PLAYER{' '}
                  <span
                    className={
                      winner === 'X' ? 'text-blue-400' : 'text-red-400'
                    }
                  >
                    {winner}
                  </span>{' '}
                  VICTORY!
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300">
              {winner === 'TIE'
                ? 'All boards filled without a 3-in-a-row alignment.'
                : gameMode === '1P' && winner === humanPlayer
                ? `You defeated the Level ${aiDifficulty} (${AI_DIFFICULTY_INFOS[aiDifficulty].name}) AI!`
                : gameMode === '1P'
                ? `Level ${aiDifficulty} AI claimed victory!`
                : `Player ${winner} dominated the master board!`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active status bar
  const boardNames = [
    ['Top-Left', 'Top-Center', 'Top-Right'],
    ['Middle-Left', 'Center', 'Middle-Right'],
    ['Bottom-Left', 'Bottom-Center', 'Bottom-Right'],
  ];

  return (
    <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-6 shadow-md">
      {/* Player Turn Indicator */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm border shadow-inner ${
            currentPlayer === 'X'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              currentPlayer === 'X' ? 'bg-blue-500' : 'bg-red-500'
            } animate-pulse`}
          />
          <span>
            TURN: Player {currentPlayer}
            {gameMode === '1P' &&
              (currentPlayer === humanPlayer ? ' (You)' : ' (AI)')}
          </span>
        </div>

        {isThinking && (
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI Thinking...</span>
          </div>
        )}
      </div>

      {/* Target Sub-Board Instruction */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
        <Compass className="w-4 h-4 text-indigo-400" />
        {activeBoard === null ? (
          <span className="text-amber-400 font-semibold">
            WILD MOVE! Play anywhere in any open sub-board.
          </span>
        ) : (
          <span>
            Must play in:{' '}
            <strong className="text-indigo-300 font-bold">
              {boardNames[activeBoard.row][activeBoard.col]} Board
            </strong>
          </span>
        )}
      </div>
    </div>
  );
};
