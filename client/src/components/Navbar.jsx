import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <button onClick={onMenu} aria-label="Open menu" className="lg:hidden text-slate-600"><Menu size={22} /></button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <Link to="/profile" className="text-right leading-tight hover:opacity-80">
          <p className="text-sm font-semibold text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-700">
          <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}