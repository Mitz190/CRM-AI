const tones = {
  violet: 'bg-violet-100 text-violet-600',
  mint: 'bg-mint-100 text-mint-500',
  peach: 'bg-peach-100 text-peach-500',
  lavender: 'bg-lavender text-violet-700',
};

export default function KPICard({ label, value, icon: Icon, tone = 'violet', hint }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800 truncate">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}