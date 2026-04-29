import { Request, Response } from 'express';
import { Activity } from '../models/Activity';

export const exportActivitiesCsv = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const acts = await Activity.find({ userId }).sort({ timestamp: 1 });
  const header = 'timestamp,type,usage,carbon_kg,cost_inr';
  const rows = acts.map((a) =>
    [a.timestamp.toISOString(), a.type, a.usage, a.carbon, a.cost].join(','),
  );
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="activities-${userId}.csv"`);
  res.send([header, ...rows].join('\n'));
};
