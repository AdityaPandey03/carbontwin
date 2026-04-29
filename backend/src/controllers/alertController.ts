import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { evaluateAlerts } from '../services/thresholdService';

export const listAlerts = async (req: Request, res: Response) => {
  const { userId } = req.params;
  await evaluateAlerts(userId);
  const alerts = await Alert.find({ userId }).sort({ timestamp: -1 }).limit(50);
  res.json(alerts);
};

export const markAlertRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const a = await Alert.findByIdAndUpdate(id, { read: true }, { new: true });
  res.json(a);
};
