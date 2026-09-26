import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GameState,
  Move,
  GameMode,
  AIDifficulty,
  TimeControl,
  Player,
} from '../types/game';
import { createInitialState, executeMove, getValidMoves } from '../logic/rules';
import { computeAIMove } from '../ai/aiEngine';
import { soundFx } from '../audio/sound';

const STATS_STORAGE_KEY = 'super_ttt_stats_v1';

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const init = createInitialState('1P', 3, 'X', 'casual');
    try {
      const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
      if (savedStats) {
        init.stats = JSON.parse(savedStats);
      }
    } catch {
      // ignore
    }
    return init;
  });

  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker for AI
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/aiWorker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (err) {
      console.warn('Web Worker initialization failed, using fallback:', err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(state.stats));
    } catch {
      // ignore
    }
  }, [state.stats]);

  // Sync sound setting with synthesizer
  useEffect(() => {
    soundFx.setEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  // Timed Clock Countdown Interval
  useEffect(() => {
    if (
      state.timeControl === 'casual' ||
      state.winner !== null ||
      state.moveHistory.length === 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.winner !== null || prev.timeControl === 'casual') return prev;

        const p = prev.currentPlayer;
        const currentTime = prev.playerTimes[p];

        if (currentTime <= 1) {
          // Player ran out of time!
          const timeoutWinner: Player = p === 'X' ? 'O' : 'X';
          soundFx.playGameWin(timeoutWinner);
          if (prev.gameMode === '1P' && timeoutWinner === prev.humanPlayer) {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          }

          const updatedStats = { ...prev.stats };
          if (timeoutWinner === 'X') updatedStats.xWins++;
          else updatedStats.oWins++;

          return {
            ...prev,
            playerTimes: { ...prev.playerTimes, [p]: 0 },
            winner: timeoutWinner,
            isTimeout: true,
            stats: updatedStats,
          };
        }

        return {
          ...prev,
          playerTimes: {
            ...prev.playerTimes,
            [p]: currentTime - 1,
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    state.timeControl,
    state.winner,
    state.moveHistory.length,
    state.currentPlayer,
  ]);

  // Handle AI turn automatically
  useEffect(() => {
    if (
      state.gameMode === '1P' &&
      state.currentPlayer !== state.humanPlayer &&
      state.winner === null &&
      !state.isThinking
    ) {
      let isCancelled = false;

      // Mark thinking
      setState((prev) => ({ ...prev, isThinking: true }));

      (async () => {
        const aiMove = await computeAIMove(state, workerRef.current);

        if (!isCancelled) {
          if (aiMove && state.winner === null) {
            const nextState = executeMove(state, aiMove);

            const subAfter = nextState.subBoards[aiMove.boardRow][aiMove.boardCol];
            if (subAfter.winner) {
              soundFx.playSubBoardWin(subAfter.winner);
            } else {
              soundFx.playMove(aiMove.player);
            }

            if (nextState.winner) {
              soundFx.playGameWin(nextState.winner);
              if (nextState.winner === state.humanPlayer) {
                confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
              }
            }

            setState({ ...nextState, isThinking: false });
          } else {
            setState((prev) => ({ ...prev, isThinking: false }));
          }
        }
      })();

      return () => {
        isCancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.gameMode,
    state.currentPlayer,
    state.humanPlayer,
    state.winner,
    state.isThinking,
  ]);

  // Player clicks a cell
  const handleCellClick = useCallback(
    (boardRow: number, boardCol: number, cellRow: number, cellCol: number) => {
      if (state.winner !== null || state.isThinking) return;

      if (state.gameMode === '1P' && state.currentPlayer !== state.humanPlayer) {
        soundFx.playInvalid();
        return;
      }

      const validMoves = getValidMoves(state.subBoards, state.activeBoard);
      const isValid = validMoves.some(
        (m) =>
          m.boardRow === boardRow &&
          m.boardCol === boardCol &&
          m.cellRow === cellRow &&
          m.cellCol === cellCol
      );

      if (!isValid) {
        soundFx.playInvalid();
        return;
      }

      const move: Move = {
        boardRow,
        boardCol,
        cellRow,
        cellCol,
        player: state.currentPlayer,
      };

      const nextState = executeMove(state, move);

      const subAfter = nextState.subBoards[boardRow][boardCol];
      if (subAfter.winner) {
        soundFx.playSubBoardWin(subAfter.winner);
      } else {
        soundFx.playMove(move.player);
      }

      if (nextState.winner) {
        soundFx.playGameWin(nextState.winner);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }

      setState(nextState);
    },
    [state]
  );

  // Restart / New Game
  const resetGame = useCallback(
    (
      newMode: GameMode = state.gameMode,
      newDiff: AIDifficulty = state.aiDifficulty,
      newHumanPlayer: Player = state.humanPlayer,
      newTimeControl: TimeControl = state.timeControl
    ) => {
      soundFx.playClick();
      setState((prev) => {
        const fresh = createInitialState(
          newMode,
          newDiff,
          newHumanPlayer,
          newTimeControl
        );
        return {
          ...fresh,
          soundEnabled: prev.soundEnabled,
          theme: prev.theme,
          stats: prev.stats,
        };
      });
    },
    [state.gameMode, state.aiDifficulty, state.humanPlayer, state.timeControl]
  );

  // Undo last move
  const undoMove = useCallback(() => {
    soundFx.playClick();
    if (state.moveHistory.length === 0 || state.isThinking) return;

    let targetHistoryLength = state.moveHistory.length - 1;

    if (
      state.gameMode === '1P' &&
      state.currentPlayer === state.humanPlayer &&
      state.moveHistory.length >= 2
    ) {
      targetHistoryLength = state.moveHistory.length - 2;
    }

    let replayState = createInitialState(
      state.gameMode,
      state.aiDifficulty,
      state.humanPlayer,
      state.timeControl
    );
    replayState.soundEnabled = state.soundEnabled;
    replayState.theme = state.theme;
    replayState.stats = state.stats;

    for (let i = 0; i < targetHistoryLength; i++) {
      replayState = executeMove(replayState, state.moveHistory[i]);
    }

    setState(replayState);
  }, [state]);

  const toggleSound = useCallback(() => {
    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const toggleTheme = useCallback(() => {
    soundFx.playClick();
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const setGameMode = useCallback(
    (mode: GameMode) => {
      resetGame(mode, state.aiDifficulty, state.humanPlayer, state.timeControl);
    },
    [resetGame, state.aiDifficulty, state.humanPlayer, state.timeControl]
  );

  const setDifficulty = useCallback(
    (diff: AIDifficulty) => {
      resetGame(state.gameMode, diff, state.humanPlayer, state.timeControl);
    },
    [resetGame, state.gameMode, state.humanPlayer, state.timeControl]
  );

  const setTimeControl = useCallback(
    (tc: TimeControl) => {
      resetGame(state.gameMode, state.aiDifficulty, state.humanPlayer, tc);
    },
    [resetGame, state.gameMode, state.aiDifficulty, state.humanPlayer]
  );

  return {
    state,
    handleCellClick,
    resetGame,
    undoMove,
    toggleSound,
    toggleTheme,
    setGameMode,
    setDifficulty,
    setTimeControl,
  };
}
