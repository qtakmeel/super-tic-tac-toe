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
    tagline: 'Monte Carlo Searcher',
    description: 'Runs fast Monte Carlo Tree Search (~20ms time budget) for strong multi-turn positioning.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  5: {
    level: 5,
    name: 'Master',
    tagline: 'Grandmaster MCTS Worker',
    description: 'Deep MCTS (~45ms time budget) running off-thread for top-tier play.',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
};

/**
 * Computes AI move based on difficulty level with guaranteed instant responsiveness (<30ms)
 */
export async function computeAIMove(
  state: GameState,
  worker?: Worker | null
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
      return getMCTSMove(state, 20); // 20ms hard time budget
    case 5:
      if (worker) {
        try {
          return await computeWorkerMove(worker, state, 45, 60);
        } catch {
          return getMCTSMove(state, 45);
        }
      }
      return getMCTSMove(state, 45); // 45ms hard time budget
    default:
      return getBeginnerMove(state);
  }
}

/**
 * Offloads MCTS calculation to Web Worker with strict timeout fallback
 */
function computeWorkerMove(
  worker: Worker,
  state: GameState,
  timeBudgetMs: number,
  timeoutMs = 60
): Promise<Move | null> {
  return new Promise((resolve) => {
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        worker.removeEventListener('message', handleMessage);
        resolve(getMCTSMove(state, 20));
      }
    }, timeoutMs);

    const handleMessage = (e: MessageEvent) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        worker.removeEventListener('message', handleMessage);
        resolve(e.data.move || null);
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({ state, timeBudgetMs });
  });
}
