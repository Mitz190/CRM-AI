import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Download, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { customerApi } from '../services/customerService';
import { downloadBlob } from '../utils/download';
import PageHeader from '../components/PageHeader';
import PageLoader from '../components/PageLoader';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import CustomerFormModal from '../components/CustomerFormModal';
import ImportCsvModal from '../components/ImportCsvModal';

const selectClass = 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200';

function SortHeader({ field, label, sort, onSort }) {
  const active = sort.field === field;
  return (
    <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 font-medium hover:text-violet-700">
      {label}
      {active && (sort.order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
    </button>
  );
}

export default function Customers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const team = useTeam(isAdmin);

  const [filters, setFilters] = useState({ search: '', category: '', status: '', assignedTo: '' });
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ customers: [], total: 0, page: 1, pages: 1, categories: [] });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const reqId = useRef(0); // ignore responses that arrive out of order

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError('');
    try {
      const params = { page, sort: sort.field, order: sort.order };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const result = await customerApi.list(params);
      if (id === reqId.current) setData(result);
    } catch (err) {
      if (id === reqId.current) setError(err.userMessage);
    } finally {
      if (id === reqId.current) { setLoading(false); setReady(true); }
    }
  }, [page, sort, filters]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce typing
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (name, value) => { setFilters((f) => ({ ...f, [name]: value })); setPage(1); };
  const toggleSort = (field) => {
    setSort((s) => (s.field === field ? { field, order: s.order === 'asc' ? 'desc' : 'asc' } : { field, order: 'asc' }));
    setPage(1);
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c) => { setEditing(c); setFormOpen(true); };

  const onSaved = (saved) => {
    setFormOpen(false);
    setNotice(`${saved.name} saved.`);
    load();
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await customerApi.remove(deleting._id);
      setNotice(`${deleting.name} deleted.`);
      setDeleting(null);
      load();
    } catch (err) {
      setDeleteError(err.userMessage);
    } finally {
      setDeleteBusy(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    setError('');
    try {
      downloadBlob(await customerApi.exportCsv(), `clientiq-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setExporting(false);
    }
  };

  if (!user) return null;

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={isAdmin ? 'All customers in your organization' : 'Customers assigned to you'}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportCsv} loading={exporting}><Download size={16} /> Export</Button>
            <Button variant="secondary" onClick={() => setImportOpen(true)}><Upload size={16} /> Import</Button>
            <Button onClick={openCreate}><Plus size={16} /> Add customer</Button>
          </div>
        }
      />

      <div className="space-y-4">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{notice}</Alert>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Search name, email or company"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200" />
          </div>
          <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={selectClass}>
            <option value="">All categories</option>
            {data.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={selectClass}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {isAdmin && (
            <select value={filters.assignedTo} onChange={(e) => setFilter('assignedTo', e.target.value)} className={selectClass}>
              <option value="">Any rep</option>
              <option value="unassigned">Unassigned</option>
              {team.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          )}
          {hasFilters && (
            <Button variant="secondary" onClick={() => { setFilters({ search: '', category: '', status: '', assignedTo: '' }); setPage(1); }}>Clear</Button>
          )}
        </div>

        <div className={`bg-white rounded-xl2 shadow-card overflow-x-auto transition-opacity ${loading && ready ? 'opacity-60' : ''}`}>
          {!ready ? (
            <PageLoader />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3"><SortHeader field="name" label="Name" sort={sort} onSort={toggleSort} /></th>
                  <th className="px-4 py-3"><SortHeader field="company" label="Company" sort={sort} onSort={toggleSort} /></th>
                  <th className="px-4 py-3"><SortHeader field="category" label="Category" sort={sort} onSort={toggleSort} /></th>
                  <th className="px-4 py-3"><SortHeader field="status" label="Status" sort={sort} onSort={toggleSort} /></th>
                  {isAdmin && <th className="px-4 py-3 font-medium">Assigned to</th>}
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${c._id}`} className="font-medium text-slate-800 hover:text-violet-700">{c.name}</Link>
                      <p className="text-xs text-slate-500">{c.email || 'No email'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.company || '—'}</td>
                    <td className="px-4 py-3">{c.category ? <Badge tone="violet">{c.category}</Badge> : '—'}</td>
                    <td className="px-4 py-3"><Badge tone={c.status === 'active' ? 'mint' : 'slate'}>{c.status === 'active' ? 'Active' : 'Inactive'}</Badge></td>
                    {isAdmin && <td className="px-4 py-3 text-slate-600">{c.assignedTo?.name || 'Unassigned'}</td>}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="p-2 rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-700"><Pencil size={16} /></button>
                        {isAdmin && (
                          <button onClick={() => { setDeleteError(''); setDeleting(c); }} aria-label={`Delete ${c.name}`} className="p-2 rounded-lg text-slate-500 hover:bg-peach-100 hover:text-peach-500"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.customers.length && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-4 py-10 text-center text-slate-400">
                      {hasFilters ? 'No customers match your filters.' : 'No customers yet. Add one or import a CSV.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
      </div>

      <CustomerFormModal
        open={formOpen} customer={editing} isAdmin={isAdmin} team={team} categories={data.categories}
        onClose={() => setFormOpen(false)} onSaved={onSaved}
      />
      <ImportCsvModal
        open={importOpen} onClose={() => setImportOpen(false)} onImported={() => { setNotice('Import finished.'); load(); }}
      />
      <ConfirmModal
        open={!!deleting} title="Delete customer" confirmLabel="Delete" loading={deleteBusy} error={deleteError}
        message={`Delete ${deleting?.name}? This cannot be undone.`}
        onClose={() => setDeleting(null)} onConfirm={confirmDelete}
      />
    </>
  );
}