import { GameState, Move, Player } from '../types/game';
import { getValidMoves, executeMove } from '../logic/rules';
import { evaluateBoard } from '../logic/evaluator';

/**
 * Level 3: Intermediate Minimax AI with Alpha-Beta Pruning
 */
export function getMinimaxMove(state: GameState, depth = 3): Move | null {
  const validMoves = getValidMoves(state.subBoards, state.activeBoard);
  if (validMoves.length === 0) return null;

  const aiPlayer = state.currentPlayer;
  let bestScore = -Infinity;
  let bestMove: Move = { ...validMoves[0], player: aiPlayer };

  // Move ordering: prioritize moves in center/corners or sub-board wins
  const sortedMoves = validMoves.map((m) => ({ ...m, player: aiPlayer }));

  for (const move of sortedMoves) {
    const nextState = executeMove(state, move);

    // Immediate win short-circuit
    if (nextState.winner === aiPlayer) return move;

    const score = minimax(
      nextState,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      aiPlayer
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  if (depth === 0 || state.winner !== null) {
    return evaluateBoard(state, aiPlayer);
  }

  const validMoves = getValidMoves(state.subBoards, state.activeBoard);
  if (validMoves.length === 0) {
    return evaluateBoard(state, aiPlayer);
  }

  const currentPlayer = state.currentPlayer;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      const candidateMove = { ...move, player: currentPlayer };
      const nextState = executeMove(state, candidateMove);
      const evalScore = minimax(
        nextState,
        depth - 1,
        alpha,
        beta,
        false,
        aiPlayer
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Alpha-beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of validMoves) {
      const candidateMove = { ...move, player: currentPlayer };
      const nextState = executeMove(state, candidateMove);
      const evalScore = minimax(
        nextState,
        depth - 1,
        alpha,
        beta,
        true,
        aiPlayer
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha-beta cutoff
    }
    return minEval;
  }
}
