import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form); // GuestRoute redirects to the dashboard once the user is set
    } catch (err) {
      setError(err.userMessage);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Welcome back</h2>
      <Alert type="error">{error}</Alert>
      <FormField label="Email" id="email" type="email" value={form.email} onChange={onChange} autoComplete="email" required />
      <FormField label="Password" id="password" type="password" value={form.password} onChange={onChange} autoComplete="current-password" required />
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-violet-600 hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" loading={submitting} className="w-full">Log in</Button>
      <p className="text-sm text-center text-slate-500">
        New to ClientIQ? <Link to="/register" className="text-violet-600 font-medium hover:underline">Create an account</Link>
      </p>
    </form>
  );
}