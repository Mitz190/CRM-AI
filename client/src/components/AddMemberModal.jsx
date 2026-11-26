import { useState } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import Button from './Button';
import Alert from './Alert';
import { userApi } from '../services/userService';

const empty = { name: '', email: '', password: '', role: 'sales_rep' };

export default function AddMemberModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await userApi.create(form);
      setForm(empty);
      onCreated();
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Add team member" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Alert type="error">{error}</Alert>
        <FormField label="Full name" id="name" value={form.name} onChange={onChange} required />
        <FormField label="Email" id="email" type="email" value={form.email} onChange={onChange} required />
        <FormField
          label="Temporary password" id="password" type="password" value={form.password} onChange={onChange}
          hint="Min 8 characters with a letter and a number. Share it securely; they can change it in Profile." required
        />
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
          <select id="role" name="role" value={form.role} onChange={onChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200">
            <option value="sales_rep">Sales Representative</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Add member</Button>
        </div>
      </form>
    </Modal>
  );
}