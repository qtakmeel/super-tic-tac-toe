import React from 'react';
import { X, CheckCircle2, AlertCircle, Compass, Target } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">How to Play Ultimate Tic-Tac-Toe</h2>
              <p className="text-xs text-slate-400">Master the rules of nested strategic board control</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Rule 1 */}
          <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white mb-1">1. The 9-in-1 Board Structure</h3>
              <p className="text-slate-300">
                The game consists of a master 3x3 grid. Inside each of the 9 master cells is a smaller 3x3 Tic-Tac-Toe board (81 cells total).
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
            <Target className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white mb-1">2. Forced Opponent Positioning</h3>
              <p className="text-slate-300">
                Where you place your mark inside a small board dictates <strong>which sub-board your opponent MUST play in next</strong>!
                For example, if you play in the top-right corner of a small board, your opponent is forced to make their next move in the top-right sub-board of the master grid.
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white mb-1">3. The Wild Move Rule</h3>
              <p className="text-slate-300">
                If a move sends your opponent to a sub-board that has <strong>already been won or completely filled</strong>, your opponent gets a <strong>WILD MOVE</strong>! They are free to place their mark in any open cell on any uncompleted sub-board.
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white mb-1">4. Winning the Game</h3>
              <p className="text-slate-300">
                Getting 3-in-a-row in a small board wins that sub-board. To win the ultimate game, align <strong>3 won sub-boards in a row, column, or diagonal</strong> on the master grid!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
