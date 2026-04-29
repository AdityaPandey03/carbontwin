import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Loader2, Mail, Lock, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

const DEMO_USERS = [
  { name: 'Anushka Verma', email: 'anushka@brightlabs.io', vibe: '🌱 Green Champion · score 92' },
  { name: 'Aarav Sharma', email: 'aarav@greenco.in', vibe: '🌱 Green Champion · score 88' },
  { name: 'Rohan Mehta', email: 'rohan@brightlabs.io', vibe: '🔴 Needs Improvement · score 58' },
];
const DEMO_PASSWORD = 'demo1234';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    const wakingId = setTimeout(
      () => toast.message('Waking up the API… this takes ~30s on first request'),
      4000,
    );
    try {
      await fn();
      clearTimeout(wakingId);
    } catch (err: any) {
      clearTimeout(wakingId);
      const msg = err.message || 'Login failed';
      if (msg.toLowerCase().includes('failed to fetch')) {
        toast.error('Server is waking up — wait a few seconds and try again');
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    wrap(async () => {
      await login(email, password);
      toast.success('Welcome back');
    });
  };

  const loginAs = (email: string) =>
    wrap(async () => {
      await login(email, DEMO_PASSWORD);
      toast.success(`Logged in as ${email}`);
    });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="container mx-auto px-4 h-20 flex items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Leaf className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Carbon<span className="text-emerald-500">Twin</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground mb-6">Log in to view your carbon dashboard</p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log in'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <span>quick demo</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  disabled={busy}
                  onClick={() => loginAs(u.email)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-left transition"
                >
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.vibe}</div>
                  </div>
                </button>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                Password for all demo accounts: <code className="bg-secondary px-1 py-0.5 rounded">{DEMO_PASSWORD}</code>
              </p>
            </div>

            <p className="text-sm text-center text-muted-foreground mt-6">
              No account?{' '}
              <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}
