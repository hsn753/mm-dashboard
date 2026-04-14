import { useState } from 'react';
import { useMMStore } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import StatCard from './StatCard';
import KillSwitchModal from './KillSwitchModal';
import HolderTable from './HolderTable';
import { mockHolders } from '../mockData';
import type { TxType } from '../types';

const TX_COLORS: Record<TxType, string> = {
  buy: 'text-[#4ade80]',
  sell: 'text-[#f87171]',
  mirror_buy: 'text-[#60a5fa]',
  mirror_sell: 'text-[#60a5fa]',
  fee_buy: 'text-[#a78bfa]',
  sell_absorb: 'text-[#fb923c]',
};

const TX_LABELS: Record<TxType, string> = {
  buy: 'buy',
  sell: 'sell',
  mirror_buy: 'mirror buy',
  mirror_sell: 'mirror sell',
  fee_buy: 'fee buy',
  sell_absorb: 'sell absorb',
};

export default function MMTab() {
  useWebSocket();
  const { stats, mirrorRules, transactions, isPaused, wsConnected, toggleRule, setPaused } = useMMStore();
  const [showKill, setShowKill] = useState(false);
  const [killed, setKilled] = useState(false);

  function handleKill() {
    setKilled(true);
    setShowKill(false);
  }

  return (
    <div className="space-y-5">
      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="active launch" value={stats.activeLaunch} />
        <StatCard label="mcap" value={stats.mcap} valueClass="text-[#4ade80]" />
        <StatCard label="treasury" value={stats.treasury} valueClass="text-[#4ade80]" />
        <StatCard label="supply control" value={stats.supplyControl} />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="buyers / sellers" value={`${stats.buyers.toLocaleString()} / ${stats.sellers}`} />
        <StatCard label="ratio" value={stats.ratio} valueClass="text-[#4ade80]" />
        <StatCard label="fees claimed 24h" value={stats.fees24h} />
        <StatCard
          label="bot status"
          value=""
          badge={
            killed
              ? { text: 'killed', color: 'text-red-400 border-red-800 bg-red-900/20' }
              : isPaused
              ? { text: 'paused', color: 'text-yellow-400 border-yellow-800 bg-yellow-900/20' }
              : { text: 'running', color: 'text-[#4ade80] border-[#166534] bg-[#052e16]' }
          }
        />
      </div>

      {/* Mirror Config */}
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2b2e]">
          <span className="text-sm text-white font-medium">mirror config</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
              <th className="text-left px-4 py-2 font-normal">rule</th>
              <th className="text-left px-4 py-2 font-normal">threshold</th>
              <th className="text-left px-4 py-2 font-normal">action</th>
              <th className="text-right px-4 py-2 font-normal">status</th>
            </tr>
          </thead>
          <tbody>
            {mirrorRules.map((rule) => (
              <tr key={rule.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                <td className="px-4 py-3 text-[#d1d5db]">{rule.rule}</td>
                <td className="px-4 py-3 text-[#9ca3af]">{rule.threshold}</td>
                <td className="px-4 py-3 text-[#9ca3af]">{rule.action}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      rule.status
                        ? 'text-[#4ade80] border-[#166534] bg-[#052e16] hover:bg-[#064e1a]'
                        : 'text-[#6b7280] border-[#374151] bg-[#1f2937] hover:bg-[#374151]'
                    }`}
                  >
                    {rule.status ? 'on' : 'off'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Actions */}
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2b2e] flex items-center justify-between">
          <span className="text-sm text-white font-medium">recent actions</span>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-[#4ade80]' : 'bg-[#6b7280]'}`} />
            <span className="text-[#6b7280] text-xs">{wsConnected ? 'live' : 'mock'}</span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
              <th className="text-left px-4 py-2 font-normal">time</th>
              <th className="text-left px-4 py-2 font-normal">type</th>
              <th className="text-left px-4 py-2 font-normal">size</th>
              <th className="text-left px-4 py-2 font-normal">wallet</th>
              <th className="text-left px-4 py-2 font-normal">tx</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 8).map((tx) => (
              <tr key={tx.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                <td className="px-4 py-2.5 text-[#6b7280]">{tx.time}</td>
                <td className={`px-4 py-2.5 ${TX_COLORS[tx.type]}`}>{TX_LABELS[tx.type]}</td>
                <td className="px-4 py-2.5 text-[#d1d5db]">${tx.size.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-[#9ca3af]">{tx.wallet}</td>
                <td className="px-4 py-2.5 text-[#6b7280] font-mono">{tx.tx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Holder Table */}
      <HolderTable holders={mockHolders} />

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => setPaused(!isPaused)}
          disabled={killed}
          className="px-4 py-2 rounded-lg border border-[#2a2b2e] text-[#d1d5db] text-sm hover:border-[#4b4c4f] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPaused ? 'resume bot' : 'pause bot'}
        </button>
        <button
          onClick={() => setShowKill(true)}
          disabled={killed}
          className="px-4 py-2 rounded-lg border border-red-900 text-red-400 text-sm hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          kill switch
        </button>
      </div>

      {showKill && <KillSwitchModal onConfirm={handleKill} onCancel={() => setShowKill(false)} />}
    </div>
  );
}
