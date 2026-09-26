export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardWinner = Player | 'TIE' | null;

export type GameMode = '1P' | '2P';
export type AIDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Coordinate {
  row: number;
  col: number;
}

export interface Move {
  boardRow: number;
  boardCol: number;
  cellRow: number;
  cellCol: number;
  player: Player;
  timestamp?: number;
}

export interface SubBoard {
  cells: CellValue[][]; // 3x3 grid
  winner: BoardWinner;
  winningLine?: number[][] | null; // e.g. [[0,0], [0,1], [0,2]]
  isFull: boolean;
}

export interface GameState {
  subBoards: SubBoard[][]; // 3x3 grid of SubBoards
  masterGrid: BoardWinner[][]; // 3x3 grid summarizing winners of each sub-board
  activeBoard: Coordinate | null; // null = free/wild move anywhere on uncompleted board
  currentPlayer: Player;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  humanPlayer: Player; // 'X' or 'O' in 1P mode
  winner: BoardWinner;
  winningMasterLine?: number[][] | null;
  moveHistory: Move[];
  isThinking: boolean; // True when AI is computing move
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  stats: {
    xWins: number;
    oWins: number;
    ties: number;
  };
}

export interface AIDifficultyInfo {
  level: AIDifficulty;
  name: string;
  tagline: string;
  description: string;
  badgeColor: string;
}
