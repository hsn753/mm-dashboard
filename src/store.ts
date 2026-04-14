import { create } from 'zustand';
import type { Transaction, MMStats, MirrorRule, KOL, Campaign } from './types';
import { mockMMStats, mockMirrorRules, mockTransactions, mockKOLs, mockCampaigns } from './mockData';

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

interface KOLStore {
  kols: KOL[];
  campaigns: Campaign[];
  activeCampaignId: string | null;
  setKOLs: (k: KOL[]) => void;
  addKOL: (k: KOL) => void;
  updateKOL: (id: string, k: Partial<KOL>) => void;
  deleteKOL: (id: string) => void;
  setCampaigns: (c: Campaign[]) => void;
  setActiveCampaign: (id: string) => void;
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

export const useKOLStore = create<KOLStore>((set) => ({
  kols: mockKOLs,
  campaigns: mockCampaigns,
  activeCampaignId: '1',
  setKOLs: (kols) => set({ kols }),
  addKOL: (k) => set((state) => ({ kols: [...state.kols, k] })),
  updateKOL: (id, k) =>
    set((state) => ({
      kols: state.kols.map((kol) => (kol.id === id ? { ...kol, ...k } : kol)),
    })),
  deleteKOL: (id) =>
    set((state) => ({ kols: state.kols.filter((k) => k.id !== id) })),
  setCampaigns: (campaigns) => set({ campaigns }),
  setActiveCampaign: (activeCampaignId) => set({ activeCampaignId }),
}));
