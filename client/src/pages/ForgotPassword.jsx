import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/authService';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      setMessage(await authApi.forgotPassword(email));
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Reset your password</h2>
      <p className="text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>
      <FormField label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Button type="submit" loading={submitting} className="w-full">Send reset link</Button>
      <p className="text-sm text-center"><Link to="/login" className="text-violet-600 hover:underline">Back to login</Link></p>
    </form>
  );
}