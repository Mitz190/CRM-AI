import { useEffect, useState } from 'react';
import api from './services/api';

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/health').then((res) => setHealth(res.data)).catch((e) => setError(e.userMessage));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-xl2 shadow-card p-8 max-w-md w-full">
        <span className="inline-block text-xs font-semibold bg-lavender text-violet-700 px-3 py-1 rounded-full">
          Module 0 · Foundation
        </span>
        <h1 className="mt-4 text-3xl font-bold text-violet-700">ClientIQ</h1>
        <p className="text-slate-500 mt-1">AI-enabled CRM &amp; customer intelligence</p>

        <div className="mt-6 rounded-xl bg-canvas p-4 text-sm">
          {error && <p className="text-peach-500">API error: {error}</p>}
          {!error && !health && <p className="text-slate-400">Checking API…</p>}
          {health && (
            <p className="text-mint-500 font-medium">
              API {health.status} · database {health.database}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}