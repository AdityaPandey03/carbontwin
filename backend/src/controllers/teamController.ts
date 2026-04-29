import { Request, Response } from 'express';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { startOfDay } from '../services/thresholdService';

export const getTeamView = async (req: Request, res: Response) => {
  const { company } = req.params;
  const users = await User.find({ company });
  if (users.length === 0) return res.json({ company, users: [], totalCarbon: 0, avgEcoScore: 0 });

  const since = startOfDay(new Date(Date.now() - 7 * 86400_000));
  const ids = users.map((u) => u._id);
  const acts = await Activity.find({ userId: { $in: ids }, timestamp: { $gte: since } });

  const byUser = new Map<string, number>();
  for (const a of acts) {
    const k = String(a.userId);
    byUser.set(k, (byUser.get(k) ?? 0) + a.carbon);
  }

  const userRows = users
    .map((u) => ({
      userId: u.id,
      name: u.name,
      ecoScore: u.ecoScore,
      weeklyCarbon: round(byUser.get(String(u._id)) ?? 0),
    }))
    .sort((a, b) => b.weeklyCarbon - a.weeklyCarbon);

  const totalCarbon = round(userRows.reduce((s, r) => s + r.weeklyCarbon, 0));
  const avgEcoScore = Math.round(users.reduce((s, u) => s + u.ecoScore, 0) / users.length);

  res.json({
    company,
    totalCarbon,
    avgEcoScore,
    topContributors: [...userRows].sort((a, b) => b.ecoScore - a.ecoScore).slice(0, 5),
    worstOffenders: userRows.slice(0, 5),
    users: userRows,
  });
};

const round = (n: number, d = 4) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
