import { useState, useEffect, useCallback } from 'react';
import StatCard from './StatCard';
import KOLModal from './KOLModal';
import CampaignModal from './CampaignModal';
import PayConfirmModal from './PayConfirmModal';
import { api } from '../api';
import type { KOL, Campaign, AuditLog, PaymentRecord, ScriptLog } from '../types';

const STATUS_STYLES: Record<string, string> = {
  paid: 'text-[#4ade80] border-[#166534] bg-[#052e16]',
  pending: 'text-yellow-400 border-yellow-800 bg-yellow-900/20',
  queued_pm: 'text-[#60a5fa] border-blue-900 bg-blue-900/20',
  queued_am: 'text-[#60a5fa] border-blue-900 bg-blue-900/20',
  confirmed: 'text-[#4ade80] border-[#166534] bg-[#052e16]',
  failed: 'text-red-400 border-red-900 bg-red-900/20',
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'paid', pending: 'pending', queued_pm: 'queued pm',
  queued_am: 'queued am', confirmed: 'confirmed', failed: 'failed',
};

type SubView = 'roster' | 'payments' | 'audit';
type AssignModal = { campaignId: string; campaignName: string } | null;

function EmptyRow({ cols, msg }: { cols: number; msg: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-[#4b5563] text-sm">{msg}</td>
    </tr>
  );
}

function Spinner() {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-8 text-center text-[#4b5563] text-sm">loading...</td>
    </tr>
  );
}

export default function KOLTab() {
  const [kols, setKols] = useState<KOL[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [scriptLog, setScriptLog] = useState<ScriptLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showKOLModal, setShowKOLModal] = useState(false);
  const [editingKOL, setEditingKOL] = useState<KOL | undefined>();
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [subView, setSubView] = useState<SubView>('roster');
  const [batchLoading, setBatchLoading] = useState(false);
  const [distributeLoading, setDistributeLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<AssignModal>(null);
  const [assignSelected, setAssignSelected] = useState<string[]>([]);

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? campaigns.find((c) => c.status === 'active') ?? campaigns[0];
  const totalPaid = payments.filter((p) => p.status === 'confirmed').reduce((s, p) => s + Number(p.amount), 0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, c, p, a, sl] = await Promise.all([
        api.kols.list(),
        api.campaigns.list(),
        api.payments.history(),
        api.audit.list(),
        api.scripts.log(),
      ]);
      setKols(k);
      setCampaigns(c);
      setPayments(p);
      setAuditLog(a);
      setScriptLog(sl);
      if (!selectedCampaignId && c.length > 0) {
        const active = c.find((x) => x.status === 'active') ?? c[0];
        setSelectedCampaignId(active.id);
      }
    } catch (e) {
      setError('Could not reach backend. Is VITE_API_URL set correctly?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleSaveKOL(data: Omit<KOL, 'id'>) {
    try {
      if (editingKOL) {
        const payload = {
          handle: data.handle,
          wallet: data.wallet,
          rate: data.rate,
          campaign_id: editingKOL.campaign_id || activeCampaign?.id || null,
          script_schedule: data.script_schedule,
          telegram_username: data.telegram_username || null,
          status: editingKOL.status,
        };
        await api.kols.update(editingKOL.id, payload);
        showToast(`${data.handle} updated`);
      } else {
        const payload = {
          handle: data.handle,
          wallet: data.wallet,
          rate: data.rate,
          campaign_id: activeCampaign?.id || null,
          script_schedule: data.script_schedule || 'am + pm',
          telegram_username: data.telegram_username || null,
        };
        await api.kols.create(payload);
        showToast(`${data.handle} added to roster`);
      }
      setShowKOLModal(false);
      setEditingKOL(undefined);
      loadAll();
    } catch {
      showToast('Error saving KOL — check console');
    }
  }

  async function handleDeleteKOL(id: string, handle: string) {
    if (!confirm(`Permanently delete ${handle} from ALL campaigns and the roster? This cannot be undone.`)) return;
    try {
      await api.kols.remove(id);
      showToast(`${handle} permanently deleted`);
      loadAll();
    } catch {
      showToast('Error deleting KOL');
    }
  }

  async function handleUnassignKOL(kolId: string, handle: string) {
    if (!activeCampaign) return;
    if (!confirm(`Remove ${handle} from campaign "${activeCampaign.name}"? They stay in the roster.`)) return;
    try {
      await api.campaigns.unassign(activeCampaign.id, kolId);
      showToast(`${handle} removed from ${activeCampaign.name}`);
      loadAll();
    } catch {
      showToast('Error unassigning KOL');
    }
  }

  async function handleDeleteCampaign(id: string, name: string) {
    if (!confirm(`Delete campaign "${name}"? KOLs will be unassigned but not deleted.`)) return;
    try {
      await api.campaigns.remove(id);
      showToast(`Campaign "${name}" deleted`);
      if (selectedCampaignId === id) setSelectedCampaignId(null);
      loadAll();
    } catch {
      showToast('Error deleting campaign');
    }
  }

  async function handleAssignKOLs() {
    if (!assignModal || assignSelected.length === 0) return;
    try {
      const result = await api.campaigns.assign(assignModal.campaignId, assignSelected) as { assigned: number; telegram: Array<{ kol: string; ok: boolean }> };
      const tgOk = result.telegram?.filter((t) => t.ok).length ?? 0;
      showToast(`${result.assigned} KOL(s) assigned${tgOk > 0 ? `, ${tgOk} Telegram DM(s) sent` : ''}`);
      setAssignModal(null);
      setAssignSelected([]);
      loadAll();
    } catch {
      showToast('Error assigning KOLs');
    }
  }

  async function handleSaveCampaign(data: Omit<Campaign, 'id' | 'status'>) {
    try {
      await api.campaigns.create(data);
      showToast(`Campaign "${data.name}" created`);
      setShowCampaignModal(false);
      loadAll();
    } catch {
      showToast('Error creating campaign');
    }
  }

  async function handleBatchPay() {
    const unpaid = kols.filter((k) => k.status !== 'paid' && k.wallet);
    if (!unpaid.length) { showToast('No unpaid KOLs with wallets'); return; }
    setShowPayConfirm(true);
  }

  async function executeBatchPay() {
    setShowPayConfirm(false);
    const unpaid = kols.filter((k) => k.status !== 'paid' && k.wallet);
    setBatchLoading(true);
    try {
      const result = await api.payments.batch(
        unpaid.map((k) => ({ kol_id: k.id, wallet: k.wallet, amount: Number(k.rate) }))
      );
      const ok = result.results.filter((r: { error?: string }) => !r.error).length;
      const fail = result.results.filter((r: { error?: string }) => r.error).length;
      showToast(`Batch done — ${ok} confirmed, ${fail} failed`);
      loadAll();
    } catch {
      showToast('Batch payment failed — check PAYER_SECRET_KEY and Solana balance');
    } finally {
      setBatchLoading(false);
    }
  }

  async function handleDistribute(slot: 'am' | 'pm') {
    setDistributeLoading(true);
    try {
      await api.scripts.distribute(slot);
      showToast(`${slot.toUpperCase()} scripts sent`);
      loadAll();
    } catch {
      showToast('Script distribution failed');
    } finally {
      setDistributeLoading(false);
    }
  }

  if (error) {
    return (
      <div className="bg-[#1a1b1e] border border-red-900 rounded-xl p-6 text-red-400 text-sm">
        ⚠ {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1a1b1e] border border-[#2a2b2e] text-[#d1d5db] text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Campaign Selector */}
      {campaigns.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#6b7280]">campaign:</span>
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-center gap-1">
              <button
                onClick={() => setSelectedCampaignId(c.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  c.id === activeCampaign?.id
                    ? 'bg-[#052e16] border-[#166534] text-[#4ade80]'
                    : 'border-[#2a2b2e] text-[#6b7280] hover:border-[#4b4c4f] hover:text-[#9ca3af]'
                }`}
              >
                {c.name}
                {c.status === 'active' && <span className="ml-1 text-[#4ade80]">•</span>}
              </button>
              <button
                onClick={() => handleDeleteCampaign(c.id, c.name)}
                title="delete campaign"
                className="text-[#4b5563] hover:text-red-500 text-xs leading-none transition-colors"
              >✕</button>
              <button
                onClick={() => { setAssignModal({ campaignId: c.id, campaignName: c.name }); setAssignSelected([]); }}
                className="px-2 py-0.5 rounded text-xs border border-[#2a2b2e] text-[#6b7280] hover:border-[#4b4c4f] hover:text-[#9ca3af] transition-colors"
              >assign</button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="active campaign" value={loading ? '...' : (activeCampaign?.name ?? '—')} />
        <StatCard label="kols" value={loading ? '...' : kols.length} />
        <StatCard label="paid today" value={loading ? '...' : `$${totalPaid.toLocaleString()}`} valueClass="text-[#4ade80]" />
        <StatCard label="scripts sent" value={loading ? '...' : scriptLog.length} />
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
            <div className="px-4 py-3 border-b border-[#2a2b2e] flex items-center justify-between">
              <span className="text-sm text-white font-medium">kol roster</span>
              {activeCampaign && (
                <span className="text-xs text-[#6b7280]">campaign: {activeCampaign.name}</span>
              )}
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
                  {loading ? <Spinner /> : kols.length === 0
                    ? <EmptyRow cols={6} msg="No KOLs yet — click 'new kol' to add one" />
                    : kols.map((kol) => (
                      <tr key={kol.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023] transition-colors">
                        <td className="px-4 py-3 text-[#d1d5db]">{kol.handle}</td>
                        <td className="px-4 py-3 text-[#6b7280] font-mono text-xs">{kol.wallet}</td>
                        <td className="px-4 py-3 text-[#9ca3af]">${Number(kol.rate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#9ca3af]">{kol.script_schedule ?? kol.scriptSchedule}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[kol.status] ?? ''}`}>
                            {STATUS_LABELS[kol.status] ?? kol.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setEditingKOL(kol); setShowKOLModal(true); }} className="text-xs text-[#6b7280] hover:text-[#9ca3af] mr-3">edit</button>
                          {kol.campaign_id
                            ? <button onClick={() => handleUnassignKOL(kol.id, kol.handle)} className="text-xs text-yellow-700 hover:text-yellow-500 mr-3" title="remove from this campaign">unassign</button>
                            : null
                          }
                          <button onClick={() => handleDeleteKOL(kol.id, kol.handle)} className="text-xs text-red-900 hover:text-red-500" title="permanently delete from roster">del</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Script Log */}
          <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2a2b2e] flex items-center justify-between">
              <span className="text-sm text-white font-medium">script log</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDistribute('am')}
                  disabled={distributeLoading}
                  className="text-xs px-2 py-1 border border-[#2a2b2e] rounded text-[#9ca3af] hover:border-[#4b4c4f] disabled:opacity-40"
                >
                  send am
                </button>
                <button
                  onClick={() => handleDistribute('pm')}
                  disabled={distributeLoading}
                  className="text-xs px-2 py-1 border border-[#2a2b2e] rounded text-[#9ca3af] hover:border-[#4b4c4f] disabled:opacity-40"
                >
                  send pm
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
                  <th className="text-left px-4 py-2 font-normal">kol</th>
                  <th className="text-left px-4 py-2 font-normal">slot</th>
                  <th className="text-left px-4 py-2 font-normal">status</th>
                  <th className="text-right px-4 py-2 font-normal">sent at</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <Spinner /> : scriptLog.length === 0
                  ? <EmptyRow cols={4} msg="No scripts sent yet" />
                  : scriptLog.slice(0, 10).map((s, i) => (
                    <tr key={i} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023]">
                      <td className="px-4 py-2.5 text-[#d1d5db]">{s.kol_handle}</td>
                      <td className="px-4 py-2.5 text-[#9ca3af]">{s.slot}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs ${s.status === 'sent' ? 'text-[#4ade80]' : s.status === 'failed' ? 'text-red-400' : 'text-[#6b7280]'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#6b7280]">{new Date(s.sent_at).toLocaleString()}</td>
                    </tr>
                  ))
                }
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
                <th className="text-left px-4 py-2 font-normal">campaign</th>
                <th className="text-left px-4 py-2 font-normal">amount</th>
                <th className="text-left px-4 py-2 font-normal">wallet</th>
                <th className="text-left px-4 py-2 font-normal">tx</th>
                <th className="text-left px-4 py-2 font-normal">date / time</th>
                <th className="text-right px-4 py-2 font-normal">status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Spinner /> : payments.length === 0
                ? <EmptyRow cols={7} msg="No payments yet" />
                : payments.map((p) => (
                  <tr key={p.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023]">
                    <td className="px-4 py-2.5 text-[#d1d5db]">{p.kol_handle ?? p.kol ?? '—'}</td>
                    <td className="px-4 py-2.5 text-[#9ca3af] text-xs">{p.campaign_name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-[#4ade80] font-medium">${Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-[#6b7280] font-mono text-xs">{p.wallet ? p.wallet.slice(0,8)+'...' : '—'}</td>
                    <td className="px-4 py-2.5">
                      {(p.tx_hash ?? p.txHash) ? (
                        <a href={`https://solscan.io/tx/${p.tx_hash ?? p.txHash}`} target="_blank" rel="noreferrer" className="text-[#60a5fa] font-mono hover:underline text-xs">
                          {String(p.tx_hash ?? p.txHash).slice(0, 10)}...
                        </a>
                      ) : <span className="text-[#4b5563]">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-[#6b7280] text-xs">{new Date((p.created_at ?? p.timestamp) as string).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status] ?? ''}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              }
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
              {loading ? <Spinner /> : auditLog.length === 0
                ? <EmptyRow cols={5} msg="No audit entries yet" />
                : auditLog.map((log) => (
                  <tr key={log.id} className="border-b border-[#2a2b2e] last:border-0 hover:bg-[#1f2023]">
                    <td className="px-4 py-2.5 text-[#6b7280]">{new Date((log.created_at ?? log.timestamp) as string).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-[#9ca3af]">{log.action}</td>
                    <td className="px-4 py-2.5 text-[#d1d5db]">{log.kol_handle ?? log.kol}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{log.detail}</td>
                    <td className="px-4 py-2.5">
                      {(log.tx_hash ?? log.txHash) && (
                        <a href={`https://solscan.io/tx/${log.tx_hash ?? log.txHash}`} target="_blank" rel="noreferrer" className="text-[#60a5fa] font-mono hover:underline text-xs">
                          {String(log.tx_hash ?? log.txHash).slice(0, 12)}...
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4 flex-wrap">
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
          disabled={batchLoading || kols.filter((k) => k.status !== 'paid').length === 0}
          className="px-4 py-2 rounded-lg bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {batchLoading ? 'sending...' : `batch pay all${kols.filter((k) => k.status !== 'paid').length > 0 ? ` (${kols.filter((k) => k.status !== 'paid').length})` : ''}`}
        </button>
        <button
          onClick={loadAll}
          className="px-4 py-2 rounded-lg border border-[#2a2b2e] text-[#6b7280] text-sm hover:border-[#4b4c4f] hover:text-white transition-colors ml-auto"
        >
          ↻ refresh
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
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white font-semibold text-base mb-1">assign KOLs to campaign</h2>
            <p className="text-[#6b7280] text-xs mb-4">{assignModal.campaignName} — assigned KOLs will get a Telegram DM immediately</p>
            <div className="space-y-1 max-h-60 overflow-y-auto mb-4">
              {kols.map((k) => (
                <label key={k.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#111213] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignSelected.includes(k.id)}
                    onChange={(e) => setAssignSelected((s) => e.target.checked ? [...s, k.id] : s.filter((x) => x !== k.id))}
                    className="accent-[#4ade80]"
                  />
                  <span className="text-[#d1d5db] text-sm">{k.handle}</span>
                  <span className="text-[#4b5563] text-xs ml-auto">{k.campaign_id === assignModal.campaignId ? '✓ assigned' : ''}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setAssignModal(null); setAssignSelected([]); }} className="flex-1 py-2 rounded-lg border border-[#2a2b2e] text-[#9ca3af] text-sm">cancel</button>
              <button onClick={handleAssignKOLs} disabled={assignSelected.length === 0} className="flex-1 py-2 rounded-lg bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-medium disabled:opacity-40">assign {assignSelected.length > 0 ? `(${assignSelected.length})` : ''}</button>
            </div>
          </div>
        </div>
      )}

      {showPayConfirm && (
        <PayConfirmModal
          kols={kols.filter((k) => k.status !== 'paid' && k.wallet)}
          onConfirm={executeBatchPay}
          onClose={() => setShowPayConfirm(false)}
        />
      )}
    </div>
  );
}
