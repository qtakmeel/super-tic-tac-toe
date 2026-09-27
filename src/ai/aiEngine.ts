import { GameState, Move, AIDifficulty, AIDifficultyInfo } from '../types/game';
import { getNoviceMove } from './level1_novice';
import { getBeginnerMove } from './level2_beginner';
import { getMinimaxMove } from './level3_minimax';
import { getMCTSMove } from './mcts';

export const AI_DIFFICULTY_INFOS: Record<AIDifficulty, AIDifficultyInfo> = {
  1: {
    level: 1,
    name: 'Novice',
    tagline: 'Casual & Forgiving',
    description: 'Makes random moves with basic opportunistic sub-board wins. Perfect for learning.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  2: {
    level: 2,
    name: 'Beginner',
    tagline: 'Tactical Awareness',
    description: 'Evaluates immediate sub-board captures and blocks basic opponent threats.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  3: {
    level: 3,
    name: 'Intermediate',
    tagline: 'Minimax Strategist',
    description: 'Uses depth-limited Minimax tree search to plan positional board control.',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  4: {
    level: 4,
    name: 'Advanced',
    tagline: 'MCTS Explorer',
    description: 'Runs Monte Carlo Tree Search with UCB1 selection for strong multi-turn positioning.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  5: {
    level: 5,
    name: 'Master',
    tagline: 'Deep MCTS',
    description: 'Extended Monte Carlo Tree Search with deeper simulations for top-tier strategic play.',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
};

/**
 * Computes an adaptive time budget for MCTS based on remaining clock time.
 * Mirrors chess-style time management: use a small fraction of remaining time,
 * so the AI always has clock to spare.
 */
function getTimeBudget(state: GameState, baseMs: number): number {
  if (state.timeControl === 'casual') return baseMs;

  const remainingSecs = state.playerTimes[state.currentPlayer];

  // Emergency: clock almost gone — think as briefly as possible
  if (remainingSecs <= 5) return 80;

  // Low on time: cap to a fraction of remaining time
  if (remainingSecs <= 30) return Math.min(baseMs, remainingSecs * 20); // ~2%

  // Normal: use up to ~3% of remaining time, capped at base budget
  return Math.min(baseMs, remainingSecs * 30);
}

/**
 * Computes AI move based on difficulty level.
 * L4 and L5 both run synchronously in the main thread — the UCT MCTS is
 * fast enough (<30ms / <60ms) that a Worker is not needed and would only
 * add postMessage serialization overhead.
 */
export async function computeAIMove(
  state: GameState,
  _worker?: Worker | null
): Promise<Move | null> {
  const { aiDifficulty } = state;

  switch (aiDifficulty) {
    case 1:
      return getNoviceMove(state);
    case 2:
      return getBeginnerMove(state);
    case 3:
      return getMinimaxMove(state, 2);
    case 4:
      return getMCTSMove(state, getTimeBudget(state, 25));
    case 5:
      return getMCTSMove(state, getTimeBudget(state, 60));
    default:
      return getBeginnerMove(state);
  }
}
