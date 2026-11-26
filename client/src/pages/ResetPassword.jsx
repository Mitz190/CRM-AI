import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function ResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      await resetPassword(token, form.password); // logs the user in, then GuestRoute redirects
    } catch (err) {
      setError(err.userMessage);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Choose a new password</h2>
      <Alert type="error">{error}</Alert>
      <FormField label="New password" id="password" type="password" value={form.password} onChange={onChange}
        hint="At least 8 characters, with a letter and a number." autoComplete="new-password" required />
      <FormField label="Confirm password" id="confirm" type="password" value={form.confirm} onChange={onChange} autoComplete="new-password" required />
      <Button type="submit" loading={submitting} className="w-full">Reset password</Button>
      <p className="text-sm text-center"><Link to="/login" className="text-violet-600 hover:underline">Back to login</Link></p>
    </form>
  );
}