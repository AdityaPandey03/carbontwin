import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { api } from '../../services/mockApi';
import { Button } from '../ui/button';
import { Settings2 } from 'lucide-react';

interface Tier {
  bar: string;
  badge: string;
  text: string;
}

const tone = (pct: number): Tier => {
  if (pct >= 100) return { bar: 'bg-rose-600', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'text-rose-400' };
  if (pct >= 90) return { bar: 'bg-rose-500', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'text-rose-400' };
  if (pct >= 75) return { bar: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'text-amber-400' };
  return { bar: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'text-emerald-400' };
};

interface BarProps {
  label: string;
  currentUsage: number;
  limit: number;
  percentageUsed: number;
  status: string;
}

const Bar = ({ label, currentUsage, limit, percentageUsed, status }: BarProps) => {
  const t = tone(percentageUsed);
  const width = Math.min(100, percentageUsed);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-sm font-semibold text-foreground">
            {currentUsage} / {limit} kg CO₂
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${t.badge}`}>{status}</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${t.bar} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
      <div className={`mt-1 text-xs ${t.text}`}>{percentageUsed.toFixed(1)}% used</div>
    </div>
  );
};

export function ThresholdMeter() {
  const [data, setData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [daily, setDaily] = useState('');
  const [weekly, setWeekly] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => api.threshold.get().then((d) => setData(d));

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 15000);
    return () => clearInterval(i);
  }, []);

  const startEdit = () => {
    setDaily(String(data?.threshold?.dailyLimit ?? '0.5'));
    setWeekly(String(data?.threshold?.weeklyLimit ?? '3'));
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.threshold.set(Number(daily), Number(weekly));
      await refresh();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Carbon Threshold</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Carbon Threshold</CardTitle>
          <CardDescription>Live daily &amp; weekly budget</CardDescription>
        </div>
        <Button size="icon-sm" variant="ghost" onClick={editing ? () => setEditing(false) : startEdit}>
          <Settings2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase text-muted-foreground">Daily limit (kg CO₂)</label>
              <input
                type="number"
                step="0.1"
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">Weekly limit (kg CO₂)</label>
              <input
                type="number"
                step="0.1"
                value={weekly}
                onChange={(e) => setWeekly(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
              />
            </div>
            <Button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
              {saving ? 'Saving…' : 'Save Limits'}
            </Button>
          </div>
        ) : (
          <>
            <Bar label="Today" {...data.status.daily} />
            <Bar label="This Week" {...data.status.weekly} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
