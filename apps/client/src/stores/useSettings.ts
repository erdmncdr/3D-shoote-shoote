import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameSettings {
  mouseSensitivity: number;
  fieldOfView: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  invertYAxis: boolean;
  volume: number;
  showFPS: boolean;
  showCrosshair: boolean;
}

const defaultSettings: GameSettings = {
  mouseSensitivity: 50,
  fieldOfView: 75,
  graphicsQuality: 'medium',
  invertYAxis: false,
  volume: 50,
  showFPS: false,
  showCrosshair: true,
};

interface SettingsStore {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'fps-game-settings',
    }
  )
);
