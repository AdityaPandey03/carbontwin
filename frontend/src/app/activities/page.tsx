'use client';
import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { useUser } from '@/components/UserContext';
import { api, formatCarbon, formatINR } from '@/lib/api';
import { Plus } from 'lucide-react';

interface Activity {
  _id: string;
  type: string;
  usage: number;
  carbon: number;
  cost: number;
  timestamp: string;
}

const TYPES = ['ai_query', 'email', 'streaming', 'video_call', 'cloud_storage', 'web_browsing', 'compute'];

export default function ActivitiesPage() {
  const { user } = useUser();
  const [items, setItems] = useState<Activity[] | null>(null);
  const [type, setType] = useState('ai_query');
  const [usage, setUsage] = useState('5');
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!user) return;
    api.get(`/api/activities/${user._id}?limit=200`).then(setItems);
  };

  useEffect(load, [user]);

  const add = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await api.post('/api/activities', { userId: user._id, type, usage: Number(usage) });
      setUsage('5');
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Topbar title="Activity History" />

      <div className="card mb-4">
        <h3 className="font-semibold text-slate-900 mb-3">Log a new activity</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200">
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Usage</label>
            <input
              type="number"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 w-32"
              min={0}
              step="any"
            />
          </div>
          <button onClick={add} disabled={busy} className="btn-primary">
            <Plus size={16} /> {busy ? 'Adding…' : 'Add Activity'}
          </button>
          <p className="text-xs text-slate-500 ml-auto max-w-xs">
            Units depend on type — AI queries (count), email (count), streaming/video (hours), storage (GB-days), browsing (page views), compute (hours).
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-3">Recent Activity</h3>
        {!items ? (
          <div className="animate-pulse h-40 bg-slate-50 rounded" />
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No activities yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase">
                <th className="py-2">When</th>
                <th>Type</th>
                <th>Usage</th>
                <th>Carbon</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-t border-slate-100">
                  <td className="py-2 text-slate-600">{new Date(a.timestamp).toLocaleString('en-IN')}</td>
                  <td className="font-medium text-slate-800">{a.type.replace('_', ' ')}</td>
                  <td>{a.usage}</td>
                  <td className="text-brand-700 font-medium">{formatCarbon(a.carbon)}</td>
                  <td className="text-amber-700 font-medium">{formatINR(a.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
