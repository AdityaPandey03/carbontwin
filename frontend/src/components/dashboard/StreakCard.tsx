import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Flame, Award } from 'lucide-react';
import { api } from '../../services/mockApi';

export function StreakCard() {
  const [streak, setStreak] = useState<any>(null);

  useEffect(() => {
    api.dashboard.getMetrics().then((d: any) => setStreak(d.raw?.streak ?? null));
  }, []);

  const cur = streak?.currentStreak ?? 0;
  const next = streak?.nextMilestone ?? 30;
  const badges: string[] = streak?.badges ?? [];
  const remaining = next ? Math.max(0, next - cur) : 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Carbon Streak
        </CardTitle>
        <CardDescription>Consecutive days under your daily limit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 grid place-items-center">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground leading-none">{cur}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {cur === 0 ? 'start one today' : `day${cur === 1 ? '' : 's'} clean`}
            </div>
          </div>
        </div>
        {next && remaining > 0 && (
          <div className="text-xs text-muted-foreground mb-3">
            {remaining} day{remaining === 1 ? '' : 's'} to next milestone ({next} days)
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 ? (
            <span className="text-xs text-muted-foreground">No badges yet — 3 days unlocks the first one</span>
          ) : (
            badges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Award className="w-3 h-3" />
                {b}
              </span>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
