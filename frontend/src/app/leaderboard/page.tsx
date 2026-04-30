'use client';
import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { api, formatCarbon } from '@/lib/api';
import { LeaderboardRow } from '@/lib/types';
import { Trophy, Flame } from 'lucide-react';

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  useEffect(() => {
    api.get('/api/leaderboard').then(setRows);
  }, []);

  return (
    <>
      <Topbar title="Leaderboard" />
      {!rows ? (
        <div className="card animate-pulse h-72" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {rows.slice(0, 3).map((r, i) => (
              <div
                key={r.userId}
                className={`card flex items-center gap-4 ${
                  i === 0
                    ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200'
                    : i === 1
                    ? 'bg-gradient-to-br from-slate-50 to-white border-slate-200'
                    : 'bg-gradient-to-br from-orange-50 to-white border-orange-100'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 grid place-items-center">
                  <Trophy size={26} className={i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-orange-500'} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Rank #{r.rank}</div>
                  <div className="font-semibold text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.company}</div>
                  <div className="mt-1 text-sm font-semibold text-brand-700">
                    {r.ecoScore} {r.level.emoji}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase">
                  <th className="py-2">Rank</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Eco-Score</th>
                  <th>Carbon Saved</th>
                  <th>Streak</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-700">#{r.rank}</td>
                    <td className="font-medium text-slate-900">{r.name}</td>
                    <td className="text-slate-600">{r.company}</td>
                    <td>
                      <span className="font-semibold text-slate-900">{r.ecoScore}</span>{' '}
                      <span className="text-slate-500">{r.level.emoji}</span>
                    </td>
                    <td>{formatCarbon(r.carbonSaved)}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                        <Flame size={14} /> {r.streak}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {r.badges.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          r.badges.map((b) => (
                            <span key={b} className="pill bg-amber-50 text-amber-800 text-[10px]">
                              {b}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
