'use client';
import { useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { useUser } from '@/components/UserContext';
import { api, formatCarbon, formatINR } from '@/lib/api';
import { Wand2 } from 'lucide-react';

const TYPES = [
  { key: 'ai_query', label: 'AI Queries' },
  { key: 'email', label: 'Emails' },
  { key: 'streaming', label: 'Streaming' },
  { key: 'video_call', label: 'Video Calls' },
  { key: 'cloud_storage', label: 'Cloud Storage' },
  { key: 'web_browsing', label: 'Web Browsing' },
  { key: 'compute', label: 'Compute' },
];

interface SimResult {
  baselineCarbon: number;
  projectedCarbon: number;
  carbonSaved: number;
  costSaved: number;
  improvement: number;
  annualisedSaving: number;
  annualisedCostSaving: number;
}

export default function SimulatorPage() {
  const { user } = useUser();
  const [pcts, setPcts] = useState<Record<string, number>>(
    Object.fromEntries(TYPES.map((t) => [t.key, 0])),
  );
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const changes = TYPES.map((t) => ({ type: t.key, reductionPercent: pcts[t.key] }))
        .filter((c) => c.reductionPercent > 0);
      const r = await api.post('/api/simulate', { userId: user._id, changes });
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="What-If Simulator" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-1">Reduction Sliders</h3>
          <p className="text-sm text-slate-500 mb-4">
            Project the effect of cutting each activity by the given percentage, applied to your last 7 days of data.
          </p>
          <div className="space-y-4">
            {TYPES.map((t) => (
              <div key={t.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <label className="font-medium text-slate-700">{t.label}</label>
                  <span className="text-brand-700 font-semibold">−{pcts[t.key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pcts[t.key]}
                  onChange={(e) => setPcts((p) => ({ ...p, [t.key]: Number(e.target.value) }))}
                  className="w-full accent-emerald-600"
                />
              </div>
            ))}
          </div>
          <button onClick={run} disabled={loading} className="btn-primary mt-6 w-full justify-center">
            <Wand2 size={16} /> {loading ? 'Simulating…' : 'Run Simulation'}
          </button>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-3">Projected Impact</h3>
          {!result ? (
            <p className="text-sm text-slate-500">Adjust sliders and run the simulation to see your projected savings.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Baseline (7d)" value={formatCarbon(result.baselineCarbon)} />
                <Stat label="Projected (7d)" value={formatCarbon(result.projectedCarbon)} tone="brand" />
                <Stat label="Carbon Saved" value={formatCarbon(result.carbonSaved)} tone="brand" />
                <Stat label="Cost Saved" value={formatINR(result.costSaved)} tone="amber" />
              </div>
              <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
                <div className="text-xs uppercase text-brand-700 font-semibold">Improvement</div>
                <div className="text-3xl font-bold text-brand-700 mt-1">{result.improvement}%</div>
                <div className="text-xs text-slate-600 mt-1">
                  Annualised: <b>{formatCarbon(result.annualisedSaving)}</b> · {formatINR(result.annualisedCostSaving)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: 'brand' | 'amber' }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-3">
    <div className="text-[11px] uppercase text-slate-500">{label}</div>
    <div className={`text-lg font-bold ${tone === 'brand' ? 'text-brand-700' : tone === 'amber' ? 'text-amber-700' : 'text-slate-900'}`}>
      {value}
    </div>
  </div>
);
