import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../../services/mockApi';
import { MOCK_CHART_DATA } from '../../services/mockData';

export function ImpactChart() {
  const [data, setData] = useState<any[]>(MOCK_CHART_DATA);

  useEffect(() => {
    api.dashboard.getMetrics().then((d) => {
      if (Array.isArray(d.chartData) && d.chartData.length > 0) setData(d.chartData);
    });
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-2 bg-card border-border">
      <CardHeader>
        <CardTitle>Unified Impact Chart</CardTitle>
        <CardDescription>Your daily CO₂ emissions vs ₹ cost</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                yAxisId="left"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}kg`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="co2"
                name="CO₂ Emitted"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorCo2)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                name="₹ Cost"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSaved)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
