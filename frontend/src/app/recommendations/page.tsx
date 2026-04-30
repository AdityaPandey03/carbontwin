'use client';
import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { useUser } from '@/components/UserContext';
import { api, formatCarbon, formatINR } from '@/lib/api';
import { Recommendation } from '@/lib/types';
import { Sparkles, ChevronRight } from 'lucide-react';

export default function RecommendationsPage() {
  const { user } = useUser();
  const [recs, setRecs] = useState<Recommendation[] | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/recommendations/${user._id}`).then(setRecs);
  }, [user]);

  return (
    <>
      <Topbar title="AI Recommendations" />
      {!recs ? (
        <div className="card animate-pulse h-72" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recs.map((r, i) => (
            <article key={i} className="card border-l-4 border-l-brand-500">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{r.title}</h3>
                    <span className="pill bg-slate-100 text-slate-700">{r.category}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{r.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Stat label="CO₂ saved/wk" value={formatCarbon(r.carbonSaving)} tone="brand" />
                <Stat label="₹ saved/wk" value={formatINR(r.costSaving)} tone="amber" />
                <Stat label="Confidence" value={`${Math.round(r.confidenceScore * 100)}%`} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  Priority
                  <div className="ml-2 w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${r.priorityScore}%` }} />
                  </div>
                  <span className="ml-2 font-medium text-slate-700">{r.priorityScore}</span>
                </div>
                <button className="text-sm text-brand-700 font-medium inline-flex items-center gap-1">
                  Apply <ChevronRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: 'brand' | 'amber' }) => (
  <div className="rounded-lg bg-slate-50 px-2 py-1.5">
    <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    <div
      className={`text-sm font-bold ${
        tone === 'brand' ? 'text-brand-700' : tone === 'amber' ? 'text-amber-700' : 'text-slate-800'
      }`}
    >
      {value}
    </div>
  </div>
);
