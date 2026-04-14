import { useState, useEffect } from 'react';
import { useMMStore } from '../store';

const STORAGE_KEY = 'mm_launch_config';

interface LaunchConfig {
  activeLaunch: string;
  ticker: string;
  contractAddress: string;
  mcap: string;
  mcapTarget: string;
  treasury: string;
  supplyControl: string;
  buyers: string;
  sellers: string;
  ratio: string;
  fees24h: string;
  poolAddress: string;
  rpcUrl: string;
  notes: string;
}

const DEFAULTS: LaunchConfig = {
  activeLaunch: '$ASPEN',
  ticker: 'ASPEN',
  contractAddress: '',
  mcap: '$34.2M',
  mcapTarget: '$30M',
  treasury: '1,240,000',
  supplyControl: '98.4%',
  buyers: '14200',
  sellers: '284',
  ratio: '50:1',
  fees24h: '$11.4k',
  poolAddress: '',
  rpcUrl: 'http://127.0.0.1:8899',
  notes: '',
};

function load(): LaunchConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function SettingsTab() {
  const setStats = useMMStore((s) => s.setStats);
  const stats = useMMStore((s) => s.stats);
  const [config, setConfig] = useState<LaunchConfig>(load);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = load();
    setConfig(stored);
    applyToStore(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyToStore(c: LaunchConfig) {
    setStats({
      ...stats,
      activeLaunch: c.activeLaunch || stats.activeLaunch,
      mcap: c.mcap || stats.mcap,
      treasury: c.treasury ? `$${Number(c.treasury.replace(/,/g, '')).toLocaleString()}` : stats.treasury,
      supplyControl: c.supplyControl || stats.supplyControl,
      buyers: c.buyers ? Number(c.buyers) : stats.buyers,
      sellers: c.sellers ? Number(c.sellers) : stats.sellers,
      ratio: c.ratio || stats.ratio,
      fees24h: c.fees24h || stats.fees24h,
    });
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    applyToStore(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setConfig(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    applyToStore(DEFAULTS);
  }

  const fields: { key: keyof LaunchConfig; label: string; placeholder: string; mono?: boolean; area?: boolean }[] = [
    { key: 'activeLaunch', label: 'Token Name / Cashtag', placeholder: '$ASPEN' },
    { key: 'ticker', label: 'Ticker', placeholder: 'ASPEN' },
    { key: 'contractAddress', label: 'Token Contract Address', placeholder: 'Solana mint address', mono: true },
    { key: 'mcap', label: 'Current Mcap', placeholder: '$34.2M' },
    { key: 'mcapTarget', label: 'Mcap Target', placeholder: '$30M' },
    { key: 'supplyControl', label: 'Supply Control %', placeholder: '98.4%' },
    { key: 'treasury', label: 'Treasury Balance (USD, numbers only)', placeholder: '1240000' },
    { key: 'buyers', label: 'Buyers (24h)', placeholder: '14200' },
    { key: 'sellers', label: 'Sellers (24h)', placeholder: '284' },
    { key: 'ratio', label: 'Buy/Sell Ratio', placeholder: '50:1' },
    { key: 'fees24h', label: 'Fees Claimed 24h', placeholder: '$11.4k' },
    { key: 'poolAddress', label: 'Meteora DLMM Pool Address', placeholder: 'Pool address', mono: true },
    { key: 'rpcUrl', label: 'Solana RPC URL', placeholder: 'http://127.0.0.1:8899', mono: true },
    { key: 'notes', label: 'Notes', placeholder: 'Any internal notes...', area: true },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2b2e] flex items-center justify-between">
          <div>
            <h2 className="text-white text-sm font-medium">launch config</h2>
            <p className="text-[#4b5563] text-xs mt-0.5">change launch token, addresses, and targets — no code needed</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-[#2a2b2e] text-[#6b7280] text-xs hover:border-[#4b4c4f] transition-colors"
            >
              reset
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                saved
                  ? 'bg-[#052e16] border border-[#166534] text-[#4ade80]'
                  : 'bg-[#4ade80] hover:bg-[#22c55e] text-black'
              }`}
            >
              {saved ? '✓ saved' : 'save & apply'}
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ key, label, placeholder, mono, area }) => (
            <div key={key} className={area ? 'md:col-span-2' : ''}>
              <label className="block text-[#6b7280] text-xs mb-1.5 uppercase tracking-wider">{label}</label>
              {area ? (
                <textarea
                  value={config[key]}
                  onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  className={`w-full bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-2 text-sm text-[#d1d5db] placeholder-[#374151] outline-none focus:border-[#4b5563] resize-none ${mono ? 'font-mono' : ''}`}
                />
              ) : (
                <input
                  type="text"
                  value={config[key]}
                  onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={`w-full bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-2 text-sm text-[#d1d5db] placeholder-[#374151] outline-none focus:border-[#4b5563] ${mono ? 'font-mono text-xs' : ''}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl p-5">
        <h3 className="text-white text-sm font-medium mb-3">how to switch to a new launch</h3>
        <ol className="space-y-2 text-[#9ca3af] text-sm">
          <li className="flex gap-3"><span className="text-[#4ade80] font-mono text-xs mt-0.5">01</span><span>Update <span className="text-[#d1d5db]">Token Name</span>, <span className="text-[#d1d5db]">Ticker</span>, and <span className="text-[#d1d5db]">Contract Address</span> above</span></li>
          <li className="flex gap-3"><span className="text-[#4ade80] font-mono text-xs mt-0.5">02</span><span>Paste the new <span className="text-[#d1d5db]">Meteora DLMM Pool Address</span></span></li>
          <li className="flex gap-3"><span className="text-[#4ade80] font-mono text-xs mt-0.5">03</span><span>Click <span className="text-[#d1d5db]">save & apply</span> — stats update instantly on the MM bot tab</span></li>
          <li className="flex gap-3"><span className="text-[#4ade80] font-mono text-xs mt-0.5">04</span><span>Go to <span className="text-[#d1d5db]">KOL tool → new campaign</span> to set up KOLs for the new token</span></li>
          <li className="flex gap-3"><span className="text-[#4ade80] font-mono text-xs mt-0.5">05</span><span>Update <span className="text-[#d1d5db]">USDC_MINT</span> on the backend server if using a different mint for payouts</span></li>
        </ol>
      </div>
    </div>
  );
}
