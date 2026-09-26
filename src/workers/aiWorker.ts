import { getMCTSMove } from '../ai/mcts';

self.onmessage = (e: MessageEvent) => {
  const { state, timeBudgetMs } = e.data;
  const move = getMCTSMove(state, timeBudgetMs || 35);
  self.postMessage({ move });
};
