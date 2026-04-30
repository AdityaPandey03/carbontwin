'use client';
import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Topbar } from '@/components/Topbar';
import { MetricCard } from '@/components/MetricCard';
import { useUser } from '@/components/UserContext';
import { api, formatCarbon, formatINR } from '@/lib/api';
import { WeeklyAnalytics } from '@/lib/types';
import { TrendingDown, TrendingUp, Flame, IndianRupee } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useUser();
  const [data, setData] = useState<WeeklyAnalytics | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/analytics/weekly/${user._id}`).then(setData);
  }, [user]);

  if (!user || !data) return <><Topbar title="Weekly Analytics" /><div className="card animate-pulse h-96" /></>;

  const types = Array.from(new Set(data.dailyGraph.flatMap((d) => Object.keys(d.type))));
  const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f43f5e'];

  const change = data.percentChange;

  return (
    <>
      <Topbar title="Weekly Analytics" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Carbon (7d)" value={formatCarbon(data.totalCarbon)} icon={<TrendingDown size={20} />} />
        <MetricCard label="Cost (7d)" value={formatINR(data.totalCost)} icon={<IndianRupee size={20} />} tone="amber" />
        <MetricCard
          label="vs Last Week"
          value={change != null ? `${change >= 0 ? '+' : ''}${change}%` : '—'}
          icon={change != null && change > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          tone={change != null && change > 0 ? 'rose' : 'brand'}
        />
        <MetricCard
          label="Top Source"
          value={data.highestEmissionSource ? data.highestEmissionSource.type.replace('_', ' ') : '—'}
          delta={data.highestEmissionSource ? `${data.highestEmissionSource.carbon.toFixed(3)} kg` : ''}
          icon={<Flame size={20} />}
          tone="rose"
        />
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-slate-900 mb-3">Daily Breakdown by Activity Type</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyGraph.map((d) => ({ date: d.date.slice(5), ...d.type }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" fontSize={11} stroke="#64748b" />
              <YAxis fontSize={11} stroke="#64748b" />
              <Tooltip formatter={(v: number) => `${Number(v).toFixed(3)} kg`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {types.map((t, i) => (
                <Bar key={t} dataKey={t} stackId="a" fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-3">Insights</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Total emissions this week: <b>{formatCarbon(data.totalCarbon)}</b> ({formatINR(data.totalCost)} social cost).</li>
          {change != null && (
            <li>
              • {change > 0 ? '⚠️ Emissions are up' : '✅ Emissions are down'} <b>{Math.abs(change)}%</b> compared to last week.
            </li>
          )}
          {data.highestEmissionSource && (
            <li>
              • Largest contributor: <b>{data.highestEmissionSource.type.replace('_', ' ')}</b> at {formatCarbon(data.highestEmissionSource.carbon)}.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
