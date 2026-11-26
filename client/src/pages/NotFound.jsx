import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-5xl font-bold text-violet-700">404</h1>
      <p className="text-slate-500">That page doesn't exist.</p>
      <Link to="/dashboard" className="text-violet-600 font-medium hover:underline">Go to dashboard</Link>
    </main>
  );
}