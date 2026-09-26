import React from 'react';
import { Trophy, Loader2, Compass, Clock } from 'lucide-react';
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
    timeControl,
    playerTimes,
    isTimeout,
  } = state;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
              ) : isTimeout ? (
                <span>
                  PLAYER{' '}
                  <span
                    className={
                      winner === 'X' ? 'text-blue-400' : 'text-red-400'
                    }
                  >
                    {winner}
                  </span>{' '}
                  WINS ON TIME!
                </span>
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
                : isTimeout
                ? `Opponent ran out of time on their clock!`
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

  const boardNames = [
    ['Top-Left', 'Top-Center', 'Top-Right'],
    ['Middle-Left', 'Center', 'Middle-Right'],
    ['Bottom-Left', 'Bottom-Center', 'Bottom-Right'],
  ];

  return (
    <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-6 shadow-md">
      {/* Player Turn & Clock Bar */}
      <div className="flex items-center gap-3 flex-wrap">
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

        {/* Timed Mode Clocks Display */}
        {timeControl !== 'casual' && (
          <div className="flex items-center gap-2 bg-slate-950/70 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <div
              className={`px-2 py-0.5 rounded ${
                currentPlayer === 'X'
                  ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/50'
                  : 'text-slate-400'
              } ${playerTimes.X <= 15 ? 'text-red-400 animate-pulse' : ''}`}
            >
              X: {formatTime(playerTimes.X)}
            </div>
            <span className="text-slate-600">|</span>
            <div
              className={`px-2 py-0.5 rounded ${
                currentPlayer === 'O'
                  ? 'bg-red-600/30 text-red-300 ring-1 ring-red-500/50'
                  : 'text-slate-400'
              } ${playerTimes.O <= 15 ? 'text-red-400 animate-pulse' : ''}`}
            >
              O: {formatTime(playerTimes.O)}
            </div>
          </div>
        )}

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
