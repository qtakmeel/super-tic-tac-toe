import {
  GameState,
  SubBoard,
  BoardWinner,
  CellValue,
  Move,
  Coordinate,
  Player,
} from '../types/game';

// All 8 possible winning line configurations on a 3x3 board
export const WINNING_LINES = [
  // Rows
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  // Columns
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  // Diagonals
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

/**
 * Creates an empty 3x3 grid
 */
export function createEmptyGrid<T>(fillValue: T): T[][] {
  return Array(3)
    .fill(null)
    .map(() => Array(3).fill(fillValue));
}

/**
 * Creates an initial empty game state
 */
export function createInitialState(
  gameMode: GameState['gameMode'] = '1P',
  aiDifficulty: GameState['aiDifficulty'] = 3,
  humanPlayer: Player = 'X'
): GameState {
  const subBoards: SubBoard[][] = Array(3)
    .fill(null)
    .map(() =>
      Array(3)
        .fill(null)
        .map(() => ({
          cells: createEmptyGrid<CellValue>(null),
          winner: null,
          winningLine: null,
          isFull: false,
        }))
    );

  return {
    subBoards,
    masterGrid: createEmptyGrid<BoardWinner>(null),
    activeBoard: null, // First player can choose any board
    currentPlayer: 'X',
    gameMode,
    aiDifficulty,
    humanPlayer,
    winner: null,
    winningMasterLine: null,
    moveHistory: [],
    isThinking: false,
    soundEnabled: true,
    theme: 'dark',
    stats: {
      xWins: 0,
      oWins: 0,
      ties: 0,
    },
  };
}

/**
 * Check if a 3x3 grid has a 3-in-a-row winner
 */
export function check3InARow(grid: BoardWinner[][]): {
  winner: Player | null;
  line: number[][] | null;
} {
  for (const line of WINNING_LINES) {
    const [[r1, c1], [r2, c2], [r3, c3]] = line;
    const val1 = grid[r1][c1];
    const val2 = grid[r2][c2];
    const val3 = grid[r3][c3];

    if (val1 && val1 !== 'TIE' && val1 === val2 && val1 === val3) {
      return { winner: val1 as Player, line };
    }
  }
  return { winner: null, line: null };
}

/**
 * Check if a 3x3 cell matrix is full
 */
export function isGridFull(cells: CellValue[][]): boolean {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (cells[r][c] === null) return false;
    }
  }
  return true;
}

/**
 * Returns all valid moves for the current game state
 */
export function getValidMoves(
  subBoards: SubBoard[][],
  activeBoard: Coordinate | null
): Move[] {
  const moves: Move[] = [];

  // Helper to add all empty cells from a specific subboard
  const addMovesForBoard = (bR: number, bC: number) => {
    const board = subBoards[bR][bC];
    if (board.winner !== null || board.isFull) return;

    for (let cR = 0; cR < 3; cR++) {
      for (let cC = 0; cC < 3; cC++) {
        if (board.cells[cR][cC] === null) {
          moves.push({
            boardRow: bR,
            boardCol: bC,
            cellRow: cR,
            cellCol: cC,
            player: 'X', // dummy, player gets assigned on move execution
          });
        }
      }
    }
  };

  if (
    activeBoard !== null &&
    subBoards[activeBoard.row][activeBoard.col].winner === null &&
    !subBoards[activeBoard.row][activeBoard.col].isFull
  ) {
    // Player is restricted to the specific active subboard
    addMovesForBoard(activeBoard.row, activeBoard.col);
  } else {
    // Wild move! Player can move in any active, uncompleted subboard
    for (let bR = 0; bR < 3; bR++) {
      for (let bC = 0; bC < 3; bC++) {
        addMovesForBoard(bR, bC);
      }
    }
  }

  return moves;
}

/**
 * Deep clone sub-boards structure
 */
export function cloneSubBoards(subBoards: SubBoard[][]): SubBoard[][] {
  return subBoards.map((row) =>
    row.map((board) => ({
      cells: board.cells.map((r) => [...r]),
      winner: board.winner,
      winningLine: board.winningLine ? [...board.winningLine] : null,
      isFull: board.isFull,
    }))
  );
}

/**
 * Execute a move on the state and return a brand new state
 */
export function executeMove(state: GameState, move: Move): GameState {
  const { boardRow, boardCol, cellRow, cellCol, player } = move;

  // Deep clone state fields that mutate
  const subBoards = cloneSubBoards(state.subBoards);
  const masterGrid = state.masterGrid.map((r) => [...r]);

  const targetSubBoard = subBoards[boardRow][boardCol];
  targetSubBoard.cells[cellRow][cellCol] = player;

  // Check sub-board winner if not already won
  if (targetSubBoard.winner === null) {
    const subCheck = check3InARow(targetSubBoard.cells as BoardWinner[][]);
    if (subCheck.winner) {
      targetSubBoard.winner = subCheck.winner;
      targetSubBoard.winningLine = subCheck.line;
      masterGrid[boardRow][boardCol] = subCheck.winner;
    } else if (isGridFull(targetSubBoard.cells)) {
      targetSubBoard.winner = 'TIE';
      targetSubBoard.isFull = true;
      masterGrid[boardRow][boardCol] = 'TIE';
    }
  }
  targetSubBoard.isFull = isGridFull(targetSubBoard.cells);

  // Check overall master game winner
  const masterCheck = check3InARow(masterGrid);
  let overallWinner: BoardWinner = masterCheck.winner;
  let winningMasterLine: number[][] | null = masterCheck.line;

  if (!overallWinner) {
    // Check if master board is tied (all sub-boards are finished/won/tied)
    let allFinished = true;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (subBoards[r][c].winner === null && !subBoards[r][c].isFull) {
          allFinished = false;
          break;
        }
      }
    }

    if (allFinished) {
      // Determine winner by count of won sub-boards if tied board
      let xCount = 0;
      let oCount = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (masterGrid[r][c] === 'X') xCount++;
          if (masterGrid[r][c] === 'O') oCount++;
        }
      }
      if (xCount > oCount) overallWinner = 'X';
      else if (oCount > xCount) overallWinner = 'O';
      else overallWinner = 'TIE';
    }
  }

  // Determine next active board
  const nextTargetBoard = subBoards[cellRow][cellCol];
  let nextActiveBoard: Coordinate | null = null;

  if (nextTargetBoard.winner === null && !nextTargetBoard.isFull) {
    nextActiveBoard = { row: cellRow, col: cellCol };
  } else {
    // Target board is finished -> Wild move allowed!
    nextActiveBoard = null;
  }

  const nextPlayer: Player = player === 'X' ? 'O' : 'X';

  const newMoveHistory: Move[] = [
    ...state.moveHistory,
    { ...move, timestamp: Date.now() },
  ];

  const updatedStats = { ...state.stats };
  if (overallWinner && overallWinner !== state.winner) {
    if (overallWinner === 'X') updatedStats.xWins++;
    else if (overallWinner === 'O') updatedStats.oWins++;
    else if (overallWinner === 'TIE') updatedStats.ties++;
  }

  return {
    ...state,
    subBoards,
    masterGrid,
    activeBoard: nextActiveBoard,
    currentPlayer: nextPlayer,
    winner: overallWinner,
    winningMasterLine,
    moveHistory: newMoveHistory,
    stats: updatedStats,
  };
}
