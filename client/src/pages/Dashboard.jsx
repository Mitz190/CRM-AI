import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Your sales overview will appear here." />
      <div className="bg-white rounded-xl2 shadow-card p-6 max-w-xl">
        <p className="text-sm text-slate-600">
          You're signed in as <span className="font-semibold capitalize">{user.role.replace('_', ' ')}</span> ({user.email}).
        </p>
        <p className="text-sm text-slate-400 mt-3">KPI cards, charts and AI highlights arrive in Module 2.</p>
      </div>
    </>
  );
}