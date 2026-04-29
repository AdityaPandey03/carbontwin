import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { api } from '../../services/mockApi';

interface Bin {
  hour: number;
  carbon: number;
  count: number;
}

export function Heatmap() {
  const [bins, setBins] = useState<Bin[]>([]);

  useEffect(() => {
    api.dashboard.getMetrics().then((d: any) => {
      if (d.raw?.heatmap) setBins(d.raw.heatmap);
    });
  }, []);

  const max = Math.max(...bins.map((b) => b.carbon), 0.0001);

  const cls = (v: number) => {
    const r = v / max;
    if (r === 0) return 'bg-secondary/40';
    if (r < 0.2) return 'bg-emerald-500/15';
    if (r < 0.4) return 'bg-emerald-500/35';
    if (r < 0.6) return 'bg-emerald-500/55';
    if (r < 0.8) return 'bg-emerald-500/75';
    return 'bg-emerald-500';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Hourly Carbon Heatmap</CardTitle>
        <CardDescription>Where your day burns the most — last 14 days, 0–23h</CardDescription>
      </CardHeader>
      <CardContent>
        {bins.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-1">
              {bins.map((b) => (
                <div
                  key={b.hour}
                  className={`aspect-square rounded ${cls(b.carbon)} relative group`}
                  title={`${String(b.hour).padStart(2, '0')}:00 — ${b.carbon.toFixed(4)} kg CO₂ (${b.count} events)`}
                >
                  <span className="absolute inset-0 grid place-items-center text-[10px] font-medium text-foreground/70">
                    {b.hour}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>low</span>
              <div className="flex gap-0.5">
                {['bg-emerald-500/15', 'bg-emerald-500/35', 'bg-emerald-500/55', 'bg-emerald-500/75', 'bg-emerald-500'].map((c) => (
                  <div key={c} className={`w-4 h-3 rounded ${c}`} />
                ))}
              </div>
              <span>high</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
