import { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/userService';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Alert from '../components/Alert';
import PageLoader from '../components/PageLoader';
import AddMemberModal from '../components/AddMemberModal';

export default function TeamManagement() {
  const { user: me } = useAuth();
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await userApi.list({ page, search: search || undefined }));
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Small debounce so we don't query on every keystroke.
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const change = async (u, patch) => {
    setNotice('');
    setError('');
    try {
      await userApi.update(u._id, patch);
      setNotice(`${u.name} updated.`);
      load();
    } catch (err) {
      setError(err.userMessage);
    }
  };

  return (
    <>
      <PageHeader
        title="Team Management"
        subtitle={`${data.total} member${data.total === 1 ? '' : 's'} in your organization`}
        action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add member</Button>}
      />

      <div className="space-y-4">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{notice}</Alert>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        <div className="bg-white rounded-xl2 shadow-card overflow-x-auto">
          {loading ? (
            <PageLoader />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => {
                  const isSelf = u._id === me._id;
                  return (
                    <tr key={u._id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{u.name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => change(u, { role: e.target.value })}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:opacity-50"
                        >
                          <option value="sales_rep">Sales Rep</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-mint-100 text-mint-500' : 'bg-peach-100 text-peach-500'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant={u.isActive ? 'danger' : 'secondary'} disabled={isSelf} onClick={() => change(u, { isActive: !u.isActive })}>
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!data.users.length && (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">No team members found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {data.page} of {data.pages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="secondary" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => { setModalOpen(false); setNotice('Team member added.'); load(); }}
      />
    </>
  );
}