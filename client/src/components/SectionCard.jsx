export default function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`bg-white rounded-xl2 shadow-card p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}