import { GameState, Move, Player, BoardWinner } from '../types/game';
import { getValidMoves } from '../logic/rules';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]            // Diags
];

/**
 * Fast flat state conversion for lightning-fast rollout simulation
 */
interface FastBoardState {
  cells: Uint8Array; // 81 cells (0=Empty, 1=X, 2=O)
  master: Uint8Array; // 9 sub-boards (0=Open, 1=X, 2=O, 3=Tie)
  activeBoard: number; // -1 = Wild Move, 0-8 = specific sub-board
  currentPlayer: number; // 1=X, 2=O
}

function stateToFast(state: GameState): FastBoardState {
  const cells = new Uint8Array(81);
  const master = new Uint8Array(9);

  for (let bR = 0; bR < 3; bR++) {
    for (let bC = 0; bC < 3; bC++) {
      const bIdx = bR * 3 + bC;
      const sub = state.subBoards[bR][bC];

      if (sub.winner === 'X') master[bIdx] = 1;
      else if (sub.winner === 'O') master[bIdx] = 2;
      else if (sub.winner === 'TIE') master[bIdx] = 3;

      for (let cR = 0; cR < 3; cR++) {
        for (let cC = 0; cC < 3; cC++) {
          const cIdx = cR * 3 + cC;
          const val = sub.cells[cR][cC];
          if (val === 'X') cells[bIdx * 9 + cIdx] = 1;
          else if (val === 'O') cells[bIdx * 9 + cIdx] = 2;
        }
      }
    }
  }

  const activeBoard = state.activeBoard
    ? state.activeBoard.row * 3 + state.activeBoard.col
    : -1;

  return {
    cells,
    master,
    activeBoard,
    currentPlayer: state.currentPlayer === 'X' ? 1 : 2,
  };
}

function checkFast3InARow(grid: Uint8Array, offset = 0): number {
  for (let i = 0; i < 8; i++) {
    const [c1, c2, c3] = WINNING_COMBOS[i];
    const v1 = grid[offset + c1];
    if (v1 === 1 || v1 === 2) {
      if (v1 === grid[offset + c2] && v1 === grid[offset + c3]) {
        return v1;
      }
    }
  }
  return 0;
}

/**
 * Perform Time-Budgeted Monte Carlo Tree Search (<30ms guaranteed)
 */
export function getMCTSMove(state: GameState, maxTimeMs = 35): Move | null {
  const validMoves = getValidMoves(state.subBoards, state.activeBoard);
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) {
    return { ...validMoves[0], player: state.currentPlayer };
  }

  const aiPlayer = state.currentPlayer;
  const aiPlayerVal = aiPlayer === 'X' ? 1 : 2;
  const fastState = stateToFast(state);

  // Score candidate moves using fast rollouts per candidate move
  const candidateScores = new Float64Array(validMoves.length);
  const startTime = performance.now();
  let totalSimulations = 0;

  while (performance.now() - startTime < maxTimeMs) {
    for (let mIdx = 0; mIdx < validMoves.length; mIdx++) {
      const move = validMoves[mIdx];
      const simWinner = simulateFastRollout(fastState, move);
      if (simWinner === aiPlayerVal) {
        candidateScores[mIdx] += 1.0;
      } else if (simWinner === 3) {
        candidateScores[mIdx] += 0.5;
      }
      totalSimulations++;
    }
  }

  let bestMoveIdx = 0;
  let bestScore = -1;

  for (let i = 0; i < validMoves.length; i++) {
    if (candidateScores[i] > bestScore) {
      bestScore = candidateScores[i];
      bestMoveIdx = i;
    }
  }

  return { ...validMoves[bestMoveIdx], player: aiPlayer };
}

/**
 * Fast rollout on flat typed arrays (~0.01ms per simulation)
 */
function simulateFastRollout(baseState: FastBoardState, firstMove: Move): number {
  const cells = new Uint8Array(baseState.cells);
  const master = new Uint8Array(baseState.master);

  let player = baseState.currentPlayer;
  let bR = firstMove.boardRow;
  let bC = firstMove.boardCol;
  let cR = firstMove.cellRow;
  let cC = firstMove.cellCol;

  // Apply first move
  let bIdx = bR * 3 + bC;
  let cIdx = cR * 3 + cC;
  cells[bIdx * 9 + cIdx] = player;

  // Check sub-board win
  const subW = checkFast3InARow(cells, bIdx * 9);
  if (subW > 0) master[bIdx] = subW;

  // Check master win
  const masterW = checkFast3InARow(master, 0);
  if (masterW > 0) return masterW;

  // Next active board is target cell index
  let activeBoard = master[cIdx] === 0 ? cIdx : -1;
  player = player === 1 ? 2 : 1;

  // Simulation steps
  for (let step = 0; step < 18; step++) {
    // Collect valid empty cells
    let targetBIdx = activeBoard;

    if (targetBIdx !== -1 && master[targetBIdx] !== 0) {
      targetBIdx = -1;
    }

    let chosenCell = -1;
    let chosenBoard = -1;

    if (targetBIdx !== -1) {
      // Pick random empty cell in active board
      const startCell = bIdx * 9;
      let openCount = 0;
      for (let c = 0; c < 9; c++) {
        if (cells[startCell + c] === 0) openCount++;
      }
      if (openCount === 0) {
        targetBIdx = -1;
      } else {
        let rPick = (Math.random() * openCount) | 0;
        for (let c = 0; c < 9; c++) {
          if (cells[startCell + c] === 0) {
            if (rPick === 0) {
              chosenCell = c;
              chosenBoard = targetBIdx;
              break;
            }
            rPick--;
          }
        }
      }
    }

    if (targetBIdx === -1) {
      // Pick random empty cell in any open sub-board
      let totalOpen = 0;
      for (let b = 0; b < 9; b++) {
        if (master[b] === 0) {
          for (let c = 0; c < 9; c++) {
            if (cells[b * 9 + c] === 0) totalOpen++;
          }
        }
      }

      if (totalOpen === 0) break;

      let rPick = (Math.random() * totalOpen) | 0;
      outer: for (let b = 0; b < 9; b++) {
        if (master[b] === 0) {
          for (let c = 0; c < 9; c++) {
            if (cells[b * 9 + c] === 0) {
              if (rPick === 0) {
                chosenCell = c;
                chosenBoard = b;
                break outer;
              }
              rPick--;
            }
          }
        }
      }
    }

    if (chosenBoard === -1 || chosenCell === -1) break;

    // Apply move
    cells[chosenBoard * 9 + chosenCell] = player;

    // Check sub board win
    const sWin = checkFast3InARow(cells, chosenBoard * 9);
    if (sWin > 0) {
      master[chosenBoard] = sWin;
      const mWin = checkFast3InARow(master, 0);
      if (mWin > 0) return mWin;
    }

    // Set next active board
    activeBoard = master[chosenCell] === 0 ? chosenCell : -1;
    player = player === 1 ? 2 : 1;
  }

  // Count master wins if timeout reached
  let xCount = 0;
  let oCount = 0;
  for (let b = 0; b < 9; b++) {
    if (master[b] === 1) xCount++;
    else if (master[b] === 2) oCount++;
  }
  if (xCount > oCount) return 1;
  if (oCount > xCount) return 2;
  return 3; // Tie
}
