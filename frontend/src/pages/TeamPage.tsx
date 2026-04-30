import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Cloud, IndianRupee, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authStore } from '../services/auth';
import { Toaster } from '../components/ui/sonner';

const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ((import.meta as any).env?.VITE_API_URL || 'http://localhost:4000')
    : '';

interface TeamMember {
  userId: string;
  name: string;
  ecoScore: number;
  weeklyCarbon: number;
}

interface TeamView {
  company: string;
  totalCarbon: number;
  avgEcoScore: number;
  topContributors: TeamMember[];
  worstOffenders: TeamMember[];
  users: TeamMember[];
}

export function TeamPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TeamView | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    if (!user?.company) return;
    const tok = authStore.getToken();
    fetch(`${API_URL}/api/team/${encodeURIComponent(user.company)}`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : undefined,
    })
      .then((r) => r.json())
      .then(setData);
  }, [user]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Team — {user?.company ?? '…'}
            </h1>
            <p className="text-muted-foreground">
              Aggregated carbon footprint across your organization
            </p>
          </div>

          {!data ? (
            <Card className="bg-card border-border h-64 animate-pulse" />
          ) : data.users.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground">
                  No team data yet — invite teammates to <strong>{user?.company}</strong> to see
                  aggregated metrics.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Stat
                  icon={<Cloud className="w-5 h-5 text-emerald-400" />}
                  label="Total Carbon (7d)"
                  value={`${data.totalCarbon.toFixed(2)} kg`}
                />
                <Stat
                  icon={<IndianRupee className="w-5 h-5 text-amber-400" />}
                  label="Avg Eco-Score"
                  value={`${data.avgEcoScore} / 100`}
                />
                <Stat
                  icon={<Users className="w-5 h-5 text-sky-400" />}
                  label="Team Size"
                  value={`${data.users.length} members`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" /> Top Contributors
                    </CardTitle>
                    <CardDescription>Highest eco-score performers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {data.topContributors.map((m, i) => (
                        <Row key={m.userId} rank={i + 1} member={m} accent="emerald" />
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-rose-400" /> Highest Emitters
                    </CardTitle>
                    <CardDescription>Last 7 days, kg CO₂</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {data.worstOffenders.map((m, i) => (
                        <Row key={m.userId} rank={i + 1} member={m} accent="rose" showCarbon />
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Row({
  rank,
  member,
  accent,
  showCarbon,
}: {
  rank: number;
  member: TeamMember;
  accent: 'emerald' | 'rose';
  showCarbon?: boolean;
}) {
  return (
    <li className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
      <div className="flex items-center gap-3">
        <span
          className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
            accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
          }`}
        >
          {rank}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground text-sm">{member.name}</span>
      </div>
      <div className="text-right">
        {showCarbon ? (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-300 border-rose-500/20">
            {member.weeklyCarbon.toFixed(2)} kg
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
            {member.ecoScore}
          </Badge>
        )}
      </div>
    </li>
  );
}
