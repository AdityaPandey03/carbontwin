import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { generateRecommendations } from '../services/aiEngine';
import { startOfDay } from '../services/thresholdService';

export const getRecommendations = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const since = startOfDay(new Date(Date.now() - 14 * 86400_000));
  const acts = await Activity.find({ userId, timestamp: { $gte: since } });
  res.json(generateRecommendations(acts));
};
