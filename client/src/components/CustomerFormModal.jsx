import { useEffect, useState } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import Button from './Button';
import Alert from './Alert';
import { customerApi } from '../services/customerService';

const blank = {
  name: '', email: '', phone: '', company: '', jobTitle: '', category: '', status: 'active',
  website: '', city: '', country: '', notes: '', assignedTo: '',
};

const toForm = (c) => {
  if (!c) return blank;
  const form = {};
  Object.keys(blank).forEach((k) => { form[k] = k === 'assignedTo' ? c.assignedTo?._id || '' : c[k] ?? ''; });
  return form;
};

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500';

export default function CustomerFormModal({ open, customer, isAdmin, team = [], categories = [], onClose, onSaved }) {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setForm(toForm(customer)); setError(''); }
  }, [open, customer]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!isAdmin || !payload.assignedTo) delete payload.assignedTo; // the server ignores it for reps anyway
      const saved = customer ? await customerApi.update(customer._id, payload) : await customerApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} size="lg" title={customer ? 'Edit customer' : 'Add customer'} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Alert type="error">{error}</Alert>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name *" id="name" value={form.name} onChange={onChange} required />
          <FormField label="Email" id="email" type="email" value={form.email} onChange={onChange} />
          <FormField label="Phone" id="phone" value={form.phone} onChange={onChange} />
          <FormField label="Company" id="company" value={form.company} onChange={onChange} />
          <FormField label="Job title" id="jobTitle" value={form.jobTitle} onChange={onChange} />
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <input id="category" name="category" list="category-options" value={form.category} onChange={onChange}
              placeholder="e.g. enterprise, smb" className={fieldClass} />
            <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <FormField label="Website" id="website" value={form.website} onChange={onChange} />
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select id="status" name="status" value={form.status} onChange={onChange} className={fieldClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <FormField label="City" id="city" value={form.city} onChange={onChange} />
          <FormField label="Country" id="country" value={form.country} onChange={onChange} />
          {isAdmin && (
            <div className="sm:col-span-2">
              <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 mb-1.5">Assigned to</label>
              <select id="assignedTo" name="assignedTo" value={form.assignedTo} onChange={onChange} className={fieldClass}>
                <option value="">{customer ? 'Keep current assignment' : 'Me (default)'}</option>
                {team.filter((u) => u.isActive).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea id="notes" name="notes" rows={3} maxLength={2000} value={form.notes} onChange={onChange} className={fieldClass} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{customer ? 'Save changes' : 'Add customer'}</Button>
        </div>
      </form>
    </Modal>
  );
}