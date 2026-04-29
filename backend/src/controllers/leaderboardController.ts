import { Request, Response } from 'express';
import { User } from '../models/User';
import { Streak } from '../models/Streak';
import { scoreLevel } from '../services/ecoScore';

export const getLeaderboard = async (_req: Request, res: Response) => {
  const users = await User.find().sort({ ecoScore: -1, carbonSaved: -1 }).limit(50);
  const streaks = await Streak.find({ userId: { $in: users.map((u) => u._id) } });
  const streakMap = new Map(streaks.map((s) => [String(s.userId), s]));

  const rows = users.map((u, i) => {
    const s = streakMap.get(String(u._id));
    return {
      rank: i + 1,
      userId: u.id,
      name: u.name,
      company: u.company,
      ecoScore: u.ecoScore,
      carbonSaved: u.carbonSaved,
      streak: s?.currentStreak ?? 0,
      badges: s?.badges ?? [],
      level: scoreLevel(u.ecoScore),
    };
  });
  res.json(rows);
};
