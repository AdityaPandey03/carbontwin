import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { startOfDay } from '../services/thresholdService';

export const getWeeklyAnalytics = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const now = new Date();
  const last7 = startOfDay(new Date(now.getTime() - 7 * 86400_000));
  const prev7Start = startOfDay(new Date(now.getTime() - 14 * 86400_000));

  const [thisWeek, lastWeek] = await Promise.all([
    Activity.find({ userId, timestamp: { $gte: last7 } }),
    Activity.find({ userId, timestamp: { $gte: prev7Start, $lt: last7 } }),
  ]);

  const totalCarbon = round(thisWeek.reduce((s, a) => s + a.carbon, 0));
  const totalCost = round(thisWeek.reduce((s, a) => s + a.cost, 0), 2);
  const prevTotal = lastWeek.reduce((s, a) => s + a.carbon, 0);
  const change = prevTotal > 0 ? round(((totalCarbon - prevTotal) / prevTotal) * 100, 1) : null;

  const byType: Record<string, number> = {};
  for (const a of thisWeek) byType[a.type] = (byType[a.type] ?? 0) + a.carbon;
  const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const highest = sorted[0]
    ? { type: sorted[0][0], carbon: round(sorted[0][1]) }
    : null;

  const dailyGraph: Array<{ date: string; carbon: number; cost: number; type: Record<string, number> }> = [];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(new Date(now.getTime() - i * 86400_000));
    const end = new Date(day);
    end.setDate(end.getDate() + 1);
    const acts = thisWeek.filter((a) => a.timestamp >= day && a.timestamp < end);
    const breakdown: Record<string, number> = {};
    acts.forEach((a) => {
      breakdown[a.type] = round((breakdown[a.type] ?? 0) + a.carbon);
    });
    dailyGraph.push({
      date: day.toISOString().slice(0, 10),
      carbon: round(acts.reduce((s, a) => s + a.carbon, 0)),
      cost: round(acts.reduce((s, a) => s + a.cost, 0), 2),
      type: breakdown,
    });
  }

  res.json({
    totalCarbon,
    totalCost,
    percentChange: change,
    highestEmissionSource: highest,
    dailyGraph,
    breakdown: Object.fromEntries(sorted.map(([k, v]) => [k, round(v)])),
  });
};

const round = (n: number, d = 4) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
