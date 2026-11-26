const tones = {
  violet: 'bg-violet-100 text-violet-700',
  mint: 'bg-mint-100 text-mint-500',
  peach: 'bg-peach-100 text-peach-500',
  slate: 'bg-slate-100 text-slate-600',
};

export default function Badge({ tone = 'slate', children }) {
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}