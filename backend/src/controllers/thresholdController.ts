import { Request, Response } from 'express';
import { Threshold } from '../models/Threshold';
import { getThresholdStatus } from '../services/thresholdService';

export const getThreshold = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const t = (await Threshold.findOne({ userId })) ?? (await Threshold.create({ userId }));
  const status = await getThresholdStatus(userId);
  res.json({ threshold: t, status });
};

export const setThreshold = async (req: Request, res: Response) => {
  const { userId, dailyLimit, weeklyLimit } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const t = await Threshold.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...(dailyLimit != null ? { dailyLimit: Number(dailyLimit) } : {}),
        ...(weeklyLimit != null ? { weeklyLimit: Number(weeklyLimit) } : {}),
      },
    },
    { upsert: true, new: true },
  );
  res.json(t);
};
