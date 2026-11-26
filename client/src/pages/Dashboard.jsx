import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Percent, RefreshCw, Sparkles, Target, Users, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dashboardApi } from '../services/dashboardService';
import { formatCompact, formatCurrency, formatDate, formatDateTime, humanize } from '../utils/format';
import PageHeader from '../components/PageHeader';
import PageLoader from '../components/PageLoader';
import Alert from '../components/Alert';
import Button from '../components/Button';
import KPICard from '../components/KPICard';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import RevenueTrendChart from '../components/charts/RevenueTrendChart';
import PipelineChart from '../components/charts/PipelineChart';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await dashboardApi.get());
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!user) return null;

  const header = (
    <PageHeader
      title={`Welcome, ${user.name.split(' ')[0]}`}
      subtitle={data?.scope === 'personal' ? 'Your personal sales overview' : 'Organization-wide sales overview'}
      action={
        <Button variant="secondary" onClick={load} loading={loading}>
          <RefreshCw size={16} /> Refresh
        </Button>
      }
    />
  );

  if (!data) {
    return (
      <>
        {header}
        {error ? <Alert type="error">{error}</Alert> : <PageLoader />}
      </>
    );
  }

  const { kpis, pipeline, revenueTrend, highPriorityLeads, upcomingActivities, teamPerformance } = data;
  const change = kpis.revenueChangePct;
  const revenueHint = change === null ? 'No revenue last month' : `${change >= 0 ? '+' : ''}${change}% vs last month`;
  const hasRevenue = revenueTrend.some((m) => m.revenue > 0);
  const hasPipeline = pipeline.some((p) => p.count > 0);
  const topWon = Math.max(1, ...teamPerformance.map((t) => t.wonValue));
  const now = Date.now();

  return (
    <div className="space-y-6">
      {header}
      <Alert type="error">{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total customers" value={kpis.totalCustomers} icon={Users} tone="violet" />
        <KPICard label="Active leads" value={kpis.activeLeads} icon={Target} tone="peach" />
        <KPICard label="Lead conversion rate" value={`${kpis.conversionRate}%`} icon={Percent} tone="mint" hint="Converted ÷ all leads" />
        <KPICard label="Revenue this month" value={formatCurrency(kpis.monthlyRevenue)} icon={Wallet} tone="lavender" hint={revenueHint} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Revenue trend" subtitle="Won deals, last 6 months" className="lg:col-span-2">
          {hasRevenue ? <RevenueTrendChart data={revenueTrend} /> : <EmptyState title="No won deals yet" hint="Revenue appears here once deals are marked as won." />}
        </SectionCard>
        <SectionCard title="Pipeline overview" subtitle={`${formatCurrency(kpis.openPipelineValue)} in open deals`}>
          {hasPipeline ? <PipelineChart data={pipeline} /> : <EmptyState title="No open deals" hint="Deals you create will show up by stage." />}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="High-priority leads" subtitle="Open leads marked high priority, largest budget first">
          {highPriorityLeads.length ? (
            <ul className="divide-y divide-slate-50">
              {highPriorityLeads.map((l) => (
                <li key={l._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{l.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {l.company || 'No company'} · {l.assignedTo?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-700">{l.budget ? formatCompact(l.budget) : '—'}</p>
                    <Badge tone="violet">{humanize(l.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No high-priority leads" />
          )}
        </SectionCard>

        <SectionCard title="Pending follow-ups" subtitle={`${kpis.pendingFollowUps} pending · ${kpis.overdueFollowUps} overdue`}>
          {upcomingActivities.length ? (
            <ul className="divide-y divide-slate-50">
              {upcomingActivities.map((a) => {
                const overdue = new Date(a.dueDate).getTime() < now;
                return (
                  <li key={a._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-500">{humanize(a.type)} · {formatDateTime(a.dueDate)}</p>
                    </div>
                    <Badge tone={overdue ? 'peach' : 'mint'}>{overdue ? 'Overdue' : 'Upcoming'}</Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="Nothing pending" hint="Scheduled calls, meetings and tasks appear here." />
          )}
        </SectionCard>
      </div>

      {data.scope === 'organization' && (
        <SectionCard title="Team performance" subtitle="Revenue from won deals, last 6 months">
          {teamPerformance.length ? (
            <ul className="space-y-3">
              {teamPerformance.map((t) => (
                <li key={t.userId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{t.name}</span>
                    <span className="text-slate-500">{formatCurrency(t.wonValue)} · {t.wonDeals} won</span>
                  </div>
                  <div className="h-2 rounded-full bg-violet-50">
                    <div className="h-2 rounded-full bg-violet-500" style={{ width: `${(t.wonValue / topWon) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No won deals yet" />
          )}
        </SectionCard>
      )}

      <SectionCard title="AI business highlights" subtitle="Future feature · Module 9">
        <div className="flex items-start gap-3 text-sm text-slate-500">
          <Sparkles size={18} className="text-violet-500 mt-0.5 shrink-0" />
          <p>AI-generated summaries of your pipeline and customers will appear here once the AI Sales Assistant is built.</p>
        </div>
      </SectionCard>
    </div>
  );
}