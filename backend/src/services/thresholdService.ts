import { Activity } from '../models/Activity';
import { Threshold } from '../models/Threshold';
import { Alert } from '../models/Alert';
import { Types } from 'mongoose';

export const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const startOfWeek = (d = new Date()) => {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 sun
  const diff = (day + 6) % 7; // make Mon=0
  x.setDate(x.getDate() - diff);
  return x;
};

export interface ThresholdStatus {
  daily: { currentUsage: number; limit: number; percentageUsed: number; status: string };
  weekly: { currentUsage: number; limit: number; percentageUsed: number; status: string };
}

const tier = (pct: number) => {
  if (pct >= 100) return 'Limit Exceeded 🚨';
  if (pct >= 90) return 'Critical Zone 🔴';
  if (pct >= 75) return 'Warning Zone ⚠️';
  return 'Safe Zone ✅';
};

export const getThresholdStatus = async (userId: string | Types.ObjectId): Promise<ThresholdStatus> => {
  const t = (await Threshold.findOne({ userId })) ?? (await Threshold.create({ userId }));

  const todayStart = startOfDay();
  const weekStart = startOfWeek();

  const [todayActs, weekActs] = await Promise.all([
    Activity.find({ userId, timestamp: { $gte: todayStart } }),
    Activity.find({ userId, timestamp: { $gte: weekStart } }),
  ]);

  const dailyUsage = todayActs.reduce((s, a) => s + a.carbon, 0);
  const weeklyUsage = weekActs.reduce((s, a) => s + a.carbon, 0);

  const dailyPct = t.dailyLimit > 0 ? (dailyUsage / t.dailyLimit) * 100 : 0;
  const weeklyPct = t.weeklyLimit > 0 ? (weeklyUsage / t.weeklyLimit) * 100 : 0;

  return {
    daily: {
      currentUsage: round(dailyUsage),
      limit: t.dailyLimit,
      percentageUsed: round(dailyPct, 1),
      status: tier(dailyPct),
    },
    weekly: {
      currentUsage: round(weeklyUsage),
      limit: t.weeklyLimit,
      percentageUsed: round(weeklyPct, 1),
      status: tier(weeklyPct),
    },
  };
};

/** Emit alerts when usage crosses thresholds; idempotent within a 6h window. */
export const evaluateAlerts = async (userId: string | Types.ObjectId) => {
  const s = await getThresholdStatus(userId);
  const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000);

  const ensure = async (type: 'warning' | 'critical', message: string) => {
    const exists = await Alert.findOne({ userId, message, timestamp: { $gte: sixHoursAgo } });
    if (!exists) await Alert.create({ userId, type, message });
  };

  if (s.daily.percentageUsed >= 100) {
    await ensure('critical', `🚨 Daily carbon limit exceeded: ${s.daily.currentUsage} / ${s.daily.limit} kg`);
  } else if (s.daily.percentageUsed >= 90) {
    await ensure('critical', `🔴 Daily usage at ${s.daily.percentageUsed}% of limit`);
  } else if (s.daily.percentageUsed >= 75) {
    await ensure('warning', `⚠️ Daily usage at ${s.daily.percentageUsed}% of limit`);
  }

  if (s.weekly.percentageUsed >= 100) {
    await ensure('critical', `🚨 Weekly carbon budget exceeded: ${s.weekly.currentUsage} / ${s.weekly.limit} kg`);
  } else if (s.weekly.percentageUsed >= 85) {
    await ensure('warning', `⚠️ You've used ${s.weekly.percentageUsed}% of your weekly carbon budget`);
  }

  // Spike detection: today vs avg of previous 7 days
  const last7Start = startOfDay(new Date(Date.now() - 7 * 86400_000));
  const todayStart = startOfDay();
  const prior = await Activity.find({
    userId,
    timestamp: { $gte: last7Start, $lt: todayStart },
  });
  const todayActs = await Activity.find({ userId, timestamp: { $gte: todayStart } });
  const avg = prior.length ? prior.reduce((a, b) => a + b.carbon, 0) / 7 : 0;
  const today = todayActs.reduce((a, b) => a + b.carbon, 0);
  if (avg > 0 && today > avg * 1.8 && today > 0.1) {
    await ensure(
      'critical',
      `🚀 Unusual spike detected: today's emissions (${round(today)} kg) are ${Math.round((today / avg) * 100)}% of your weekly average`,
    );
  }
};

const round = (n: number, d = 4) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
