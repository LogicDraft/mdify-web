"use client";

import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import type {
  ConversionHistoryItem,
  ConversionResult,
  ConversionSettings,
} from "../types";
import { DEFAULT_SETTINGS } from "../types";

// Custom storage using IndexedDB
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface ConversionStore {
  // Current conversion
  currentResult: ConversionResult | null;
  setCurrentResult: (result: ConversionResult | null) => void;

  // History
  history: ConversionHistoryItem[];
  addToHistory: (result: ConversionResult) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // Settings
  settings: ConversionSettings;
  updateSettings: (settings: Partial<ConversionSettings>) => void;

  // UI State
  isConverting: boolean;
  setIsConverting: (v: boolean) => void;
  conversionProgress: number;
  setConversionProgress: (v: number) => void;
}

export const useConversionStore = create<ConversionStore>()(
  persist(
    (set) => ({
      currentResult: null,
      setCurrentResult: (result) => set({ currentResult: result }),

      history: [],
      addToHistory: (result) =>
        set((state) => {
          const item: ConversionHistoryItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            fileName: result.fileName,
            fileSize: result.fileSize,
            fileType: result.fileType,
            markdown: result.markdown,
            convertedAt: new Date().toISOString(),
            conversionTimeMs: result.conversionTimeMs,
          };
          // Keep last 20 items
          const history = [item, ...state.history].slice(0, 20);
          return { history };
        }),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
      clearHistory: () => set({ history: [] }),

      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      isConverting: false,
      setIsConverting: (v) => set({ isConverting: v }),
      conversionProgress: 0,
      setConversionProgress: (v) => set({ conversionProgress: v }),
    }),
    {
      name: "mdify-store",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        history: state.history,
        settings: state.settings,
      }),
    }
  )
);
