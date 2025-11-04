import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ru' | 'be';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'timeline-language-storage',
    }
  )
);
