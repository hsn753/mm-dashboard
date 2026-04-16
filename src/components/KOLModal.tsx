import { useState } from 'react';
import type { KOL } from '../types';

interface Props {
  kol?: KOL;
  onSave: (k: Omit<KOL, 'id'>) => void;
  onClose: () => void;
}

export default function KOLModal({ kol, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    handle: kol?.handle ?? '',
    wallet: kol?.wallet ?? '',
    rate: kol?.rate ?? 0,
    campaign: kol?.campaign ?? '',
    script_schedule: (kol?.script_schedule ?? kol?.scriptSchedule ?? 'am + pm') as KOL['script_schedule'],
    status: kol?.status ?? 'pending' as KOL['status'],
    telegram_username: kol?.telegram_username ?? kol?.telegramUsername ?? '',
  });

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl p-6 w-full max-w-md">
        <h2 className="text-white font-semibold text-base mb-4">{kol ? 'edit kol' : 'add kol'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'handle', field: 'handle', type: 'text', placeholder: '@handle' },
            { label: 'wallet', field: 'wallet', type: 'text', placeholder: 'Solana wallet address' },
            { label: 'rate (USDC)', field: 'rate', type: 'number', placeholder: '0' },
            { label: 'telegram username', field: 'telegram_username', type: 'text', placeholder: 'username (no @)' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs text-[#6b7280] mb-1">{label}</label>
              <input
                type={type}
                value={(form as Record<string, string | number>)[field]}
                onChange={(e) => set(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                required={field !== 'telegram_username'}
                className="w-full bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-2 text-sm text-[#d1d5db] placeholder-[#4b5563] outline-none focus:border-[#4b5563]"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">script schedule</label>
            <select
              value={form.script_schedule}
              onChange={(e) => set('script_schedule', e.target.value)}
              className="w-full bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-2 text-sm text-[#d1d5db] outline-none focus:border-[#4b5563]"
            >
              <option value="am + pm">am + pm</option>
              <option value="am only">am only</option>
              <option value="pm only">pm only</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#2a2b2e] text-[#9ca3af] text-sm hover:border-[#4b4c4f] transition-colors">
              cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-medium transition-colors">
              save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
