export default function EmptyState({ title, hint }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}