import { useState, useEffect } from 'react';
import MMTab from './components/MMTab';
import KOLTab from './components/KOLTab';
import SettingsTab from './components/SettingsTab';
import { useMMStore } from './store';

type Tab = 'mm' | 'kol' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'mm', label: 'mm bot' },
  { id: 'kol', label: 'kol tool' },
  { id: 'settings', label: 'settings' },
];

const STORAGE_KEY = 'mm_launch_config';

export default function App() {
  const [tab, setTab] = useState<Tab>('mm');
  const setStats = useMMStore((s) => s.setStats);
  const stats = useMMStore((s) => s.stats);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const c = JSON.parse(raw);
      setStats({
        ...stats,
        activeLaunch: c.activeLaunch || stats.activeLaunch,
        mcap: c.mcap || stats.mcap,
        treasury: c.treasury ? `$${Number(String(c.treasury).replace(/,/g, '')).toLocaleString()}` : stats.treasury,
        supplyControl: c.supplyControl || stats.supplyControl,
        buyers: c.buyers ? Number(c.buyers) : stats.buyers,
        sellers: c.sellers ? Number(c.sellers) : stats.sellers,
        ratio: c.ratio || stats.ratio,
        fees24h: c.fees24h || stats.fees24h,
      });
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
