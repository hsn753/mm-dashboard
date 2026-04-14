import { useState, useEffect } from 'react';
import MMTab from './components/MMTab';
import KOLTab from './components/KOLTab';
import SettingsTab from './components/SettingsTab';
import { useMMStore } from './store';
import type { Transaction, TxType } from './types';

type Tab = 'mm' | 'kol' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'mm', label: 'mm bot' },
  { id: 'kol', label: 'kol tool' },
  { id: 'settings', label: 'settings' },
];

const STORAGE_KEY = 'mm_launch_config';

interface DexPair {
  baseToken?: { symbol?: string };
  priceUsd?: string;
  marketCap?: number;
  fdv?: number;
  priceChange?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  volume?: { h24?: number };
}

interface DexTx {
  txHash?: string;
  maker?: string;
  type?: string;
  amountUsd?: number;
  timestamp?: number;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('mm');
  const setStats = useMMStore((s) => s.setStats);
  const setTransactions = useMMStore((s) => s.setTransactions);
  const activeMint = useMMStore((s) => s.activeMint);
  const stats = useMMStore((s) => s.stats);

  useEffect(() => {
    const saved = (() => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } })();
    const supplyControl = saved?.supplyControl || stats.supplyControl;

    async function fetchAll() {
      try {
        const [tokenRes, dexRes, tradesRes] = await Promise.all([
          fetch(`/api/token/${activeMint}`).catch(() => null),
          fetch(`https://api.dexscreener.com/tokens/v1/solana/${activeMint}`).catch(() => null),
          fetch(`https://api.dexscreener.com/dex/trades/solana/${activeMint}?limit=20`).catch(() => null),
        ]);

        let ticker = 'TOKEN';
        let mcap = '—';

        if (tokenRes?.ok) {
          const t = await tokenRes.json() as { ticker: string; mcap: string };
          ticker = t.ticker;
          mcap = t.mcap !== '—' ? t.mcap : mcap;
        }

        if (dexRes?.ok) {
          const pairs = await dexRes.json() as DexPair[];
          const pair = pairs?.[0];
          if (pair) {
            ticker = pair.baseToken?.symbol ?? ticker;
            const buys = pair.txns?.h24?.buys ?? 0;
            const sells = pair.txns?.h24?.sells ?? 0;
            const mcapRaw = pair.marketCap ?? pair.fdv ?? 0;
            mcap = mcapRaw >= 1e9 ? `$${(mcapRaw/1e9).toFixed(1)}B` : mcapRaw >= 1e6 ? `$${(mcapRaw/1e6).toFixed(1)}M` : mcapRaw > 0 ? `$${(mcapRaw/1e3).toFixed(0)}K` : mcap;
            const vol24 = pair.volume?.h24 ?? 0;
            setStats({
              ...stats,
              activeLaunch: `$${ticker}`,
              mcap,
              buyers: buys,
              sellers: sells,
              ratio: sells > 0 ? `${Math.round(buys / sells)}:1` : '—',
              fees24h: vol24 > 0 ? `$${(vol24 * 0.003 / 1000).toFixed(1)}K` : '—',
              supplyControl,
            });
          }
        } else {
          setStats({ ...stats, activeLaunch: `$${ticker}`, mcap, supplyControl });
        }

        if (tradesRes?.ok) {
          const tradesData = await tradesRes.json() as { trades?: DexTx[] };
          const newTxs: Transaction[] = (tradesData?.trades ?? []).slice(0, 15).map((t, i) => ({
            id: t.txHash ?? String(i),
            time: t.timestamp ? new Date(t.timestamp * 1000).toLocaleTimeString('en-US', { hour12: false }) : '--:--:--',
            type: (t.type === 'sell' ? 'sell' : 'buy') as TxType,
            size: Math.round(t.amountUsd ?? 0),
            wallet: t.maker ? t.maker.slice(0, 6) + '...' + t.maker.slice(-4) : 'unknown',
            tx: t.txHash ? t.txHash.slice(0, 6) + '...' + t.txHash.slice(-3) : '—',
            jitoBundle: false,
            bundleLatencyMs: undefined,
          }));
          if (newTxs.length > 0) setTransactions(newTxs);
        }
      } catch { /* ignore */ }
    }

    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMint]);

  return (
    <div className="min-h-screen bg-[#0d0e0f] text-[#e5e7eb]">
      {/* Top bar */}
      <div className="border-b border-[#1e1f22] bg-[#111213]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center h-12 gap-1">
            {/* Logo mark */}
            <div className="flex items-center gap-2 mr-5">
              <div className="w-5 h-5 rounded bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
              </div>
              <span className="text-[#4b5563] text-xs font-mono tracking-widest uppercase">dione</span>
            </div>
            {/* Tabs */}
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 h-full text-sm transition-colors border-b-2 -mb-px ${
                  tab === t.id
                    ? 'text-white border-[#4ade80]'
                    : 'text-[#6b7280] border-transparent hover:text-[#9ca3af]'
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 text-[#4b5563] text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'mm' && <MMTab />}
        {tab === 'kol' && <KOLTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
