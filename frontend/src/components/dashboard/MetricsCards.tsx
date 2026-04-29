import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Cloud, IndianRupee, Trophy, Flame } from 'lucide-react';
import { api } from '../../services/mockApi';
import { MOCK_USER } from '../../services/mockData';

export function MetricsCards() {
  const [user, setUser] = useState<typeof MOCK_USER>(MOCK_USER);
  const [threshold, setThreshold] = useState<any>(null);

  useEffect(() => {
    api.dashboard.getMetrics().then((d) => setUser(d.user as any));
    api.threshold.get().then(setThreshold);
  }, []);

  const formatINR = (n: number) =>
    n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Carbon (all-time)
          </CardTitle>
          <Cloud className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {user.totalCarbonSaved.toFixed(2)} kg
          </div>
          <p className="text-xs text-muted-foreground mt-1">CO₂ equivalent</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Cost
          </CardTitle>
          <IndianRupee className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ₹{formatINR(user.totalRupeesSaved)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Social cost @ ₹850/kg
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Eco-Score
          </CardTitle>
          <Trophy className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {user.ecoScore}/100
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {user.ecoScore >= 80
              ? '🌱 Green Champion'
              : user.ecoScore >= 50
              ? '🌿 Eco Contributor'
              : '🔴 Needs Improvement'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {user.currentStreak} Days
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {threshold?.status?.daily?.status ?? 'Keep it up!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
