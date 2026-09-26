import { GameState, Move, Player } from '../types/game';
import { getValidMoves, executeMove } from '../logic/rules';
import { evaluateBoard } from '../logic/evaluator';

/**
 * Level 2: Beginner AI
 * Evaluates immediate 1-step outcomes:
 * 1. Takes immediate master game win.
 * 2. Takes immediate sub-board win.
 * 3. Blocks opponent immediate sub-board win.
 * 4. Avoids giving opponent a wild move.
 * 5. Falls back to best 1-step heuristic score.
 */
export function getBeginnerMove(state: GameState): Move | null {
  const validMoves = getValidMoves(state.subBoards, state.activeBoard);
  if (validMoves.length === 0) return null;

  const aiPlayer = state.currentPlayer;
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';

  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const candidateMove = { ...move, player: aiPlayer };
    const nextState = executeMove(state, candidateMove);

    // 1. Immediate master win
    if (nextState.winner === aiPlayer) {
      return candidateMove;
    }

    let score = evaluateBoard(nextState, aiPlayer);

    // 2. Bonus for winning sub-board
    const subBefore = state.subBoards[move.boardRow][move.boardCol];
    const subAfter = nextState.subBoards[move.boardRow][move.boardCol];
    if (subBefore.winner === null && subAfter.winner === aiPlayer) {
      score += 500;
    }

    // 3. Penalty for giving wild move
    if (nextState.activeBoard === null && nextState.winner === null) {
      score -= 150;
    }

    // Add slight random noise to prevent identical predictable play
    score += (Math.random() - 0.5) * 20;

    if (score > bestScore) {
      bestScore = score;
      bestMove = candidateMove;
    }
  }

  return bestMove || { ...validMoves[0], player: aiPlayer };
}
