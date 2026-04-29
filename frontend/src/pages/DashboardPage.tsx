import React, { useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { MetricsCards } from '../components/dashboard/MetricsCards';
import { ImpactChart } from '../components/dashboard/ImpactChart';
import { WhatIfSimulator } from '../components/dashboard/WhatIfSimulator';
import { ActionCenter } from '../components/dashboard/ActionCenter';
import { Leaderboard } from '../components/dashboard/Leaderboard';
import { EcoScoreGauge } from '../components/dashboard/EcoScoreGauge';
import { Chatbot } from '../components/dashboard/Chatbot';
import { ThresholdMeter } from '../components/dashboard/ThresholdMeter';
import { AlertsPanel } from '../components/dashboard/AlertsPanel';
import { LogActivity } from '../components/dashboard/LogActivity';
import { Heatmap } from '../components/dashboard/Heatmap';
import { StreakCard } from '../components/dashboard/StreakCard';
import { Toaster } from '../components/ui/sonner';

export function DashboardPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back. Here's your carbon impact today.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">Carbon Engine v2.0 Live</span>
            </div>
          </div>

          {/* KPIs */}
          <MetricsCards />

          {/* Threshold + Streak + Eco-score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ThresholdMeter />
            <StreakCard />
            <EcoScoreGauge />
          </div>

          {/* Trend chart + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ImpactChart />
            <AlertsPanel />
          </div>

          {/* Log activity + Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LogActivity />
            </div>
            <Heatmap />
          </div>

          {/* Simulator + Recommendations + Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WhatIfSimulator />
              <ActionCenter />
            </div>
            <div className="lg:col-span-1">
              <Leaderboard />
            </div>
          </div>
        </div>
      </main>

      <Chatbot />
      <Toaster theme="dark" />
    </div>
  );
}
