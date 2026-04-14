interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function KillSwitchModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-white font-semibold text-base mb-2">Confirm Kill Switch</h2>
        <p className="text-[#6b7280] text-sm mb-6">
          This will immediately halt all bot activity. All active mirrors and fee redeployments will stop. This cannot be undone remotely.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-[#2a2b2e] text-[#9ca3af] text-sm hover:border-[#4b4c4f] transition-colors"
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            kill bot
          </button>
        </div>
      </div>
    </div>
  );
}
