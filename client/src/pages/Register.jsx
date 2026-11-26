import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', organizationName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const { confirm, ...payload } = form;
      await register(payload);
    } catch (err) {
      setError(err.userMessage);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Create your workspace</h2>
      <Alert type="error">{error}</Alert>
      <FormField label="Your name" id="name" value={form.name} onChange={onChange} autoComplete="name" required />
      <FormField label="Organization name" id="organizationName" value={form.organizationName} onChange={onChange} required />
      <FormField label="Work email" id="email" type="email" value={form.email} onChange={onChange} autoComplete="email" required />
      <FormField label="Password" id="password" type="password" value={form.password} onChange={onChange}
        hint="At least 8 characters, with a letter and a number." autoComplete="new-password" required />
      <FormField label="Confirm password" id="confirm" type="password" value={form.confirm} onChange={onChange} autoComplete="new-password" required />
      <Button type="submit" loading={submitting} className="w-full">Create account</Button>
      <p className="text-sm text-center text-slate-500">
        Already have an account? <Link to="/login" className="text-violet-600 font-medium hover:underline">Log in</Link>
      </p>
    </form>
  );
}