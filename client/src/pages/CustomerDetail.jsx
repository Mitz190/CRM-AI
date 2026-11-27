import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Layers, Pencil, Trash2, Trophy, Wallet, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { customerApi } from '../services/customerService';
import { formatCurrency, formatDate, formatDateTime, humanize } from '../utils/format';
import PageHeader from '../components/PageHeader';
import PageLoader from '../components/PageLoader';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Badge from '../components/Badge';
import KPICard from '../components/KPICard';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import CustomerFormModal from '../components/CustomerFormModal';

const stageTone = { won: 'mint', lost: 'peach' };

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-800 break-words">{value || '—'}</dd>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const team = useTeam(isAdmin);

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await customerApi.get(id));
    } catch (err) {
      setData(null);
      setError(err.userMessage);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await customerApi.remove(id);
      navigate('/customers', { replace: true });
    } catch (err) {
      setDeleteError(err.userMessage);
      setDeleteBusy(false);
    }
  };

  const back = (
    <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline mb-4">
      <ArrowLeft size={16} /> Back to customers
    </Link>
  );

  if (!user) return null;
  if (!data) {
    return (
      <>
        {back}
        {error ? <Alert type="error">{error}</Alert> : <PageLoader />}
      </>
    );
  }

  const { customer: c, stats, deals, activities } = data;

  return (
    <>
      {back}
      <PageHeader
        title={c.name}
        subtitle={[c.jobTitle, c.company].filter(Boolean).join(' · ') || 'No company details'}
        action={
          <div className="flex flex-wrap gap-2 items-center">
            <Badge tone={c.status === 'active' ? 'mint' : 'slate'}>{c.status === 'active' ? 'Active' : 'Inactive'}</Badge>
            <Button variant="secondary" onClick={() => setEditOpen(true)}><Pencil size={16} /> Edit</Button>
            {isAdmin && <Button variant="danger" onClick={() => { setDeleteError(''); setDeleteOpen(true); }}><Trash2 size={16} /> Delete</Button>}
          </div>
        }
      />

      <div className="space-y-6">
        <Alert type="success">{notice}</Alert>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label="Total deals" value={stats.totalDeals} icon={Layers} tone="violet" />
          <KPICard label="Open deals" value={stats.openDeals} icon={Briefcase} tone="peach" />
          <KPICard label="Open pipeline value" value={formatCurrency(stats.openValue)} icon={Wallet} tone="lavender" />
          <KPICard label="Won revenue" value={formatCurrency(stats.wonValue)} icon={Trophy} tone="mint" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Contact">
            <dl className="space-y-3">
              <Info label="Email" value={c.email} />
              <Info label="Phone" value={c.phone} />
              <Info label="Website" value={c.website} />
              <Info label="Location" value={[c.city, c.country].filter(Boolean).join(', ')} />
            </dl>
          </SectionCard>
          <SectionCard title="Company & ownership">
            <dl className="space-y-3">
              <Info label="Company" value={c.company} />
              <Info label="Category" value={c.category} />
              <Info label="Assigned to" value={c.assignedTo?.name || 'Unassigned'} />
              <Info label="Created" value={`${formatDate(c.createdAt)}${c.createdBy ? ` by ${c.createdBy.name}` : ''}`} />
            </dl>
          </SectionCard>
          <SectionCard title="Notes">
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{c.notes || 'No notes yet.'}</p>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Deals" subtitle="Most recent 20">
            {deals.length ? (
              <ul className="divide-y divide-slate-50">
                {deals.map((d) => (
                  <li key={d._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(d.value)} · Owner: {d.owner?.name || '—'}</p>
                    </div>
                    <Badge tone={stageTone[d.stage] || 'violet'}>{humanize(d.stage)}</Badge>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No deals yet" hint="Deals linked to this customer appear here." />}
          </SectionCard>

          <SectionCard title="Activities" subtitle="Most recent 20">
            {activities.length ? (
              <ul className="divide-y divide-slate-50">
                {activities.map((a) => (
                  <li key={a._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-500">{humanize(a.type)} · {formatDateTime(a.dueDate)}</p>
                    </div>
                    <Badge tone={a.status === 'completed' ? 'mint' : 'peach'}>{humanize(a.status)}</Badge>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No activities yet" />}
          </SectionCard>
        </div>

        <SectionCard title="Interaction history" subtitle="Future feature · Module 7">
          <div className="flex items-start gap-3 text-sm text-slate-500">
            <MessageSquare size={18} className="text-violet-500 mt-0.5 shrink-0" />
            <p>Emails, calls, meetings and notes with this customer will be logged here once Communication Management is built.</p>
          </div>
        </SectionCard>
      </div>

      <CustomerFormModal
        open={editOpen} customer={c} isAdmin={isAdmin} team={team}
        onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); setNotice('Customer updated.'); load(); }}
      />
      <ConfirmModal
        open={deleteOpen} title="Delete customer" confirmLabel="Delete" loading={deleteBusy} error={deleteError}
        message={`Delete ${c.name}? This cannot be undone.`}
        onClose={() => setDeleteOpen(false)} onConfirm={remove}
      />
    </>
  );
}