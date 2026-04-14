import { useState } from 'react';
import MMTab from './components/MMTab';
import KOLTab from './components/KOLTab';

type Tab = 'mm' | 'kol';

export default function App() {
  const [tab, setTab] = useState<Tab>('mm');

  return (
    <div className="min-h-screen bg-[#111213] text-[#e5e7eb]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 border-b border-[#2a2b2e] w-full pb-0">
            <button
              onClick={() => setTab('mm')}
              className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
                tab === 'mm'
                  ? 'text-white border-white'
                  : 'text-[#6b7280] border-transparent hover:text-[#9ca3af]'
              }`}
            >
              mm bot
            </button>
            <button
              onClick={() => setTab('kol')}
              className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
                tab === 'kol'
                  ? 'text-white border-white'
                  : 'text-[#6b7280] border-transparent hover:text-[#9ca3af]'
              }`}
            >
              kol tool
            </button>
            <div className="ml-auto flex items-center pb-2">
              <span className="text-[#4b5563] text-xs">···</span>
            </div>
          </div>
        </div>

        {tab === 'mm' ? <MMTab /> : <KOLTab />}
      </div>
    </div>
  );
}
