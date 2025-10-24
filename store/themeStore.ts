import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  backgroundColor: string;
  textColor: string;
  frameOpacity: number; // 0-100
  setBackgroundColor: (color: string) => void;
  setTextColor: (color: string) => void;
  setFrameOpacity: (opacity: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      backgroundColor: '#111827', // dark slate gray
      textColor: '#e5e7eb', // light gray
      frameOpacity: 100,
      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
      setTextColor: (textColor) => set({ textColor }),
      setFrameOpacity: (frameOpacity) => set({ frameOpacity }),
    }),
    {
      name: 'timeline-theme-storage', // name of the item in the storage (must be unique)
    }
  )
);
