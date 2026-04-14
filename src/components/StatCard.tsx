interface StatCardProps {
  label: string;
  value: string | number;
  valueClass?: string;
  badge?: { text: string; color: string };
}

export default function StatCard({ label, value, valueClass = '', badge }: StatCardProps) {
  return (
    <div className="bg-[#1a1b1e] border border-[#2a2b2e] rounded-xl p-4 flex flex-col gap-1 min-w-0">
      <span className="text-[#6b7280] text-xs uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2 mt-1">
        {badge ? (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color}`}>
            {badge.text}
          </span>
        ) : (
          <span className={`text-xl font-semibold tracking-tight ${valueClass}`}>{value}</span>
        )}
      </div>
    </div>
  );
}
