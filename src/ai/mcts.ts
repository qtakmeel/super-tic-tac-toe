import { GameState, Move } from '../types/game';
import { getValidMoves } from '../logic/rules';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6],             // Diags
];

// ─── Fast flat state ─────────────────────────────────────────────────────────

interface FastState {
  cells: Uint8Array;   // 81 bytes: board[bIdx*9 + cIdx] = 0/1/2
  master: Uint8Array;  // 9 bytes:  0=open, 1=X, 2=O, 3=tie
  active: number;      // -1=wild, 0-8=forced board index
  player: number;      // 1=X, 2=O
}

function stateToFast(state: GameState): FastState {
  const cells = new Uint8Array(81);
  const master = new Uint8Array(9);

  for (let bR = 0; bR < 3; bR++) {
    for (let bC = 0; bC < 3; bC++) {
      const bIdx = bR * 3 + bC;
      const sub = state.subBoards[bR][bC];

      if (sub.winner === 'X')   master[bIdx] = 1;
      else if (sub.winner === 'O')   master[bIdx] = 2;
      else if (sub.winner === 'TIE') master[bIdx] = 3;

      for (let cR = 0; cR < 3; cR++) {
        for (let cC = 0; cC < 3; cC++) {
          const v = sub.cells[cR][cC];
          if (v === 'X') cells[bIdx * 9 + cR * 3 + cC] = 1;
          else if (v === 'O') cells[bIdx * 9 + cR * 3 + cC] = 2;
        }
      }
    }
  }

  const active = state.activeBoard
    ? state.activeBoard.row * 3 + state.activeBoard.col
    : -1;

  return {
    cells,
    master,
    active,
    player: state.currentPlayer === 'X' ? 1 : 2,
  };
}

// ─── Win checker ──────────────────────────────────────────────────────────────

function winCheck(grid: Uint8Array, offset: number): number {
  for (let i = 0; i < 8; i++) {
    const [a, b, c] = WINNING_COMBOS[i];
    const v = grid[offset + a];
    if (v !== 0 && v === grid[offset + b] && v === grid[offset + c]) return v;
  }
  return 0;
}

// ─── Single rollout from a given FastState snapshot ───────────────────────────
// Returns: 1 (X wins), 2 (O wins), 3 (tie/draw)

function rollout(cells: Uint8Array, master: Uint8Array, active: number, player: number): number {
  // Work on copies so we don't mutate between simulations
  const c = new Uint8Array(cells);
  const m = new Uint8Array(master);
  let ab = active;
  let pl = player;

  for (let step = 0; step < 81; step++) {
    // Determine which board to play in
    let bIdx = ab;
    if (bIdx !== -1 && m[bIdx] !== 0) bIdx = -1; // forced board is closed → wild

    let chosenBoard = -1;
    let chosenCell = -1;

    if (bIdx !== -1) {
      // Count open cells in forced board
      let open = 0;
      const base = bIdx * 9;
      for (let ci = 0; ci < 9; ci++) {
        if (c[base + ci] === 0) open++;
      }
      if (open === 0) {
        bIdx = -1; // no cells in forced board → wild
      } else {
        let pick = (Math.random() * open) | 0;
        for (let ci = 0; ci < 9; ci++) {
          if (c[base + ci] === 0) {
            if (pick === 0) { chosenBoard = bIdx; chosenCell = ci; break; }
            pick--;
          }
        }
      }
    }

    if (bIdx === -1) {
      // Wild move: count all open cells across open boards
      let total = 0;
      for (let b = 0; b < 9; b++) {
        if (m[b] === 0) {
          for (let ci = 0; ci < 9; ci++) {
            if (c[b * 9 + ci] === 0) total++;
          }
        }
      }
      if (total === 0) break; // board full → tie

      let pick = (Math.random() * total) | 0;
      outer: for (let b = 0; b < 9; b++) {
        if (m[b] === 0) {
          for (let ci = 0; ci < 9; ci++) {
            if (c[b * 9 + ci] === 0) {
              if (pick === 0) { chosenBoard = b; chosenCell = ci; break outer; }
              pick--;
            }
          }
        }
      }
    }

    if (chosenBoard === -1) break;

    // Apply move
    c[chosenBoard * 9 + chosenCell] = pl;

    // Check sub-board win
    const sw = winCheck(c, chosenBoard * 9);
    if (sw > 0) {
      m[chosenBoard] = sw;
      const mw = winCheck(m, 0);
      if (mw > 0) return mw;
    } else {
      // Check if sub-board is now full (tie)
      let full = true;
      const sb = chosenBoard * 9;
      for (let ci = 0; ci < 9; ci++) {
        if (c[sb + ci] === 0) { full = false; break; }
      }
      if (full && m[chosenBoard] === 0) m[chosenBoard] = 3; // tie
    }

    // Next active board = the cell index we just played (maps to board index)
    ab = m[chosenCell] === 0 ? chosenCell : -1;
    pl = pl === 1 ? 2 : 1;
  }

  // Heuristic result: count captured boards
  let x = 0, o = 0;
  for (let b = 0; b < 9; b++) {
    if (m[b] === 1) x++;
    else if (m[b] === 2) o++;
  }
  if (x > o) return 1;
  if (o > x) return 2;
  return 3;
}

// ─── UCB1 MCTS tree ───────────────────────────────────────────────────────────

interface Node {
  move: Move | null;      // null for root
  wins: number;
  visits: number;
  children: Node[];
  untriedMoves: Move[];
  fast: FastState;        // state AFTER this node's move was applied
  aiPlayer: number;       // the AI's player value (constant across tree)
}

const C = Math.SQRT2; // UCB1 exploration constant

function ucbScore(node: Node, parentVisits: number): number {
  if (node.visits === 0) return Infinity;
  return node.wins / node.visits + C * Math.sqrt(Math.log(parentVisits) / node.visits);
}

function applyMoveToFast(fs: FastState, move: Move): FastState {
  const c = new Uint8Array(fs.cells);
  const m = new Uint8Array(fs.master);

  const bIdx = move.boardRow * 3 + move.boardCol;
  const cIdx = move.cellRow * 3 + move.cellCol;
  c[bIdx * 9 + cIdx] = fs.player;

  // Check sub-board win
  const sw = winCheck(c, bIdx * 9);
  if (sw > 0) {
    m[bIdx] = sw;
  } else {
    // Check tie
    let full = true;
    for (let ci = 0; ci < 9; ci++) {
      if (c[bIdx * 9 + ci] === 0) { full = false; break; }
    }
    if (full) m[bIdx] = 3;
  }

  // Next active board
  const nextActive = m[cIdx] === 0 ? cIdx : -1;
  const nextPlayer = fs.player === 1 ? 2 : 1;

  return { cells: c, master: m, active: nextActive, player: nextPlayer };
}

function makeNode(move: Move | null, fs: FastState, aiPlayer: number): Node {
  const validMoves = getValidMovesFromFast(fs);
  return { move, wins: 0, visits: 0, children: [], untriedMoves: validMoves, fast: fs, aiPlayer };
}

function getValidMovesFromFast(fs: FastState): Move[] {
  const moves: Move[] = [];
  const player: 'X' | 'O' = fs.player === 1 ? 'X' : 'O';

  if (fs.active !== -1 && fs.master[fs.active] === 0) {
    // Forced board
    const b = fs.active;
    const bR = (b / 3) | 0, bC = b % 3;
    const base = b * 9;
    for (let ci = 0; ci < 9; ci++) {
      if (fs.cells[base + ci] === 0) {
        moves.push({ boardRow: bR, boardCol: bC, cellRow: (ci / 3) | 0, cellCol: ci % 3, player });
      }
    }
  } else {
    // Wild move
    for (let b = 0; b < 9; b++) {
      if (fs.master[b] === 0) {
        const bR = (b / 3) | 0, bC = b % 3;
        const base = b * 9;
        for (let ci = 0; ci < 9; ci++) {
          if (fs.cells[base + ci] === 0) {
            moves.push({ boardRow: bR, boardCol: bC, cellRow: (ci / 3) | 0, cellCol: ci % 3, player });
          }
        }
      }
    }
  }
  return moves;
}

function isTerminal(fs: FastState): boolean {
  // Check master win
  if (winCheck(fs.master, 0) > 0) return true;
  // Check if all boards done
  for (let b = 0; b < 9; b++) {
    if (fs.master[b] === 0) return false;
  }
  return true;
}

function selectChild(node: Node): Node {
  let best = node.children[0];
  let bestScore = -Infinity;
  for (const child of node.children) {
    const s = ucbScore(child, node.visits);
    if (s > bestScore) { bestScore = s; best = child; }
  }
  return best;
}

/**
 * Time-budgeted UCB1 MCTS.
 * Uses proper tree search with fast flat rollouts for simulation.
 */
export function getMCTSMove(state: GameState, maxTimeMs = 35): Move | null {
  const validMoves = getValidMoves(state.subBoards, state.activeBoard);
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) return { ...validMoves[0], player: state.currentPlayer };

  const aiPlayer = state.currentPlayer === 'X' ? 1 : 2;
  const rootFast = stateToFast(state);

  // Seed the root with valid moves pre-computed
  const root: Node = {
    move: null,
    wins: 0,
    visits: 0,
    children: [],
    untriedMoves: [...validMoves],
    fast: rootFast,
    aiPlayer,
  };

  const deadline = performance.now() + maxTimeMs;

  while (performance.now() < deadline) {
    // 1. Selection: traverse tree by UCB1
    let node = root;
    const path: Node[] = [node];

    while (node.untriedMoves.length === 0 && node.children.length > 0 && !isTerminal(node.fast)) {
      node = selectChild(node);
      path.push(node);
    }

    // 2. Expansion: add one child for an untried move
    if (node.untriedMoves.length > 0 && !isTerminal(node.fast)) {
      const idx = (Math.random() * node.untriedMoves.length) | 0;
      const move = node.untriedMoves.splice(idx, 1)[0];
      const childFast = applyMoveToFast(node.fast, move);
      const child = makeNode(move, childFast, aiPlayer);
      node.children.push(child);
      node = child;
      path.push(node);
    }

    // 3. Simulation: run random rollout from this node
    let result: number;
    if (isTerminal(node.fast)) {
      result = winCheck(node.fast.master, 0);
      if (result === 0) {
        // count boards
        let x = 0, o = 0;
        for (let b = 0; b < 9; b++) {
          if (node.fast.master[b] === 1) x++;
          else if (node.fast.master[b] === 2) o++;
        }
        result = x > o ? 1 : o > x ? 2 : 3;
      }
    } else {
      result = rollout(node.fast.cells, node.fast.master, node.fast.active, node.fast.player);
    }

    // 4. Backpropagation
    for (const n of path) {
      n.visits++;
      if (result === n.aiPlayer) n.wins += 1;
      else if (result === 3) n.wins += 0.5; // tie is half-credit
    }
  }

  // Pick most-visited child of root (robust child selection)
  if (root.children.length === 0) {
    // Fallback: no tree built (very tight budget), return random
    const idx = (Math.random() * validMoves.length) | 0;
    return { ...validMoves[idx], player: state.currentPlayer };
  }

  let bestChild = root.children[0];
  for (const child of root.children) {
    if (child.visits > bestChild.visits) bestChild = child;
  }

  return bestChild.move ? { ...bestChild.move, player: state.currentPlayer } : null;
}
