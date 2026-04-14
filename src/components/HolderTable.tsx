import { useState, useMemo } from 'react';
import type { HolderRow } from '../types';

interface Props {
  holders: HolderRow[];
}

type SortKey = keyof HolderRow;

function exportCSV(holders: HolderRow[]) {
  const headers = 'wallet,costBasis,pnl,kolSource,entryTime';
  const rows = holders.map((h) => `${h.wallet},${h.costBasis},${h.pnl},${h.kolSource},${h.entryTime}`);
  const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'holders.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function HolderTable({ holders }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('costBasis');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return holders
      .filter((h) => h.wallet.toLowerCase().includes(q) || h.kolSource.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [holders, search, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span className="ml-1 text-[#4ade80]">{sortDir === 'asc' ? '↑' : '↓'}</span> : <span className="ml-1 text-[#374151]">↕</span>;

  return (
    <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2b2e] flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-white font-medium">holder intelligence</span>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search wallet or kol..."
            className="bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-1.5 text-xs text-[#d1d5db] placeholder-[#4b5563] outline-none focus:border-[#4b5563] w-48"
          />
          <button
            onClick={() => exportCSV(filtered)}
            className="px-3 py-1.5 rounded-lg border border-[#2a2b2e] text-[#9ca3af] text-xs hover:border-[#4b4c4f] hover:text-white transition-colors"
          >
            export csv
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
              {(['wallet', 'costBasis', 'pnl', 'kolSource', 'entryTime'] as SortKey[]).map((k) => (
                <th
                  key={k}
                  onClick={() => handleSort(k)}
                  className="text-left px-4 py-2 font-normal cursor-pointer hover:text-[#9ca3af] select-none"
                >
                  {k === 'costBasis' ? 'cost basis' : k === 'kolSource' ? 'kol source' : k === 'entryTime' ? 'entry' : k}
                  <SortIcon k={k} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.wallet} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                <td className="px-4 py-2.5 text-[#d1d5db] font-mono">{h.wallet}</td>
                <td className="px-4 py-2.5 text-[#9ca3af]">${h.costBasis.toLocaleString()}</td>
                <td className={`px-4 py-2.5 font-medium ${h.pnl >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                  {h.pnl >= 0 ? '+' : ''}${h.pnl.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-[#60a5fa]">{h.kolSource}</td>
                <td className="px-4 py-2.5 text-[#6b7280]">{h.entryTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
