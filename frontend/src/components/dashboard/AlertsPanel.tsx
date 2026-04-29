import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, AlertCircle, TrendingUp, Info, BellRing } from 'lucide-react';
import { api } from '../../services/mockApi';

const ICONS: Record<string, any> = {
  warning: AlertTriangle,
  critical: AlertCircle,
  spike: TrendingUp,
  info: Info,
};

const TONES: Record<string, string> = {
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  critical: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
  spike: 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300',
  info: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
};

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const load = () => api.alerts.list().then(setAlerts);
    load();
    const i = setInterval(load, 20000);
    return () => clearInterval(i);
  }, []);

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-amber-400" />
          Real-time Alerts
        </CardTitle>
        <CardDescription>Threshold breaches and usage spikes</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">All clear — no alerts.</p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-auto">
            {alerts.slice(0, 8).map((a) => {
              const Icon = ICONS[a.type] ?? Info;
              return (
                <li key={a._id} className={`flex items-start gap-3 p-3 rounded-xl border ${TONES[a.type] ?? TONES.info}`}>
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-snug">{a.message}</div>
                    <div className="text-[11px] opacity-70 mt-0.5">
                      {new Date(a.timestamp).toLocaleString('en-IN')}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
