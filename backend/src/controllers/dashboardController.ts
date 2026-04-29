import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { Alert } from '../models/Alert';
import { User } from '../models/User';
import { getThresholdStatus, startOfDay, evaluateAlerts } from '../services/thresholdService';
import { computeEcoScore, scoreLevel } from '../services/ecoScore';
import { Threshold } from '../models/Threshold';
import { recomputeStreak } from '../services/streakService';

export const getDashboard = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'user not found' });

  await evaluateAlerts(userId);

  const thresholdStatus = await getThresholdStatus(userId);
  const t = (await Threshold.findOne({ userId })) ?? (await Threshold.create({ userId }));

  const last7 = startOfDay(new Date(Date.now() - 7 * 86400_000));
  const prev7Start = startOfDay(new Date(Date.now() - 14 * 86400_000));

  const [thisWeek, prevWeek, allTime, alerts, streakInfo] = await Promise.all([
    Activity.find({ userId, timestamp: { $gte: last7 } }),
    Activity.find({ userId, timestamp: { $gte: prev7Start, $lt: last7 } }),
    Activity.find({ userId }),
    Alert.find({ userId }).sort({ timestamp: -1 }).limit(10),
    recomputeStreak(userId),
  ]);

  const totalCarbon = round(allTime.reduce((s, a) => s + a.carbon, 0));
  const totalCost = round(allTime.reduce((s, a) => s + a.cost, 0), 2);
  const weeklyCarbon = round(thisWeek.reduce((s, a) => s + a.carbon, 0));
  const prevWeeklyCarbon = round(prevWeek.reduce((s, a) => s + a.carbon, 0));

  // threshold compliance over last 7 days
  const dayMap = new Map<string, number>();
  for (const a of thisWeek) {
    const k = startOfDay(a.timestamp).toISOString();
    dayMap.set(k, (dayMap.get(k) ?? 0) + a.carbon);
  }
  const daysWithData = Math.max(1, dayMap.size);
  const compliantDays = Array.from(dayMap.values()).filter((v) => v <= t.dailyLimit).length;
  const compliance = compliantDays / daysWithData;

  const ecoScore = computeEcoScore({
    weeklyCarbon,
    weeklyLimit: t.weeklyLimit,
    prevWeeklyCarbon,
    thresholdComplianceRatio: compliance,
  });
  user.ecoScore = ecoScore;
  await user.save();

  // Activity breakdown
  const breakdown: Record<string, { carbon: number; cost: number; count: number }> = {};
  for (const a of thisWeek) {
    breakdown[a.type] ??= { carbon: 0, cost: 0, count: 0 };
    breakdown[a.type].carbon += a.carbon;
    breakdown[a.type].cost += a.cost;
    breakdown[a.type].count += 1;
  }
  for (const k of Object.keys(breakdown)) {
    breakdown[k].carbon = round(breakdown[k].carbon);
    breakdown[k].cost = round(breakdown[k].cost, 2);
  }

  // Daily trend (last 14 days)
  const dailyTrend: Array<{ date: string; carbon: number; cost: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const day = startOfDay(new Date(Date.now() - i * 86400_000));
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayActs = allTime.filter((a) => a.timestamp >= day && a.timestamp < dayEnd);
    dailyTrend.push({
      date: day.toISOString().slice(0, 10),
      carbon: round(dayActs.reduce((s, a) => s + a.carbon, 0)),
      cost: round(dayActs.reduce((s, a) => s + a.cost, 0), 2),
    });
  }

  // Hourly heatmap (last 14 days, 0-23)
  const heatmap = Array.from({ length: 24 }, (_, h) => ({ hour: h, carbon: 0, count: 0 }));
  for (const a of allTime) {
    const h = new Date(a.timestamp).getHours();
    heatmap[h].carbon += a.carbon;
    heatmap[h].count += 1;
  }
  heatmap.forEach((b) => (b.carbon = round(b.carbon)));

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      ecoScore,
      level: scoreLevel(ecoScore),
    },
    totalCarbon,
    totalCost,
    weeklyCarbon,
    prevWeeklyCarbon,
    ecoScore,
    level: scoreLevel(ecoScore),
    thresholdStatus,
    alerts,
    breakdown,
    dailyTrend,
    heatmap,
    streak: streakInfo,
  });
};

const round = (n: number, d = 4) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
