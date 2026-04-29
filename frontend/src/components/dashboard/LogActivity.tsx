import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { api } from '../../services/mockApi';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const TYPES = [
  { key: 'ai_query', label: 'AI Queries', unit: 'queries' },
  { key: 'email', label: 'Emails', unit: 'emails' },
  { key: 'streaming', label: 'Streaming', unit: 'hours' },
  { key: 'video_call', label: 'Video Calls', unit: 'hours' },
  { key: 'cloud_storage', label: 'Cloud Storage', unit: 'GB-days' },
  { key: 'web_browsing', label: 'Web Browsing', unit: 'page views' },
  { key: 'compute', label: 'Compute', unit: 'hours' },
];

export function LogActivity() {
  const [type, setType] = useState('ai_query');
  const [usage, setUsage] = useState('5');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usage || Number(usage) <= 0) return;
    setBusy(true);
    try {
      const r = await api.activities.log(type, Number(usage));
      if (r) {
        toast.success(`Logged ${usage} ${TYPES.find((t) => t.key === type)?.unit}`, {
          description: `+${(r as any).carbon?.toFixed(4) ?? '?'} kg CO₂ · ₹${(r as any).cost?.toFixed(2) ?? '?'}`,
        });
      } else {
        toast.error('Backend not reachable');
      }
      setUsage('5');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to log activity');
    } finally {
      setBusy(false);
    }
  };

  const current = TYPES.find((t) => t.key === type);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          Log Activity
        </CardTitle>
        <CardDescription>Add a digital activity — see it flow through the carbon engine instantly</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2 items-end">
          <div>
            <label className="text-xs uppercase text-muted-foreground">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground"
            >
              {TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">Usage ({current?.unit})</label>
            <input
              type="number"
              min="0"
              step="any"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground"
            />
          </div>
          <Button type="submit" disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {busy ? 'Logging…' : 'Log'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
