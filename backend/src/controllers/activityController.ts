import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { computeCarbon } from '../services/carbonEngine';
import { evaluateAlerts } from '../services/thresholdService';
import { recomputeStreak } from '../services/streakService';

export const createActivity = async (req: Request, res: Response) => {
  const { userId, type, usage, timestamp } = req.body;
  if (!userId || !type || usage == null) {
    return res.status(400).json({ error: 'userId, type, usage are required' });
  }
  const { carbon, cost } = computeCarbon(type, Number(usage));
  const activity = await Activity.create({
    userId,
    type,
    usage: Number(usage),
    carbon,
    cost,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  });

  await evaluateAlerts(userId);
  await recomputeStreak(userId);

  res.status(201).json(activity);
};

export const listActivities = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  const acts = await Activity.find({ userId }).sort({ timestamp: -1 }).limit(limit);
  res.json(acts);
};
