import { GameState, Move, Player } from '../types/game';
import { getValidMoves, executeMove } from '../logic/rules';

class MCTSNode {
  state: GameState;
  parent: MCTSNode | null;
  move: Move | null;
  children: MCTSNode[] = [];
  untriedMoves: Move[];
  visits = 0;
  wins = 0;
  playerToMove: Player;

  constructor(state: GameState, parent: MCTSNode | null = null, move: Move | null = null) {
    this.state = state;
    this.parent = parent;
    this.move = move;
    this.playerToMove = state.currentPlayer;
    
    // Get valid moves and tag them with current player
    const valid = getValidMoves(state.subBoards, state.activeBoard);
    this.untriedMoves = valid.map((m) => ({ ...m, player: this.playerToMove }));
  }

  isFullyExpanded(): boolean {
    return this.untriedMoves.length === 0;
  }

  isTerminal(): boolean {
    return this.state.winner !== null;
  }

  selectChild(explorationConstant = 1.414): MCTSNode {
    let bestChild = this.children[0];
    let bestValue = -Infinity;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      // UCB1 formula
      const exploitation = child.wins / child.visits;
      const exploration = explorationConstant * Math.sqrt(Math.log(this.visits) / child.visits);
      const ucbValue = exploitation + exploration;

      if (ucbValue > bestValue) {
        bestValue = ucbValue;
        bestChild = child;
      }
    }
    return bestChild;
  }

  expand(): MCTSNode {
    const moveIndex = (Math.random() * this.untriedMoves.length) | 0;
    const move = this.untriedMoves.splice(moveIndex, 1)[0];
    const nextState = executeMove(this.state, move);
    const childNode = new MCTSNode(nextState, this, move);
    this.children.push(childNode);
    return childNode;
  }
}

/**
 * Perform Monte Carlo Tree Search for Ultimate Tic-Tac-Toe
 */
export function getMCTSMove(state: GameState, iterations = 800): Move | null {
  const rootMoves = getValidMoves(state.subBoards, state.activeBoard);
  if (rootMoves.length === 0) return null;
  if (rootMoves.length === 1) {
    return { ...rootMoves[0], player: state.currentPlayer };
  }

  const aiPlayer = state.currentPlayer;
  const root = new MCTSNode(state);

  for (let i = 0; i < iterations; i++) {
    let node = root;

    // 1. Selection
    while (!node.isTerminal() && node.isFullyExpanded() && node.children.length > 0) {
      node = node.selectChild();
    }

    // 2. Expansion
    if (!node.isTerminal() && !node.isFullyExpanded()) {
      node = node.expand();
    }

    // 3. Fast Rollout Simulation
    const result = rollout(node.state, 20);

    // 4. Backpropagation
    let currNode: MCTSNode | null = node;
    while (currNode !== null) {
      currNode.visits++;
      if (result === aiPlayer) {
        currNode.wins += 1.0;
      } else if (result === 'TIE') {
        currNode.wins += 0.5;
      }
      currNode = currNode.parent;
    }
  }

  // Pick the most visited child from root
  let bestChild: MCTSNode | null = null;
  let maxVisits = -1;

  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    if (child.visits > maxVisits) {
      maxVisits = child.visits;
      bestChild = child;
    }
  }

  return bestChild ? bestChild.move : { ...rootMoves[0], player: aiPlayer };
}

/**
 * Ultra-fast rollout simulation without quadratic state clones
 */
function rollout(initialState: GameState, maxMoves = 20): 'X' | 'O' | 'TIE' | null {
  let currState = initialState;
  let movesCount = 0;

  while (currState.winner === null && movesCount < maxMoves) {
    const validMoves = getValidMoves(currState.subBoards, currState.activeBoard);
    if (validMoves.length === 0) break;

    const player = currState.currentPlayer;
    // Ultra-fast random move selection
    const randomIndex = (Math.random() * validMoves.length) | 0;
    const selectedMove: Move = { ...validMoves[randomIndex], player };

    currState = executeMove(currState, selectedMove);
    movesCount++;
  }

  if (currState.winner !== null) return currState.winner;

  // If max depth reached, estimate winner from sub-board counts
  let xCount = 0;
  let oCount = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const w = currState.masterGrid[r][c];
      if (w === 'X') xCount++;
      else if (w === 'O') oCount++;
    }
  }
  if (xCount > oCount) return 'X';
  if (oCount > xCount) return 'O';
  return 'TIE';
}
