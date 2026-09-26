import { getMCTSMove } from '../ai/mcts';

self.onmessage = (e: MessageEvent) => {
  const { state, iterations } = e.data;
  const move = getMCTSMove(state, iterations || 5000);
  self.postMessage({ move });
};
