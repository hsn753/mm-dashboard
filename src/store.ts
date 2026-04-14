import { create } from 'zustand';
import type { Transaction, MMStats, MirrorRule } from './types';
import { mockMMStats, mockMirrorRules, mockTransactions } from './mockData';

interface MMStore {
  stats: MMStats;
  mirrorRules: MirrorRule[];
  transactions: Transaction[];
  isPaused: boolean;
  wsConnected: boolean;
  setStats: (s: MMStats) => void;
  setMirrorRules: (r: MirrorRule[]) => void;
  toggleRule: (id: string) => void;
  addTransaction: (tx: Transaction) => void;
  setPaused: (v: boolean) => void;
  setWsConnected: (v: boolean) => void;
}

export const useMMStore = create<MMStore>((set) => ({
  stats: mockMMStats,
  mirrorRules: mockMirrorRules,
  transactions: mockTransactions,
  isPaused: false,
  wsConnected: false,
  setStats: (stats) => set({ stats }),
  setMirrorRules: (mirrorRules) => set({ mirrorRules }),
  toggleRule: (id) =>
    set((state) => ({
      mirrorRules: state.mirrorRules.map((r) =>
        r.id === id ? { ...r, status: !r.status } : r
      ),
    })),
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 100),
    })),
  setPaused: (isPaused) => set({ isPaused }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
}));
