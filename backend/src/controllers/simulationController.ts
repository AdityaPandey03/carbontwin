import { Request, Response } from 'express';
import { Activity, ActivityType } from '../models/Activity';
import { computeCarbon, CARBON_RATE_INR_PER_KG } from '../services/carbonEngine';
import { startOfDay } from '../services/thresholdService';

interface ChangeSpec {
  type: ActivityType;
  reductionPercent: number; // 0–100
}

export const simulate = async (req: Request, res: Response) => {
  const { userId, changes } = req.body as { userId: string; changes: ChangeSpec[] };
  if (!userId || !Array.isArray(changes)) {
    return res.status(400).json({ error: 'userId and changes[] required' });
  }
  const since = startOfDay(new Date(Date.now() - 7 * 86400_000));
  const acts = await Activity.find({ userId, timestamp: { $gte: since } });

  const baseline = acts.reduce((s, a) => s + a.carbon, 0);
  let projected = 0;

  for (const a of acts) {
    const change = changes.find((c) => c.type === a.type);
    if (change) {
      const factor = 1 - Math.max(0, Math.min(100, change.reductionPercent)) / 100;
      const recomputed = computeCarbon(a.type, a.usage * factor);
      projected += recomputed.carbon;
    } else {
      projected += a.carbon;
    }
  }

  const carbonSaved = round(baseline - projected);
  const costSaved = round(carbonSaved * CARBON_RATE_INR_PER_KG, 2);
  const improvement = baseline > 0 ? round(((baseline - projected) / baseline) * 100, 1) : 0;

  res.json({
    baselineCarbon: round(baseline),
    projectedCarbon: round(projected),
    carbonSaved,
    costSaved,
    improvement,
    annualisedSaving: round(carbonSaved * 52, 2),
    annualisedCostSaving: round(costSaved * 52, 2),
  });
};

const round = (n: number, d = 4) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
