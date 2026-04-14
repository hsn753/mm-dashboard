import type { KOL } from '../types';

interface Props {
  kols: KOL[];
  onConfirm: () => void;
  onClose: () => void;
}

export default function PayConfirmModal({ kols, onConfirm, onClose }: Props) {
  const total = kols.reduce((s, k) => s + Number(k.rate), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-yellow-900/30 border border-yellow-800 flex items-center justify-center text-yellow-400 text-base">⚡</div>
          <div>
            <h2 className="text-white font-semibold text-base">confirm batch payment</h2>
            <p className="text-[#6b7280] text-xs mt-0.5">this will send real USDC on-chain</p>
          </div>
        </div>

        <div className="bg-[#111213] border border-[#2a2b2e] rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6b7280] text-xs border-b border-[#2a2b2e]">
                <th className="text-left px-3 py-2 font-normal">kol</th>
                <th className="text-left px-3 py-2 font-normal">wallet</th>
                <th className="text-right px-3 py-2 font-normal">amount</th>
              </tr>
            </thead>
            <tbody>
              {kols.map((k) => (
                <tr key={k.id} className="border-b border-[#1f2023] last:border-0">
                  <td className="px-3 py-2 text-[#d1d5db]">{k.handle}</td>
                  <td className="px-3 py-2 text-[#6b7280] font-mono text-xs">{k.wallet.slice(0, 8)}...{k.wallet.slice(-4)}</td>
                  <td className="px-3 py-2 text-right text-[#4ade80]">${Number(k.rate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mb-5 px-1">
          <span className="text-[#6b7280] text-sm">total payout</span>
          <span className="text-white font-semibold text-base">${total.toLocaleString()} USDC</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[#2a2b2e] text-[#9ca3af] text-sm hover:border-[#4b4c4f] transition-colors"
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-medium transition-colors"
          >
            confirm & send
          </button>
        </div>
      </div>
    </div>
  );
}
