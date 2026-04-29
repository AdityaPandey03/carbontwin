import { Activity } from '../models/Activity';
import { Threshold } from '../models/Threshold';
import { Streak } from '../models/Streak';
import { Types } from 'mongoose';
import { startOfDay } from './thresholdService';

const BADGES: Array<{ days: number; badge: string }> = [
  { days: 3, badge: '3-Day Starter' },
  { days: 7, badge: '7-Day Bonus' },
  { days: 30, badge: 'Carbon Saver Elite' },
];

export const recomputeStreak = async (userId: string | Types.ObjectId) => {
  const t = (await Threshold.findOne({ userId })) ?? (await Threshold.create({ userId }));
  const limit = t.dailyLimit;

  // Walk back day by day, count consecutive days under limit
  const today = startOfDay();
  let cursor = new Date(today);
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const acts = await Activity.find({ userId, timestamp: { $gte: dayStart, $lt: dayEnd } });
    if (acts.length === 0) break; // no data, stop
    const total = acts.reduce((s, a) => s + a.carbon, 0);
    if (total > limit) break;

    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const earnedBadges = BADGES.filter((b) => streak >= b.days).map((b) => b.badge);

  const existing = (await Streak.findOne({ userId })) ?? (await Streak.create({ userId }));
  existing.currentStreak = streak;
  existing.longestStreak = Math.max(existing.longestStreak, streak);
  existing.lastUnderThresholdDate = streak > 0 ? today : existing.lastUnderThresholdDate;
  existing.badges = Array.from(new Set([...(existing.badges ?? []), ...earnedBadges]));
  await existing.save();

  return {
    currentStreak: existing.currentStreak,
    longestStreak: existing.longestStreak,
    badges: existing.badges,
    nextMilestone: BADGES.find((b) => b.days > streak)?.days ?? null,
  };
};
