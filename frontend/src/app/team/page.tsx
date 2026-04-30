'use client';
import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { MetricCard } from '@/components/MetricCard';
import { useUser } from '@/components/UserContext';
import { api, formatCarbon } from '@/lib/api';
import { TeamView } from '@/lib/types';
import { Users, Cloud, Star } from 'lucide-react';

export default function TeamPage() {
  const { user } = useUser();
  const [data, setData] = useState<TeamView | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/team/${encodeURIComponent(user.company)}`).then(setData);
  }, [user]);

  if (!user) return <Topbar title="Team / Company" />;

  return (
    <>
      <Topbar title={`Team — ${user.company}`} />

      {!data ? (
        <div className="card animate-pulse h-72" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard label="Total Carbon (7d)" value={formatCarbon(data.totalCarbon)} icon={<Cloud size={20} />} />
            <MetricCard label="Avg Eco-Score" value={`${data.avgEcoScore}`} icon={<Star size={20} />} tone="amber" />
            <MetricCard label="Team Size" value={`${data.users.length}`} icon={<Users size={20} />} tone="sky" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-3">🌱 Top Contributors (highest eco-score)</h3>
              <ul className="space-y-2">
                {data.topContributors.map((u, i) => (
                  <li key={u.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                    <div className="text-sm text-brand-700 font-bold">{u.ecoScore}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-900 mb-3">⚠️ Highest Emitters (this week)</h3>
              <ul className="space-y-2">
                {data.worstOffenders.map((u, i) => (
                  <li key={u.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 grid place-items-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                    <div className="text-sm text-rose-700 font-bold">{formatCarbon(u.weeklyCarbon)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
