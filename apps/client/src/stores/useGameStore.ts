import { create } from 'zustand';
import { GameState, PlayerData } from '../services/NetworkService';

interface GameStore extends GameState {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  updateState: (state: GameState) => void;
  getPlayer: (id: string) => PlayerData | undefined;
  getLocalPlayer: () => PlayerData | undefined;
  reset: () => void;
}

const initialState: GameState = {
  players: new Map(),
  blueScore: 0,
  redScore: 0,
  timeRemaining: 600,
  tick: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  sessionId: null,

  setSessionId: (id) => set({ sessionId: id }),

  updateState: (state) =>
    set({
      players: state.players,
      blueScore: state.blueScore,
      redScore: state.redScore,
      timeRemaining: state.timeRemaining,
      tick: state.tick,
    }),

  getPlayer: (id) => get().players.get(id),

  getLocalPlayer: () => {
    const { sessionId, players } = get();
    if (!sessionId) return undefined;
    return players.get(sessionId);
  },

  reset: () =>
    set({
      ...initialState,
      sessionId: null,
    }),
}));
