import { useState } from 'react';
import type { Campaign } from '../types';

interface Props {
  onSave: (c: Omit<Campaign, 'id' | 'status'>) => void;
  onClose: () => void;
}

export default function CampaignModal({ onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    ticker: '',
    cashtag: '',
    start_date: '',
    end_date: '',
    script_template: 'Hey {{handle}}, here\'s your script for {{cashtag}} today:\n\n{{angle}}\n\nPost between 8-10am EST. Tag {{cashtag}} and include the chart link.',
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-white font-semibold text-base mb-4">new campaign</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'campaign name', field: 'name', placeholder: 'e.g. aspen launch' },
              { label: 'ticker', field: 'ticker', placeholder: 'ASPEN' },
              { label: 'cashtag', field: 'cashtag', placeholder: '$ASPEN' },
              { label: 'start date', field: 'start_date', placeholder: 'YYYY-MM-DD' },
              { label: 'end date', field: 'end_date', placeholder: 'YYYY-MM-DD' },
            ].map(({ label, field, placeholder }) => (
              <div key={field} className={field === 'name' ? 'col-span-2' : ''}>
                <label className="block text-xs text-[#6b7280] mb-1">{label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[field]}
                  onChange={(e) => set(field, e.target.value)}
                  placeholder={placeholder}
                  required
                  className="w-full bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-2 text-sm text-[#d1d5db] placeholder-[#4b5563] outline-none focus:border-[#4b5563]"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">
              script template <span className="text-[#4b5563]">(vars: {'{{handle}}'}, {'{{cashtag}}'}, {'{{angle}}'})</span>
            </label>
            <textarea
              value={form.script_template}
              onChange={(e) => set('script_template', e.target.value)}
              rows={4}
              className="w-full bg-[#111213] border border-[#2a2b2e] rounded-lg px-3 py-2 text-sm text-[#d1d5db] placeholder-[#4b5563] outline-none focus:border-[#4b5563] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#2a2b2e] text-[#9ca3af] text-sm hover:border-[#4b4c4f] transition-colors">
              cancel
            </button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-[#4ade80] hover:bg-[#22c55e] text-black text-sm font-medium transition-colors">
              create campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
