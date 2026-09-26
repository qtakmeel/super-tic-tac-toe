import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { Header } from './components/Header';
import { GameModeBar } from './components/GameModeBar';
import { GameStatus } from './components/GameStatus';
import { MasterBoard } from './components/MasterBoard';
import { MoveHistory } from './components/MoveHistory';
import { RulesModal } from './components/RulesModal';
import { StatsModal } from './components/StatsModal';

export function App() {
  const {
    state,
    handleCellClick,
    resetGame,
    undoMove,
    toggleSound,
    toggleTheme,
    setGameMode,
    setDifficulty,
    setTimeControl,
  } = useGameState();

  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 transition-colors duration-300 ${
        state.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Container */}
      <div className="w-full max-w-5xl flex flex-col items-center">
        {/* Top Header */}
        <Header
          theme={state.theme}
          soundEnabled={state.soundEnabled}
          onToggleTheme={toggleTheme}
          onToggleSound={toggleSound}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onResetGame={() => resetGame()}
        />

        {/* Mode, Time Control & Difficulty Selector Bar */}
        <GameModeBar
          gameMode={state.gameMode}
          aiDifficulty={state.aiDifficulty}
          timeControl={state.timeControl}
          onSetGameMode={setGameMode}
          onSetDifficulty={setDifficulty}
          onSetTimeControl={setTimeControl}
          isThinking={state.isThinking}
        />

        {/* Game Status Banner */}
        <GameStatus state={state} />

        {/* Central Master Board */}
        <MasterBoard state={state} onCellClick={handleCellClick} />

        {/* Move History Drawer */}
        <MoveHistory
          moveHistory={state.moveHistory}
          isThinking={state.isThinking}
          onUndo={undoMove}
        />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-500 font-medium">
        <p>Ultimate Tic-Tac-Toe • Built with React, TypeScript & Tailwind CSS</p>
      </footer>

      {/* Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <StatsModal
        isOpen={isStatsOpen}
        stats={state.stats}
        onClose={() => setIsStatsOpen(false)}
      />
    </div>
  );
}

export default App;
