import { GameState, Player } from '../types/game';
import { WINNING_LINES } from './rules';

const MASTER_WEIGHTS = [
  [2.5, 1.5, 2.5],
  [1.5, 3.5, 1.5],
  [2.5, 1.5, 2.5],
];

const CELL_WEIGHTS = [
  [1.2, 1.0, 1.2],
  [1.0, 1.5, 1.0],
  [1.2, 1.0, 1.2],
];

/**
 * Heuristic evaluation of an Ultimate Tic-Tac-Toe game state
 */
export function evaluateBoard(state: GameState, aiPlayer: Player): number {
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';

  // Terminal state evaluation
  if (state.winner === aiPlayer) return 10000;
  if (state.winner === opponent) return -10000;
  if (state.winner === 'TIE') return 0;

  let score = 0;

  // 1. Evaluate Master Grid Wins
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const winner = state.masterGrid[r][c];
      const weight = MASTER_WEIGHTS[r][c];

      if (winner === aiPlayer) {
        score += 200 * weight;
      } else if (winner === opponent) {
        score -= 200 * weight;
      }
    }
  }

  // 2. Evaluate Master Grid Potential Lines (2-in-a-row)
  for (const line of WINNING_LINES) {
    const [[r1, c1], [r2, c2], [r3, c3]] = line;
    const v1 = state.masterGrid[r1][c1];
    const v2 = state.masterGrid[r2][c2];
    const v3 = state.masterGrid[r3][c3];

    const vals = [v1, v2, v3];
    const aiCount = vals.filter((v) => v === aiPlayer).length;
    const oppCount = vals.filter((v) => v === opponent).length;
    const openCount = vals.filter((v) => v === null).length;

    if (aiCount === 2 && openCount === 1) score += 350;
    if (oppCount === 2 && openCount === 1) score -= 350;
    if (aiCount === 1 && openCount === 2) score += 50;
    if (oppCount === 1 && openCount === 2) score -= 50;
  }

  // 3. Evaluate Sub-Boards (In-progress boards)
  for (let bR = 0; bR < 3; bR++) {
    for (let bC = 0; bC < 3; bC++) {
      const subBoard = state.subBoards[bR][bC];
      if (subBoard.winner !== null || subBoard.isFull) continue;

      const cells = subBoard.cells;
      const bWeight = MASTER_WEIGHTS[bR][bC];

      // Cell position weights within sub-board
      for (let cR = 0; cR < 3; cR++) {
        for (let cC = 0; cC < 3; cC++) {
          const val = cells[cR][cC];
          const cellWeight = CELL_WEIGHTS[cR][cC] * bWeight;
          if (val === aiPlayer) score += 8 * cellWeight;
          else if (val === opponent) score -= 8 * cellWeight;
        }
      }

      // 2-in-a-row potential inside sub-board
      for (const line of WINNING_LINES) {
        const [[r1, c1], [r2, c2], [r3, c3]] = line;
        const v1 = cells[r1][c1];
        const v2 = cells[r2][c2];
        const v3 = cells[r3][c3];
        const lineVals = [v1, v2, v3];

        const aiC = lineVals.filter((v) => v === aiPlayer).length;
        const oppC = lineVals.filter((v) => v === opponent).length;
        const nullC = lineVals.filter((v) => v === null).length;

        if (aiC === 2 && nullC === 1) score += 25 * bWeight;
        if (oppC === 2 && nullC === 1) score -= 25 * bWeight;
      }
    }
  }

  // 4. Wild Move & Target Control Penalty/Bonus
  if (state.activeBoard === null) {
    if (state.currentPlayer === opponent) {
      score -= 100;
    } else {
      score += 100;
    }
  }

  return score;
}
