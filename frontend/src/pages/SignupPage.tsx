import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Loader2, Mail, Lock, User as UserIcon, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export function SignupPage() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signup(name, email, password, company || undefined);
      toast.success('Welcome to CarbonTwin');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

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
            <h1 className="text-2xl font-bold mb-1">Start your free trial</h1>
            <p className="text-sm text-muted-foreground mb-6">
              No credit card. 14-day trial. Up to 50 users.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <Field icon={UserIcon} label="Name">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aditya Pandey"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </Field>
              <Field icon={Mail} label="Work Email">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </Field>
              <Field icon={Building2} label="Company (optional)">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </Field>
              <Field icon={Lock} label="Password (min 4 chars)">
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </Field>

              <Button
                type="submit"
                disabled={busy}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="mt-1 relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
