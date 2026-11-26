import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact, formatCurrency } from '../../utils/format';

const tick = { fontSize: 12, fill: '#94a3b8' };

export default function RevenueTrendChart({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEE9F7" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} />
          <YAxis tickFormatter={formatCompact} tickLine={false} axisLine={false} width={48} tick={tick} />
          <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
          <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}