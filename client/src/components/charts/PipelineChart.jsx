import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact, formatCurrency, humanize } from '../../utils/format';

const tick = { fontSize: 12, fill: '#94a3b8' };

export default function PipelineChart({ data }) {
  const rows = data.map((p) => ({ ...p, label: humanize(p.stage) }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEE9F7" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} interval={0} />
          <YAxis tickFormatter={formatCompact} tickLine={false} axisLine={false} width={48} tick={tick} />
          <Tooltip
            cursor={{ fill: '#F5F3FF' }}
            formatter={(v, name, item) => [`${formatCurrency(v)} · ${item.payload.count} deal(s)`, 'Value']}
          />
          <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}