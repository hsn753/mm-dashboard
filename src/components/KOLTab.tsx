import { useState } from 'react';
import { useKOLStore } from '../store';
import StatCard from './StatCard';
import KOLModal from './KOLModal';
import CampaignModal from './CampaignModal';
import { mockScriptQueue, mockAuditLog, mockPayments } from '../mockData';
import type { KOL, Campaign } from '../types';

const STATUS_STYLES: Record<string, string> = {
  paid: 'text-[#4ade80] border-[#166534] bg-[#052e16]',
  pending: 'text-yellow-400 border-yellow-800 bg-yellow-900/20',
  queued_pm: 'text-[#60a5fa] border-blue-900 bg-blue-900/20',
  queued_am: 'text-[#60a5fa] border-blue-900 bg-blue-900/20',
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'paid',
  pending: 'pending',
  queued_pm: 'queued pm',
  queued_am: 'queued am',
};

type SubView = 'roster' | 'payments' | 'audit';

export default function KOLTab() {
  const { kols, campaigns, activeCampaignId, addKOL, updateKOL, deleteKOL, setCampaigns, setActiveCampaign } = useKOLStore();
  const [showKOLModal, setShowKOLModal] = useState(false);
  const [editingKOL, setEditingKOL] = useState<KOL | undefined>();
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [subView, setSubView] = useState<SubView>('roster');
  const [batchLoading, setBatchLoading] = useState(false);

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId);
  const totalPaid = mockPayments.reduce((s, p) => s + p.amount, 0);

  function handleSaveKOL(data: Omit<KOL, 'id'>) {
    if (editingKOL) {
      updateKOL(editingKOL.id, data);
    } else {
      addKOL({ ...data, id: crypto.randomUUID() });
    }
    setShowKOLModal(false);
    setEditingKOL(undefined);
  }

  function handleSaveCampaign(data: Omit<Campaign, 'id' | 'status'>) {
    const newCampaign: Campaign = { ...data, id: crypto.randomUUID(), status: 'active' };
    setCampaigns([...campaigns, newCampaign]);
    setActiveCampaign(newCampaign.id);
    setShowCampaignModal(false);
  }

  async function handleBatchPay() {
    setBatchLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBatchLoading(false);
    alert('Batch payment endpoint not yet connected. Wire VITE_API_URL to activate.');
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="active campaign" value={activeCampaign?.name ?? '—'} />
        <StatCard label="kols" value={kols.length} />
        <StatCard label="paid today" value={`$${totalPaid.toLocaleString()}`} valueClass="text-[#4ade80]" />
        <StatCard label="scripts sent" value={mockScriptQueue.length * 2} />
      </div>

      {/* Sub Nav */}
      <div className="flex gap-4 border-b border-[#2a2b2e]">
        {(['roster', 'payments', 'audit'] as SubView[]).map((v) => (
          <button
            key={v}
            onClick={() => setSubView(v)}
            className={`pb-2 text-sm transition-colors ${subView === v ? 'text-white border-b-2 border-[#4ade80]' : 'text-[#6b7280] hover:text-[#9ca3af]'}`}
          >
            {v}
          </button>
        ))}
      </div>

      {subView === 'roster' && (
        <>
          {/* KOL Roster */}
          <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2a2b2e]">
              <span className="text-sm text-white font-medium">kol roster</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
                    <th className="text-left px-4 py-2 font-normal">handle</th>
                    <th className="text-left px-4 py-2 font-normal">wallet</th>
                    <th className="text-left px-4 py-2 font-normal">rate</th>
                    <th className="text-left px-4 py-2 font-normal">script</th>
                    <th className="text-left px-4 py-2 font-normal">status</th>
                    <th className="text-right px-4 py-2 font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  {kols.map((kol) => (
                    <tr key={kol.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                      <td className="px-4 py-3 text-[#d1d5db]">{kol.handle}</td>
                      <td className="px-4 py-3 text-[#6b7280] font-mono">{kol.wallet}</td>
                      <td className="px-4 py-3 text-[#9ca3af]">${kol.rate.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#9ca3af]">{kol.scriptSchedule}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[kol.status]}`}>
                          {STATUS_LABELS[kol.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setEditingKOL(kol); setShowKOLModal(true); }}
                          className="text-xs text-[#6b7280] hover:text-[#9ca3af] mr-3"
                        >edit</button>
                        <button
                          onClick={() => deleteKOL(kol.id)}
                          className="text-xs text-red-700 hover:text-red-500"
                        >del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Script Queue */}
          <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2a2b2e]">
              <span className="text-sm text-white font-medium">script queue — 6:00 pm est</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
                  <th className="text-left px-4 py-2 font-normal">kol</th>
                  <th className="text-left px-4 py-2 font-normal">angle</th>
                  <th className="text-right px-4 py-2 font-normal">send</th>
                </tr>
              </thead>
              <tbody>
                {mockScriptQueue.map((item, i) => (
                  <tr key={i} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                    <td className="px-4 py-3 text-[#d1d5db]">{item.kolHandle}</td>
                    <td className="px-4 py-3 text-[#9ca3af]">{item.angle}</td>
                    <td className="px-4 py-3 text-right text-[#6b7280]">{item.sendMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {subView === 'payments' && (
        <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2b2e]">
            <span className="text-sm text-white font-medium">payment history</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
                <th className="text-left px-4 py-2 font-normal">kol</th>
                <th className="text-left px-4 py-2 font-normal">wallet</th>
                <th className="text-left px-4 py-2 font-normal">amount</th>
                <th className="text-left px-4 py-2 font-normal">tx</th>
                <th className="text-left px-4 py-2 font-normal">time</th>
                <th className="text-right px-4 py-2 font-normal">status</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((p) => (
                <tr key={p.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                  <td className="px-4 py-2.5 text-[#d1d5db]">{p.kol}</td>
                  <td className="px-4 py-2.5 text-[#6b7280] font-mono">{p.wallet}</td>
                  <td className="px-4 py-2.5 text-[#4ade80]">${p.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <a
                      href={`https://solscan.io/tx/${p.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#60a5fa] font-mono hover:underline"
                    >
                      {p.txHash}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-[#6b7280]">{p.timestamp}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subView === 'audit' && (
        <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2b2e]">
            <span className="text-sm text-white font-medium">audit log</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
                <th className="text-left px-4 py-2 font-normal">time</th>
                <th className="text-left px-4 py-2 font-normal">action</th>
                <th className="text-left px-4 py-2 font-normal">kol</th>
                <th className="text-left px-4 py-2 font-normal">detail</th>
                <th className="text-left px-4 py-2 font-normal">tx</th>
              </tr>
            </thead>
            <tbody>
              {mockAuditLog.map((log) => (
                <tr key={log.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                  <td className="px-4 py-2.5 text-[#6b7280]">{log.timestamp}</td>
                  <td className="px-4 py-2.5 text-[#9ca3af]">{log.action}</td>
                  <td className="px-4 py-2.5 text-[#d1d5db]">{log.kol}</td>
                  <td className="px-4 py-2.5 text-[#6b7280]">{log.detail}</td>
                  <td className="px-4 py-2.5">
                    {log.txHash && (
                      <a href={`https://solscan.io/tx/${log.txHash}`} target="_blank" rel="noreferrer" className="text-[#60a5fa] font-mono hover:underline">
                        {log.txHash}
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => { setEditingKOL(undefined); setShowKOLModal(true); }}
          className="px-4 py-2 rounded-lg border border-[#2a2b2e] text-[#d1d5db] text-sm hover:border-[#4b4c4f] hover:text-white transition-colors"
        >
          new kol
        </button>
        <button
          onClick={() => setShowCampaignModal(true)}
          className="px-4 py-2 rounded-lg border border-[#2a2b2e] text-[#d1d5db] text-sm hover:border-[#4b4c4f] hover:text-white transition-colors"
        >
          new campaign
        </button>
        <button
          onClick={handleBatchPay}
          disabled={batchLoading}
          className="px-4 py-2 rounded-lg bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {batchLoading ? 'sending...' : 'batch pay all'}
        </button>
      </div>

      {showKOLModal && (
        <KOLModal
          kol={editingKOL}
          onSave={handleSaveKOL}
          onClose={() => { setShowKOLModal(false); setEditingKOL(undefined); }}
        />
      )}
      {showCampaignModal && (
        <CampaignModal onSave={handleSaveCampaign} onClose={() => setShowCampaignModal(false)} />
      )}
    </div>
  );
}
