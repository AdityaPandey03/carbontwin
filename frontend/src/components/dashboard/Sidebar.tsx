import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Trophy,
  Bot,
  Leaf,
  LogOut,
  Sliders,
  Users,
  Bell,
  Download,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { resetApiUser } from '../../services/mockApi';
import { authStore } from '../../services/auth';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  anchor?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Log Activity', anchor: 'log-activity' },
  { icon: Sliders, label: 'Simulator', anchor: 'simulator' },
  { icon: Bell, label: 'Alerts', anchor: 'alerts' },
  { icon: Bot, label: 'AI Coach', anchor: 'ai-coach' },
  { icon: Trophy, label: 'Leaderboard', anchor: 'leaderboard' },
  { icon: Users, label: 'Team', path: '/team' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const goAnchor = (anchor: string) => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }), 50);
      return;
    }
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = () => {
    logout();
    resetApiUser();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '··';

  const downloadCsv = () => {
    if (!user) return;
    const tok = authStore.getToken();
    fetch(`${API_URL}/api/export/${user._id}/csv`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : undefined,
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carbontwin-${user.name.split(' ')[0]}-activities.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Carbon<span className="text-emerald-500">Twin</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const baseClass = `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left w-full ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400 font-medium'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`;
          if (item.path) {
            return (
              <Link key={item.label} to={item.path} className={baseClass}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                {item.label}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => goAnchor(item.anchor!)}
              className={baseClass}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}

        <div className="pt-6 mt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Tools
          </p>
          <button
            type="button"
            onClick={downloadCsv}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left w-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {user?.name ?? '…'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.company ?? ''} · score {user?.ecoScore ?? '—'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
