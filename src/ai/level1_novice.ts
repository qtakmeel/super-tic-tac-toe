import { GameState, Move, Player } from '../types/game';
import { getValidMoves, executeMove } from '../logic/rules';

/**
 * Level 1: Novice AI
 * Plays mostly random moves, but takes an immediate sub-board win if available.
 */
export function getNoviceMove(state: GameState): Move | null {
  const validMoves = getValidMoves(state.subBoards, state.activeBoard);
  if (validMoves.length === 0) return null;

  const aiPlayer = state.currentPlayer;

  // 1. Check if any valid move immediately wins a sub-board
  for (const move of validMoves) {
    const candidateMove = { ...move, player: aiPlayer };
    const nextState = executeMove(state, candidateMove);
    const subBoardBefore = state.subBoards[move.boardRow][move.boardCol];
    const subBoardAfter = nextState.subBoards[move.boardRow][move.boardCol];

    if (subBoardBefore.winner === null && subBoardAfter.winner === aiPlayer) {
      return candidateMove;
    }
  }

  // 2. Otherwise pick a random valid move
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return { ...validMoves[randomIndex], player: aiPlayer };
}
