import { useState } from 'react';
import { useMMStore } from '../store';

const STORAGE_KEY = 'mm_launch_config';

interface TokenData {
  mint: string;
  name: string;
  ticker: string;
  mcap: string;
  price: string;
  change24h: string;
}

function extractMint(input: string): string {
  const trimmed = input.trim();
  const jupMatch = trimmed.match(/jup\.ag\/tokens\/([A-Za-z0-9]+)/);
  if (jupMatch) return jupMatch[1];
  if (/^[A-Za-z0-9]{32,44}$/.test(trimmed)) return trimmed;
  return trimmed;
}

function formatMcap(usd: number): string {
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(1)}B`;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${usd.toFixed(0)}`;
}

export default function SettingsTab() {
  const setStats = useMMStore((s) => s.setStats);
  const stats = useMMStore((s) => s.stats);

  const savedRaw = localStorage.getItem(STORAGE_KEY);
  const saved = savedRaw ? JSON.parse(savedRaw) : null;

  const [input, setInput] = useState(saved?.mint ?? '');
  const [mcapTarget, setMcapTarget] = useState(saved?.mcapTarget ?? '$30M');
  const [supplyControl, setSupplyControl] = useState(saved?.supplyControl ?? '98.4%');
  const [notes, setNotes] = useState(saved?.notes ?? '');
  const [token, setToken] = useState<TokenData | null>(saved?.token ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleLookup() {
    const mint = extractMint(input);
    if (!mint) return;
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const res = await fetch(`https://price.jup.ag/v6/price?ids=${mint}`);
      const priceData = await res.json() as { data: Record<string, { price: number; id: string }> };
      const entry = priceData?.data?.[mint];

      const metaRes = await fetch(`https://tokens.jup.ag/token/${mint}`);
      const meta = await metaRes.json() as { symbol?: string; name?: string; extensions?: { coingeckoId?: string }; daily_volume?: number };

      const ticker = meta?.symbol ?? 'UNKNOWN';
      const name = meta?.name ?? ticker;
      const price = entry?.price ?? 0;

      let mcapStr = '—';
      if (meta?.extensions?.coingeckoId) {
        try {
          const cgRes = await fetch(`https://api.coingecko.com/api/v3/coins/${meta.extensions.coingeckoId}?localization=false&tickers=false&community_data=false&developer_data=false`);
          const cgData = await cgRes.json() as { market_data?: { market_cap?: { usd?: number }; price_change_percentage_24h?: number } };
          const mcapUsd = cgData?.market_data?.market_cap?.usd;
          if (mcapUsd) mcapStr = formatMcap(mcapUsd);
        } catch { /* no mcap */ }
      }

      const tokenData: TokenData = {
        mint,
        name,
        ticker,
        mcap: mcapStr,
        price: price > 0 ? `$${price.toPrecision(4)}` : '—',
        change24h: '—',
      };
      setToken(tokenData);
    } catch {
      setError('Could not fetch token data. Check the address or URL.');
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!token) return;
    const config = { mint: token.mint, token, mcapTarget, supplyControl, notes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setStats({
      ...stats,
      activeLaunch: `$${token.ticker}`,
      mcap: token.mcap !== '—' ? token.mcap : stats.mcap,
      supplyControl: supplyControl || stats.supplyControl,
    });
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setInput('');
    setToken(null);
    setMcapTarget('$30M');
    setSupplyControl('98.4%');
    setNotes('');
    setError(null);
  }

  return (
    <div className="space-y-4">
      {/* Token lookup */}
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2b2e]">
          <h2 className="text-white text-sm font-medium">switch launch token</h2>
          <p className="text-[#4b5563] text-xs mt-0.5">paste a Jupiter link or Solana mint address — we fetch everything</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setToken(null); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="https://jup.ag/tokens/... or mint address"
              className="flex-1 bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-2.5 text-sm text-[#d1d5db] placeholder-[#374151] outline-none focus:border-[#4b5563] font-mono"
            />
            <button
              onClick={handleLookup}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-lg bg-[#1f2023] border border-[#2a2b2e] text-[#d1d5db] text-sm hover:border-[#4b4c4f] disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              {loading ? 'fetching...' : 'look up'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          {token && (
            <div className="bg-[#111213] border border-[#2a2b2e] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">${token.ticker}</span>
                  <span className="text-[#6b7280] text-sm ml-2">{token.name}</span>
                </div>
                <span className="text-[#4ade80] text-xs px-2 py-0.5 rounded-full border border-[#166534] bg-[#052e16]">found</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#4b5563] uppercase tracking-wider">mint</span>
                  <p className="text-[#6b7280] font-mono mt-0.5 truncate">{token.mint}</p>
                </div>
                <div>
                  <span className="text-[#4b5563] uppercase tracking-wider">price</span>
                  <p className="text-[#d1d5db] mt-0.5">{token.price}</p>
                </div>
                <div>
                  <span className="text-[#4b5563] uppercase tracking-wider">mcap</span>
                  <p className="text-[#4ade80] mt-0.5">{token.mcap}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1f2023]">
                <div>
                  <label className="text-[#4b5563] text-xs uppercase tracking-wider">mcap target</label>
                  <input
                    type="text"
                    value={mcapTarget}
                    onChange={(e) => setMcapTarget(e.target.value)}
                    placeholder="$30M"
                    className="mt-1 w-full bg-[#1a1b1e] border border-[#2a2b2e] rounded px-2 py-1.5 text-sm text-[#d1d5db] outline-none focus:border-[#4b5563]"
                  />
                </div>
                <div>
                  <label className="text-[#4b5563] text-xs uppercase tracking-wider">supply control %</label>
                  <input
                    type="text"
                    value={supplyControl}
                    onChange={(e) => setSupplyControl(e.target.value)}
                    placeholder="98.4%"
                    className="mt-1 w-full bg-[#1a1b1e] border border-[#2a2b2e] rounded px-2 py-1.5 text-sm text-[#d1d5db] outline-none focus:border-[#4b5563]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[#4b5563] text-xs uppercase tracking-wider">notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes..."
                    rows={2}
                    className="mt-1 w-full bg-[#1a1b1e] border border-[#2a2b2e] rounded px-2 py-1.5 text-sm text-[#d1d5db] placeholder-[#374151] outline-none focus:border-[#4b5563] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg border border-[#2a2b2e] text-[#6b7280] text-xs hover:border-[#4b4c4f] transition-colors"
                >
                  reset
                </button>
                <button
                  onClick={handleApply}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    applied
                      ? 'bg-[#052e16] border border-[#166534] text-[#4ade80]'
                      : 'bg-[#4ade80] hover:bg-[#22c55e] text-black'
                  }`}
                >
                  {applied ? '✓ applied' : 'apply to dashboard'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current active */}
      {saved?.token && !token && (
        <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs uppercase tracking-wider">current active token</span>
            <p className="text-white font-semibold mt-0.5">${saved.token.ticker} <span className="text-[#6b7280] font-normal text-sm">— {saved.token.name}</span></p>
            <p className="text-[#4b5563] font-mono text-xs mt-0.5">{saved.token.mint}</p>
          </div>
          <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-400 border border-red-900 px-2 py-1 rounded">clear</button>
        </div>
      )}
    </div>
  );
}
